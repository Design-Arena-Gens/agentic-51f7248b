import { fetchMumbaiNews, pickTopStory, summarize } from '@/lib/news';

export const revalidate = 300;

export async function GET() {
  try {
    const items = await fetchMumbaiNews();
    const top = pickTopStory(items);
    const summary = top ? summarize(top.description || top.title, 80) : null;
    return new Response(JSON.stringify({ items, top, summary }), { status: 200, headers: { 'content-type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Failed to fetch' }), { status: 500, headers: { 'content-type': 'application/json' } });
  }
}
