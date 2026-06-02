const { createClient } = require('@supabase/supabase-js');

let _client = null;

const stripBOM = s => (s ? s.replace(/^﻿/, '') : s);

function getClient() {
  if (!_client) {
    _client = createClient(
      stripBOM(process.env.SUPABASE_URL),
      stripBOM(process.env.SUPABASE_SERVICE_ROLE_KEY)
    );
  }
  return _client;
}

// Proxy so existing code (supabase.from(...)) works unchanged,
// but createClient is only called on first actual use — not at module load time.
module.exports = new Proxy({}, {
  get(_, prop) {
    return getClient()[prop];
  },
});
