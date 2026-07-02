const supabase = require('../../../_supabase');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const code = (req.query.code || '').toUpperCase();
  const { items: reorderedItems } = req.body || {};

  if (!Array.isArray(reorderedItems) || !reorderedItems.length) {
    return res.status(400).json({ error: 'items array is required' });
  }
  if (reorderedItems.some(it => !it || !it.id || typeof it.position !== 'number')) {
    return res.status(400).json({ error: 'Each item must have id and position' });
  }

  const { data: list, error: listError } = await supabase
    .from('lists')
    .select('id')
    .eq('code', code)
    .single();

  if (listError || !list) return res.status(404).json({ error: 'List not found' });

  const results = await Promise.all(
    reorderedItems.map(it => {
      const updates = { position: it.position };
      if (it.category !== undefined) updates.category = it.category;
      return supabase.from('items').update(updates).eq('id', it.id).eq('list_id', list.id);
    })
  );

  const failed = results.find(r => r.error);
  if (failed) {
    console.error('reorder items error:', failed.error);
    return res.status(500).json({ error: 'Failed to reorder items' });
  }

  await supabase.from('lists').update({ updated_at: new Date().toISOString() }).eq('id', list.id);

  return res.status(200).json({ success: true });
};
