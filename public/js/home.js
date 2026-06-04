// ── Toast notifications ───────────────────────────────────────────────────────
function showToast(msg, type = 'info', duration = 3000) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.textContent = msg;
  container.appendChild(t);
  requestAnimationFrame(() => requestAnimationFrame(() => t.classList.add('show')));
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, duration);
}

// ── Dark mode ────────────────────────────────────────────────────────────────
const darkToggle = document.getElementById('dark-toggle');
function applyTheme(dark) {
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : '');
  darkToggle.textContent = dark ? '☀️' : '🌙';
}
let isDark = localStorage.getItem('shop119_dark') === '1';
applyTheme(isDark);
darkToggle.addEventListener('click', () => {
  isDark = !isDark;
  localStorage.setItem('shop119_dark', isDark ? '1' : '0');
  applyTheme(isDark);
});

// ── Date prepopulation ────────────────────────────────────────────────────────
const listNameInput = document.getElementById('list-name');
const today = new Date();
listNameInput.value = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

// ── My Lists (localStorage) ───────────────────────────────────────────────────
const MY_LISTS_KEY = 'shop119_mine';

function getMyLists() {
  try { return JSON.parse(localStorage.getItem(MY_LISTS_KEY) || '[]'); } catch { return []; }
}

function saveMyList(code, name) {
  const lists = getMyLists().filter(l => l.code !== code);
  lists.unshift({ code, name, createdAt: new Date().toISOString() });
  localStorage.setItem(MY_LISTS_KEY, JSON.stringify(lists.slice(0, 20)));
}

function removeMyList(code) {
  const lists = getMyLists().filter(l => l.code !== code);
  localStorage.setItem(MY_LISTS_KEY, JSON.stringify(lists));
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function loadMyLists() {
  const lists = getMyLists();
  const section = document.getElementById('my-lists-section');
  const container = document.getElementById('my-lists-container');
  if (!lists.length) { section.style.display = 'none'; return; }
  section.style.display = 'block';
  container.innerHTML = '';
  lists.forEach(list => {
    const row = document.createElement('div');
    row.className = 'my-list-row';
    row.innerHTML = `
      <div class="my-list-info">
        <div class="my-list-name">${escHtml(list.name)}</div>
        <div class="my-list-date">${formatDate(list.createdAt)} · ${list.code}</div>
      </div>
      <div class="my-list-actions">
        <a href="/list/${list.code}" class="btn btn-red btn-sm">Open</a>
        <button class="btn btn-blue btn-sm" onclick="copyList('${list.code}', '${escHtml(list.name)}')">Copy</button>
        <button class="btn btn-sm" style="background:var(--bg);color:var(--muted);" onclick="archiveList('${list.code}')">Archive</button>
      </div>`;
    container.appendChild(row);
  });
}

function escHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

async function copyList(code, name) {
  try {
    const res = await fetch(`/api/lists/${code}/copy`, { method: 'POST' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    saveMyList(data.code, data.name);
    window.location.href = `/list/${data.code}`;
  } catch (err) {
    showToast('Could not copy list: ' + err.message, 'error');
  }
}

async function archiveList(code) {
  if (!confirm('Archive this list? It will no longer be accessible by code.')) return;
  try {
    await fetch(`/api/lists/${code}/archive`, { method: 'PATCH' });
    removeMyList(code);
    loadMyLists();
  } catch (err) {
    showToast('Could not archive list.', 'error');
  }
}

window.copyList = copyList;
window.archiveList = archiveList;

loadMyLists();

// ── Staples ───────────────────────────────────────────────────────────────────
function getStaples() { try { return JSON.parse(localStorage.getItem('shop119_staples') || '[]'); } catch { return []; } }

function escHtmlHome(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function loadStaplesSection() {
  const staples = getStaples();
  const section   = document.getElementById('staples-section');
  const container = document.getElementById('staples-container');
  const createBtn2 = document.getElementById('create-from-staples-btn');

  if (createBtn2) createBtn2.style.display = staples.length ? 'inline-flex' : 'none';
  if (!section || !container) return;

  if (!staples.length) { section.style.display = 'none'; return; }
  section.style.display = 'block';
  container.innerHTML = '';

  staples.forEach((s, idx) => {
    const row = document.createElement('div');
    row.className = 'staple-row';
    row.innerHTML = `
      <span class="staple-name">${escHtmlHome(s.name)}</span>
      <span class="staple-cat">${escHtmlHome(s.category || 'Other')}</span>
      <button class="staple-remove" title="Remove" data-idx="${idx}">×</button>`;
    row.querySelector('.staple-remove').addEventListener('click', () => removeStaple(idx));
    container.appendChild(row);
  });
}

function removeStaple(idx) {
  const staples = getStaples();
  staples.splice(idx, 1);
  localStorage.setItem('shop119_staples', JSON.stringify(staples));
  loadStaplesSection();
}

function clearAllStaples() {
  if (!confirm('Remove all staples? You can re-add them by starring items on any list.')) return;
  localStorage.removeItem('shop119_staples');
  loadStaplesSection();
}

async function createFromStaples() {
  const btn = document.getElementById('create-from-staples-btn');
  const name = listNameInput.value.trim() || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span>';

  try {
    const res = await fetch('/api/lists/create', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) });
    const list = await res.json();
    if (!res.ok) throw new Error(list.error);
    saveMyList(list.code, list.name);

    const staples = getStaples();
    await Promise.allSettled(
      staples.map(s => fetch(`/api/lists/${list.code}/items/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: s.name, quantity: s.quantity, notes: s.notes, item_number: s.item_number, category: s.category }),
      }))
    );

    window.location.href = `/list/${list.code}`;
  } catch (err) {
    showToast('Could not create list: ' + err.message, 'error');
    btn.disabled = false;
    btn.textContent = '★ Start from my staples';
  }
}

window.clearAllStaples = clearAllStaples;
document.getElementById('create-from-staples-btn')?.addEventListener('click', createFromStaples);

loadStaplesSection();

// ── Create list ───────────────────────────────────────────────────────────────
const createBtn = document.getElementById('create-btn');
const createError = document.getElementById('create-error');

function setLoading(btn, loading) {
  btn.disabled = loading;
  btn.innerHTML = loading ? '<span class="spinner"></span>' : btn === createBtn ? 'Create List' : 'Go';
}

async function createList() {
  const name = listNameInput.value.trim();
  if (!name) { createError.textContent = 'Please enter a list name.'; return; }
  createError.textContent = '';
  setLoading(createBtn, true);
  try {
    const res = await fetch('/api/lists/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create list');
    saveMyList(data.code, data.name);
    window.location.href = `/list/${data.code}`;
  } catch (err) {
    createError.textContent = err.message;
    setLoading(createBtn, false);
  }
}

createBtn.addEventListener('click', createList);
listNameInput.addEventListener('keydown', e => { if (e.key === 'Enter') createList(); });

// ── Join list ─────────────────────────────────────────────────────────────────
const joinBtn = document.getElementById('join-btn');
const joinCodeInput = document.getElementById('join-code');
const joinError = document.getElementById('join-error');

function joinList() {
  const code = joinCodeInput.value.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (code.length !== 6) { joinError.textContent = 'Please enter the full 6-character code.'; return; }
  joinError.textContent = '';
  window.location.href = `/list/${code}`;
}

joinBtn.addEventListener('click', joinList);
joinCodeInput.addEventListener('keydown', e => { if (e.key === 'Enter') joinList(); });
joinCodeInput.addEventListener('input', () => { joinCodeInput.value = joinCodeInput.value.toUpperCase(); });
