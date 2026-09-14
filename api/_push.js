const webpush = require('web-push');
const supabase = require('./_supabase');

const stripBOM = s => (s ? s.replace(/^﻿/, '') : s);

let configured = false;
function isConfigured() {
  return !!(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY && process.env.VAPID_SUBJECT);
}
function ensureConfigured() {
  if (configured || !isConfigured()) return;
  webpush.setVapidDetails(
    stripBOM(process.env.VAPID_SUBJECT),
    stripBOM(process.env.VAPID_PUBLIC_KEY),
    stripBOM(process.env.VAPID_PRIVATE_KEY),
  );
  configured = true;
}

// Sends a push payload to every subscriber of a list (except excludeEndpoint, if given),
// and opportunistically deletes subscriptions the push service reports as gone (404/410).
async function sendToList(listId, payload, excludeEndpoint) {
  ensureConfigured();
  if (!isConfigured()) return { sent: 0, configured: false };

  const { data: subs } = await supabase
    .from('push_subscriptions')
    .select('id, endpoint, p256dh, auth')
    .eq('list_id', listId);

  if (!subs || !subs.length) return { sent: 0, configured: true };

  const targets = subs.filter(s => s.endpoint !== excludeEndpoint);
  const results = await Promise.allSettled(targets.map(sub =>
    webpush.sendNotification(
      { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
      JSON.stringify(payload),
    ).catch(err => {
      if (err.statusCode === 404 || err.statusCode === 410) {
        return supabase.from('push_subscriptions').delete().eq('id', sub.id).then(() => { throw err; });
      }
      throw err;
    })
  ));

  return { sent: results.filter(r => r.status === 'fulfilled').length, configured: true };
}

module.exports = { isConfigured, sendToList };
