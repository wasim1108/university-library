import { useRef, useState } from 'react'
import {
  Image as IKImage,
  ImageKitProvider,
  upload,
  Video as IKVideo,
  ImageKitAbortError,
  ImageKitInvalidRequestError,
  ImageKitServerError,
  ImageKitUploadNetworkError,
} from '@imagekit/next';
import config from '@/lib/config';
import { toast } from "sonner"
import { cn } from "@/lib/utils";
import Image from "next/image";

const {
  env: {
    imagekit: { publicKey, urlEndPoint }
  }
} = config

const authenticator = async () => {

  try {
    const response = await fetch(`${config.env.apiEndpoint}/api/imagekit`)

    if (!response.ok) {
      const errorText = await response.text()

      throw new Error(`Request failed with status ${response.status}: ${errorText}`)
    }

    const data = await response.json()

    const { signature, expire, token } = data
    // console.log(data)
    return { token, signature, expire, publicKey }

  } catch (error) {
    console.error("Authentication error:", error);
    throw new Error("Authentication request failed");
  }

}

interface Props {
  type: "image" | "video";
  accept: string;
  placeholder: string;
  folder: string;
  variant: "dark" | "light";
  onFileChange: (filePath: string) => void;
  value?: string;
}

const FileUpload = ({
  type,
  accept,
  placeholder,
  folder,
  variant,
  onFileChange,
  value,
}: Props) => {

  // State to keep track of the current upload progress (percentage)
  const [progress, setProgress] = useState(0);
  const [file, setFile] = useState<{ filePath: string | null }>({
    filePath: value ?? null,
  });

  // console.log(urlEndPoint)

  // Create a ref for the file input element to access its files easily
  const ikUploadRef = useRef<HTMLInputElement>(null);

  // Create an AbortController instance to provide an option to cancel the upload if needed.
  const abortController = new AbortController();

  const styles = {
    button:
      variant === "dark"
        ? "bg-dark-300"
        : "bg-light-600 border-gray-100 border",
    placeholder: variant === "dark" ? "text-light-100" : "text-slate-500",
    text: variant === "dark" ? "text-light-100" : "text-dark-400",
  };

  const onError = (error: any) => {
    console.log(error);

    toast.error(`${type} upload failed`, {
      description: `Your ${type} could not be uploaded. Please try again.`,
    })

  };

  const onSuccess = (res: any) => {
    setFile(res);
    onFileChange(res.filePath);

    toast.success(`${type} uploaded successfully`, {
      description: `Your ${type} was uploaded successfully!`,
    })
  }

  /**
     * Handles the file upload process.
     *
     * This function:
     * - Validates file selection.
     * - Retrieves upload authentication credentials.
     * - Initiates the file upload via the ImageKit SDK.
     * - Updates the upload progress.
     * - Catches and processes errors accordingly.
     */
  const handleUpload = async () => {
    // Access the file input element using the ref
    const fileInput = ikUploadRef.current;
    if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
      alert("Please select a file to upload");
      return;
    }

    // Extract the first file from the file input
    const file = fileInput.files[0];

    // Retrieve authentication parameters for the upload.
    let authParams;
    try {
      authParams = await authenticator();
    } catch (authError) {
      console.error("Failed to authenticate for upload:", authError);
      return;
    }
    const { signature, expire, token, publicKey } = authParams;

    // Call the ImageKit SDK upload function with the required parameters and callbacks.
    try {
      const uploadResponse = await upload({
        // Authentication parameters
        expire,
        token,
        signature,
        publicKey,
        file,
        fileName: file.name, // Optionally set a custom file name
        // Progress callback to update upload progress state
        onProgress: (event) => {
          setProgress((event.loaded / event.total) * 100);
        },
        folder, // Specify the folder in ImageKit where the file should be uploaded
        useUniqueFileName: true, // Ensure unique file names to avoid overwriting
        // Abort signal to allow cancellation of the upload if needed.
        abortSignal: abortController.signal,
      });
      onSuccess(uploadResponse);
      
      console.log("Upload response:", uploadResponse);
    } catch (error) {
      // Handle specific error types provided by the ImageKit SDK.
      if (error instanceof ImageKitAbortError) {
        console.error("Upload aborted:", error.reason);
      } else if (error instanceof ImageKitInvalidRequestError) {
        console.error("Invalid request:", error.message);
      } else if (error instanceof ImageKitUploadNetworkError) {
        console.error("Network error:", error.message);
      } else if (error instanceof ImageKitServerError) {
        console.error("Server error:", error.message);
      } else {
        // Handle any other errors that may occur.
        console.error("Upload error:", error);
        onError(error);
      }
    }
  };

  return (
    <>
      <ImageKitProvider
        urlEndpoint={urlEndPoint}
      >
        <input
          className="hidden"
          type="file"
          ref={ikUploadRef}
          accept={accept}
        />
        {/* <button type="button" onClick={handleUpload}>
        Upload file
      </button>
      <br /> */}
        {/* Display the current upload progress */}
        {/* Upload progress: <progress value={progress} max={100}></progress> */}

        <button
          className={cn("upload-btn", styles.button)}
          onClick={(e) => {
            e.preventDefault();

            if (ikUploadRef.current) {
              // @ts-ignore
              ikUploadRef.current?.click();
              // handleUpload();
              
            }
          }}
        >
          <Image
            src="/icons/upload.svg"
            alt="upload-icon"
            width={20}
            height={20}
            className="object-contain"
            loading="eager"
          />

          <p className={cn("text-base", styles.placeholder)}>{placeholder}</p>

          {file.filePath && (
            <p className={cn("upload-filename", styles.text)}>{file.filePath}</p>
          )}
        </button>
        <p>hello: {file.filePath}</p>
        {file.filePath &&
          (type === "image" ? (
            <IKImage
              alt={file.filePath}
              src={file.filePath}
              width={500}
              height={300}
            />
          ) : type === "video" ? (
            <IKVideo
              src={file.filePath}
              controls={true}
              className="h-96 w-full rounded-xl"
            />
          ) : null)}

      </ImageKitProvider>
    </>
  )
}

export default FileUpload