const supabase = require('../_supabase');

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function generateCode() {
  return Array.from({ length: 6 }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join('');
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name } = req.body || {};
  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'List name is required' });
  }
  const trimmedName = name.trim().slice(0, 100);

  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateCode();
    const { data, error } = await supabase
      .from('lists')
      .insert({ code, name: trimmedName })
      .select()
      .single();

    if (!error) return res.status(201).json(data);
    if (error.code !== '23505') {
      console.error('create list error:', error);
      return res.status(500).json({ error: 'Failed to create list' });
    }
  }

  return res.status(500).json({ error: 'Could not generate unique code, try again' });
};
