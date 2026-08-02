// Static weighted-graph layout of the store, expressed as aisle nodes + edges.
// Node 0 = Entrance. Edge weight = walking distance (meters) between aisles.
// This is passed to the C++ Graph/RoutePlanner engine on every /api/route request.

const storeEdges = [
  { u: 0, v: 1, weight: 4 },
  { u: 0, v: 2, weight: 2 },
  { u: 1, v: 2, weight: 1 },
  { u: 1, v: 3, weight: 5 },
  { u: 2, v: 3, weight: 8 },
  { u: 2, v: 4, weight: 10 },
  { u: 3, v: 4, weight: 2 },
  { u: 3, v: 5, weight: 6 },
  { u: 4, v: 5, weight: 3 },
  { u: 5, v: 6, weight: 1 },
  { u: 4, v: 6, weight: 5 },
];

const ENTRANCE_NODE = 0;

module.exports = { storeEdges, ENTRANCE_NODE };
