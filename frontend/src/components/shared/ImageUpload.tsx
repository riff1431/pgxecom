"use client";

import { cn } from "@/lib/utils";
import { CloudUpload, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";

interface ImageUploadProps {
  value: (string | File)[];
  onChange: (value: (string | File)[]) => void;
  onRemove: (value: string | File) => void;
  maxFiles?: number;
}

export function ImageUpload({
  value = [],
  onChange,
  onRemove,
  maxFiles = 5,
}: ImageUploadProps) {
  const [previews, setPreviews] = useState<string[]>([]);

  useEffect(() => {
    // Generate previews for File objects
    const newPreviews = value.map((item) => {
      if (typeof item === "string") {
        return item.startsWith("http")
          ? item
          : `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL || ""}${item}`;
      }
      return URL.createObjectURL(item);
    });

    setPreviews(newPreviews);

    // Cleanup URLs
    return () => {
      newPreviews.forEach((preview) => {
        if (preview.startsWith("blob:")) {
          URL.revokeObjectURL(preview);
        }
      });
    };
  }, [value]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (value.length + acceptedFiles.length > maxFiles) {
        toast.error(`Maximum ${maxFiles} images allowed`);
        return;
      }
      onChange([...value, ...acceptedFiles]);
    },
    [onChange, value, maxFiles]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    disabled: value.length >= maxFiles,
  });

  return (
    <div className="space-y-4 w-full">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {value.map((item, index) => (
          <div
            key={index}
            className="relative aspect-square rounded-xl overflow-hidden border border-border group transition-all hover:border-primary/50 bg-background shadow-xs"
          >
            {previews[index] && (
              <Image
                fill
                src={previews[index]}
                alt="Product image"
                className="object-contain p-2"
                unoptimized
              />
            )}
            <button
              type="button"
              onClick={() => onRemove(item)}
              aria-label="Remove image"
              className="absolute top-2 right-2 p-1.5 bg-destructive text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-destructive/90 z-10"
            >
              <X className="h-3.5 w-3.5" />
            </button>
            {typeof item !== "string" && (
              <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-primary text-[9px] text-primary-foreground font-mono font-bold uppercase rounded-md shadow-xs z-10">
                New
              </div>
            )}
          </div>
        ))}

        {value.length < maxFiles && (
          <div
            {...getRootProps()}
            className={cn(
              "aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-200 group",
              isDragActive
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/50 hover:bg-muted/40 bg-muted/20"
            )}
          >
            <input {...getInputProps()} />
            <div className="w-10 h-10 bg-card rounded-xl border border-border/80 flex items-center justify-center mb-2 shadow-xs group-hover:border-primary/40 group-hover:scale-105 transition-all">
              <CloudUpload className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground group-hover:text-foreground transition-colors">
              Add Media
            </span>
          </div>
        )}
      </div>

      <p className="text-[11px] font-mono font-bold text-muted-foreground uppercase tracking-wider">
        Allowed formats: JPG, PNG, WEBP. Max size 5MB per image.
      </p>
    </div>
  );
}
