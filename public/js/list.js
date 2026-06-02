// ── State ──────────────────────────────────────────────────────────────────
const pathParts = window.location.pathname.split('/');
const listCode = (pathParts[pathParts.indexOf('list') + 1] || '').toUpperCase();

let listData = null;
let items = [];
let lastUpdatedAt = null;
let pollTimer = null;
let editingItemId = null;

// ── DOM refs ────────────────────────────────────────────────────────────────
const loadingState = document.getElementById('loading-state');
const errorState   = document.getElementById('error-state');
const mainState    = document.getElementById('main-state');
const itemsContainer = document.getElementById('items-container');
const fab          = document.getElementById('fab');
const addForm      = document.getElementById('add-form-container');
const addName      = document.getElementById('add-name');
const addQty       = document.getElementById('add-qty');
const addNotes     = document.getElementById('add-notes');
const addError     = document.getElementById('add-error');
const addSubmitBtn = document.getElementById('add-submit-btn');
const addCancelBtn = document.getElementById('add-cancel-btn');
const statusBar    = document.getElementById('status-bar');
const shareBtn     = document.getElementById('share-btn');
const shareOverlay = document.getElementById('share-overlay');
const listNameHeader = document.getElementById('list-name-header');
const codeBadge    = document.getElementById('code-badge');

// ── Init ────────────────────────────────────────────────────────────────────
if (!listCode || listCode.length !== 6) {
  window.location.href = '/';
} else {
  loadList(true);
  pollTimer = setInterval(() => loadList(false), 3500);
}

// ── API helpers ─────────────────────────────────────────────────────────────
async function api(method, path, body) {
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(path, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

async function loadList(initial) {
  try {
    const data = await api('GET', `/api/lists/${listCode}`);
    if (initial || data.updated_at !== lastUpdatedAt) {
      lastUpdatedAt = data.updated_at;
      listData = data;
      items = data.items || [];
      if (initial) showMain(data);
      renderItems();
    }
    setStatus('');
  } catch (err) {
    if (initial) {
      loadingState.style.display = 'none';
      errorState.style.display = 'block';
      clearInterval(pollTimer);
    } else {
      setStatus('Connection issue — retrying…');
    }
  }
}

function showMain(data) {
  loadingState.style.display = 'none';
  mainState.style.display = 'block';
  fab.style.display = 'flex';
  document.title = `${data.name} — CostcoList`;
  listNameHeader.textContent = data.name;
  listNameHeader.style.display = 'block';
  codeBadge.textContent = data.code;
  codeBadge.style.display = 'inline-block';
  shareBtn.style.display = 'inline-flex';
  document.getElementById('share-code-val').textContent = data.code;
  document.getElementById('share-url-val').textContent = window.location.href;
}

function setStatus(msg) {
  statusBar.textContent = msg;
}

// ── Render items ─────────────────────────────────────────────────────────────
function renderItems() {
  const sorted = [
    ...items.filter(i => !i.checked).sort((a, b) => a.position - b.position || new Date(a.created_at) - new Date(b.created_at)),
    ...items.filter(i => i.checked).sort((a, b) => a.position - b.position || new Date(a.created_at) - new Date(b.created_at)),
  ];

  if (sorted.length === 0) {
    itemsContainer.innerHTML = `
      <div class="empty-state">
        <div class="icon">🛒</div>
        <p>No items yet. Tap <strong>+</strong> to add something.</p>
      </div>`;
    return;
  }

  // Remove empty state if present
  const emptyState = itemsContainer.querySelector('.empty-state');
  if (emptyState) emptyState.remove();

  // Keyed diff: only touch nodes that changed or are new/removed
  const existingMap = {};
  itemsContainer.querySelectorAll('[data-item-id]').forEach(el => {
    existingMap[el.dataset.itemId] = el;
  });

  const newIds = new Set(sorted.map(i => i.id));

  // Remove deleted items
  Object.keys(existingMap).forEach(id => {
    if (!newIds.has(id)) existingMap[id].remove();
  });

  sorted.forEach((item, idx) => {
    if (item.id === editingItemId) {
      // Keep the edit form in place — just ensure position
      const existing = existingMap[item.id];
      if (existing && existing !== itemsContainer.children[idx]) {
        itemsContainer.insertBefore(existing, itemsContainer.children[idx] || null);
      }
      return;
    }

    const existing = existingMap[item.id];
    const node = buildItemNode(item);

    if (!existing) {
      itemsContainer.insertBefore(node, itemsContainer.children[idx] || null);
    } else {
      // Update in place if changed
      if (existing.dataset.updatedAt !== item.updated_at || existing.dataset.checked !== String(item.checked)) {
        existing.replaceWith(node);
      } else if (existing !== itemsContainer.children[idx]) {
        itemsContainer.insertBefore(existing, itemsContainer.children[idx] || null);
      }
    }
  });
}

function buildItemNode(item) {
  const div = document.createElement('div');
  div.className = `item-card${item.checked ? ' checked' : ''}`;
  div.dataset.itemId = item.id;
  div.dataset.updatedAt = item.updated_at;
  div.dataset.checked = String(item.checked);

  const checkEl = document.createElement('div');
  checkEl.className = `item-check${item.checked ? ' checked' : ''}`;
  checkEl.title = item.checked ? 'Mark as needed' : 'Mark as got it';
  checkEl.addEventListener('click', () => toggleCheck(item));

  const body = document.createElement('div');
  body.className = 'item-body';
  body.innerHTML = `
    <div class="item-name">${escHtml(item.name)}</div>
    <div class="item-meta">
      ${item.quantity && item.quantity !== '1' ? `<span class="qty-badge">× ${escHtml(item.quantity)}</span>` : item.quantity === '1' ? '<span class="qty-badge">× 1</span>' : ''}
      ${item.notes ? `<span class="item-notes">${escHtml(item.notes)}</span>` : ''}
    </div>`;

  const actions = document.createElement('div');
  actions.className = 'item-actions';

  const editBtn = document.createElement('button');
  editBtn.className = 'btn-icon';
  editBtn.title = 'Edit';
  editBtn.textContent = '✏️';
  editBtn.addEventListener('click', () => startEdit(item, div));

  const delBtn = document.createElement('button');
  delBtn.className = 'btn-icon';
  delBtn.title = 'Delete';
  delBtn.textContent = '🗑️';
  delBtn.addEventListener('click', () => deleteItem(item, div));

  actions.append(editBtn, delBtn);
  div.append(checkEl, body, actions);
  return div;
}

function escHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── Toggle check ─────────────────────────────────────────────────────────────
async function toggleCheck(item) {
  const newChecked = !item.checked;
  // Optimistic update
  item.checked = newChecked;
  renderItems();

  try {
    const updated = await api('PATCH', `/api/lists/${listCode}/items/update`, { itemId: item.id, checked: newChecked });
    Object.assign(item, updated);
    lastUpdatedAt = null; // force re-render on next poll
  } catch (err) {
    // Revert
    item.checked = !newChecked;
    renderItems();
    setStatus('Could not update item. Try again.');
  }
}

// ── Delete item ──────────────────────────────────────────────────────────────
async function deleteItem(item, node) {
  if (!confirm(`Delete "${item.name}"?`)) return;
  node.style.opacity = '0.4';
  try {
    await api('DELETE', `/api/lists/${listCode}/items/delete`, { itemId: item.id });
    items = items.filter(i => i.id !== item.id);
    renderItems();
    lastUpdatedAt = null;
  } catch (err) {
    node.style.opacity = '';
    setStatus('Could not delete item. Try again.');
  }
}

// ── Inline edit ───────────────────────────────────────────────────────────────
function startEdit(item, node) {
  if (editingItemId) cancelEdit();
  editingItemId = item.id;

  const form = document.createElement('div');
  form.className = 'item-edit-form';
  form.dataset.itemId = item.id;
  form.innerHTML = `
    <div class="input-row">
      <input class="input" id="edit-name" value="${escHtml(item.name)}" placeholder="Item name" maxlength="200">
      <input class="input" id="edit-qty" value="${escHtml(item.quantity)}" placeholder="Qty" maxlength="30" style="max-width:90px;">
    </div>
    <input class="input" id="edit-notes" value="${escHtml(item.notes || '')}" placeholder="Notes (optional)" maxlength="200">
    <div class="edit-actions">
      <button class="btn btn-sm" id="edit-cancel-btn" style="background:var(--bg);color:var(--text);">Cancel</button>
      <button class="btn btn-red btn-sm" id="edit-save-btn">Save</button>
    </div>
    <p class="error-msg" id="edit-error"></p>`;

  node.replaceWith(form);

  form.querySelector('#edit-cancel-btn').addEventListener('click', cancelEdit);
  form.querySelector('#edit-save-btn').addEventListener('click', () => saveEdit(item));
  form.querySelector('#edit-name').focus();
  form.querySelector('#edit-name').addEventListener('keydown', e => { if (e.key === 'Enter') saveEdit(item); });
}

function cancelEdit() {
  editingItemId = null;
  renderItems();
}

async function saveEdit(item) {
  const name  = document.getElementById('edit-name').value.trim();
  const qty   = document.getElementById('edit-qty').value.trim() || '1';
  const notes = document.getElementById('edit-notes').value.trim();
  const errEl = document.getElementById('edit-error');

  if (!name) { errEl.textContent = 'Name is required.'; return; }
  errEl.textContent = '';

  const saveBtn = document.getElementById('edit-save-btn');
  saveBtn.disabled = true;
  saveBtn.innerHTML = '<span class="spinner"></span>';

  try {
    const updated = await api('PATCH', `/api/lists/${listCode}/items/update`, { itemId: item.id, name, quantity: qty, notes });
    Object.assign(item, updated);
    editingItemId = null;
    lastUpdatedAt = null;
    renderItems();
  } catch (err) {
    errEl.textContent = err.message;
    saveBtn.disabled = false;
    saveBtn.textContent = 'Save';
  }
}

// ── Add item ──────────────────────────────────────────────────────────────────
fab.addEventListener('click', () => {
  const isOpen = addForm.classList.toggle('open');
  fab.classList.toggle('open', isOpen);
  if (isOpen) {
    addName.focus();
    addName.value = '';
    addQty.value = '';
    addNotes.value = '';
    addError.textContent = '';
  }
});

addCancelBtn.addEventListener('click', closeAddForm);

addSubmitBtn.addEventListener('click', submitAddItem);
addName.addEventListener('keydown', e => { if (e.key === 'Enter') addQty.focus(); });
addQty.addEventListener('keydown', e => { if (e.key === 'Enter') addNotes.focus(); });
addNotes.addEventListener('keydown', e => { if (e.key === 'Enter') submitAddItem(); });

function closeAddForm() {
  addForm.classList.remove('open');
  fab.classList.remove('open');
}

async function submitAddItem() {
  const name  = addName.value.trim();
  const qty   = addQty.value.trim() || '1';
  const notes = addNotes.value.trim();

  if (!name) { addError.textContent = 'Item name is required.'; return; }
  addError.textContent = '';
  addSubmitBtn.disabled = true;
  addSubmitBtn.innerHTML = '<span class="spinner"></span>';

  try {
    const item = await api('POST', `/api/lists/${listCode}/items/add`, { name, quantity: qty, notes });
    items.push(item);
    lastUpdatedAt = null;
    renderItems();
    closeAddForm();
  } catch (err) {
    addError.textContent = err.message;
  } finally {
    addSubmitBtn.disabled = false;
    addSubmitBtn.textContent = 'Add Item';
  }
}

// ── Share ─────────────────────────────────────────────────────────────────────
shareBtn.addEventListener('click', openShare);

function openShare() {
  if (navigator.share && /Mobi|Android/i.test(navigator.userAgent)) {
    navigator.share({ title: listData ? listData.name : 'CostcoList', url: window.location.href }).catch(() => {});
  } else {
    shareOverlay.style.display = 'flex';
  }
}

function closeShare() {
  shareOverlay.style.display = 'none';
}

window.closeShare = closeShare;

window.copyText = function (type) {
  const text = type === 'code'
    ? document.getElementById('share-code-val').textContent
    : document.getElementById('share-url-val').textContent;
  navigator.clipboard.writeText(text).then(() => {
    setStatus('Copied to clipboard!');
    setTimeout(() => setStatus(''), 2000);
  }).catch(() => {
    setStatus('Could not copy — please copy manually.');
  });
};

shareOverlay.addEventListener('click', e => {
  if (e.target === shareOverlay) closeShare();
});
