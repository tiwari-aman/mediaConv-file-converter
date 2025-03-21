// utils/fileConversion.ts

import { IMAGE_FORMATS } from "../constants/mediaFileType";

// Types
export interface ConversionResult {
  url: string;
  blob: Blob;
}

// /**
//  * Convert image file to specified format using canvas
//  */
// export const convertImage = (
//   fileUrl: string,
//   format: string,
//   canvasElement: HTMLCanvasElement
// ): Promise<ConversionResult> => {
//   return new Promise((resolve, reject) => {
//     const img = new Image();
//     img.crossOrigin = "anonymous";

//     img.onload = () => {
//       if (!canvasElement) return reject("Canvas not available");

//       const ctx = canvasElement.getContext("2d");
//       if (!ctx) return reject("Canvas context not available");

//       // Set canvas dimensions to match image
//       canvasElement.width = img.width;
//       canvasElement.height = img.height;

//       // Draw image on canvas
//       ctx.drawImage(img, 0, 0);

//       // Convert canvas to blob
//       canvasElement.toBlob((blob) => {
//         if (!blob) {
//           reject("Failed to create blob");
//           return;
//         }

//         // Create URL for the blob
//         const url = URL.createObjectURL(blob);
//         resolve({ url, blob });
//       }, `image/${format}`);
//     };

//     img.onerror = () => {
//       reject("Failed to load image");
//     };

//     img.src = fileUrl;
//   });
// };

/**
 * Converts an image from a URL to the specified format
 * @param fileUrl The URL of the image to convert
 * @param format The target format (without the dot)
 * @param canvasElement HTML Canvas element to use for drawing
 * @returns Promise with the converted image URL and blob
 */
export const convertImage = (
  fileUrl: string,
  format: string,
  canvasElement: HTMLCanvasElement
): Promise<ConversionResult> => {
  return new Promise((resolve, reject) => {
    // Validate the format
    const normalizedFormat = format.toLowerCase().replace(".", "");
    if (!IMAGE_FORMATS.includes(normalizedFormat)) {
      return reject(
        `Unsupported format: ${format}. Supported formats are: ${IMAGE_FORMATS.join(
          ", "
        )}`
      );
    }

    // Special handling for SVG as it can't be directly converted via canvas
    if (normalizedFormat === "svg") {
      return reject(
        "SVG conversion is not supported through canvas. Please use a dedicated SVG library."
      );
    }

    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      if (!canvasElement) return reject("Canvas not available");

      const ctx = canvasElement.getContext("2d");
      if (!ctx) return reject("Canvas context not available");

      // Set canvas dimensions to match image
      canvasElement.width = img.width;
      canvasElement.height = img.height;

      // Clear canvas and draw image
      ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
      ctx.drawImage(img, 0, 0);

      // Handle specific format requirements
      let mimeType = `image/${normalizedFormat}`;
      let quality = undefined;

      // JPEG and WebP support quality setting
      if (
        normalizedFormat === "jpg" ||
        normalizedFormat === "jpeg" ||
        normalizedFormat === "webp"
      ) {
        quality = 0.92; // 92% quality
      }

      // Special handling for specific formats
      switch (normalizedFormat) {
        case "jpg":
        case "jpeg":
          // Draw white background for JPEGs (since they don't support transparency)
          ctx.globalCompositeOperation = "destination-over";
          ctx.fillStyle = "white";
          ctx.fillRect(0, 0, canvasElement.width, canvasElement.height);
          ctx.globalCompositeOperation = "source-over";
          mimeType = "image/jpeg";
          break;
        case "tif":
        case "tiff":
          mimeType = "image/tiff";
          break;
        case "raw":
        case "tga":
          return reject(
            `${normalizedFormat.toUpperCase()} format requires specialized libraries and cannot be converted via canvas`
          );
      }

      // Convert canvas to blob
      canvasElement.toBlob(
        (blob) => {
          if (!blob) {
            reject(`Failed to create ${normalizedFormat} blob`);
            return;
          }

          // Create URL for the blob
          const url = URL.createObjectURL(blob);
          resolve({ url, blob });
        },
        mimeType,
        quality
      );
    };

    img.onerror = (error) => {
      reject(`Failed to load image: ${error}`);
    };

    img.src = fileUrl;
  });
};

/**
 * Convert an image file to a specified format
 * @param imageFile The input File object
 * @param targetFormat The desired output format
 * @returns Promise with the converted image
 */
export const convertImageFile = (
  imageFile: File,
  targetFormat: string
): Promise<ConversionResult> => {
  return new Promise((resolve, reject) => {
    // Create canvas element
    const canvas = document.createElement("canvas");

    // Create URL from file
    const fileUrl = URL.createObjectURL(imageFile);

    // Convert the image
    convertImage(fileUrl, targetFormat, canvas)
      .then((result) => {
        // Clean up the temporary URL
        URL.revokeObjectURL(fileUrl);
        resolve(result);
      })
      .catch((error) => {
        // Clean up the temporary URL
        URL.revokeObjectURL(fileUrl);
        reject(error);
      });
  });
};

/**
 * Batch convert multiple images to a target format
 * @param fileUrls Array of image URLs to convert
 * @param targetFormat The desired output format
 * @returns Promise with array of conversion results
 */
export const batchConvertImages = (
  fileUrls: string[],
  targetFormat: string
): Promise<ConversionResult[]> => {
  const canvas = document.createElement("canvas");

  const conversionPromises = fileUrls.map((url) =>
    convertImage(url, targetFormat, canvas)
  );

  return Promise.all(conversionPromises);
};

/**
 * Convert video file to specified format (simplified simulation)
 */
export const convertVideo = (
  fileUrl: string,
  format: string
): Promise<ConversionResult> => {
  return new Promise((resolve, reject) => {
    try {
      // In a real implementation, you would use a library like FFmpeg.js
      // This is a simulated conversion for demonstration
      fetch(fileUrl)
        .then((response) => response.blob())
        .then((blob) => {
          // Create a new blob with the desired type
          const newBlob = new Blob([blob], {
            type: `video/${format}`,
          });

          const url = URL.createObjectURL(newBlob);
          resolve({ url, blob: newBlob });
        })
        .catch((err) => {
          reject("Failed to process video: " + err.message);
        });
    } catch (err) {
      reject("Failed to convert video");
    }
  });
};

/**
 * Convert audio file to specified format (simplified simulation)
 */
export const convertAudio = (
  fileUrl: string,
  format: string
): Promise<ConversionResult> => {
  return new Promise((resolve, reject) => {
    try {
      // In a real implementation, you would use a library like FFmpeg.js
      // This is a simulated conversion for demonstration
      fetch(fileUrl)
        .then((response) => response.blob())
        .then((blob) => {
          // Create a new blob with the desired type
          const newBlob = new Blob([blob], {
            type: `audio/${format}`,
          });

          const url = URL.createObjectURL(newBlob);
          resolve({ url, blob: newBlob });
        })
        .catch((err) => {
          reject("Failed to process audio: " + err.message);
        });
    } catch (err) {
      reject("Failed to convert audio");
    }
  });
};

/**
 * Convert a file based on its type
 */
export const convertFile = (
  fileUrl: string,
  fileType: string,
  format: string,
  canvasElement: HTMLCanvasElement
): Promise<ConversionResult> => {
  switch (fileType) {
    case "image":
      return convertImage(fileUrl, format, canvasElement);
    case "video":
      return convertVideo(fileUrl, format);
    case "audio":
      return convertAudio(fileUrl, format);
    default:
      return Promise.reject("Unsupported file type");
  }
};

/**
 * Create a download link for a file
 */
export const downloadFile = (
  blob: Blob,
  filename: string,
  format: string
): void => {
  // Create an anchor element for downloading
  const downloadLink = document.createElement("a");
  const url = URL.createObjectURL(blob);

  // Set download attributes
  downloadLink.href = url;
  downloadLink.download = `${filename}.${format}`;

  // Append to document, trigger click, and remove
  document.body.appendChild(downloadLink);
  downloadLink.click();

  // Clean up
  setTimeout(() => {
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);
  }, 200);
};
