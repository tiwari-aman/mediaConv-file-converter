import { Icon } from "@iconify/react";
import CustomButton from "../shared/CustomButton";
import { useFileHandling } from "../../hooks/useFileHandling";
import {
  getAvailableFormats,
  getFileIcon,
  formatFileSize,
} from "../../utils/fileType";

export interface FileUploaderConverterProps {
  onConversionComplete?: (fileId: string, url: string, format: string) => void;
}
export const FileConverter = ({
  onConversionComplete,
}: FileUploaderConverterProps) => {
  const {
    files,
    isDragging,
    openDropdown,
    refs: { canvasRef, videoRef, audioRef, fileInputRef },
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
  } = useFileHandling(onConversionComplete);

  return (
    <div className="file-uploader-converter">
      {!files.length && (
        <div
          className={`file-uploader  ${isDragging ? "dragging" : ""} `}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          <Icon icon="mdi:cloud-upload" className="upload-icon" />
          <h3 className="drag-title">Drag & Drop or Click to Upload</h3>
          <p className="drag-subtitle">
            Support for images, videos, and audio files
          </p>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInputChange}
            multiple
            accept="image/*,video/*,audio/*"
            style={{ display: "none" }}
          />
        </div>
      )}

      {files.length > 1 && (
        <div className="remove-all-button-container">
          <CustomButton
            onClick={handleRemoveAllFiles}
            className="remove-all-button"
          >
            <Icon icon="mdi:delete-sweep" className="button-icon" />
            Remove All ({files.length})
          </CustomButton>
        </div>
      )}

      <div className="file-list">
        {files.map((fileItem) => (
          <div key={fileItem.id} className="file-converter">
            <div className="file-info-container">
              <div className="file-info">
                <div className="file-title">
                  <div className="file-icon">
                    <Icon
                      icon={getFileIcon(fileItem.fileType)}
                      width={42}
                      height={42}
                      color="#fff"
                    />
                  </div>
                  <div className="file-name-container">
                    <p className="file-name">{fileItem.file.name}</p>
                    <p className="file-size">
                      ({formatFileSize(fileItem.file.size)})
                    </p>
                  </div>
                </div>
                <button
                  className="title-remove-button"
                  onClick={() => handleRemoveFile(fileItem.id)}
                >
                  <Icon
                    icon="mdi:delete"
                    className="remove-icon"
                    color="#ff0000"
                  />
                </button>
              </div>
              <div className="converter-controls">
                <div className="format-selector">
                  <span className="format-label">Convert to</span>
                  <div className="dropdown-container">
                    <button
                      className="dropdown-button"
                      onClick={(e) => toggleDropdown(fileItem.id, e)}
                    >
                      <p className="selected-format">
                        {fileItem.selectedFormat || "Select"}
                      </p>
                      <Icon icon="mdi:chevron-down" className="dropdown-icon" />
                    </button>

                    {openDropdown === fileItem.id && (
                      <div className="dropdown-menu">
                        {getAvailableFormats(fileItem.fileType).map(
                          (format) => (
                            <button
                              key={format}
                              className={`dropdown-item ${
                                fileItem.selectedFormat === format
                                  ? "selected"
                                  : ""
                              }`}
                              onClick={(e) =>
                                handleFormatSelect(fileItem.id, format, e)
                              }
                            >
                              {format}
                            </button>
                          )
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {fileItem.isConverting ? (
                  <div className="progress-container">
                    <div
                      className="progress-bar"
                      style={{ width: `${fileItem.progress}%` }}
                    ></div>
                    <span className="progress-text">{fileItem.progress}%</span>
                  </div>
                ) : fileItem.convertedUrl ? (
                  <CustomButton
                    onClick={() => handleDownload(fileItem.id)}
                    className="download-button"
                  >
                    <Icon icon="mdi:download" className="button-icon" />
                    Download
                  </CustomButton>
                ) : (
                  <CustomButton
                    onClick={() => handleConvert(fileItem.id)}
                    disabled={!fileItem.selectedFormat}
                    className={`convert-button ${
                      !fileItem.selectedFormat ? "disabled" : ""
                    }`}
                  >
                    Convert Now
                  </CustomButton>
                )}

                <button
                  className="remove-button"
                  onClick={() => handleRemoveFile(fileItem.id)}
                >
                  <Icon
                    icon="mdi:delete"
                    className="remove-icon"
                    color="#ff0000"
                  />
                </button>
              </div>
            </div>

            {fileItem.error && (
              <div className="error-message">
                <Icon icon="mdi:alert-circle" color="#ff0000" />
                <span>{fileItem.error}</span>
              </div>
            )}
          </div>
        ))}
      </div>
      {files.length > 0 && (
        <div
          className="file-uploader secondary"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          <div
            className={`upload-area-secondary ${isDragging ? "dragging" : ""} `}
          >
            <Icon icon="mdi:cloud-upload" width={22} height={22} />
            <p className="upload-text">Add more files</p>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInputChange}
              multiple
              accept="image/*,video/*,audio/*"
              style={{ display: "none" }}
            />
          </div>
        </div>
      )}

      {/* Hidden elements for media handling */}
      <canvas ref={canvasRef} style={{ display: "none" }} />
      <video ref={videoRef} style={{ display: "none" }} />
      <audio ref={audioRef} style={{ display: "none" }} />
    </div>
  );
};
