import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  userId: { type: Number, required: true },
  id: { type: Number, required: true, unique: true },
  title: { type: String, required: true },
  body: { type: String, required: true }
}, {
  timestamps: true
});

export default mongoose.model('Post', postSchema);
