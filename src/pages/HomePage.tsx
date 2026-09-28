import { Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { getNews } from "../lib/api";
import { championships } from "../data/championships";
import { results } from "../data/results";
import { socialPosts } from "../data/social-posts";
import type { NewsPost } from "../lib/types";

export function HomePage() {
  const [news, setNews] = useState<NewsPost[]>([]);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);

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

  const toggleHeroVideo = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  return (
    <>
      <section className="hero">
        <div className="hero-media">
          <video
            ref={videoRef}
            className="hero-video"
            poster="/assets/ignium-hero-car.png"
            autoPlay
            muted
            loop
            playsInline
          >
            <source src="/assets/ignium-hero.mp4" type="video/mp4" />
          </video>
          <button
            type="button"
            className="hero-media-control"
            onClick={toggleHeroVideo}
            aria-label={isPlaying ? "Pause background video" : "Play background video"}
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
          </button>
        </div>

        <div className="hero-inner">
          <div className="hero-copy">
            <div className="eyebrow">iRacing Endurance Team</div>
            <h1 className="hero-title">
              <span className="blue">Ignite</span>
              <span>Your</span>
              <span>Passion</span>
            </h1>
            <p className="hero-subtitle">Ignium Motorsport competes on three core values: Hard Work, Dedication, and Positivity. We race with discipline, integrity, and the drive to excel.</p>
            <div className="button-row">
              <Link className="button-primary" to="/results">View Results</Link>
              <Link className="button-secondary" to="/about">Meet the Team</Link>
            </div>
          </div>

          <aside className="next-race-card">
            <div className="eyebrow">Currently Racing In</div>
            <h3>{championships[0]?.name ?? "See our results"}</h3>
            <p>
              <Link to="/results">View all championships &amp; ladders</Link>
            </p>
          </aside>
        </div>
      </section>

      <section className="section compact">
        <div className="page-shell">
          <div className="section-header">
            <h3>Recent Results</h3>
            <Link className="button-ghost" to="/results">All Results</Link>
          </div>
          <div className="news-grid">
            {recentResults.map((result) => (
              <article key={result.id} className="news-card">
                <div className="news-meta">{result.series}</div>
                <h3>{result.track}</h3>
                <p>{result.finish ?? result.note}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section compact">
        <div className="page-shell">
          <div className="section-header">
            <h3>Latest News</h3>
            <Link className="button-ghost" to="/news">All News</Link>
          </div>
          <div className="news-grid">
            {news.map((post) => (
              <article key={post.id} className="news-card">
                <div className="news-meta">Ignium Update</div>
                <h3>{post.title}</h3>
                <p>{post.excerpt}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section compact">
        <div className="page-shell">
          <div className="social-grid-heading">
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
              </a>
            ))}
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
