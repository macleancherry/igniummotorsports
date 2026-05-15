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
    <>
      <section className="section compact subpage-hero">
        <div className="page-shell">
          <div className="eyebrow">Team Updates</div>
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

          {!loading && !error && posts.length > 0 ? (
            <div className="news-grid">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="news-card"
                  style={
                    post.coverImageUrl
                      ? {
                          backgroundImage: `linear-gradient(180deg, transparent 0%, rgba(3, 6, 9, 0.88) 68%), radial-gradient(circle at 80% 0%, rgba(0, 184, 248, 0.16), transparent 35%), url(${post.coverImageUrl})`,
                          backgroundSize: "auto, auto, cover",
                          backgroundPosition: "center, center, center",
                        }
                      : undefined
                  }
                >
                  <div className="news-meta">
                    {post.author ?? "Ignium Motorsport"}
                    {post.publishedAt ? ` • ${new Date(post.publishedAt).toLocaleDateString()}` : ""}
                  </div>
                  <h3>{post.title}</h3>
                  <p>{post.excerpt ?? "Read the full update."}</p>
                  <div className="button-row">
                    <Link className="button-secondary" to={`/news/${post.slug}`}>
                      Read Article
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : null}
        </div>
      </section>
    </>
  );
}
