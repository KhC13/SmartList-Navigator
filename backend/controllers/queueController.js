const { computeQueueRecommendation } = require('../utils/routeEngine');

// Simulated checkout counters (in-memory). In a real system this would come
// from POS hardware/DB, but for this DSA/OOP demo we simulate fluctuating
// queue lengths so the Priority Queue recommendation has something to react to.
let counters = [
  { counterId: 1, cashierName: 'Alice', queueLength: 5, avgServiceTime: 20 },
  { counterId: 2, cashierName: 'Bob', queueLength: 2, avgServiceTime: 25 },
  { counterId: 3, cashierName: 'Charlie', queueLength: 8, avgServiceTime: 15 },
  { counterId: 4, cashierName: 'Diana', queueLength: 3, avgServiceTime: 18 },
];

function simulateFluctuation() {
  counters = counters.map((c) => ({
    ...c,
    queueLength: Math.max(0, c.queueLength + Math.floor(Math.random() * 3) - 1),
  }));
}

// GET /api/queue
async function getQueueStatus(req, res) {
  try {
    simulateFluctuation();
    const result = await computeQueueRecommendation(counters);

    const io = req.app.get('io');
    if (io) io.emit('queueUpdated', result);

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Failed to compute queue status', error: err.message });
  }
}

module.exports = { getQueueStatus };
