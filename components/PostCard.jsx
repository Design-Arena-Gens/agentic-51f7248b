"use client";

import { useMemo, useRef, useState } from 'react';
import { toPng } from 'html-to-image';

function Skyline() {
  // Minimal vector skyline inspired graphic (no external assets)
  return (
    <svg width="100%" height="100%" viewBox="0 0 1080 1080" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a1a1a" />
          <stop offset="100%" stopColor="#0d0d0d" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="1080" height="1080" fill="url(#g)" />
      <g fill="#0b0b0b">
        <rect x="60" y="520" width="90" height="360" />
        <rect x="170" y="460" width="120" height="420" />
        <rect x="320" y="500" width="90" height="380" />
        <rect x="430" y="430" width="140" height="450" />
        <rect x="590" y="520" width="100" height="360" />
        <rect x="710" y="470" width="140" height="410" />
        <rect x="870" y="500" width="100" height="380" />
      </g>
      <g fill="#FFC107" opacity="0.15">
        <circle cx="880" cy="260" r="80" />
      </g>
    </svg>
  );
}

export default function PostCard({ data }) {
  const ref = useRef(null);
  const [downloading, setDownloading] = useState(false);

  const emojis = useMemo(() => {
    if (!data) return '?????';
    const map = {
      weather: '?????????',
      traffic: '??????',
      crime: '??????',
      'real estate': '???????',
      events: '??????',
      civic: '???????',
      general: '?????',
    };
    return map[data.category] || map.general;
  }, [data]);

  const hashtags = '#MumbaiNews #MumbaiUpdates #MumbaiCity #BreakingNews #LocalMumbai';

  const handleDownload = async () => {
    if (!ref.current || !data) return;
    try {
      setDownloading(true);
      const node = ref.current;
      const dataUrl = await toPng(node, { cacheBust: true, pixelRatio: 2 });
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `mumbai-news-${Date.now()}.png`;
      a.click();
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 12, opacity: 0.8 }}>Top story</div>
          <div style={{ fontWeight: 700 }}>{data ? data.source : '?'}</div>
        </div>
        <button className="button" onClick={handleDownload} disabled={!data || downloading}>
          {downloading ? 'Preparing?' : 'Download PNG'}
        </button>
      </div>

      <div
        ref={ref}
        style={{
          position: 'relative',
          width: 540,
          height: 540,
          background: '#0f1214',
          borderRadius: 16,
          overflow: 'hidden',
          border: '1px solid #23272a',
          boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
        }}
      >
        <Skyline />

        {/* Header stripe */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 10, background: '#FFC107' }} />

        {/* Tag */}
        <div style={{ position: 'absolute', top: 16, left: 16, background: '#FFC107', color: '#111', padding: '6px 10px', borderRadius: 8, fontWeight: 900, letterSpacing: 1 }}>
          MUMBAI ? {data?.date || ''}
        </div>

        {/* Headline */}
        <div style={{ position: 'absolute', left: 24, right: 24, top: 64, color: '#fff', fontFamily: 'var(--font-bebas)', lineHeight: 1.02, textTransform: 'uppercase', fontSize: 40 }}>
          {data ? data.headline : 'Fetching latest Mumbai updates?'}
        </div>

        {/* Divider */}
        <div style={{ position: 'absolute', left: 24, right: 24, top: 200, height: 2, background: 'rgba(255,193,7,0.5)' }} />

        {/* Summary */}
        <div style={{ position: 'absolute', left: 24, right: 24, top: 212, color: 'rgba(255,255,255,0.92)', fontSize: 16, lineHeight: 1.5 }}>
          {data ? `${data.summary}` : '?'}
        </div>

        {/* Footer */}
        <div style={{ position: 'absolute', left: 24, right: 24, bottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div style={{ color: '#FFC107', fontWeight: 800 }}>?? {data?.location || 'Mumbai'}</div>
            <div style={{ opacity: 0.8, fontSize: 12 }}>{hashtags}</div>
          </div>
          <div style={{ fontSize: 20 }}>{emojis}</div>
        </div>

        {/* Safety band */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 10, background: '#FFC107' }} />
      </div>

      {data && (
        <div style={{ marginTop: 12, fontSize: 12 }}>
          Source: <a href={data.link} target="_blank" rel="noreferrer" style={{ color: '#FFD54F' }}>{new URL(data.link).hostname}</a>
          {data.category ? <span style={{ marginLeft: 8, opacity: 0.8 }}>? {data.category}</span> : null}
        </div>
      )}
    </div>
  );
}
