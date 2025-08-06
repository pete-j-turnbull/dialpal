import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { config } from "@/config";
import AwsS3 from "@uppy/aws-s3";
import Uppy from "@uppy/core";
import { ContentType, File as ConvexFile } from "@convex/schema/common";

import { getFileDetailsFromUrl, getKeyFromUrl } from "./helpers";
import { UploadOptions } from "./types";

type ContextType = {
  uppy: Uppy;
  progress: number;
  isUploading: boolean;
};

const Context = createContext<ContextType>({} as ContextType);

const MB_TO_BYTES = 1024 * 1024;

const uppy = new Uppy({
  autoProceed: true,
  restrictions: {
    maxFileSize: 500 * MB_TO_BYTES,
    maxNumberOfFiles: 1,
    allowedFileTypes: null,
  },
}).use(AwsS3, {
  endpoint: `${config.convexSiteUrl}/upload`,
  shouldUseMultipart: (f) =>
    f.size !== null && f.size !== undefined && f.size > 1 * MB_TO_BYTES, // TODO: revert and make 5
});

export const UploadProvider = (props: PropsWithChildren) => {
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const handleUploadProgress = (v: number) => {
      setProgress(v);
    };
    const handleUploadStart = () => {
      setIsUploading(true);
    };
    const handleUploadSuccess = () => {
      setIsUploading(false);
      uppy.cancelAll();
    };
    const handleUploadError = () => {
      setIsUploading(false);
      uppy.cancelAll();
    };

    uppy.on("progress", handleUploadProgress);
    uppy.on("upload", handleUploadStart);
    uppy.on("upload-success", handleUploadSuccess);
    uppy.on("upload-error", handleUploadError);

    return () => {
      uppy.off("progress", handleUploadProgress);
      uppy.off("upload", handleUploadStart);
      uppy.off("upload-success", handleUploadSuccess);
      uppy.off("upload-error", handleUploadError);
    };
  }, []);

  const contextValue = useMemo<ContextType>(
    () => ({ uppy, progress, isUploading }),
    [progress, isUploading]
  );

  return (
    <Context.Provider value={contextValue}>{props.children}</Context.Provider>
  );
};

export const useUpload = (props: {
  options: UploadOptions;
  onUploadSuccess?: (file: ConvexFile) => void;
  onUploadError?: (error: Error) => void;
}) => {
  const context = useContext(Context);
  if (!context)
    throw new Error("useUpload must be used within a UploadProvider");

  const { uppy } = context;
  const { options, onUploadSuccess, onUploadError } = props;

  // const { acceptedMimeTypes, maxFileSize, maxNumberOfFiles } = options;
  // TODO: set restrictions

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleUploadSuccess = async (file: any, response: any) => {
      const url = response.body?.location || response.uploadURL || response.url;

      const key = getKeyFromUrl(url);
      const fileDetails = await getFileDetailsFromUrl(url, {
        contentType: file.type as ContentType,
        filename: file.name,
      });

      const internalFile: ConvexFile = {
        ...fileDetails,
        id: key,
        url,
      } as ConvexFile;

      onUploadSuccess?.(internalFile);
    };

    uppy.on("upload-success", handleUploadSuccess);

    return () => {
      uppy.off("upload-success", handleUploadSuccess);
    };
  }, [uppy, onUploadSuccess]);

  // TODO: pause, resume, retry, reset

  const cancelUpload = useCallback(() => {
    uppy.cancelAll();
  }, [uppy]);

  return {
    uppy,
    cancelUpload,
  };
};

export const useUploadState = () => {
  const context = useContext(Context);
  if (!context)
    throw new Error("useUploadState must be used within a UploadProvider");

  const { progress, isUploading } = context;

  return { progress, isUploading };
};
