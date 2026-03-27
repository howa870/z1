import { supabase } from "./supabase";

export { isSupabaseConfigured } from "./supabase";

export interface GalleryItem {
  id: number;
  url: string;
  type: "image" | "video";
  title: string;
  created_at?: string;
}

export interface Testimonial {
  id: number;
  rating: number;
  comment: string;
  image?: string;
}

export interface SiteSettings {
  id?: number;
  title: string;
  subtitle: string;
  button: string;
  whatsapp: string;
  phone: string;
  tiktok: string;
  facebook: string;
  instagram: string;
  primaryColor: string;
  location: string;
}

export const DEFAULT_SETTINGS: SiteSettings = {
  title: "قنفات ودواوين الأسدي",
  subtitle: "تفصيل وبيع بأعلى جودة",
  button: "اطلب الآن",
  whatsapp: "9647881457896",
  phone: "+9647881457896",
  tiktok: "https://www.tiktok.com/@alasde92",
  facebook: "https://www.facebook.com/share/18KUs2QP3f/",
  instagram: "https://www.instagram.com/allasde9",
  primaryColor: "#d4af37",
  location: "كركوك - حي العسكري\nقرب جامع خديجة الكبرى",
};

// ─── GALLERY ──────────────────────────────────────────────────────────────────

export async function getGallery(): Promise<GalleryItem[]> {
  const { data, error } = await supabase
    .from("gallery")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[Supabase] ❌ خطأ في جلب المعرض:", error.message);
    throw new Error(error.message);
  }

  return (data as GalleryItem[]) ?? [];
}

export async function addGalleryItem(
  item: Omit<GalleryItem, "id" | "created_at">
): Promise<GalleryItem | null> {
  const { data, error } = await supabase
    .from("gallery")
    .insert([{ url: item.url, type: item.type, title: item.title }])
    .select()
    .single();

  if (error) {
    console.error("[Supabase] ❌ خطأ في إضافة عنصر للمعرض:", error.message);
    return null;
  }

  return data as GalleryItem;
}

export async function deleteGalleryItem(id: number): Promise<boolean> {
  const { error } = await supabase.from("gallery").delete().eq("id", id);

  if (error) {
    console.error("[Supabase] ❌ خطأ في حذف عنصر المعرض:", error.message);
    return false;
  }

  return true;
}

// ─── TESTIMONIALS ─────────────────────────────────────────────────────────────

export async function getTestimonials(): Promise<Testimonial[]> {
  const { data, error } = await supabase
    .from("testimonials")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    console.error("[Supabase] ❌ خطأ في جلب التقييمات:", error.message);
    throw new Error(error.message);
  }

  return (data as Testimonial[]) ?? [];
}

export async function addTestimonial(
  item: Omit<Testimonial, "id">
): Promise<Testimonial | null> {
  const { data, error } = await supabase
    .from("testimonials")
    .insert([{ rating: item.rating, comment: item.comment, image: item.image ?? "" }])
    .select()
    .single();

  if (error) {
    console.error("[Supabase] ❌ خطأ في إضافة تقييم:", error.message);
    return null;
  }

  return data as Testimonial;
}

export async function deleteTestimonial(id: number): Promise<boolean> {
  const { error } = await supabase.from("testimonials").delete().eq("id", id);

  if (error) {
    console.error("[Supabase] ❌ خطأ في حذف التقييم:", error.message);
    return false;
  }

  return true;
}

// ─── SETTINGS ─────────────────────────────────────────────────────────────────

export async function getSettings(): Promise<SiteSettings> {
  const { data, error } = await supabase
    .from("settings")
    .select("*")
    .limit(1)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // No rows found — return defaults
      return DEFAULT_SETTINGS;
    }
    console.error("[Supabase] ❌ خطأ في جلب الإعدادات:", error.message);
    throw new Error(error.message);
  }

  if (!data) return DEFAULT_SETTINGS;

  return {
    id: data.id,
    title: data.title ?? DEFAULT_SETTINGS.title,
    subtitle: data.subtitle ?? DEFAULT_SETTINGS.subtitle,
    button: data.button ?? DEFAULT_SETTINGS.button,
    whatsapp: data.whatsapp ?? DEFAULT_SETTINGS.whatsapp,
    phone: data.phone ?? DEFAULT_SETTINGS.phone,
    tiktok: data.tiktok ?? DEFAULT_SETTINGS.tiktok,
    facebook: data.facebook ?? DEFAULT_SETTINGS.facebook,
    instagram: data.instagram ?? DEFAULT_SETTINGS.instagram,
    primaryColor: data.primary_color ?? DEFAULT_SETTINGS.primaryColor,
    location: data.location ?? DEFAULT_SETTINGS.location,
  };
}

export async function updateSettings(s: SiteSettings): Promise<boolean> {
  const payload = {
    title: s.title,
    subtitle: s.subtitle,
    button: s.button,
    whatsapp: s.whatsapp,
    phone: s.phone,
    tiktok: s.tiktok,
    facebook: s.facebook,
    instagram: s.instagram,
    primary_color: s.primaryColor,
    location: s.location,
  };

  if (s.id) {
    const { error } = await supabase
      .from("settings")
      .update(payload)
      .eq("id", s.id);

    if (error) {
      console.error("[Supabase] ❌ خطأ في تحديث الإعدادات:", error.message);
      return false;
    }
  } else {
    const { error } = await supabase.from("settings").insert([payload]);

    if (error) {
      console.error("[Supabase] ❌ خطأ في إنشاء الإعدادات:", error.message);
      return false;
    }
  }

  return true;
}
