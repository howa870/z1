import { supabase } from "./supabase";

const BUCKET = "images";

/**
 * رفع صورة إلى Supabase Storage وإرجاع الرابط العام
 */
export async function uploadImage(file: File): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const path = `uploads/${fileName}`;

  console.log(`[Storage] 🔼 جاري رفع الصورة: ${path}`);

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, {
      upsert: true,
      contentType: file.type || "image/jpeg",
    });

  if (uploadError) {
    console.error("[Storage] ❌ فشل رفع الصورة:", uploadError.message);
    throw new Error(`فشل رفع الصورة: ${uploadError.message}`);
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);

  if (!data?.publicUrl) {
    console.error("[Storage] ❌ لم يتم الحصول على رابط الصورة");
    throw new Error("لم يتم الحصول على رابط الصورة");
  }

  console.log(`[Storage] ✅ تم الرفع بنجاح:`, data.publicUrl);
  return data.publicUrl;
}
