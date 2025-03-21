import React from "react";

interface CustomButtonProps {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: "convert" | "download";
  children: React.ReactNode;
  className?: string;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  onClick,
  disabled = false,
  loading = false,
  variant = "convert",
  children,
  className,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`custom-button ${className} ${variant} ${
        disabled ? "disabled" : ""
      }`}
    >
      {loading ? "Processing..." : children}
    </button>
  );
};

export default CustomButton;
