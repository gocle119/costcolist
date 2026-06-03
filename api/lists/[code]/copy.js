const supabase = require('../../../_supabase');

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function generateCode() {
  return Array.from({ length: 6 }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join('');
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const code = (req.query.code || '').toUpperCase();

  const { data: source, error: sourceError } = await supabase
    .from('lists')
    .select('*')
    .eq('code', code)
    .single();

  if (sourceError || !source) return res.status(404).json({ error: 'List not found' });

  const { data: sourceItems } = await supabase
    .from('items')
    .select('*')
    .eq('list_id', source.id)
    .eq('checked', false)
    .order('position', { ascending: true });

  // Create new list
  let newList = null;
  for (let attempt = 0; attempt < 5; attempt++) {
    const newCode = generateCode();
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('lists')
      .insert({ code: newCode, name: `Copy of ${source.name}` })
      .select()
      .single();
    if (!error) { newList = data; break; }
    if (error.code !== '23505') return res.status(500).json({ error: 'Failed to create copy' });
  }

  if (!newList) return res.status(500).json({ error: 'Could not generate unique code' });

  // Copy unchecked items
  if (sourceItems && sourceItems.length > 0) {
    const copies = sourceItems.map(({ name, quantity, notes, item_number, price, category, position }) => ({
      list_id: newList.id, name, quantity, notes, item_number, price, category, position, checked: false,
    }));
    await supabase.from('items').insert(copies);
  }

  return res.status(201).json(newList);
};
