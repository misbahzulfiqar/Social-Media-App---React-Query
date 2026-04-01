import { useCallback, useEffect, useState } from "react";
import { useDropzone, type FileWithPath } from "react-dropzone";

import { Button } from "../ui/button";
import { PostImage } from "@/components/shared/PostImage";
import { convertFileToUrl } from "@/lib/utils";

type FileUploaderProps = {
  fieldChange: (files: File[]) => void;
  mediaUrl: string;
  /** Appwrite storage file id — loads with session for private buckets. */
  storageFileId?: string;
};

const FileUploader = ({
  fieldChange,
  mediaUrl,
  storageFileId,
}: FileUploaderProps) => {
  const [pickedLocal, setPickedLocal] = useState(false);
  const [localPreview, setLocalPreview] = useState("");

  useEffect(() => {
    if (!pickedLocal) {
      setLocalPreview("");
    }
  }, [mediaUrl, storageFileId, pickedLocal]);

  const onDrop = useCallback(
    (acceptedFiles: FileWithPath[]) => {
      fieldChange(acceptedFiles);
      setPickedLocal(true);
      setLocalPreview(convertFileToUrl(acceptedFiles[0]));
    },
    [fieldChange]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpeg", ".jpg"],
    },
  });

  const showServer =
    !pickedLocal &&
    (Boolean(storageFileId?.trim()) || Boolean(mediaUrl.trim()));

  return (
    <div
      {...getRootProps()}
      className="flex flex-center flex-col bg-dark-3 rounded-xl cursor-pointer">
      <input {...getInputProps()} className="cursor-pointer" />

      {pickedLocal && localPreview ? (
        <>
          <div className="flex flex-1 justify-center w-full p-5 lg:p-10">
            <img
              src={localPreview}
              alt="Selected upload"
              className="file_uploader-img"
            />
          </div>
          <p className="file_uploader-label">Click or drag photo to replace</p>
        </>
      ) : showServer ? (
        <>
          <div className="flex flex-1 justify-center w-full p-5 lg:p-10">
            <PostImage
              post={{
                $id: "edit-post-preview",
                imageId: storageFileId?.trim() ?? "",
                imageUrl: storageFileId?.trim() ? "" : mediaUrl.trim(),
              }}
              alt="Current post image"
              className="file_uploader-img"
              loading="eager"
            />
          </div>
          <p className="file_uploader-label">Click or drag photo to replace</p>
        </>
      ) : (
        <div className="file_uploader-box ">
          <img
            src="/assets/icons/file-upload.svg"
            width={96}
            height={77}
            alt="file upload"
          />

          <h3 className="base-medium text-light-2 mb-2 mt-6">
            Drag photo here
          </h3>
          <p className="text-light-4 small-regular mb-6">SVG, PNG, JPG</p>

          <Button type="button" className="shad-button_dark_4">
            Select from computer
          </Button>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
