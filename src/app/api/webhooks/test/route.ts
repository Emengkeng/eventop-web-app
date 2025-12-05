import { NextRequest, NextResponse } from 'next/server';

interface TestWebhookRequest {
  url: string;
  testPayload?: any;
}

interface TestWebhookResponse {
  success: boolean;
  status?: number;
  responseTime?: number;
  responseBody?: string;
  message: string;
  error?: string;
  details?: {
    headers?: Record<string, string>;
    statusText?: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: TestWebhookRequest = await request.json();
    const { url, testPayload } = body;

    // Validate URL
    if (!url) {
      return NextResponse.json<TestWebhookResponse>(
        { 
          success: false, 
          error: 'URL is required',
          message: 'Please provide a webhook URL to test'
        },
        { status: 400 }
      );
    }

    // Validate URL format and protocol
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
      
      // Only allow http/https protocols
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        return NextResponse.json<TestWebhookResponse>(
          { 
            success: false, 
            error: 'Invalid protocol',
            message: 'Only HTTP and HTTPS protocols are supported'
          },
          { status: 400 }
        );
      }

      // Warn about using http (insecure)
      if (parsedUrl.protocol === 'http:' && !parsedUrl.hostname.includes('localhost')) {
        console.warn('Testing webhook with insecure HTTP protocol:', url);
      }
    } catch (error) {
      return NextResponse.json<TestWebhookResponse>(
        { 
          success: false, 
          error: 'Invalid URL format',
          message: 'Please provide a valid URL (e.g., https://example.com/webhook)'
        },
        { status: 400 }
      );
    }

    // Default test payload
    const payload = testPayload || {
      event: 'webhook.test',
      data: {
        message: 'This is a test webhook from your subscription platform',
        timestamp: new Date().toISOString(),
        test: true,
      },
      metadata: {
        testId: `test_${Date.now()}`,
        version: '1.0',
      }
    };

    // Measure response time
    const startTime = Date.now();

    // Make request to the webhook endpoint with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    let webhookResponse: Response;
    try {
      webhookResponse = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'SubscriptionPlatform-Webhook-Test/1.0',
          'X-Webhook-Test': 'true',
          'X-Test-Timestamp': new Date().toISOString(),
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      
      // Handle timeout
      if (fetchError.name === 'AbortError') {
        return NextResponse.json<TestWebhookResponse>({
          success: false,
          error: 'Request timeout',
          message: 'The endpoint did not respond within 10 seconds',
        });
      }

      // Handle connection errors
      if (fetchError.cause?.code === 'ENOTFOUND') {
        return NextResponse.json<TestWebhookResponse>({
          success: false,
          error: 'DNS resolution failed',
          message: 'Could not resolve the domain name. Please check the URL.',
        });
      }

      if (fetchError.cause?.code === 'ECONNREFUSED') {
        return NextResponse.json<TestWebhookResponse>({
          success: false,
          error: 'Connection refused',
          message: 'The server refused the connection. Is the endpoint running?',
        });
      }

      // Generic network error
      return NextResponse.json<TestWebhookResponse>({
        success: false,
        error: 'Network error',
        message: fetchError.message || 'Failed to connect to the endpoint',
      });
    }

    clearTimeout(timeoutId);
    const responseTime = Date.now() - startTime;

    // Get response body (handle potential errors)
    let responseBody = '';
    let responseBodyError = false;
    try {
      const text = await webhookResponse.text();
      responseBody = text.substring(0, 1000); // Limit to first 1000 chars
    } catch (e) {
      responseBody = 'Unable to read response body';
      responseBodyError = true;
    }

    // Get response headers (just a few important ones)
    const responseHeaders: Record<string, string> = {};
    ['content-type', 'content-length', 'server'].forEach(header => {
      const value = webhookResponse.headers.get(header);
      if (value) responseHeaders[header] = value;
    });

    // Determine success based on status code
    const isSuccess = webhookResponse.status >= 200 && webhookResponse.status < 300;

    return NextResponse.json<TestWebhookResponse>({
      success: isSuccess,
      status: webhookResponse.status,
      responseTime,
      responseBody: responseBodyError ? undefined : responseBody,
      message: isSuccess
        ? `Endpoint responded successfully with status ${webhookResponse.status}`
        : `Endpoint returned error status ${webhookResponse.status}`,
      details: {
        headers: responseHeaders,
        statusText: webhookResponse.statusText,
      },
    });

  } catch (error: any) {
    console.error('Webhook test error:', error);
    
    return NextResponse.json<TestWebhookResponse>(
      {
        success: false,
        error: 'Internal server error',
        message: 'An unexpected error occurred while testing the endpoint',
      },
      { status: 500 }
    );
  }
}