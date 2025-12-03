import { Connection, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import { Program, AnchorProvider, web3, BN } from '@coral-xyz/anchor';

const PROGRAM_ID = new PublicKey('GPVtSfXPiy8y4SkJrMC3VFyKUmGVhMrRbAp2NhiW1Ds2');

const USDC_MINT = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');

/**
 * Build the register_merchant transaction
 */
export async function buildRegisterMerchantTransaction(
  merchantWallet: string,
  planId: string,
  planName: string,
  feeAmountUsdc: number, // e.g., 29.00
  intervalDays: number, // e.g., 30
  connection: Connection
): Promise<{ transaction: Uint8Array; merchantPlanPda: PublicKey }> {
  
  const merchant = new PublicKey(merchantWallet);
  
  const feeAmount = new BN(Math.floor(feeAmountUsdc * 1_000_000));
  
  const paymentInterval = new BN(intervalDays * 86400);

  const [merchantPlanPda, bump] = PublicKey.findProgramAddressSync(
    [
      Buffer.from('merchant_plan'),
      merchant.toBuffer(),
      USDC_MINT.toBuffer(),
      Buffer.from(planId)
    ],
    PROGRAM_ID
  );

  // Format: [instruction_discriminator (8 bytes)] + [plan_id] + [plan_name] + [fee_amount] + [payment_interval]
  const instructionData = Buffer.concat([
    Buffer.from([238,
        245,
        77,
        132,
        161,
        88,
        216,
        248]),
    encodeString(planId),
    encodeString(planName),
    feeAmount.toArrayLike(Buffer, 'le', 8),
    paymentInterval.toArrayLike(Buffer, 'le', 8)
  ]);

  const instruction = {
    programId: PROGRAM_ID,
    keys: [
      { pubkey: merchantPlanPda, isSigner: false, isWritable: true },
      { pubkey: merchant, isSigner: true, isWritable: true },
      { pubkey: USDC_MINT, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data: instructionData,
  };

  const transaction = new Transaction();
  transaction.add(instruction);
  
  const { blockhash } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = merchant;

  const serializedTransaction = transaction.serialize({
    requireAllSignatures: false,
    verifySignatures: false,
  });

  return {
    transaction: serializedTransaction,
    merchantPlanPda
  };
}

/**
 * Helper: Encode string with length prefix (Borsh format)
 */
function encodeString(str: string): Buffer {
  const strBuffer = Buffer.from(str, 'utf8');
  const lengthBuffer = Buffer.alloc(4);
  lengthBuffer.writeUInt32LE(strBuffer.length, 0);
  return Buffer.concat([lengthBuffer, strBuffer]);
}

/**
 * Updated CreatePlanModal with actual transaction
 */
export const handleCreatePlanWithTransaction = async (
  formData: {
    planName: string;
    planId: string;
    feeAmount: string;
    paymentInterval: string;
  },
  wallets: any[],
  signAndSendTransaction: any
) => {
  if (!formData.planName || !formData.planId || !formData.feeAmount) {
    throw new Error('Please fill in all required fields');
  }

  if (wallets.length === 0) {
    throw new Error('Please create a wallet first');
  }

  const wallet = wallets[0];
  
  // Connect to Solana devnet
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

  const { transaction, merchantPlanPda } = await buildRegisterMerchantTransaction(
    wallet.address,
    formData.planId,
    formData.planName,
    parseFloat(formData.feeAmount),
    parseInt(formData.paymentInterval),
    connection
  );

  console.log('Merchant Plan PDA:', merchantPlanPda.toBase58());

  // Sign and send transaction via Privy
  const result = await signAndSendTransaction({
    transaction: Buffer.from(transaction),
    wallet: wallet
  });

  console.log('Transaction signature:', result);

  return {
    signature: result,
    merchantPlanPda: merchantPlanPda.toBase58()
  };
};

/**
 * ALTERNATIVE: Using Anchor (Recommended)
 * 
 * If you have your program's IDL, you can use Anchor which is much cleaner:
 */

export async function buildRegisterMerchantWithAnchor(
  merchantWallet: string,
  planId: string,
  planName: string,
  feeAmountUsdc: number,
  intervalDays: number,
  program: Program // Pass your Anchor program instance
) {
  const merchant = new PublicKey(merchantWallet);
  const feeAmount = new BN(Math.floor(feeAmountUsdc * 1_000_000));
  const paymentInterval = new BN(intervalDays * 86400);

  // Derive PDA
  const [merchantPlanPda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from('merchant_plan'),
      merchant.toBuffer(),
      USDC_MINT.toBuffer(),
      Buffer.from(planId)
    ],
    program.programId
  );

  // Build transaction using Anchor
  const tx = await program.methods
    .registerMerchant(
      planId,
      planName,
      feeAmount,
      paymentInterval
    )
    .accounts({
      merchantPlan: merchantPlanPda,
      merchant: merchant,
      mint: USDC_MINT,
      systemProgram: SystemProgram.programId,
    })
    .transaction();

  return tx;
}