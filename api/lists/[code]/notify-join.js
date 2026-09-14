const supabase = require('../../_supabase');
const { sendToList, isConfigured } = require('../../_push');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!isConfigured()) return res.status(503).json({ error: 'Push notifications are not configured yet' });

  const code = (req.query.code || '').toUpperCase();
  const { data: list } = await supabase
    .from('lists')
    .select('id, name')
    .eq('code', code)
    .eq('archived', false)
    .single();

  if (!list) return res.status(404).json({ error: 'List not found' });

  const result = await sendToList(list.id, {
    title: list.name,
    body: 'Someone joined your list',
    url: `/list/${code}`,
  });

  return res.status(200).json(result);
};
