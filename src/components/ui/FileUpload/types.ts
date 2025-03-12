interface FileUploadProps {
    name?: string;
    handleSignOut?: () => void;
    handleLogin?: () => void;
    handleUpload?: () => void;
    uploadedFiles?: UploadedFile[];
    handleDownload?: (fileName: string, fileHash: string, fileSize: number) => void;
  }
  
  interface UploadedFile {
    fileName: string;
    fileHash: string;
    fileSize: number;
  }