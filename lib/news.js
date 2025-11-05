import Parser from 'rss-parser';

const parser = new Parser({
  timeout: 10000,
});

const FEEDS = [
  // Times of India - Mumbai
  'https://timesofindia.indiatimes.com/rssfeeds/-2128838597.cms',
  // Indian Express - Mumbai
  'https://indianexpress.com/section/cities/mumbai/feed/',
  // Hindustan Times - Mumbai
  'https://www.hindustantimes.com/feeds/rss/cities/mumbai-news/rssfeed.xml',
  // Mid-Day Mumbai
  'https://www.mid-day.com/Resources/midday/rss/mumbai-news.xml',
];

const CATEGORY_KEYWORDS = [
  { key: 'civic', words: ['bmc', 'civic', 'municipal', 'water cut', 'power cut', 'infrastructure', 'metro', 'road work', 'drainage', 'monsoon work', 'storm water'] },
  { key: 'traffic', words: ['traffic', 'jam', 'congestion', 'slow-moving', 'diversion', 'closure', 'vehicle movement'] },
  { key: 'events', words: ['festival', 'event', 'concert', 'marathon', 'exhibition', 'fair', 'ganesh', 'diwali', 'navratri'] },
  { key: 'weather', words: ['rain', 'showers', 'thunderstorm', 'humidity', 'temperature', 'heat', 'cold', 'imd', 'monsoon', 'wind'] },
  { key: 'real estate', words: ['real estate', 'property', 'mhada', 'rera', 'redevelopment', 'builder', 'housing'] },
  { key: 'crime', words: ['police', 'arrested', 'crime', 'fraud', 'scam', 'theft', 'murder', 'assault', 'extortion', 'ncb'] },
];

function classifyCategory(text) {
  const lower = (text || '').toLowerCase();
  for (const c of CATEGORY_KEYWORDS) {
    if (c.words.some(w => lower.includes(w))) return c.key;
  }
  return 'general';
}

function normalizeItem(item) {
  const title = item.title?.trim() || '';
  const link = item.link || '';
  const isoDate = item.isoDate || item.pubDate || new Date().toISOString();
  const description = (item.contentSnippet || item.content || '').replace(/\s+/g, ' ').trim();
  const category = classifyCategory(`${title} ${description}`);
  return { title, link, isoDate: new Date(isoDate).toISOString(), description, category, source: item.feedTitle || '' };
}

export async function fetchMumbaiNews() {
  const results = [];
  const feeds = await Promise.allSettled(
    FEEDS.map(async (url) => {
      try {
        const feed = await parser.parseURL(url);
        const feedTitle = feed.title || new URL(url).hostname;
        const items = (feed.items || []).slice(0, 25).map(i => ({ ...i, feedTitle })).map(normalizeItem);
        return items;
      } catch (e) {
        return [];
      }
    })
  );

  for (const r of feeds) {
    if (r.status === 'fulfilled') results.push(...r.value);
  }

  const uniqueByTitle = new Map();
  for (const item of results) {
    if (!uniqueByTitle.has(item.title)) uniqueByTitle.set(item.title, item);
  }
  const deduped = Array.from(uniqueByTitle.values());

  deduped.sort((a, b) => new Date(b.isoDate) - new Date(a.isoDate));
  return deduped;
}

export function pickTopStory(items) {
  if (!items || items.length === 0) return null;
  // Prefer Mumbai-relevant keywords if ties, else most recent
  const priority = (i) => {
    const t = `${i.title} ${i.description}`.toLowerCase();
    let score = 0;
    if (i.category !== 'general') score += 2;
    if (t.includes('mumbai')) score += 2;
    if (t.includes('bmc') || t.includes('traffic') || t.includes('imd')) score += 1;
    // recency boost
    const hoursOld = (Date.now() - new Date(i.isoDate).getTime()) / (1000 * 60 * 60);
    score += Math.max(0, 24 - hoursOld) / 24;
    return score;
  };

  const sorted = [...items].sort((a, b) => priority(b) - priority(a));
  return sorted[0];
}

export function summarize(text, maxWords = 80) {
  const clean = (text || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  const words = clean.split(' ');
  if (words.length <= maxWords) return clean;
  return words.slice(0, maxWords).join(' ') + '?';
}
