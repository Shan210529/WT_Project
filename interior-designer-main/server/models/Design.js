const mongoose = require('mongoose');

// 1. Define a Sub-Schema for the individual furniture items
// This tells Mongoose exactly what an "item" object looks like
const ItemSchema = new mongoose.Schema({
  id: { type: String, required: true },
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  rotation: { type: Number, default: 0 },
  scaleX: { type: Number, default: 1 },
  scaleY: { type: Number, default: 1 },
  imageUrl: { type: String, required: true },
  type: { type: String } // Optional: 'sofa', 'table', etc.
}, { _id: false }); // We disable auto-generated _id for items to keep the array clean

// 2. Define the Main Design Schema
const DesignSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  name: { 
    type: String, 
    required: true 
  },
  roomDimensions: {
    width: { type: Number, required: true },
    height: { type: Number, required: true }
  },
  // 3. Use the ItemSchema here. 
  // This fixes the "Cast to [string]" error.
  items: [ItemSchema], 
  
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Design', DesignSchema);