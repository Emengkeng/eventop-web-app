import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
// import { getAccessToken } from '@privy-io/react-auth';

const f = createUploadthing();

export const ourFileRouter = {
  merchantLogo: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    // .middleware(async ({ req }) => {
    //   const authToken = await getAccessToken();
      
    //   if (!authToken) throw new UploadThingError("Unauthorized");
      
    //   return { userId: 'ok' };
    // })
    .onUploadComplete(async ({ metadata, file }) => {
      // console.log("Upload complete for userId:", metadata.userId);
      // console.log("file url", file.ufsUrl );
      
      return { url: file.ufsUrl };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;