-- ========================================
-- جدول المنتجات
-- ========================================
CREATE TABLE IF NOT EXISTS products (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name        TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price       NUMERIC(12, 2) NOT NULL DEFAULT 0,
  image       TEXT NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ========================================
-- Row Level Security
-- ========================================
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- قراءة عامة لأي زائر
CREATE POLICY "public_read_products"
  ON products FOR SELECT
  USING (true);

-- كتابة/تعديل/حذف للمستخدم المسجل فقط
CREATE POLICY "auth_insert_products"
  ON products FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "auth_update_products"
  ON products FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "auth_delete_products"
  ON products FOR DELETE
  USING (auth.role() = 'authenticated');

-- ========================================
-- Storage Bucket: images
-- (نفّذ هذا في Supabase Dashboard > Storage)
-- ========================================
-- 1. أنشئ bucket اسمه: images
-- 2. فعّل Public Access
-- 3. أضف السياسات التالية:

-- INSERT policy (authenticated):
-- CREATE POLICY "auth_upload_images"
--   ON storage.objects FOR INSERT
--   WITH CHECK (bucket_id = 'images' AND auth.role() = 'authenticated');

-- SELECT policy (public):
-- CREATE POLICY "public_read_images"
--   ON storage.objects FOR SELECT
--   USING (bucket_id = 'images');
