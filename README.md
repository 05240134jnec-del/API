# SYD204 Task List API: Step-by-Step Guide

Same app, built three times: **Part 1** (memory) → **Part 2** (MySQL) → **Part 3** (MVC).
A simple **frontend** (`public/`) lets you use the API from a web page.

## What is in this folder

```
task-api/
├── .env.example            template for your secrets (copy to .env)
├── .gitignore
├── package.json
├── server-part1-memory.js  PART 1: array storage
├── server.js               PART 2: MySQL, single file
├── server-mvc.js           PART 3: MVC entry point (also serves the frontend)
├── test-db.js              connection test (delete after it works)
├── database/schema.sql     run once in MySQL Workbench
├── public/                 FRONTEND (the dining room)
│   ├── index.html
│   ├── style.css
│   └── app.js
└── src/
    ├── db.js               connection pool
    ├── routes/taskRoutes.js
    ├── controllers/taskController.js
    └── models/taskModel.js
```

Restaurant map: `public/` = dining room, routes = menu, controller = chef, model = pantry, MySQL = permanent storage, `.env` = secret recipe book.

---

## Step 0: Check your tools

```
node --version     (v18 or higher)
npm --version
```

## Step 1: Install packages

Open this folder in VS Code, open the terminal, and run:

```
npm install
```

## Step 2: PART 1, in-memory API (no database yet)

```
node server-part1-memory.js
```

Open http://localhost:3000. You should see `{ "message": "Task API is ready! 🚀" }` (Checkpoint 1).
Test in Thunder Client / Postman using the Part 1 checklist in your practical.
Stop the server (Ctrl+C) and start it again: your tasks are gone. That is the lesson.

## Step 3: Create your Aiven user (Aiven website)

1. Open service `mysql-20713dd0` → **Users** tab → **Create service user**.
2. Username: your own name or student ID (lowercase, no spaces).
3. Authentication: `caching_sha2_password`.
4. Click **Add** and copy the password immediately.

## Step 4: Create `.env`

Copy `.env.example` to a new file named `.env`, then change only these two lines:

```
DB_USER=your_username
DB_PASS=your_password
```

Never share `.env` or commit it to Git.

## Step 5: Create the table in MySQL Workbench

1. New connection: host `mysql-20713dd0-rub-a06b.b.aivencloud.com`, port `15308`, your username and password, SSL **Require**.
2. Open `database/schema.sql`, paste it into a SQL tab, and run it.
3. Check: `SHOW TABLES;` and `SELECT * FROM tasks;`.

## Step 6: Prove the connection

```
node test-db.js
```

Expected: `Connected to MySQL` and `db: 'defaultdb'`. If it fails, fix `.env` first (see Troubleshooting). Then delete `test-db.js`.

## Step 7: PART 2, MySQL API (single file)

```
node server.js
```

Test `GET /tasks`, `POST /tasks`, and so on. Do the **persistence proof**: create a task, stop Node, start again, `GET /tasks`. Your task is still there.

## Step 8: PART 3, MVC version

```
node server-mvc.js
```

Same results as Part 2, but the code is split across route → controller → model. Re-run the same tests.

## Step 9: Use the frontend

With `server-mvc.js` running, open:

**http://localhost:3000/app**

| On the page | Calls the API |
|---|---|
| Page loads | `GET /tasks` |
| Type a title + **Add** | `POST /tasks` |
| Tick a checkbox | `PATCH /tasks/:id` |
| **Edit** → **Save** | `PUT /tasks/:id` |
| **Delete** | `DELETE /tasks/:id` |
| Add an empty title | server answers `400`, the page shows "Title is required" |

Do not double-click `index.html` to open it as a file. It must be opened through `http://localhost:3000/app` so the page and API share one address.

## Step 10: Test checklist from the practical

| Test | Expected |
|---|---|
| `GET /` | 200 message |
| `GET /tasks` | 200 array |
| `POST /tasks {"title":"Task A"}` | 201 |
| `GET /tasks/9999` | 404 `Task not found` |
| `PATCH /tasks/1 {"completed":true}` | 200 |
| `PUT /tasks/2 {"title":"...","completed":true}` | 200 |
| `DELETE /tasks/<id>` | 204, then GET gives 404 |
| `POST /tasks {}` | 400 `Title is required` |
| `POST /tasks {"title":"'; DROP TABLE tasks; --"}` | 201, table still exists |

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `ECONNREFUSED` / timeout | Port must be `15308`, not 3306 |
| TLS / SSL error | Make sure `DB_SSL=REQUIRED` is in `.env` |
| `Access denied for user` | Wrong `DB_USER` / `DB_PASS`. Do not use `avnadmin` |
| `Table 'tasks' doesn't exist` | Run `database/schema.sql` in Workbench |
| `req.body` is undefined | `app.use(express.json())` must come before the routes |
| `EADDRINUSE` | Port 3000 is busy: press Ctrl+C in the old terminal |
| Request hangs forever | A middleware is missing `next()` |
| Frontend shows "Could not load tasks" | Server not running, or you did not open `/app` through localhost |
