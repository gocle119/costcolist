// Proxies Open Food Facts (free, keyless) server-side so the client never has to deal
// with a third-party API directly (CORS, rate limits, error shape).
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const upc = (req.query.upc || '').replace(/[^0-9]/g, '');
  if (!upc || upc.length < 6 || upc.length > 14) {
    return res.status(400).json({ error: 'Invalid barcode' });
  }

  try {
    const offRes = await fetch(`https://world.openfoodfacts.org/api/v2/product/${upc}.json`, {
      headers: { 'User-Agent': 'Shop119/1.0 (+https://shop119.vercel.app)' },
    });
    const data = await offRes.json();

    if (data.status !== 1 || !data.product) {
      return res.status(200).json({ found: false, upc });
    }

    const name = data.product.product_name || data.product.product_name_en
      || [data.product.brands, data.product.generic_name].filter(Boolean).join(' ')
      || '';

    if (!name.trim()) return res.status(200).json({ found: false, upc });

    return res.status(200).json({ found: true, upc, name: name.trim() });
  } catch (err) {
    console.error('barcode lookup error:', err);
    return res.status(502).json({ error: 'Barcode lookup failed', found: false, upc });
  }
};
