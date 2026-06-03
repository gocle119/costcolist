const supabase = require('../../../_supabase');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'PATCH') return res.status(405).json({ error: 'Method not allowed' });

  const code = (req.query.code || '').toUpperCase();
  const { itemId, name, quantity, notes, checked, item_number, price, category } = req.body || {};

  if (!itemId) return res.status(400).json({ error: 'itemId is required' });

  const { data: list, error: listError } = await supabase
    .from('lists')
    .select('id')
    .eq('code', code)
    .single();

  if (listError || !list) return res.status(404).json({ error: 'List not found' });

  const { data: existing, error: existError } = await supabase
    .from('items')
    .select('id')
    .eq('id', itemId)
    .eq('list_id', list.id)
    .single();

  if (existError || !existing) return res.status(404).json({ error: 'Item not found' });

  const updates = { updated_at: new Date().toISOString() };
  if (name !== undefined) updates.name = name.trim();
  if (quantity !== undefined) updates.quantity = String(quantity).trim() || '1';
  if (notes !== undefined) updates.notes = notes.trim();
  if (checked !== undefined) updates.checked = Boolean(checked);
  if (item_number !== undefined) updates.item_number = item_number.trim();
  if (category !== undefined) updates.category = category;
  if (price !== undefined) updates.price = (price === '' || price === null) ? null : parseFloat(price);

  const { data: item, error } = await supabase
    .from('items')
    .update(updates)
    .eq('id', itemId)
    .select()
    .single();

  if (error) {
    console.error('update item error:', error);
    return res.status(500).json({ error: 'Failed to update item' });
  }

  await supabase.from('lists').update({ updated_at: new Date().toISOString() }).eq('id', list.id);

  return res.status(200).json(item);
};
