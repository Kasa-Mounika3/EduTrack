# EduTrack EduTrack Server

Production-style Express, MongoDB, REST, GraphQL, and Socket.io backend.

## Folder Structure

```txt
server/
|-- src/
|   |-- config/
|   |   `-- db.js
|   |-- controllers/
|   |-- graphql/
|   |-- middleware/
|   |-- models/
|   |-- routes/
|   |-- sockets/
|   |-- utils/
|   |-- app.js
|   `-- server.js
|-- .env
|-- .env.example
|-- nodemon.json
|-- package.json
`-- README.md
```

## Installation

```bash
cd C:\Users\kasas\Projects\SMS\Level-3\server
npm install
```

## Environment Variables

Create `.env` from `.env.example`:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://kasamounika887_db_user:Kasamouni%40123@cluster0.zxmbwb1.mongodb.net/edutrack?appName=Cluster0
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

Important: if your Atlas password contains `@`, encode it as `%40`. The raw password `Kasamouni@123` must be written as `Kasamouni%40123` inside `MONGO_URI`.

EduTrack uses the same `edutrack` database as Levels 1 and 2. It adds announcements, notifications, activity logs, analytics, GraphQL, and Socket.io behavior without moving data into a separate database.

## Run

Production-style start:

```bash
npm start
```

Development with nodemon:

```bash
npm run dev
```

Backend URLs:

```txt
REST:    http://localhost:5000/api
GraphQL: http://localhost:5000/graphql
Socket:  http://localhost:5000
```

## MongoDB Atlas Setup

1. Open MongoDB Atlas.
2. Go to Database Access and create a database user.
3. Go to Network Access and add your current IP address.
4. Go to Database > Connect > Drivers.
5. Copy the Node.js connection string.
6. Replace username, password, host, and database name.
7. Encode special password characters. `@` becomes `%40`.
8. Put the final URI in `Level-3/server/.env`.

## MongoDB Connection Debugging

The connection utility lives in `src/config/db.js`.

It checks:
- missing `.env`
- missing `MONGO_URI`
- invalid URI prefix
- unencoded `@` in the password
- Atlas cluster DNS failures
- Atlas Network Access / IP whitelist failures
- wrong database user password

Expected success log:

```txt
Connecting to MongoDB Atlas...
MongoDB Connected Successfully: cluster0-shard-00-00.xxxxx.mongodb.net
```

Troubleshooting:
- IP whitelist issue: Atlas > Network Access > Add IP Address > Add Current IP Address.
- Cluster paused: Atlas > Database > Resume.
- Wrong password: Atlas > Database Access > Edit database user > set a new password, then update `.env`.
- Invalid URI: use `mongodb+srv://USERNAME:ENCODED_PASSWORD@HOST/DATABASE?appName=Cluster0`.
- dotenv not loading: keep `.env` directly inside `Level-3/server`, then restart the server.
- Windows nodemon `EPERM`: close duplicate terminals, stop old Node processes, or use `npm start`.
