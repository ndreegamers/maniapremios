"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, ImageIcon, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { compressImage } from "@/lib/utils";
import { MAX_RECEIPT_SIZE, TARGET_RECEIPT_WIDTH, TARGET_RECEIPT_QUALITY } from "@/lib/constants";

interface ReceiptUploaderProps {
  onFile: (file: File) => void;
  onClear: () => void;
}

export function ReceiptUploader({ onFile, onClear }: ReceiptUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function processFile(rawFile: File) {
    setCompressing(true);
    try {
      let finalFile = rawFile;

      if (rawFile.size > MAX_RECEIPT_SIZE && rawFile.type.startsWith("image/")) {
        const blob = await compressImage(rawFile, TARGET_RECEIPT_WIDTH, TARGET_RECEIPT_QUALITY);
        finalFile = new File([blob], rawFile.name.replace(/\.[^.]+$/, ".jpg"), {
          type: "image/jpeg",
        });
      }

      const url = URL.createObjectURL(finalFile);
      setPreview(url);
      onFile(finalFile);
    } finally {
      setCompressing(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) processFile(file);
  }

  function handleClear() {
    setPreview(null);
    onClear();
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="flex flex-col gap-3">
      <AnimatePresence mode="wait">
        {preview ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            className="relative rounded-md overflow-hidden border border-[#0F7B5C]/40 bg-[#0F7B5C]/5"
          >
            <img
              src={preview}
              alt="Comprobante"
              className="w-full max-h-60 object-contain"
            />
            <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-[#0F7B5C] text-white text-xs rounded px-2 py-0.5">
              <CheckCircle2 className="w-3 h-3" />
              Comprobante adjunto
            </div>
            <button
              onClick={handleClear}
              className="absolute top-2 right-2 bg-[#08090C]/80 text-[#8A90A0] hover:text-[#EDEFF4] rounded-full p-1 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={cn(
              "rounded-md border-2 border-dashed p-6 flex flex-col items-center gap-4 transition-all duration-200",
              isDragging
                ? "border-[#2E6BFF] bg-[#2E6BFF]/5"
                : "border-[#262A34] hover:border-[#2E6BFF]/50"
            )}
          >
            <div className="flex flex-col items-center gap-2 text-center">
              {compressing ? (
                <>
                  <ImageIcon className="w-8 h-8 text-[#2E6BFF] animate-pulse" />
                  <p className="text-sm text-[#8A90A0]">Procesando imagen...</p>
                </>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-[#2E6BFF]" />
                  <p className="text-sm font-medium text-[#EDEFF4]">
                    Adjunta la captura de tu pago
                  </p>
                  <p className="text-xs text-[#8A90A0]/60">PNG, JPG hasta 6 MB · arrastra o selecciona</p>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 bg-[#2E6BFF] text-[#08090C] font-semibold text-sm rounded-md px-4 py-2 transition-all hover:bg-[#4F7FFF] active:scale-[0.98]"
            >
              <Upload className="w-3.5 h-3.5" />
              Seleccionar imagen
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
