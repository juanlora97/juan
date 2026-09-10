/*
# Create photo portfolio content model

1. New Tables
- `portfolio_categories` stores the five photography categories and their display order.
- `portfolio_projects` stores one portfolio work per gallery cover, including title, description, category, published status, and ordering mode.
- `portfolio_images` stores the individual images inside each project, including captions and sequence.
- `portfolio_profile` stores the public photographer contact information.

2. Security
- Row-level security is enabled on every table.
- Public visitors can only read published projects, their images, active categories, and the public profile.
- Authenticated users can manage portfolio content through owner-scoped policies.

3. Important Notes
- This migration is additive and safe to re-run.
- Project ordering supports manual and random presentation modes.
*/

CREATE TABLE IF NOT EXISTS portfolio_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  owner_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS portfolio_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  category_id uuid REFERENCES portfolio_categories(id) ON DELETE SET NULL,
  cover_image_url text NOT NULL DEFAULT '',
  sort_mode text NOT NULL DEFAULT 'manual' CHECK (sort_mode IN ('manual', 'random')),
  display_order integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  owner_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS portfolio_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES portfolio_projects(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  caption text NOT NULL DEFAULT '',
  display_order integer NOT NULL DEFAULT 0,
  owner_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS portfolio_profile (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT 'Juan Lora',
  email text NOT NULL DEFAULT 'Juanloracardoso@gmail.com',
  phone text NOT NULL DEFAULT '+55 24 9-9906.7132',
  bio text NOT NULL DEFAULT '',
  owner_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE portfolio_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_profile ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read active portfolio categories" ON portfolio_categories;
CREATE POLICY "Public can read active portfolio categories" ON portfolio_categories FOR SELECT TO anon, authenticated USING (is_active = true);
DROP POLICY IF EXISTS "Owners can read portfolio categories" ON portfolio_categories;
CREATE POLICY "Owners can read portfolio categories" ON portfolio_categories FOR SELECT TO authenticated USING (auth.uid() = owner_id);
DROP POLICY IF EXISTS "Owners can insert portfolio categories" ON portfolio_categories;
CREATE POLICY "Owners can insert portfolio categories" ON portfolio_categories FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
DROP POLICY IF EXISTS "Owners can update portfolio categories" ON portfolio_categories;
CREATE POLICY "Owners can update portfolio categories" ON portfolio_categories FOR UPDATE TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
DROP POLICY IF EXISTS "Owners can delete portfolio categories" ON portfolio_categories;
CREATE POLICY "Owners can delete portfolio categories" ON portfolio_categories FOR DELETE TO authenticated USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Public can read published portfolio projects" ON portfolio_projects;
CREATE POLICY "Public can read published portfolio projects" ON portfolio_projects FOR SELECT TO anon, authenticated USING (is_published = true);
DROP POLICY IF EXISTS "Owners can read portfolio projects" ON portfolio_projects;
CREATE POLICY "Owners can read portfolio projects" ON portfolio_projects FOR SELECT TO authenticated USING (auth.uid() = owner_id);
DROP POLICY IF EXISTS "Owners can insert portfolio projects" ON portfolio_projects;
CREATE POLICY "Owners can insert portfolio projects" ON portfolio_projects FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
DROP POLICY IF EXISTS "Owners can update portfolio projects" ON portfolio_projects;
CREATE POLICY "Owners can update portfolio projects" ON portfolio_projects FOR UPDATE TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
DROP POLICY IF EXISTS "Owners can delete portfolio projects" ON portfolio_projects;
CREATE POLICY "Owners can delete portfolio projects" ON portfolio_projects FOR DELETE TO authenticated USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Public can read images from published projects" ON portfolio_images;
CREATE POLICY "Public can read images from published projects" ON portfolio_images FOR SELECT TO anon, authenticated USING (EXISTS (SELECT 1 FROM portfolio_projects WHERE portfolio_projects.id = portfolio_images.project_id AND portfolio_projects.is_published = true));
DROP POLICY IF EXISTS "Owners can read portfolio images" ON portfolio_images;
CREATE POLICY "Owners can read portfolio images" ON portfolio_images FOR SELECT TO authenticated USING (auth.uid() = owner_id);
DROP POLICY IF EXISTS "Owners can insert portfolio images" ON portfolio_images;
CREATE POLICY "Owners can insert portfolio images" ON portfolio_images FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id AND EXISTS (SELECT 1 FROM portfolio_projects WHERE portfolio_projects.id = portfolio_images.project_id AND portfolio_projects.owner_id = auth.uid()));
DROP POLICY IF EXISTS "Owners can update portfolio images" ON portfolio_images;
CREATE POLICY "Owners can update portfolio images" ON portfolio_images FOR UPDATE TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
DROP POLICY IF EXISTS "Owners can delete portfolio images" ON portfolio_images;
CREATE POLICY "Owners can delete portfolio images" ON portfolio_images FOR DELETE TO authenticated USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Public can read portfolio profile" ON portfolio_profile;
CREATE POLICY "Public can read portfolio profile" ON portfolio_profile FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Owners can read portfolio profile" ON portfolio_profile;
CREATE POLICY "Owners can read portfolio profile" ON portfolio_profile FOR SELECT TO authenticated USING (auth.uid() = owner_id);
DROP POLICY IF EXISTS "Owners can insert portfolio profile" ON portfolio_profile;
CREATE POLICY "Owners can insert portfolio profile" ON portfolio_profile FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
DROP POLICY IF EXISTS "Owners can update portfolio profile" ON portfolio_profile;
CREATE POLICY "Owners can update portfolio profile" ON portfolio_profile FOR UPDATE TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
DROP POLICY IF EXISTS "Owners can delete portfolio profile" ON portfolio_profile;
CREATE POLICY "Owners can delete portfolio profile" ON portfolio_profile FOR DELETE TO authenticated USING (auth.uid() = owner_id);

CREATE INDEX IF NOT EXISTS portfolio_projects_category_order_idx ON portfolio_projects (category_id, display_order);
CREATE INDEX IF NOT EXISTS portfolio_images_project_order_idx ON portfolio_images (project_id, display_order);
