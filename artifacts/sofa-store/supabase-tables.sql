-- ============================================================
-- قنفات ودواوين الأسدي — Supabase Tables Setup
-- نفّذ هذا الكود في محرر SQL في لوحة تحكم Supabase
-- ============================================================

-- ── جدول المعرض ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gallery (
  id         BIGSERIAL PRIMARY KEY,
  url        TEXT        NOT NULL,
  type       TEXT        NOT NULL DEFAULT 'image' CHECK (type IN ('image', 'video')),
  title      TEXT        NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── جدول التقييمات ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS testimonials (
  id         BIGSERIAL PRIMARY KEY,
  rating     INT         NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  comment    TEXT        NOT NULL,
  image      TEXT        NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── جدول الإعدادات ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS settings (
  id            BIGSERIAL PRIMARY KEY,
  title         TEXT NOT NULL DEFAULT 'قنفات ودواوين الأسدي',
  subtitle      TEXT NOT NULL DEFAULT 'تفصيل وبيع بأعلى جودة',
  button        TEXT NOT NULL DEFAULT 'اطلب الآن',
  whatsapp      TEXT NOT NULL DEFAULT '9647881457896',
  phone         TEXT NOT NULL DEFAULT '+9647881457896',
  tiktok        TEXT NOT NULL DEFAULT 'https://www.tiktok.com/@alasde92',
  facebook      TEXT NOT NULL DEFAULT 'https://www.facebook.com/share/18KUs2QP3f/',
  instagram     TEXT NOT NULL DEFAULT 'https://www.instagram.com/allasde9',
  primary_color TEXT NOT NULL DEFAULT '#d4af37',
  location      TEXT NOT NULL DEFAULT E'كركوك - حي العسكري\nقرب جامع خديجة الكبرى',
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── جدول الكتلوكات ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS catalogs (
  id          BIGSERIAL PRIMARY KEY,
  name        TEXT        NOT NULL,
  fabric_type TEXT        NOT NULL DEFAULT '',
  warranty    TEXT        NOT NULL DEFAULT '',
  image       TEXT        NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── جدول الألوان ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS catalog_colors (
  id         BIGSERIAL PRIMARY KEY,
  catalog_id BIGINT      NOT NULL REFERENCES catalogs(id) ON DELETE CASCADE,
  name       TEXT        NOT NULL,
  code       TEXT        NOT NULL DEFAULT '',
  image      TEXT        NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index للبحث السريع بالكتلوك
CREATE INDEX IF NOT EXISTS idx_catalog_colors_catalog_id ON catalog_colors(catalog_id);

-- ── Row Level Security ──────────────────────────────────────
ALTER TABLE gallery          ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials     ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings         ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalogs         ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog_colors   ENABLE ROW LEVEL SECURITY;

-- القراءة للجميع
CREATE POLICY "public_read_gallery"        ON gallery        FOR SELECT USING (true);
CREATE POLICY "public_read_testimonials"   ON testimonials   FOR SELECT USING (true);
CREATE POLICY "public_read_settings"       ON settings       FOR SELECT USING (true);
CREATE POLICY "public_read_catalogs"       ON catalogs       FOR SELECT USING (true);
CREATE POLICY "public_read_colors"         ON catalog_colors FOR SELECT USING (true);

-- الكتابة للجميع (قيّدها لاحقاً بـ Auth إذا أردت)
CREATE POLICY "public_insert_gallery"      ON gallery        FOR INSERT WITH CHECK (true);
CREATE POLICY "public_delete_gallery"      ON gallery        FOR DELETE USING (true);
CREATE POLICY "public_insert_testimonials" ON testimonials   FOR INSERT WITH CHECK (true);
CREATE POLICY "public_delete_testimonials" ON testimonials   FOR DELETE USING (true);
CREATE POLICY "public_update_settings"     ON settings       FOR UPDATE USING (true);
CREATE POLICY "public_insert_settings"     ON settings       FOR INSERT WITH CHECK (true);
CREATE POLICY "public_insert_catalogs"     ON catalogs       FOR INSERT WITH CHECK (true);
CREATE POLICY "public_update_catalogs"     ON catalogs       FOR UPDATE USING (true);
CREATE POLICY "public_delete_catalogs"     ON catalogs       FOR DELETE USING (true);
CREATE POLICY "public_insert_colors"       ON catalog_colors FOR INSERT WITH CHECK (true);
CREATE POLICY "public_update_colors"       ON catalog_colors FOR UPDATE USING (true);
CREATE POLICY "public_delete_colors"       ON catalog_colors FOR DELETE USING (true);

-- ── الإعدادات الافتراضية ────────────────────────────────────
INSERT INTO settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- ── بيانات افتراضية للمعرض ──────────────────────────────────
INSERT INTO gallery (url, type, title) VALUES
  ('https://images.unsplash.com/photo-1762803842055-de1e5fb14477?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080', 'image', 'قنفة فاخرة 1'),
  ('https://images.unsplash.com/photo-1683793837504-318275ff665d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080', 'image', 'ديوان مخمل ذهبي'),
  ('https://images.unsplash.com/photo-1707299231603-6c0a93e0f7fa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080', 'image', 'غرفة جلوس فاخرة'),
  ('https://images.unsplash.com/photo-1555041469-a586c61ea9bc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080', 'image', 'أريكة كلاسيكية'),
  ('https://images.unsplash.com/photo-1567016432779-094069958ea5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080', 'image', 'ديوان ملكي'),
  ('https://images.unsplash.com/photo-1586023492125-27b2c045efd7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080', 'image', 'كنب فاخر')
ON CONFLICT DO NOTHING;

-- ── بيانات افتراضية للتقييمات ───────────────────────────────
INSERT INTO testimonials (rating, comment) VALUES
  (5, 'شغلهم نظيف والتفصيل دقيق جداً 👌'),
  (5, 'أفضل مكان طلبت منه قنفات ودواوين بصراحة'),
  (5, 'سعر مناسب وجودة عالية — أنصح الجميع')
ON CONFLICT DO NOTHING;
