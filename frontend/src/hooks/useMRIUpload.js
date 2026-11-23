
import { useEffect, useRef, useState } from "react";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
];

export function useMRIUpload() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState("");
  const [isValidating, setIsValidating] = useState(false);

  const fileInputRef = useRef(null);
  const requestIdRef = useRef(0);

  // Release previous preview URLs
  useEffect(() => {
    if (!previewUrl) return;

    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  // Invalidate pending validation on unmount
  useEffect(() => {
    return () => {
      requestIdRef.current += 1;
    };
  }, []);

  function validateFile(file) {
    if (!file) {
      return "Please select an MRI image.";
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return "Invalid format. Please upload PNG, JPG or JPEG.";
    }

    if (file.size === 0) {
      return "The selected image is empty.";
    }

    if (file.size > MAX_FILE_SIZE) {
      return "Image size must not exceed 10 MB.";
    }

    return null;
  }

  // Check whether the browser can decode the image
  function validateImageContent(file) {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(file);
      const image = new Image();

      image.onload = () => {
        const valid = image.naturalWidth > 0 &&
                      image.naturalHeight > 0;

        URL.revokeObjectURL(url);
        resolve(valid);
      };

      image.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(false);
      };

      image.src = url;
    });
  }

  // Select and validate an image
  async function handleFileSelect(file) {
    const requestId = ++requestIdRef.current;

    // Clear previous selection
    setSelectedFile(null);
    setPreviewUrl(null);
    setError("");

    const validationError = validateFile(file);

    if (validationError) {
      setIsValidating(false);
      setError(validationError);
      return false;
    }

    setIsValidating(true);

    try {
      const isImageValid = await validateImageContent(file);

      // Ignore outdated validation results
      if (requestId !== requestIdRef.current) {
        return false;
      }

      if (!isImageValid) {
        setError(
          "This image cannot be opened. Please select a valid PNG or JPG file."
        );
        return false;
      }

      const objectUrl = URL.createObjectURL(file);

      setSelectedFile(file);
      setPreviewUrl(objectUrl);
      setError("");

      return true;
    } catch {
      if (requestId === requestIdRef.current) {
        setError("Image validation failed. Please try again.");
      }

      return false;
    } finally {
      if (requestId === requestIdRef.current) {
        setIsValidating(false);
      }
    }
  }

  function removeFile() {
    requestIdRef.current += 1;

    setSelectedFile(null);
    setPreviewUrl(null);
    setError("");
    setIsValidating(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function openFilePicker() {
    fileInputRef.current?.click();
  }

  return {
    selectedFile,
    previewUrl,
    error,
    isValidating,
    fileInputRef,
    handleFileSelect,
    removeFile,
    openFilePicker,
  };
}
