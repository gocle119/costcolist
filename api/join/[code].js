const supabase = require('../_supabase');

function escapeHtml(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function renderPage({ title, description, ogUrl, imageUrl, bodyHtml }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <meta name="theme-color" content="#E31837">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${imageUrl}">
  <meta property="og:url" content="${ogUrl}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${imageUrl}">
  <link rel="stylesheet" href="/css/style.css">
  <link rel="icon" href="/favicon.png">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
</head>
<body>
  <div class="page" style="display:flex; flex-direction:column; align-items:center; text-align:center; padding-top:60px;">
    ${bodyHtml}
  </div>
</body>
</html>`;
}

module.exports = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const rawCode = (req.query.code || '').toUpperCase();
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const origin = `${proto}://${req.headers.host}`;
  const imageUrl = `${origin}/og-image.png`;

  const code = /^[A-Z0-9]{6}$/.test(rawCode) ? rawCode : '';

  if (code) {
    const { data: list } = await supabase
      .from('lists')
      .select('code, name')
      .eq('code', code)
      .eq('archived', false)
      .single();

    if (list) {
      const safeName = escapeHtml(list.name);
      const listUrl = `${origin}/list/${list.code}`;
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(200).send(renderPage({
        title: `Join “${safeName}” on Shop119`,
        description: `Tap to view and add items to this shared shopping list.`,
        ogUrl: `${origin}/join/${list.code}`,
        imageUrl,
        bodyHtml: `
          <h1 style="margin-bottom:8px;">Shop<span style="color:var(--red);">119</span></h1>
          <p style="font-size:1.1rem; margin-bottom:24px;">You're invited to join<br><strong>${safeName}</strong></p>
          <a href="${listUrl}" class="btn btn-red" style="padding:14px 32px; font-size:1rem;">Join List</a>
          <p style="color:var(--muted); font-size:0.85rem; margin-top:16px;">Code: ${list.code}</p>
          <script>setTimeout(function () { window.location.href = ${JSON.stringify(listUrl)}; }, 1200);</script>
        `,
      }));
    }
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.status(404).send(renderPage({
    title: 'List not found — Shop119',
    description: 'This invite link is invalid or the list has been archived.',
    ogUrl: origin,
    imageUrl,
    bodyHtml: `
      <div style="font-size:2.5rem; margin-bottom:12px;">🛒</div>
      <h2 style="color:var(--red); margin-bottom:8px;">List not found</h2>
      <p style="color:var(--muted); margin-bottom:24px;">This invite link doesn't match any list. It may have been archived.</p>
      <a href="/" class="btn btn-red">Go to Shop119</a>
    `,
  }));
};
