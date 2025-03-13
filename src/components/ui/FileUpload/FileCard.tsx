import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { FileText, X, CheckCircle, Loader2, ArrowDown } from "lucide-react";

interface FileCardProps {
    file: {
        fileName: string;
        fileSize: number;
        fileHash: string;
        botToken?: string;
        channelId?: string;
    };
    botToken?: string;
    channelId?: string;
    onDelete?: (fileHash: string) => void;
    downloadProgress: number;
}

const FileCard = ({ file, botToken, channelId, onDelete, downloadProgress = 0 }: FileCardProps) => {

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadComplete, setDownloadComplete] = useState(false);

    const handleDownload = async () => {
        setIsDownloading(true);
        setDownloadComplete(false);
        try {
            const effectiveBotToken = file.botToken || botToken;
            const effectiveChannelId = file.channelId || channelId;

            if (!effectiveBotToken || !effectiveChannelId) {
                console.error('Missing bot token or channel ID for download');
                return;
            }

            const params = new URLSearchParams({
                fileSize: file.fileSize.toString(),
                fileName: file.fileName,
                botToken: effectiveBotToken,
                channelId: effectiveChannelId
            });

            const response = await fetch(
                `http://localhost:5000/api/retrieve/${file.fileHash}?${params}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response.ok) {
                const blob = await response.blob();
                const downloadUrl = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = downloadUrl;
                link.download = file.fileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(downloadUrl);
                setDownloadComplete(true);
                setTimeout(() => {
                    setDownloadComplete(false);
                }, 3000);
            } else {
                throw new Error(`Download failed with status: ${response.status}`);
            }
        } catch (error) {
            console.error('Error downloading file:', error);
        } finally {
            setIsDownloading(false); 
        }
    };

    return (
        <div className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-gray-800/90 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.01]">
            <div className="flex items-center space-x-4">
                <div className="p-3 rounded-lg bg-purple-50 text-purple-600">
                    <FileText size={24} />
                </div>
                <div>
                    <p className="font-medium text-gray-800 dark:text-white">{file.fileName}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {(file.fileSize / (1024 * 1024)).toFixed(2)} MB
                    </p>
                </div>
            </div>
            <div className="flex items-center space-x-2">
                {downloadProgress > 0 ? (
                    <div className="flex items-center space-x-2">
                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-purple-500"
                                style={{ width: `${downloadProgress}%` }}
                            />
                        </div>
                        <span className="text-sm text-gray-500">
                            {downloadProgress}%
                        </span>
                    </div>
                ) : (
                    <>
                        <Button
                            variant="outline"
                            size="sm"
                            className={`relative overflow-hidden group ${
                                downloadComplete 
                                    ? "bg-green-50 text-green-600 border-green-200" 
                                    : isDownloading 
                                        ? "bg-purple-50 text-purple-600 border-purple-200" 
                                        : "text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                            } px-4 py-2 transition-all duration-300`}
                            onClick={handleDownload}
                            disabled={isDownloading || downloadComplete}
                        >
                            {downloadComplete ? (
                                <div className="flex items-center space-x-2 transition-all duration-300">
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    <span>Downloaded</span>
                                </div>
                            ) : isDownloading ? (
                                <div className="flex items-center space-x-2">
                                    <div className="relative w-4 h-4">
                                        <Loader2 className="h-4 w-4 animate-spin absolute" />
                                        <div className="absolute inset-0 bg-purple-100 rounded-full scale-0 group-hover:scale-150 transition-all duration-700 opacity-0 group-hover:opacity-30"></div>
                                    </div>
                                    <span className="relative">
                                        <span className="inline-block transition-transform duration-200 group-hover:-translate-y-1">Downloading</span>
                                        <span className="absolute left-0 text-purple-800 opacity-0 group-hover:opacity-100 transition-all duration-200 delay-200 group-hover:translate-y-1">Please wait...</span>
                                    </span>
                                </div>
                            ) : (
                                <div className="flex items-center space-x-2 group-hover:space-x-3 transition-all duration-300">
                                    <ArrowDown className="h-4 w-4 group-hover:animate-bounce" />
                                    <span className="relative">
                                        <span className="inline-block transition-all duration-300 group-hover:font-medium">Download</span>
                                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-purple-400 group-hover:w-full transition-all duration-300"></span>
                                    </span>
                                </div>
                            )}
                            
                            {/* Background pulse effect when downloading */}
                            {isDownloading && (
                                <span className="absolute inset-0 bg-purple-200 opacity-30 animate-pulse"></span>
                            )}
                            
                            {/* Success ripple effect */}
                            {downloadComplete && (
                                <span className="absolute inset-0 bg-green-200 animate-ping opacity-30 duration-700"></span>
                            )}
                        </Button>
                    </>
                )}
                {onDelete && (
                    <>
                        {showDeleteConfirm ? (
                            <div className="flex items-center space-x-2">
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    className="bg-red-500 hover:bg-red-600 text-white"
                                    onClick={async () => {
                                        if (onDelete) {
                                            setIsDeleting(true);
                                            onDelete(file.fileHash);
                                            setIsDeleting(false);
                                            setShowDeleteConfirm(false);
                                        }
                                    }}
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        'Delete'
                                    )}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowDeleteConfirm(false)}
                                    disabled={isDeleting}
                                >
                                    Cancel
                                </Button>
                            </div>
                        ) : (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full h-8 w-8 p-0"
                                onClick={() => setShowDeleteConfirm(true)}
                            >
                                <X size={18} />
                            </Button>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default FileCard;