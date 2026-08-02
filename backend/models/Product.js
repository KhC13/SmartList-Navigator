const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    aisle: { type: Number, required: true }, // maps to a node id in the store graph
    category: { type: String, default: 'general', trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
