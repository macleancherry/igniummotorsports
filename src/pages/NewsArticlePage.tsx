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
    <section className="section compact">
      <div className="page-shell">
        <div className="button-row" style={{ marginTop: 0, marginBottom: 18 }}>
          <Link className="button-ghost" to="/news">
            Back To News
          </Link>
        </div>

        {loading ? (
          <div className="empty-state">
            <h3>Loading Article</h3>
            <p>Fetching story content.</p>
          </div>
        ) : null}

        {error ? (
          <div className="empty-state">
            <h3>Data Loading Notice</h3>
            <p>{error}</p>
          </div>
        ) : null}

        {post ? (
          <article className="panel article-shell">
            <div className="eyebrow">News Article</div>
            <h1 className="subpage-title">{post.title}</h1>

            <p className="data-caption">
              {post.author ? `By ${post.author}` : "Ignium Motorsport"}
              {post.publishedAt
                ? ` • ${new Date(post.publishedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}`
                : ""}
            </p>

            {post.coverImageUrl ? (
              <div className="news-article-cover-wrap">
                <img
                  src={post.coverImageUrl}
                  alt={post.title}
                  className="news-article-cover"
                  loading="eager"
                  decoding="async"
                />
              </div>
            ) : null}

            <div className="article-body">
              {(post.bodyMarkdown ?? "").split(/\n\n+/).map((paragraph, index) => (
                <p key={`${post.id}-${index}`}>{paragraph}</p>
              ))}
            </div>

            <div className="button-row">
              <Link className="button-primary" to="/live">
                Open Live Race Control
              </Link>
              <Link className="button-secondary" to="/results">
                View Results
              </Link>
            </div>
          </article>
        ) : null}
      </div>
    </section>
  );
}
