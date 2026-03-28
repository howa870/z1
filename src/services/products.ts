import { supabase } from "../lib/supabase";

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  created_at: string;
}

export type ProductInput = Omit<Product, "id" | "created_at">;

export async function fetchProducts(): Promise<Product[]> {
  console.log("[products] جاري جلب المنتجات...");
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[products] ❌ خطأ في جلب المنتجات:", error.message);
    throw new Error(error.message);
  }

  console.log(`[products] ✅ تم جلب ${data?.length ?? 0} منتج`);
  return data ?? [];
}

export async function fetchProductById(id: number): Promise<Product | null> {
  console.log(`[products] جاري جلب المنتج #${id}...`);
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("[products] ❌ خطأ في جلب المنتج:", error.message);
    return null;
  }
  return data;
}

export async function createProduct(input: ProductInput): Promise<Product> {
  console.log("[products] جاري إضافة منتج جديد:", input.name);
  const { data, error } = await supabase
    .from("products")
    .insert(input)
    .select()
    .single();

  if (error) {
    console.error("[products] ❌ خطأ في إضافة المنتج:", error.message);
    throw new Error(error.message);
  }

  console.log("[products] ✅ تم إضافة المنتج:", data.id);
  return data;
}

export async function updateProduct(id: number, input: Partial<ProductInput>): Promise<Product> {
  console.log(`[products] جاري تحديث المنتج #${id}...`);
  const { data, error } = await supabase
    .from("products")
    .update(input)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("[products] ❌ خطأ في تحديث المنتج:", error.message);
    throw new Error(error.message);
  }

  console.log("[products] ✅ تم تحديث المنتج:", data.id);
  return data;
}

export async function deleteProduct(id: number): Promise<void> {
  console.log(`[products] جاري حذف المنتج #${id}...`);
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("[products] ❌ خطأ في حذف المنتج:", error.message);
    throw new Error(error.message);
  }

  console.log(`[products] ✅ تم حذف المنتج #${id}`);
}

export async function getProductsCount(): Promise<number> {
  const { count, error } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true });

  if (error) return 0;
  return count ?? 0;
}
