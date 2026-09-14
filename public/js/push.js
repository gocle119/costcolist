// Push notification subscribe/unsubscribe for a single list. Loaded on list.html only.
// Safe no-op if the browser lacks Push API support or the server hasn't configured VAPID yet.

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
}

async function getCurrentSubscription() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return null;
  const reg = await navigator.serviceWorker.ready;
  return reg.pushManager.getSubscription();
}

async function isNotifySupported() {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

async function enableNotifications(code) {
  if (!(await isNotifySupported())) {
    showToast('Push notifications aren’t supported on this browser.', 'error', 3500);
    return false;
  }
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    showToast('Notification permission denied.', 'error', 3000);
    return false;
  }
  try {
    const keyRes = await fetch('/api/vapid-public-key');
    if (!keyRes.ok) throw new Error('not configured');
    const { publicKey } = await keyRes.json();

    const reg = await navigator.serviceWorker.ready;
    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });
    }
    await api('POST', `/api/lists/${code}/subscribe`, { subscription: sub.toJSON() });
    showToast('Notifications on for this list', 'success', 2000);
    return true;
  } catch (err) {
    showToast('Could not enable notifications yet.', 'error', 3000);
    return false;
  }
}

async function disableNotifications(code) {
  try {
    const sub = await getCurrentSubscription();
    if (sub) {
      await api('DELETE', `/api/lists/${code}/subscribe`, { endpoint: sub.endpoint });
      await sub.unsubscribe();
    }
    showToast('Notifications off for this list', 'info', 2000);
  } catch {}
}
