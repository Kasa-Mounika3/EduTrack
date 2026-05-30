# EduTrack EduTrack Backend

Beginner-friendly Express and MongoDB backend for the EduTrack EduTrack.

## Folder Structure

```txt
backend/
|-- src/
|   |-- config/
|   |   `-- db.js
|   |-- controllers/
|   |-- models/
|   |-- routes/
|   |-- app.js
|   `-- server.js
|-- .env
|-- .env.example
|-- package.json
`-- README.md
```

## Install Packages

```bash
cd C:\Users\kasas\Projects\SMS\level-1\backend
npm install
```

If nodemon is missing:

```bash
npm install --save-dev nodemon
```

## Environment Variables

Create `backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb+srv://kasamounika887_db_user:Kasamouni%40123@cluster0.zxmbwb1.mongodb.net/edutrack?appName=Cluster0
```

Important: the password contains `@`, so it must be URL-encoded as `%40` in the connection string.

Atlas may show this raw value:

```env
MONGO_URI=mongodb+srv://kasamounika887_db_user:Kasamouni@123@cluster0.zxmbwb1.mongodb.net/?appName=Cluster0
```

Use this encoded value in `.env`:

```env
MONGO_URI=mongodb+srv://kasamounika887_db_user:Kasamouni%40123@cluster0.zxmbwb1.mongodb.net/edutrack?appName=Cluster0
```

`dotenv` reads `.env` and loads those values into `process.env`. The server loads dotenv at the top of `src/server.js` before using `PORT` or `MONGO_URI`.

## Run Backend

Production-style start:

```bash
npm start
```

Development start:

```bash
npm run dev
```

Backend URL:

```txt
http://localhost:5000
```

## REST Routes

```txt
GET    /api/students
POST   /api/students
PUT    /api/students/:id
DELETE /api/students/:id
```

## MongoDB Connection

The connection logic lives in:

```txt
src/config/db.js
```

Mongoose uses `MONGO_URI` to connect to MongoDB Atlas. If the URI is missing or wrong, the server stops with a clear message instead of failing silently.

All EduTrack levels use the same database name: `edutrack`. EduTrack creates the initial `students` collection, and Levels 2 and 3 extend the same database instead of creating separate level-specific databases.

## Troubleshooting

`MONGO_URI is missing`
- Make sure `.env` is inside `level-1/backend`, not inside `src`.
- Make sure the variable name is exactly `MONGO_URI`.
- Restart the terminal after editing `.env`.

`dotenv not loading`
- Run commands from `level-1/backend`.
- Confirm `src/server.js` loads dotenv before reading `process.env`.

MongoDB Atlas connection failure:
- Make sure your Atlas username and password are correct.
- Encode special password characters. `@` becomes `%40`.
- In Atlas, add your IP address under Network Access.
- Make sure the cluster is running.

Nodemon issues on Windows:
- Use `npm start` if `npm run dev` fails.
- Reinstall nodemon with `npm install --save-dev nodemon`.
- Close extra terminals that may already be running the server.
- If Windows shows `EPERM`, close VS Code terminals, stop old Node processes, then run `npm run dev` again.

Port already in use:

```bash
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F
```
