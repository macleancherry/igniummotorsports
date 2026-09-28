import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getNews } from "../lib/api";
import { championships } from "../data/championships";
import { results } from "../data/results";
import { socialPosts } from "../data/social-posts";
import { ResultsTable } from "../components/ResultsTable";
import { formatResultDate } from "../lib/results";
import { useInView } from "../hooks/useInView";
import type { NewsPost } from "../lib/types";

const HERO_WORDS = ["Ignite", "Your", "Passion"];

export function HomePage() {
  const [news, setNews] = useState<NewsPost[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);

  const [resultsRef, resultsInView] = useInView<HTMLDivElement>();
  const [newsRef, newsInView] = useInView<HTMLDivElement>();
  const [socialRef, socialInView] = useInView<HTMLDivElement>();

  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsRevealed(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    let mounted = true;

    getNews()
      .then((newsData) => {
        if (!mounted) return;
        setNews(newsData.slice(0, 3));
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "Failed to load home data.");
      });

    return () => {
      mounted = false;
    };
  }, []);

  const recentResults = results.slice(0, 3);

  return (
    <>
      <section className="hero">
        <div className="hero-media">
          <img
            className="hero-image"
            src="/assets/ignium-hero-car.png"
            alt="Ignium Motorsport GT3 car on track"
            fetchPriority="high"
          />
          <div className="hero-scrim" aria-hidden="true" />
        </div>

        <div className="hero-inner">
          <div>
            <span className="eyebrow">— iRacing Endurance Team</span>
            <h1 className="hero-title">
              {HERO_WORDS.map((word, index) => (
                <span
                  key={word}
                  className={`hero-line${isRevealed ? " is-revealed" : ""}`}
                  style={{ transitionDelay: `${index * 120}ms` }}
                >
                  {word}
                </span>
              ))}
            </h1>
            <p className="hero-subtitle">
              Ignium Motorsport competes on three core values: Hard Work, Dedication, and Positivity. We race with
              discipline, integrity, and the drive to excel.
            </p>
            <div className="button-row">
              <Link className="button-primary" to="/results">
                View Results
              </Link>
              <Link className="button-secondary" to="/about">
                Meet the Team
              </Link>
            </div>
          </div>

          <aside className="stint-panel">
            <span className="mono text-accent">Currently Racing In</span>
            <h3>{championships[0]?.name ?? "See our results"}</h3>
            <p>
              <Link to="/results">View all championships &amp; ladders</Link>
            </p>
          </aside>
        </div>
      </section>

      <section className="section compact">
        <div className="page-shell">
          <div ref={resultsRef} className={`fade-up${resultsInView ? " is-in" : ""}`}>
            <div className="section-header">
              <h2>Recent Results</h2>
              <Link className="button-ghost" to="/results">
                All Results
              </Link>
            </div>
            <ResultsTable results={recentResults} caption="Ignium Motorsport's most recent race results" />
          </div>
        </div>
      </section>

      <section className="section compact">
        <div className="page-shell">
          <div ref={newsRef} className={`fade-up${newsInView ? " is-in" : ""}`}>
            <div className="section-header">
              <h2>Latest News</h2>
              <Link className="button-ghost" to="/news">
                All News
              </Link>
            </div>
            {news.length > 0 ? (
              <div className="news-teaser-grid">
                {news.map((post, index) => (
                  <Link
                    key={post.id}
                    to={`/news/${post.slug}`}
                    className={`article-card${index === 0 ? " article-card--feature" : ""}${
                      post.coverImageUrl ? "" : " no-image-card"
                    }`}
                  >
                    {post.coverImageUrl && <img src={post.coverImageUrl} alt="" loading="lazy" />}
                    {index === 0 && <span className="article-tag-latest">Latest</span>}
                    {post.publishedAt && (
                      <span className="split-date">{formatResultDate(post.publishedAt.slice(0, 10))}</span>
                    )}
                    <h3>{post.title}</h3>
                    <p>{post.excerpt}</p>
                  </Link>
                ))}
              </div>
            ) : (
              !error && <p>No news posted yet — check back soon.</p>
            )}
          </div>
        </div>
      </section>

      <section className="section compact">
        <div className="page-shell">
          <div ref={socialRef} className={`fade-up${socialInView ? " is-in" : ""}`}>
            <div className="section-header">
              <h2>Follow The Team</h2>
            </div>
            <div className="social-grid">
              {socialPosts.map((post) => (
                <a
                  key={post.id}
                  className="social-grid-item"
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img src={post.imageUrl} alt={post.caption ?? "Ignium Motorsport on Instagram"} loading="lazy" />
                  {post.caption && <span className="social-caption">{post.caption} ↗</span>}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {error ? (
        <section className="section compact">
          <div className="page-shell">
            <div className="empty-state">
              <h3>Data Loading Notice</h3>
              <p>{error}</p>
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
