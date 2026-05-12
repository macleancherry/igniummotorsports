import type { Driver, LiveEvent, LiveTimingRow, NewsPost, ResultRow } from "./types";

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

const mockDrivers: Driver[] = [
  {
    id: 1,
    name: "Mac Cherry",
    slug: "mac-cherry",
    raceNumber: "23",
    country: "Australia",
    bio: "Endurance-focused GT driver with a calm, data-first racecraft approach.",
    youtubeUrl: "https://www.youtube.com/@BudgetDadRacing",
  },
];

const mockNews: NewsPost[] = [
  {
    id: 1,
    title: "Ignium Motorsport Launches Live Race Control",
    slug: "ignium-live-race-control-launch",
    excerpt: "A new operations hub for race timing, stream tracking, and results sync.",
    bodyMarkdown: "Live Race Control is now online.",
    author: "Ignium Motorsport",
    publishedAt: new Date().toISOString(),
  },
];

const mockResults: ResultRow[] = [
  {
    id: 1,
    source: "manual",
    series: "IMSA Endurance",
    track: "Long Beach",
    car: "Ferrari 296 GT3",
    startPosition: 11,
    finishPosition: 7,
    classPosition: 5,
    bestLap: "1:19.083",
    incidents: 4,
    strengthOfField: 2850,
    completedAt: "2026-03-28T00:00:00Z",
  },
];

export async function getDrivers(): Promise<Driver[]> {
  try {
    const data = await fetchJson<{ results: Driver[] }>("/api/drivers");
    return data.results;
  } catch (error) {
    if (DEV_FALLBACK) return mockDrivers;
    throw error;
  }
}

export async function getDriver(slug: string): Promise<Driver> {
  const data = await fetchJson<{ result: Driver }>(`/api/drivers/${slug}`);
  return data.result;
}

export async function getDriverResults(slug: string): Promise<ResultRow[]> {
  const data = await fetchJson<{ results: ResultRow[] }>(`/api/drivers/${slug}/results`);
  return data.results;
}

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

export async function getResults(): Promise<ResultRow[]> {
  try {
    const data = await fetchJson<{ results: ResultRow[] }>("/api/results");
    return data.results;
  } catch (error) {
    if (DEV_FALLBACK) return mockResults;
    throw error;
  }
}

export async function getLive(): Promise<{ event: LiveEvent | null; drivers: Driver[] }> {
  return fetchJson<{ event: LiveEvent | null; drivers: Driver[] }>("/api/live");
}

export async function getTiming(eventId: number): Promise<LiveTimingRow[]> {
  const data = await fetchJson<{ rows: LiveTimingRow[] }>(`/api/timing/${eventId}`);
  return data.rows;
}

export { ApiError };
