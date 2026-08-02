const Product = require('../models/Product');

// GET /api/products?search=milk
async function getProducts(req, res) {
  try {
    const { search } = req.query;
    const query = search
      ? { name: { $regex: search, $options: 'i' } } // simple search filter
      : {};
    const products = await Product.find(query).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch products', error: err.message });
  }
}

// POST /api/products
async function createProduct(req, res) {
  try {
    const { name, price, stock, aisle, category } = req.body;
    if (!name || price == null || stock == null || aisle == null) {
      return res.status(400).json({ message: 'name, price, stock and aisle are required' });
    }
    const product = await Product.create({ name, price, stock, aisle, category });

    const io = req.app.get('io');
    if (io) io.emit('inventoryUpdated', { type: 'created', product });

    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create product', error: err.message });
  }
}

// PUT /api/products/:id
async function updateProduct(req, res) {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const io = req.app.get('io');
    if (io) io.emit('inventoryUpdated', { type: 'updated', product });

    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update product', error: err.message });
  }
}

// DELETE /api/products/:id
async function deleteProduct(req, res) {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const io = req.app.get('io');
    if (io) io.emit('inventoryUpdated', { type: 'deleted', productId: req.params.id });

    res.json({ message: 'Product deleted', product });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete product', error: err.message });
  }
}

module.exports = { getProducts, createProduct, updateProduct, deleteProduct };
