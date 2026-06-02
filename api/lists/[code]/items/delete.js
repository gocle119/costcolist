const supabase = require('../../../_supabase');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'DELETE') return res.status(405).json({ error: 'Method not allowed' });

  const code = (req.query.code || '').toUpperCase();
  const { itemId } = req.body || {};

  if (!itemId) return res.status(400).json({ error: 'itemId is required' });

  const { data: list, error: listError } = await supabase
    .from('lists')
    .select('id')
    .eq('code', code)
    .single();

  if (listError || !list) return res.status(404).json({ error: 'List not found' });

  const { error } = await supabase
    .from('items')
    .delete()
    .eq('id', itemId)
    .eq('list_id', list.id);

  if (error) {
    console.error('delete item error:', error);
    return res.status(500).json({ error: 'Failed to delete item' });
  }

  await supabase.from('lists').update({ updated_at: new Date().toISOString() }).eq('id', list.id);

  return res.status(200).json({ success: true });
};
