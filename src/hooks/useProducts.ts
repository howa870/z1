import { useState, useEffect, useCallback } from "react";
import {
  fetchProducts,
  deleteProduct,
  type Product,
} from "../services/products";

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProducts();
      setProducts(data);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "خطأ غير معروف";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const remove = useCallback(async (id: number) => {
    await deleteProduct(id);
    setProducts(prev => prev.filter(p => p.id !== id));
  }, []);

  return { products, loading, error, reload: load, remove };
}
