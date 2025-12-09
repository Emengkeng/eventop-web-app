import { OurFileRouter } from "@/libs/core";
import {
  generateUploadButton,
  generateUploadDropzone,
  generateUploader,
} from "@uploadthing/react";


export const UploadButton = generateUploadButton<OurFileRouter>();
export const UploadDropzone = generateUploadDropzone<OurFileRouter>();
export const Uploader = generateUploader<OurFileRouter>();
