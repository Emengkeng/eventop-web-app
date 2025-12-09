import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "../../../libs/core";

export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
});