const supabase = require('../../_supabase');
const { isConfigured } = require('../../_push');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!isConfigured()) return res.status(503).json({ error: 'Push notifications are not configured yet' });

  const code = (req.query.code || '').toUpperCase();
  const { data: list, error: listError } = await supabase
    .from('lists')
    .select('id')
    .eq('code', code)
    .eq('archived', false)
    .single();

  if (listError || !list) return res.status(404).json({ error: 'List not found' });

  if (req.method === 'POST') {
    const { subscription } = req.body || {};
    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return res.status(400).json({ error: 'Invalid subscription' });
    }
    const { error } = await supabase
      .from('push_subscriptions')
      .upsert({
        list_id: list.id,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      }, { onConflict: 'endpoint' });

    if (error) {
      console.error('subscribe error:', error);
      return res.status(500).json({ error: 'Failed to save subscription' });
    }
    return res.status(201).json({ ok: true });
  }

  if (req.method === 'DELETE') {
    const { endpoint } = req.body || {};
    if (!endpoint) return res.status(400).json({ error: 'endpoint is required' });
    await supabase.from('push_subscriptions').delete().eq('list_id', list.id).eq('endpoint', endpoint);
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
