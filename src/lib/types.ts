export type Category = {
  id: string;
  name: string;
  slug: string;
  display_order: number;
  is_active: boolean;
};

export type PortfolioImage = {
  id: string;
  project_id: string;
  image_url: string;
  caption: string;
  display_order: number;
};

export type Project = {
  id: string;
  title: string;
  description: string;
  category_id: string | null;
  cover_image_url: string;
  sort_mode: 'manual' | 'random';
  display_order: number;
  is_published: boolean;
  category?: Category | null;
  images: PortfolioImage[];
};

export type Profile = {
  id: string;
  name: string;
  email: string;
  phone: string;
  bio: string;
};
