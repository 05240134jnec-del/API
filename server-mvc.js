// server-mvc.js — PART 3 complete (MVC entry point)
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const taskRoutes = require('./src/routes/taskRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Task API (MVC version) is ready!' });
});

// Every route inside taskRoutes is prefixed with /tasks
app.use('/tasks', taskRoutes);

// FRONTEND (the "dining room"): serves the files in /public at http://localhost:3000/app
// This is the only line added to the practical's server-mvc.js.
app.use('/app', express.static('public'));

app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.statusCode || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

app.listen(PORT, () => {
  console.log(`MVC server running at http://localhost:${PORT}`);
  console.log(`Frontend at       http://localhost:${PORT}/app`);
});
