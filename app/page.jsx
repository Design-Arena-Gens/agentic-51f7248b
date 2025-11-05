import { fetchMumbaiNews, pickTopStory, summarize } from '@/lib/news';
import PostCard from '@/components/PostCard';
import Link from 'next/link';

export const revalidate = 600; // ISR every 10 minutes

export default async function Page() {
  const items = await fetchMumbaiNews();
  const top = pickTopStory(items);

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  const content = top ? summarize(top.description || top.title, 80) : 'No recent updates available.';

  const data = top ? {
    headline: top.title,
    summary: content,
    date: dateStr,
    location: 'Mumbai, India',
    link: top.link,
    category: top.category,
    source: top.source,
  } : null;

  return (
    <div className="container">
      <div className="header">
        <div className="brand">
          <span className="brand-badge">MUMBAI</span>
          <strong>Local News ? Insta Post</strong>
        </div>
        <Link href="/api/news" className="button" prefetch={false}>API</Link>
      </div>

      <div className="grid">
        <div className="card">
          <PostCard data={data} />
        </div>
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Latest Headlines</h3>
          <ul>
            {items.slice(0, 8).map((i) => (
              <li key={i.link} style={{ marginBottom: 8 }}>
                <a href={i.link} target="_blank" rel="noreferrer" style={{ color: '#FFD54F', textDecoration: 'none' }}>
                  {i.title}
                </a>
                <div style={{ opacity: 0.7, fontSize: 12 }}>{new Date(i.isoDate).toLocaleString('en-IN')} ? {i.source}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="footer">Data aggregated from reputable Mumbai news RSS feeds. Classification is heuristic.</div>
    </div>
  );
}
