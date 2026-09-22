"use client";

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
  maxFiles = 5
}: ImageUploadProps) {
  const [previews, setPreviews] = useState<string[]>([]);

  useEffect(() => {
    // Generate previews for File objects
    const newPreviews = value.map(item => {
      if (typeof item === 'string') {
        return item.startsWith('http') ? item : `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}${item}`;
      }
      return URL.createObjectURL(item);
    });

    setPreviews(newPreviews);

    // Cleanup URLs
    return () => {
      newPreviews.forEach(preview => {
        if (preview.startsWith('blob:')) {
          URL.revokeObjectURL(preview);
        }
      });
    };
  }, [value]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (value.length + acceptedFiles.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} images allowed`);
      return;
    }
    onChange([...value, ...acceptedFiles]);
  }, [onChange, value, maxFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    disabled: value.length >= maxFiles
  });

  return (
    <div className="space-y-4 w-full">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {value.map((item, index) => (
          <div key={index} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-gray-100 group transition-all hover:border-emerald-200 shadow-sm">
            {previews[index] && (
              <Image
                fill
                src={previews[index]}
                alt="Product image"
                className="object-cover"
                unoptimized
              />
            )}
            <button
              type="button"
              onClick={() => onRemove(item)}
              className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600 z-10"
            >
              <X className="h-4 w-4" />
            </button>
            {typeof item !== 'string' && (
              <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-emerald-500 text-[8px] text-white font-black uppercase rounded-full shadow-sm z-10">
                New File
              </div>
            )}
          </div>
        ))}
        
        {value.length < maxFiles && (
          <div
            {...getRootProps()}
            className={`
              aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all
              ${isDragActive ? 'border-emerald-400 bg-emerald-50' : 'border-gray-200 hover:border-emerald-300 hover:bg-gray-50'}
            `}
          >
            <input {...getInputProps()} />
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <CloudUpload className="h-6 w-6 text-gray-400" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Add Media</span>
          </div>
        )}
      </div>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
        Allowed formats: JPG, PNG, WEBP. Max size 5MB per image.
      </p>
    </div>
  );
}
