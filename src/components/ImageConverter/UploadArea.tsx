import { useEffect } from "react";
import { FileConverter } from "./FileConverter";

export function UploadArea() {
  useEffect(() => {
    const preventDefault = (e: DragEvent) => e.preventDefault();
    window.addEventListener("dragover", preventDefault);
    return () => window.removeEventListener("dragover", preventDefault);
  }, []);

  return <FileConverter />;
}
