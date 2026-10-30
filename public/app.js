// public/app.js  (used by dashboard.html)
// Talks to the Task API using fetch(). Each action matches one endpoint:
//   load tasks      -> GET    /tasks
//   add a task      -> POST   /tasks
//   tick checkbox   -> PATCH  /tasks/:id   { completed }
//   edit the title  -> PUT    /tasks/:id   { title, completed }
//   delete          -> DELETE /tasks/:id

// Opened at http://localhost:3000/app  -> same server, so no prefix needed.
// Opened with VS Code Live Server (port 5500) -> call the API on port 3000.
const API_URL = location.port === '3000' ? '' : 'http://localhost:3000';

const form = document.getElementById('task-form');
const titleInput = document.getElementById('title-input');
const searchInput = document.getElementById('search-input');
const taskList = document.getElementById('task-list');
const messageEl = document.getElementById('message');
const filterButtons = document.querySelectorAll('.filter');

const statTotal = document.getElementById('stat-total');
const statDone = document.getElementById('stat-done');
const statPending = document.getElementById('stat-pending');
const progressText = document.getElementById('progress-text');
const progressFill = document.getElementById('progress-fill');

let tasks = [];            // copy of what the server returned
let currentFilter = 'all';
let searchText = '';

// ---------- helpers ----------

function showMessage(text, type) {
  messageEl.textContent = text;
  messageEl.className = 'message ' + (type || '');
}

// One function for every request. Throws an Error with the server's message
// when the status is 4xx/5xx, so each caller can use try/catch.
async function api(path, options = {}) {
  const res = await fetch(API_URL + path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (res.status === 204) return null; // DELETE has no body

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Request failed (' + res.status + ')');
  }
  return data;
}

// MySQL BOOLEAN comes back as 1/0, so turn it into true/false
function isDone(task) {
  return task.completed === true || task.completed === 1;
}

// ---------- GET /tasks ----------

async function loadTasks() {
  try {
    tasks = await api('/tasks');
    render();
  } catch (err) {
    showMessage('Could not load tasks: ' + err.message, 'error');
  }
}

// ---------- dashboard numbers ----------

function updateStats() {
  const total = tasks.length;
  const done = tasks.filter(isDone).length;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);

  statTotal.textContent = total;
  statDone.textContent = done;
  statPending.textContent = total - done;
  progressText.textContent = percent + '%';
  progressFill.style.width = percent + '%';
}

// ---------- draw the list ----------

function render() {
  updateStats();
  taskList.innerHTML = '';

  const query = searchText.trim().toLowerCase();

  const visible = tasks.filter((t) => {
    if (currentFilter === 'active' && isDone(t)) return false;
    if (currentFilter === 'done' && !isDone(t)) return false;
    if (query && !t.title.toLowerCase().includes(query)) return false;
    return true;
  });

  if (visible.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'empty';
    empty.innerHTML = '<span class="big">🗂️</span>No tasks found.';
    taskList.appendChild(empty);
    return;
  }

  visible.forEach((task) => taskList.appendChild(buildItem(task)));
}

function buildItem(task) {
  const li = document.createElement('li');
  li.className = 'task-item' + (isDone(task) ? ' done' : '');

  // checkbox -> PATCH
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = isDone(task);
  checkbox.addEventListener('change', () => toggleTask(task.id, checkbox.checked));

  // title (textContent keeps user text safe from HTML injection)
  const title = document.createElement('span');
  title.className = 'task-title';
  title.textContent = task.title;

  const badge = document.createElement('span');
  badge.className = 'badge ' + (isDone(task) ? 'complete' : 'pending');
  badge.textContent = isDone(task) ? 'Completed' : 'Pending';

  const editBtn = document.createElement('button');
  editBtn.className = 'small edit-btn';
  editBtn.textContent = 'Edit';
  editBtn.addEventListener('click', () => startEdit(li, task, title, editBtn));

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'small delete-btn';
  deleteBtn.textContent = 'Delete';
  deleteBtn.addEventListener('click', () => deleteTask(task.id));

  li.append(checkbox, title, badge, editBtn, deleteBtn);
  return li;
}

// ---------- POST /tasks ----------

form.addEventListener('submit', async (event) => {
  event.preventDefault(); // stop the page from reloading

  try {
    await api('/tasks', {
      method: 'POST',
      body: JSON.stringify({ title: titleInput.value }),
    });
    titleInput.value = '';
    showMessage('Task added.', 'ok');
    await loadTasks();
  } catch (err) {
    showMessage(err.message, 'error'); // e.g. "Title is required"
  }
});

// ---------- PATCH /tasks/:id ----------

async function toggleTask(id, completed) {
  try {
    await api('/tasks/' + id, {
      method: 'PATCH',
      body: JSON.stringify({ completed }),
    });
    showMessage('', '');
    await loadTasks();
  } catch (err) {
    showMessage(err.message, 'error');
    await loadTasks(); // put the checkbox back
  }
}

// ---------- PUT /tasks/:id ----------

function startEdit(li, task, titleSpan, editBtn) {
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'edit-input';
  input.value = task.title;

  const saveBtn = document.createElement('button');
  saveBtn.className = 'small save-btn';
  saveBtn.textContent = 'Save';

  li.replaceChild(input, titleSpan);
  li.replaceChild(saveBtn, editBtn);
  input.focus();

  async function save() {
    try {
      // PUT replaces the whole task, so send both fields
      await api('/tasks/' + task.id, {
        method: 'PUT',
        body: JSON.stringify({ title: input.value, completed: isDone(task) }),
      });
      showMessage('Task updated.', 'ok');
      await loadTasks();
    } catch (err) {
      showMessage(err.message, 'error');
    }
  }

  saveBtn.addEventListener('click', save);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') save();
    if (e.key === 'Escape') render();
  });
}

// ---------- DELETE /tasks/:id ----------

async function deleteTask(id) {
  if (!confirm('Delete this task?')) return;
  try {
    await api('/tasks/' + id, { method: 'DELETE' });
    showMessage('Task deleted.', 'ok');
    await loadTasks();
  } catch (err) {
    showMessage(err.message, 'error');
  }
}

// ---------- search and filters (no API call, just re-draw) ----------

searchInput.addEventListener('input', () => {
  searchText = searchInput.value;
  render();
});

filterButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    currentFilter = btn.dataset.filter;
    filterButtons.forEach((b) => b.classList.toggle('active', b === btn));
    render();
  });
});

// ---------- start ----------
loadTasks();
