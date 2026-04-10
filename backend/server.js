import express from 'express';
import mongoose from 'mongoose';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import Post from './models/Post.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  },
  transports: ['websocket']
});

app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://nishantsingh8195_db_user:Nish@nt995@cluster0.wp8c2ri.mongodb.net/test';
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// REST APIs
// 1. Fetch & Save Posts
app.post('/api/posts/sync', async (req, res) => {
  try {
    const { data } = await axios.get('https://jsonplaceholder.typicode.com/posts');
    
    // Using bulkWrite for efficient upserts
    const operations = data.map(post => ({
      updateOne: {
        filter: { id: post.id },
        update: { $set: post },
        upsert: true
      }
    }));
    
    await Post.bulkWrite(operations);
    
    // Fetch newly saved posts to return
    const savedPosts = await Post.find().sort({ id: 1 }).limit(50);
    res.status(200).json({ message: 'Posts synced successfully', count: data.length, posts: savedPosts });
  } catch (error) {
    console.error('Error syncing posts:', error);
    res.status(500).json({ error: 'Failed to sync posts' });
  }
});

// 2. Get All Posts
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await Post.find().sort({ id: 1 }).limit(100);
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// 3. Get Single Post
app.get('/api/posts/:id', async (req, res) => {
  try {
    const post = await Post.findOne({ id: req.params.id });
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

// WebSocket Implementation for Real-Time Search
io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);

  socket.on('search', async (query) => {
    try {
      if (!query || query.trim() === '') {
        // If query is empty, return top posts
        const allPosts = await Post.find().sort({ id: 1 }).limit(50);
        socket.emit('results', allPosts);
        return;
      }
      
      const searchRegex = new RegExp(query, 'i');
      const results = await Post.find({
        $or: [
          { title: searchRegex },
          { body: searchRegex }
        ]
      }).limit(50);
      
      socket.emit('results', results);
    } catch (error) {
      console.error('Search error:', error);
      socket.emit('search_error', { message: 'Failed to search' });
    }
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
