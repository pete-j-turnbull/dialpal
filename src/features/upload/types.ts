import { ContentType } from "@convex/schema/common";

export type UploadOptions = {
  acceptedContentTypes: ContentType[];
  maxFileSize?: number; // in MB
  maxNumberOfFiles?: number;
};
