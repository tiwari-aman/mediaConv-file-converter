// Define available formats for different file types
export const AVAILABLE_FORMATS = {
  image: [
    "jpg",
    "jpeg",
    "png",
    "gif",
    "bmp",
    "webp",
    "ico",
    "tif",
    "tiff",
    "svg",
    "raw",
    "tga",
  ],
  video: [
    "mp4",
    "m4v",
    "mp4v",
    "3gp",
    "3g2",
    "avi",
    "mov",
    "wmv",
    "mkv",
    "flv",
    "ogv",
    "webm",
    "h264",
    "264",
    "hevc",
    "265",
  ],
  audio: ["mp3", "wav", "ogg", "aac", "wma", "flac", "m4a"],
  unknown: [],
};

// Get file type based on MIME type
export const getFileType = (
  file: File
): "image" | "video" | "audio" | "unknown" => {
  const mimeType = file.type.toLowerCase();

  if (mimeType.startsWith("image/")) {
    return "image";
  } else if (mimeType.startsWith("video/")) {
    return "video";
  } else if (mimeType.startsWith("audio/")) {
    return "audio";
  }

  return "unknown";
};

// Get available formats for a file type
export const getAvailableFormats = (fileType: string): string[] => {
  return AVAILABLE_FORMATS[fileType as keyof typeof AVAILABLE_FORMATS] || [];
};

// Get appropriate icon for a file type
export const getFileIcon = (fileType: string): string => {
  switch (fileType) {
    case "image":
      return "tdesign:image-1-filled";
    case "video":
      return "bxs:video";
    case "audio":
      return "dashicons:format-audio";
    default:
      return "mdi:file";
  }
};

export const getFileIconColor = (fileType: string): string => {
  switch (fileType) {
    case "image":
      return "yellow";
    case "video":
      return "green";
    case "audio":
      return "blue";
    default:
      return "gray";
  }
};

// Format file size
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) {
    return `${bytes} B`;
  } else if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(2)} KB`;
  } else {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }
};
