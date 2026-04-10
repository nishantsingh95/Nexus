import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, DownloadCloud, Activity, Database, ChevronRight } from 'lucide-react';

const SOCKET_URL = 'https://nexus-q8su.onrender.com';
const socket = io(SOCKET_URL, { transports: ['websocket'] });

function App() {
  const [posts, setPosts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState(null);
  const [expandedPosts, setExpandedPosts] = useState(new Set());

  const toggleExpand = (id) => {
    const newSet = new Set(expandedPosts);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setExpandedPosts(newSet);
  };

  // Initialize and load default posts
  useEffect(() => {
    fetchPosts();

    // Setup Socket Listeners
    socket.on('connect', () => {
      console.log('Connected to socket server');
    });

    socket.on('results', (results) => {
      setPosts(results);
      setIsLoading(false);
    });

    return () => {
      socket.off('connect');
      socket.off('results');
    };
  }, []);

  // Real-time search using WebSockets with debounce effect
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setIsLoading(true);
      socket.emit('search', searchQuery);
    }, 300); // 300ms debounce

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get('https://nexus-q8su.onrender.com/api/posts');
      setPosts(res.data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to load posts from the database.');
    } finally {
      setIsLoading(false);
    }
  };

  const syncPosts = async () => {
    try {
      setIsSyncing(true);
      setError(null);
      const res = await axios.post('https://nexus-q8su.onrender.com/api/posts/sync');
      setPosts(res.data.posts);
      setSearchQuery(''); // clear search
    } catch (err) {
      console.error(err);
      setError('Failed to fetch and save posts from JSONPlaceholder.');
    } finally {
      setIsSyncing(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 12
      }
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <div className="title-container">
          <h1>Nexus Data Hub</h1>
          <p>Real-time post aggregation and search platform</p>
        </div>

        <div className="controls-container">
          <div className="search-wrapper">
            <Search className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search posts in real-time..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <button 
            className="btn" 
            onClick={syncPosts} 
            disabled={isSyncing}
            style={{ 
              background: isSyncing ? '#4b5563' : 'var(--accent-color)', 
            }}
          >
            {isSyncing ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                >
                  <Activity size={18} />
                </motion.div>
                Syncing...
              </>
            ) : (
              <>
                <DownloadCloud size={18} />
                Fetch & Save Posts
              </>
            )}
          </button>
        </div>
      </header>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="error-message"
        >
          <Database size={20} />
          <span>{error}</span>
        </motion.div>
      )}

      {isLoading && !posts.length ? (
        <div className="loader-container">
          <div className="spinner"></div>
          <p>Connecting to data streams...</p>
        </div>
      ) : (
        <motion.div
          className="posts-grid"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <AnimatePresence>
            {posts.length > 0 ? (
              posts.map((post) => (
                <motion.div
                  key={post._id || post.id}
                  className="post-card"
                  variants={itemVariants}
                  layout
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <span className="post-id-badge">ID: {post.id}</span>
                  <h3 className="post-title" style={expandedPosts.has(post._id || post.id) ? { WebkitLineClamp: 'unset' } : {}}>{post.title}</h3>
                  <p className="post-body" style={expandedPosts.has(post._id || post.id) ? { WebkitLineClamp: 'unset' } : {}}>{post.body}</p>
                  
                  <div className="post-meta">
                    <span>User ID: {post.userId}</span>
                    <motion.button 
                      onClick={() => toggleExpand(post._id || post.id)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      style={{ 
                        background: 'transparent', 
                        border: 'none', 
                        color: 'var(--accent-color)', 
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      {expandedPosts.has(post._id || post.id) ? 'Show less' : 'Read more'} 
                      <ChevronRight 
                        size={16} 
                        style={{ 
                          transform: expandedPosts.has(post._id || post.id) ? 'rotate(-90deg)' : 'none', 
                          transition: 'transform 0.2s',
                          marginLeft: '4px'
                        }} 
                      />
                    </motion.button>
                  </div>
                </motion.div>
              ))
            ) : (
              !isLoading && (
                <motion.div 
                  className="empty-state"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <Database size={48} opacity={0.5} />
                  <h3>No posts found</h3>
                  <p>Try fetching data from the server or adjusting your search.</p>
                </motion.div>
              )
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}

export default App;
