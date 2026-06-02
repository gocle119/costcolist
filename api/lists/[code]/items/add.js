const supabase = require('../../../_supabase');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const code = (req.query.code || '').toUpperCase();
  const { name, quantity = '1', notes = '' } = req.body || {};

  if (!name || !name.trim()) return res.status(400).json({ error: 'Item name is required' });

  const { data: list, error: listError } = await supabase
    .from('lists')
    .select('id')
    .eq('code', code)
    .single();

  if (listError || !list) return res.status(404).json({ error: 'List not found' });

  const { data: maxPos } = await supabase
    .from('items')
    .select('position')
    .eq('list_id', list.id)
    .order('position', { ascending: false })
    .limit(1)
    .single();

  const position = maxPos ? maxPos.position + 1 : 0;

  const { data: item, error } = await supabase
    .from('items')
    .insert({
      list_id: list.id,
      name: name.trim(),
      quantity: String(quantity).trim() || '1',
      notes: (notes || '').trim(),
      position,
    })
    .select()
    .single();

  if (error) {
    console.error('add item error:', error);
    return res.status(500).json({ error: 'Failed to add item' });
  }

  await supabase.from('lists').update({ updated_at: new Date().toISOString() }).eq('id', list.id);

  return res.status(201).json(item);
};
