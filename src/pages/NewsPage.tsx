import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getNews } from "../lib/api";
import { formatSplitDate } from "../lib/format";
import { useInView } from "../hooks/useInView";
import type { NewsPost } from "../lib/types";

export function NewsPage() {
  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gridRef, gridInView] = useInView<HTMLDivElement>();

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

  const [feature, ...rest] = posts;

  return (
    <>
      <section className="subpage-hero">
        <div className="page-shell">
          <span className="eyebrow">— Team Updates</span>
          <h1 className="subpage-title">News</h1>
          <p className="subpage-intro">
            Race reports, announcements, and behind-the-scenes updates from Ignium Motorsport.
          </p>
        </div>
      </section>

      <section className="section compact">
        <div className="page-shell">
          {loading ? (
            <div className="empty-state">
              <h3>Loading News</h3>
              <p>Fetching the latest updates.</p>
            </div>
          ) : null}

          {error ? (
            <div className="empty-state">
              <h3>Data Loading Notice</h3>
              <p>{error}</p>
            </div>
          ) : null}

          {!loading && !error && posts.length === 0 ? (
            <div className="empty-state">
              <h3>No News Yet</h3>
              <p>There are no published updates right now.</p>
            </div>
          ) : null}

          {!loading && !error && feature ? (
            <div ref={gridRef} className={`fade-up${gridInView ? " is-in" : ""}`}>
              <Link
                to={`/news/${feature.slug}`}
                className={`article-card article-card--feature${feature.coverImageUrl ? "" : " no-image-card"}`}
              >
                {feature.coverImageUrl && <img src={feature.coverImageUrl} alt="" loading="lazy" />}
                <span className="article-tag-latest">Latest</span>
                {feature.publishedAt && <span className="split-date">{formatSplitDate(feature.publishedAt)}</span>}
                <h3>{feature.title}</h3>
                <p>{feature.excerpt}</p>
              </Link>

              {rest.length > 0 && (
                <div className="article-grid" style={{ marginTop: 24 }}>
                  {rest.map((post) => (
                    <Link
                      key={post.id}
                      to={`/news/${post.slug}`}
                      className={`article-card${post.coverImageUrl ? "" : " no-image-card"}`}
                    >
                      {post.coverImageUrl && <img src={post.coverImageUrl} alt="" loading="lazy" />}
                      {post.publishedAt && <span className="split-date">{formatSplitDate(post.publishedAt)}</span>}
                      <h3>{post.title}</h3>
                      <p>{post.excerpt}</p>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </div>
      </section>
    </>
  );
}
