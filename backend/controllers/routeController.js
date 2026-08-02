const Product = require('../models/Product');
const { computeShortestRoute } = require('../utils/routeEngine');
const { storeEdges, ENTRANCE_NODE } = require('../config/storeLayout');

// POST /api/route  { productIds: [...] }
// Looks up the aisle (graph node) for each selected product, then asks the
// C++ Dijkstra-based RoutePlanner for the shortest path visiting all of them.
async function planRoute(req, res) {
  try {
    const { productIds } = req.body;
    if (!Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ message: 'productIds array is required' });
    }

    const products = await Product.find({ _id: { $in: productIds } });
    if (products.length === 0) {
      return res.status(404).json({ message: 'No matching products found' });
    }

    const stops = [...new Set(products.map((p) => p.aisle))];

    const result = await computeShortestRoute(ENTRANCE_NODE, storeEdges, stops);

    const io = req.app.get('io');
    if (io) io.emit('routeGenerated', { path: result.path, distance: result.distance });

    res.json({
      path: result.path,
      distance: result.distance,
      products: products.map((p) => ({ id: p._id, name: p.name, aisle: p.aisle })),
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to plan route', error: err.message });
  }
}

module.exports = { planRoute };
