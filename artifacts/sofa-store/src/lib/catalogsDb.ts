import { supabase } from "./supabase";

export interface Catalog {
  id: number;
  name: string;
  fabric_type: string;
  warranty: string;
  image: string;
  created_at?: string;
}

export interface CatalogColor {
  id: number;
  catalog_id: number;
  name: string;
  code: string;
  image: string;
  created_at?: string;
}

// ─── CATALOGS ─────────────────────────────────────────────────────────────────

export async function getCatalogs(): Promise<Catalog[]> {
  const { data, error } = await supabase
    .from("catalogs")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) {
    console.error("[Supabase] ❌ خطأ في جلب الكتلوكات:", error.message);
    throw new Error(error.message);
  }
  return (data as Catalog[]) ?? [];
}

export async function addCatalog(
  item: Omit<Catalog, "id" | "created_at">
): Promise<Catalog | null> {
  const { data, error } = await supabase
    .from("catalogs")
    .insert([item])
    .select()
    .single();
  if (error) {
    console.error("[Supabase] ❌ خطأ في إضافة كتلوك:", error.message);
    return null;
  }
  return data as Catalog;
}

export async function updateCatalog(
  id: number,
  item: Partial<Omit<Catalog, "id" | "created_at">>
): Promise<boolean> {
  const { error } = await supabase.from("catalogs").update(item).eq("id", id);
  if (error) {
    console.error("[Supabase] ❌ خطأ في تحديث الكتلوك:", error.message);
    return false;
  }
  return true;
}

export async function deleteCatalog(id: number): Promise<boolean> {
  const { error } = await supabase.from("catalogs").delete().eq("id", id);
  if (error) {
    console.error("[Supabase] ❌ خطأ في حذف الكتلوك:", error.message);
    return false;
  }
  return true;
}

// ─── COLORS ───────────────────────────────────────────────────────────────────

export async function getColorsByCatalog(catalogId: number): Promise<CatalogColor[]> {
  const { data, error } = await supabase
    .from("catalog_colors")
    .select("*")
    .eq("catalog_id", catalogId)
    .order("created_at", { ascending: true });
  if (error) {
    console.error("[Supabase] ❌ خطأ في جلب الألوان:", error.message);
    throw new Error(error.message);
  }
  return (data as CatalogColor[]) ?? [];
}

export async function getAllColors(): Promise<CatalogColor[]> {
  const { data, error } = await supabase
    .from("catalog_colors")
    .select("*")
    .order("catalog_id", { ascending: true });
  if (error) {
    console.error("[Supabase] ❌ خطأ في جلب جميع الألوان:", error.message);
    throw new Error(error.message);
  }
  return (data as CatalogColor[]) ?? [];
}

export async function addColor(
  item: Omit<CatalogColor, "id" | "created_at">
): Promise<CatalogColor | null> {
  const { data, error } = await supabase
    .from("catalog_colors")
    .insert([item])
    .select()
    .single();
  if (error) {
    console.error("[Supabase] ❌ خطأ في إضافة لون:", error.message);
    return null;
  }
  return data as CatalogColor;
}

export async function updateColor(
  id: number,
  item: Partial<Omit<CatalogColor, "id" | "catalog_id" | "created_at">>
): Promise<boolean> {
  const { error } = await supabase.from("catalog_colors").update(item).eq("id", id);
  if (error) {
    console.error("[Supabase] ❌ خطأ في تحديث اللون:", error.message);
    return false;
  }
  return true;
}

export async function deleteColor(id: number): Promise<boolean> {
  const { error } = await supabase.from("catalog_colors").delete().eq("id", id);
  if (error) {
    console.error("[Supabase] ❌ خطأ في حذف اللون:", error.message);
    return false;
  }
  return true;
}
