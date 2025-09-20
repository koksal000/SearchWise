'use client';

import { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from './ui/button';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, X } from 'lucide-react';
import Image from 'next/image';

type ImageSearchDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSearch: (file: File) => void;
};

export function ImageSearchDialog({ isOpen, onOpenChange, onSearch }: ImageSearchDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false,
  });

  const handleSearch = () => {
    if (file) {
      onSearch(file);
    }
  };

  const handleClose = () => {
    setFile(null);
    setPreview(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Visual Search</DialogTitle>
          <DialogDescription>
            Upload or drop an image to get AI-powered search terms.
          </DialogDescription>
        </DialogHeader>
        <div
          {...getRootProps()}
          className={`mt-4 border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive ? 'border-primary bg-accent' : 'border-border hover:border-primary'}`}
        >
          <input {...getInputProps()} />
          {preview && file ? (
            <div className="relative">
              <Image src={preview} alt={file.name} width={200} height={200} className="mx-auto rounded-md object-contain max-h-60" />
              <Button
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                  setPreview(null);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <UploadCloud className="h-10 w-10" />
              <p>
                {isDragActive ? 'Drop the image here ...' : "Drag 'n' drop an image here, or click to select"}
              </p>
              <p className="text-xs">PNG, JPG, GIF up to 10MB</p>
            </div>
          )}
        </div>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSearch} disabled={!file}>
            Analyze and Search
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
