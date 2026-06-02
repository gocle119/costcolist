const supabase = require('../_supabase');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const code = (req.query.code || '').toUpperCase();
  if (!code || code.length !== 6) return res.status(400).json({ error: 'Invalid code' });

  const { data: list, error: listError } = await supabase
    .from('lists')
    .select('*')
    .eq('code', code)
    .single();

  if (listError || !list) return res.status(404).json({ error: 'List not found' });

  const { data: items, error: itemsError } = await supabase
    .from('items')
    .select('*')
    .eq('list_id', list.id)
    .order('position', { ascending: true })
    .order('created_at', { ascending: true });

  if (itemsError) {
    console.error('fetch items error:', itemsError);
    return res.status(500).json({ error: 'Failed to fetch items' });
  }

  return res.status(200).json({ ...list, items: items || [] });
};
