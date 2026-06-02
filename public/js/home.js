const createBtn = document.getElementById('create-btn');
const createError = document.getElementById('create-error');
const listNameInput = document.getElementById('list-name');

const joinBtn = document.getElementById('join-btn');
const joinCodeInput = document.getElementById('join-code');
const joinError = document.getElementById('join-error');

function setLoading(btn, loading) {
  btn.disabled = loading;
  btn.innerHTML = loading
    ? '<span class="spinner"></span>'
    : btn === createBtn ? 'Create List' : 'Go';
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
    window.location.href = `/list/${data.code}`;
  } catch (err) {
    createError.textContent = err.message;
    setLoading(createBtn, false);
  }
}

function joinList() {
  const code = joinCodeInput.value.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (code.length !== 6) { joinError.textContent = 'Please enter the full 6-character code.'; return; }
  joinError.textContent = '';
  window.location.href = `/list/${code}`;
}

createBtn.addEventListener('click', createList);
listNameInput.addEventListener('keydown', e => { if (e.key === 'Enter') createList(); });

joinBtn.addEventListener('click', joinList);
joinCodeInput.addEventListener('keydown', e => { if (e.key === 'Enter') joinList(); });
joinCodeInput.addEventListener('input', () => {
  joinCodeInput.value = joinCodeInput.value.toUpperCase();
});
