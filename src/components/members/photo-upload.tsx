"use client";

import { useRef, useState, useCallback } from "react";
import { Upload, X, ImageIcon, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

interface PhotoUploadProps {
  value: string | null | undefined;
  onChange: (url: string | null) => void;
}

const BUCKET = "member-photos";
const MAX_MB = 5;
const ACCEPTED = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export function PhotoUpload({ value, onChange }: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(async (file: File) => {
    setError(null);

    if (!ACCEPTED.includes(file.type)) {
      setError("Only JPG, PNG, or WebP images allowed.");
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      setError(`File must be under ${MAX_MB} MB.`);
      return;
    }

    setUploading(true);
    setProgress(10);

    try {
      const ext  = file.name.split(".").pop();
      const path = `${crypto.randomUUID()}.${ext}`;

      setProgress(40);
      const { error: upErr } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { upsert: false, contentType: file.type });

      if (upErr) throw new Error(upErr.message);

      setProgress(90);
      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
      setProgress(100);
      onChange(data.publicUrl);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }, [onChange]);

  const handleFile = (file: File | undefined | null) => {
    if (file) upload(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleRemove = () => {
    onChange(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-2">
      {value ? (
        /* Preview */
        <div className="relative w-24 h-24 group">
          <img
            src={value}
            alt="Member photo"
            className="w-24 h-24 rounded-xl object-cover border border-border shadow-sm"
          />
          <div className="absolute inset-0 rounded-xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="text-white text-[10px] font-semibold bg-white/20 hover:bg-white/30 rounded px-1.5 py-1 transition-colors"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="text-white hover:text-red-300 transition-colors"
              aria-label="Remove photo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Drop zone */
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => !uploading && inputRef.current?.click()}
          className={cn(
            "w-full border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 py-5 cursor-pointer transition-colors",
            dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/30",
            uploading && "pointer-events-none opacity-70"
          )}
        >
          {uploading ? (
            <>
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
              <p className="text-xs text-muted-foreground">Uploading… {progress}%</p>
              <div className="w-32 h-1 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
              </div>
            </>
          ) : (
            <>
              <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                <ImageIcon className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="text-xs font-medium text-foreground">
                  <span className="text-primary">Click to upload</span> or drag & drop
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">JPG, PNG, WebP — max {MAX_MB} MB</p>
              </div>
              <Upload className="w-3.5 h-3.5 text-muted-foreground" />
            </>
          )}
        </div>
      )}

      {error && <p className="text-[11px] text-destructive">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(",")}
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
}
