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
      <div style={{ marginBottom: "2rem" }}>
        <Link to="/news" style={{ color: "var(--ignium-blue)", textDecoration: "none", fontSize: "0.9rem" }}>
          ← Back to news
        </Link>
      </div>

      {loading && <p>Loading article...</p>}
      {error && <p className="error">{error}</p>}
      {post && (
        <>
          {post.publishedAt && (
            <p className="kicker">
              {new Date(post.publishedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </p>
          )}
          <h1 style={{ marginTop: "0.5rem" }}>{post.title}</h1>
          {post.author && (
            <p className="muted" style={{ fontSize: "0.9rem", marginTop: "0.5rem" }}>
              By {post.author}
            </p>
          )}
          {post.coverImageUrl && (
            <div className="news-article-cover-wrap" style={{ marginTop: "1.25rem" }}>
              <img
                src={post.coverImageUrl}
                alt={post.title}
                className="news-article-cover"
                loading="eager"
                decoding="async"
              />
            </div>
          )}
          <div style={{ borderTop: "1px solid var(--ignium-border)", paddingTop: "1.5rem", marginTop: "1.5rem" }}>
            <p style={{ whiteSpace: "pre-wrap", lineHeight: "1.75" }}>{post.bodyMarkdown}</p>
          </div>
          <div style={{ borderTop: "1px solid var(--ignium-border)", paddingTop: "1.5rem", marginTop: "2rem" }}>
            <div className="link-row">
              <Link className="btn-primary" to="/live">
                Open Live Race Control
              </Link>
              <Link className="btn-ghost" to="/results">
                View Results
              </Link>
            </div>
          </div>
        </>
      )}
    </article>
  );
}
