# Nexus Data Hub - Full Stack Internship Task

A dynamic, premium full-stack application built with the MERN stack (MongoDB, Express, React, Node.js) and WebSockets for real-time search.

## Features
- **Modern UI**: Built with React, Vite, and Framer Motion for smooth animations and a premium dark-mode aesthetic.
- **Data Integration**: Fetches data from `jsonplaceholder.typicode.com/posts` and stores it into MongoDB Atlas.
- **REST APIs**: Designed Express endpoints to sync the data and retrieve posts.
- **Real-time Search**: Implements Socket.io WebSockets to provide instantaneous search filtering on the frontend without relying on constant HTTP requests.

## Technologies Used
**Frontend**: React (Vite), Framer Motion, Lucide React, Socket.io-client, CSS Custom Properties (Vanilla CSS).
**Backend**: Node.js, Express, Socket.io, Mongoose, Axios.
**Database**: MongoDB Atlas.

## Getting Started

### Prerequisites
- Node.js (v16+)
- npm or yarn

### 1. Clone & Setup
Clone the repository, then navigate into both `backend` and `frontend` folders to install dependencies.

```bash
# In the backend directory
cd backend
npm install

# In the frontend directory
cd frontend
npm install
```

### 2. Environment Variables
In the `backend` folder, create a `.env` file with the following variable (using your MongoDB URL with properly URL-encoded password if it contains special characters like `@` -> `%40`):
```env
MONGO_URI="mongodb+srv://nishantsingh8195_db_user:Nish%40nt995@cluster0.wp8c2ri.mongodb.net/internshiptask"
PORT=5000
```

### 3. Run Locally
You will need to run the backend and frontend servers simultaneously.

**Start the Backend:**
```bash
cd backend
npm run dev
```

**Start the Frontend:**
```bash
cd frontend
npm run dev
```
The frontend will run on `http://localhost:3000` and communicate with the backend on `http://localhost:5000`.

## Deployment note
- This project is structured as a monorepo.
- **Frontend** can be seamlessly deployed on Vercel by selecting the `frontend` root directory and setting the framework preset to Vite.
- **Backend**: Since this application utilizes **WebSockets**, Vercel's Edge/Serverless functions are not ideal as they do not support persistent persistent connections like `socket.io`. It is recommended to deploy the `backend` directory to **Render**, **Railway**, or **Heroku** which provide stateful containers for WebSocket connections.
