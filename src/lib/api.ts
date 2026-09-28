import type { Garage61Status, NewsPost, SocialPost } from "./types";

const DEV_FALLBACK = import.meta.env.DEV;

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(path, { headers: { Accept: "application/json" } });
  if (!response.ok) {
    const text = await response.text();
    throw new ApiError(text || `Request failed: ${response.status}`, response.status);
  }
  return (await response.json()) as T;
}

const mockNews: NewsPost[] = [
  {
    id: 1,
    title: "Ignium Motorsport Season Update",
    slug: "ignium-season-update",
    excerpt: "Latest news from the team.",
    bodyMarkdown: "Latest news from the team.",
    author: "Ignium Motorsport",
    publishedAt: new Date().toISOString(),
  },
];

export async function getNews(): Promise<NewsPost[]> {
  try {
    const data = await fetchJson<{ results: NewsPost[] }>("/api/news");
    return data.results;
  } catch (error) {
    if (DEV_FALLBACK) return mockNews;
    throw error;
  }
}

export async function getNewsArticle(slug: string): Promise<NewsPost> {
  const data = await fetchJson<{ result: NewsPost }>(`/api/news/${slug}`);
  return data.result;
}

const emptyGarage61Status: Garage61Status = { activeDrivers: [] };

export async function getGarage61Status(): Promise<Garage61Status> {
  try {
    return await fetchJson<Garage61Status>("/api/garage61-status");
  } catch {
    return emptyGarage61Status;
  }
}

const mockSocialPosts: SocialPost[] = [
  {
    id: "dev-1",
    imageUrl: "/assets/ignium-hero-car.png",
    caption: "Ignium Motorsport",
    url: "https://www.instagram.com/ignium_motorsport/",
  },
];

export async function getSocialPosts(): Promise<SocialPost[]> {
  try {
    const data = await fetchJson<{ results: SocialPost[] }>("/api/social");
    return data.results;
  } catch (error) {
    if (DEV_FALLBACK) return mockSocialPosts;
    throw error;
  }
}

export { ApiError };
