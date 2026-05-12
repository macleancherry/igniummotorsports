import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getNewsArticle } from "../lib/api";
import type { NewsPost } from "../lib/types";

export function NewsArticlePage() {
  const { slug = "" } = useParams();
  const [post, setPost] = useState<NewsPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    getNewsArticle(slug)
      .then((row) => {
        if (mounted) setPost(row);
      })
      .catch((err) => {
        if (mounted) setError(err instanceof Error ? err.message : "Failed to load article.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [slug]);

  return (
    <article className="page-wrap prose">
      <p>
        <Link to="/news">Back to news</Link>
      </p>
      {loading && <p>Loading article...</p>}
      {error && <p className="error">{error}</p>}
      {post && (
        <>
          <h1>{post.title}</h1>
          <p className="muted">{post.author ?? "Ignium Motorsport"}</p>
          <p>{post.bodyMarkdown}</p>
        </>
      )}
    </article>
  );
}
