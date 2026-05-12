import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getNews } from "../lib/api";
import type { NewsPost } from "../lib/types";

export function NewsPage() {
  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    getNews()
      .then((rows) => {
        if (mounted) setPosts(rows);
      })
      .catch((err) => {
        if (mounted) setError(err instanceof Error ? err.message : "Failed to load news.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="page-wrap">
      <h1>News</h1>
      {loading && <p>Loading news...</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && posts.length === 0 && <p>No news yet.</p>}
      <div className="stack">
        {posts.map((post) => (
          <article className="panel" key={post.id}>
            <h2>{post.title}</h2>
            <p>{post.excerpt}</p>
            <p className="muted">{post.author ?? "Ignium Motorsport"}</p>
            <Link to={`/news/${post.slug}`}>Read article</Link>
          </article>
        ))}
      </div>
    </section>
  );
}
