// server-part1-memory.js — PART 1 complete (in-memory Task API)
// In the practical this file is called server.js at the time of Part 1.
// Here it has its own name so it does not clash with the Part 2 server.js.
// Run it with: node server-part1-memory.js
const express = require('express');
const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3000;

// Temporary "database" — a JavaScript array
let tasks = [];
let nextId = 1;

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Task API is ready! 🚀' });
});

// GET /tasks — return every task
app.get('/tasks', (req, res) => {
  res.json(tasks);
});

// POST /tasks — create a task
app.post('/tasks', (req, res) => {
  const { title } = req.body;
  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'Title is required' });
  }
  const newTask = {
    id: nextId++,
    title: title.trim(),
    completed: false,
  };
  tasks.push(newTask);
  res.status(201).json(newTask);
});

// GET /tasks/:id — return one task
app.get('/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const task = tasks.find((item) => item.id === id);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  res.json(task);
});

// PATCH /tasks/:id — update completed status
app.patch('/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { completed } = req.body;
  const task = tasks.find((item) => item.id === id);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  task.completed = completed;
  res.json(task);
});

// DELETE /tasks/:id — remove a task
app.delete('/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = tasks.findIndex((item) => item.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }
  tasks.splice(index, 1);
  res.status(204).send();
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  res.status(err.statusCode || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
  console.log('GET /tasks');
  console.log('POST /tasks');
  console.log('GET /tasks/:id');
  console.log('PATCH /tasks/:id');
  console.log('DELETE /tasks/:id');
});
