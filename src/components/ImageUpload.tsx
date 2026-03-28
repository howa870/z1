import { useState, useRef, DragEvent } from "react";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import { uploadImage } from "../lib/storage";

interface Props {
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
}

export function ImageUpload({ value, onChange, disabled }: Props) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("يرجى اختيار ملف صورة صالح");
      return;
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setError("حجم الصورة يجب أن يكون أقل من 10 ميجابايت");
      return;
    }

    setUploading(true);
    setError(null);
    setProgress(10);
    console.log("[ImageUpload] بدء رفع الصورة:", file.name, `(${(file.size / 1024).toFixed(1)} KB)`);

    try {
      setProgress(40);
      const url = await uploadImage(file);
      setProgress(100);
      onChange(url);
      console.log("[ImageUpload] ✅ تم الرفع:", url);
      setTimeout(() => setProgress(0), 500);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "فشل رفع الصورة";
      console.error("[ImageUpload] ❌", msg);
      setError(msg);
      setProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
    e.target.value = "";
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleUpload(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => setDragging(false);

  const clearImage = () => {
    onChange("");
    setError(null);
  };

  return (
    <div className="space-y-2" dir="rtl">
      {value ? (
        <div className="relative rounded-xl overflow-hidden border border-[#d4af37]/30 aspect-video bg-[#111]">
          <img
            src={value}
            alt="صورة المنتج"
            className="w-full h-full object-cover"
            onError={() => {
              console.warn("[ImageUpload] فشل تحميل الصورة من URL:", value);
              setError("تعذر عرض الصورة — تحقق من الرابط");
            }}
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={disabled || uploading}
              className="flex items-center gap-1.5 bg-[#d4af37] text-black px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:bg-[#c9a02e]"
            >
              <Upload className="w-3.5 h-3.5" />
              تغيير
            </button>
            <button
              type="button"
              onClick={clearImage}
              disabled={disabled}
              className="flex items-center gap-1.5 bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-700 transition-all"
            >
              <X className="w-3.5 h-3.5" />
              حذف
            </button>
          </div>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !disabled && !uploading && inputRef.current?.click()}
          className={`
            relative border-2 border-dashed rounded-xl aspect-video flex flex-col items-center justify-center cursor-pointer
            transition-all duration-200
            ${dragging ? "border-[#d4af37] bg-[#d4af37]/5" : "border-[#d4af37]/30 hover:border-[#d4af37]/60 bg-[#111]"}
            ${(disabled || uploading) ? "pointer-events-none opacity-60" : ""}
          `}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-[#d4af37] animate-spin" />
              <p className="text-[#d4af37] text-sm font-bold">جاري الرفع...</p>
              <div className="w-36 h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#d4af37] rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-center px-4">
              <div className="w-12 h-12 rounded-full bg-[#d4af37]/10 flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-[#d4af37]" />
              </div>
              <p className="text-white text-sm font-bold">اسحب الصورة هنا أو اضغط للاختيار</p>
              <p className="text-gray-500 text-xs">PNG, JPG, WEBP — حتى 10 ميجابايت</p>
            </div>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden"
        disabled={disabled || uploading}
      />

      {/* URL input fallback */}
      <div className="relative">
        <input
          type="url"
          value={value.startsWith("http") ? value : ""}
          onChange={e => { onChange(e.target.value); setError(null); }}
          placeholder="أو أدخل رابط الصورة مباشرة..."
          dir="ltr"
          disabled={disabled || uploading}
          className="w-full bg-[#1a1a1a] border border-[#d4af37]/20 text-white px-4 py-2.5 rounded-xl focus:outline-none focus:border-[#d4af37]/60 transition-colors placeholder-gray-600 text-sm disabled:opacity-50"
        />
      </div>

      {error && (
        <p className="flex items-center gap-1.5 text-red-400 text-xs">
          <X className="w-3.5 h-3.5 flex-shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
