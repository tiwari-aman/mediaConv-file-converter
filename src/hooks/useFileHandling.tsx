// hooks/useFileConverterHooks.ts

import { useState, useEffect, useRef } from "react";
import { convertFile, downloadFile } from "../utils/fileConversion";
import { getFileType } from "../utils/fileType";
import { toast } from "react-toastify";
interface FileItem {
  file: File;
  id: string;
  fileType: "image" | "video" | "audio" | "unknown";
  selectedFormat: string | null;
  isConverting: boolean;
  convertedUrl: string | null;
  convertedBlob: Blob | null;
  progress: number;
  error: string | null;
}
export const useFileHandling = (
  onConversionComplete?: (fileId: string, url: string, format: string) => void
) => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clean up URLs when component unmounts
  useEffect(() => {
    return () => {
      files.forEach((file) => {
        if (file.convertedUrl) {
          URL.revokeObjectURL(file.convertedUrl);
        }
      });
    };
  }, [files]);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (openDropdown) {
        const target = event.target as Element;
        const isDropdownClick =
          target.closest(".dropdown-button") ||
          target.closest(".dropdown-menu");

        if (!isDropdownClick) {
          setOpenDropdown(null);
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openDropdown]);

  // Handle file selection
  const handleFileChange = (selectedFiles: FileList) => {
    const newFiles: FileItem[] = Array.from(selectedFiles).map((file) => ({
      file,
      id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      fileType: getFileType(file),
      selectedFormat: null,
      isConverting: false,
      convertedUrl: null,
      convertedBlob: null,
      progress: 0,
      error: null,
    }));

    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      handleFileChange(selectedFiles);
    }
  };

  // Handle drag and drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFiles = e.dataTransfer.files; // Get the dropped files
    const validFiles: File[] = [];
    const invalidFiles: File[] = [];

    // Filter files based on supported types
    for (let i = 0; i < droppedFiles.length; i++) {
      const file = droppedFiles[i];
      if (getFileType(file) !== "unknown") {
        validFiles.push(file);
      } else {
        invalidFiles.push(file);
      }
    }

    // Show toast for invalid files
    invalidFiles.forEach((file) => {
      toast.error(`${file.name} is not a supported format!`, {
        position: "top-right",
        autoClose: 3000,
      });
    });

    if (validFiles.length === 0) return;

    // Create a new FileList using DataTransfer
    const dataTransfer = new DataTransfer();
    validFiles.forEach((file) => dataTransfer.items.add(file));
    const newFileList = dataTransfer.files;

    if (newFileList && newFileList.length > 0) {
      handleFileChange(newFileList);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  // Format selection
  const handleFormatSelect = (
    fileId: string,
    format: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();

    setFiles((prevFiles) =>
      prevFiles.map((file) =>
        file.id === fileId
          ? {
              ...file,
              selectedFormat: format,
              convertedUrl: null,
              convertedBlob: null,
              progress: 0,
              error: null,
            }
          : file
      )
    );
    setOpenDropdown(null);
  };

  // Toggle dropdown
  const toggleDropdown = (fileId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenDropdown((current) => (current === fileId ? null : fileId));
  };

  // Conversion logic
  const handleConvert = async (fileId: string) => {
    const fileItem = files.find((f) => f.id === fileId);
    if (!fileItem || !fileItem.selectedFormat || !canvasRef.current) return;

    setFiles((prevFiles) =>
      prevFiles.map((file) =>
        file.id === fileId
          ? { ...file, isConverting: true, progress: 0, error: null }
          : file
      )
    );

    try {
      // Simulated progress
      const progressInterval = setInterval(() => {
        setFiles((prevFiles) =>
          prevFiles.map((file) =>
            file.id === fileId
              ? {
                  ...file,
                  progress: file.progress >= 90 ? 90 : file.progress + 5,
                }
              : file
          )
        );
      }, 200);

      // Create a URL for the file
      const fileUrl = URL.createObjectURL(fileItem.file);

      // Convert the file
      const result = await convertFile(
        fileUrl,
        fileItem.fileType,
        fileItem.selectedFormat,
        canvasRef.current
      );

      // Clean up the original URL
      URL.revokeObjectURL(fileUrl);
      clearInterval(progressInterval);

      // Update file state with conversion result
      setFiles((prevFiles) =>
        prevFiles.map((file) =>
          file.id === fileId
            ? {
                ...file,
                convertedUrl: result.url,
                convertedBlob: result.blob,
                isConverting: false,
                progress: 100,
              }
            : file
        )
      );

      if (onConversionComplete && fileItem.selectedFormat) {
        onConversionComplete(fileId, result.url, fileItem.selectedFormat);
      }
    } catch (error) {
      setFiles((prevFiles) =>
        prevFiles.map((file) =>
          file.id === fileId
            ? {
                ...file,
                isConverting: false,
                progress: 0,
                error:
                  error instanceof Error
                    ? error.message
                    : "Failed to convert file",
              }
            : file
        )
      );
    }
  };

  const handleDownload = (fileId: string) => {
    const fileItem = files.find((f) => f.id === fileId);
    if (!fileItem || !fileItem.convertedBlob || !fileItem.selectedFormat) {
      setFiles((prevFiles) =>
        prevFiles.map((file) =>
          file.id === fileId
            ? { ...file, error: "No converted file available for download" }
            : file
        )
      );
      return;
    }

    try {
      // Create a filename with the new extension
      const originalName = fileItem.file.name.split(".")[0];

      // Download the file
      downloadFile(
        fileItem.convertedBlob,
        originalName,
        fileItem.selectedFormat
      );
    } catch (err) {
      setFiles((prevFiles) =>
        prevFiles.map((file) =>
          file.id === fileId
            ? {
                ...file,
                error: "Failed to download file. Please try again.",
              }
            : file
        )
      );
    }
  };

  const handleRemoveFile = (fileId: string) => {
    setFiles((prevFiles) => {
      const fileToRemove = prevFiles.find((f) => f.id === fileId);
      if (fileToRemove?.convertedUrl) {
        URL.revokeObjectURL(fileToRemove.convertedUrl);
      }
      return prevFiles.filter((file) => file.id !== fileId);
    });
  };

  const handleRemoveAllFiles = () => {
    // Cleanup all URLs
    files.forEach((file) => {
      if (file.convertedUrl) {
        URL.revokeObjectURL(file.convertedUrl);
      }
    });
    setFiles([]);
    // Clear the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return {
    files,
    isDragging,
    openDropdown,
    refs: {
      canvasRef,
      videoRef,
      audioRef,
      fileInputRef,
    },
    handlers: {
      handleFileInputChange,
      handleDrop,
      handleDragOver,
      handleDragLeave,
      handleFormatSelect,
      toggleDropdown,
      handleConvert,
      handleDownload,
      handleRemoveFile,
      handleRemoveAllFiles,
    },
  };
};
