export type NewsPost = {
  id: number;
  title: string;
  slug: string;
  excerpt?: string | null;
  bodyMarkdown?: string | null;
  coverImageUrl?: string | null;
  author?: string | null;
  publishedAt?: string | null;
  createdAt?: string | null;
};

// Placeholder shape — refine once real Garage61 API docs are available.
export type Garage61Status = {
  activeDrivers: Array<{ name: string }>;
};
