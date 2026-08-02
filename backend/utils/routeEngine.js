const { spawn } = require('child_process');
const path = require('path');

const ENGINE_PATH = path.resolve(__dirname, process.env.ROUTE_ENGINE_PATH || '../../cpp/route_engine');

function runEngine(args) {
  return new Promise((resolve, reject) => {
    const proc = spawn(ENGINE_PATH, args);
    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (data) => (stdout += data.toString()));
    proc.stderr.on('data', (data) => (stderr += data.toString()));

    proc.on('error', (err) => reject(err)); // e.g. ENOENT if binary not built yet

    proc.on('close', (code) => {
      if (code !== 0 && !stdout) {
        return reject(new Error(stderr || `route_engine exited with code ${code}`));
      }
      try {
        resolve(JSON.parse(stdout.trim()));
      } catch (e) {
        reject(new Error('Failed to parse route_engine output: ' + stdout));
      }
    });
  });
}

/**
 * Calls the compiled C++ engine (Graph + Dijkstra RoutePlanner) to compute
 * the shortest shopping route visiting all requested aisle stops.
 * Falls back to a JS re-implementation of Dijkstra if the C++ binary
 * has not been compiled yet, so the app remains usable end-to-end.
 */
async function computeShortestRoute(start, edges, stops) {
  const args = ['route', String(start), String(edges.length)];
  edges.forEach((e) => args.push(String(e.u), String(e.v), String(e.weight)));
  args.push(String(stops.length));
  stops.forEach((s) => args.push(String(s)));

  try {
    return await runEngine(args);
  } catch (err) {
    console.warn('C++ route_engine unavailable, using JS fallback:', err.message);
    return jsFallbackRoute(start, edges, stops);
  }
}

/**
 * Calls the compiled C++ engine (PriorityQueue/min-heap based QueueManager)
 * to recommend the fastest checkout counter. Falls back to a JS
 * re-implementation if the binary isn't built.
 */
async function computeQueueRecommendation(counters) {
  const args = ['queue', String(counters.length)];
  counters.forEach((c) =>
    args.push(String(c.counterId), c.cashierName, String(c.queueLength), String(c.avgServiceTime))
  );

  try {
    return await runEngine(args);
  } catch (err) {
    console.warn('C++ route_engine unavailable, using JS fallback:', err.message);
    return jsFallbackQueue(counters);
  }
}

// ---------------- JS fallback implementations (mirror the C++ logic) ----------------

function jsFallbackRoute(start, edges, stops) {
  const adj = new Map();
  const addEdge = (u, v, w) => {
    if (!adj.has(u)) adj.set(u, []);
    adj.get(u).push({ to: v, weight: w });
  };
  edges.forEach((e) => {
    addEdge(e.u, e.v, e.weight);
    addEdge(e.v, e.u, e.weight);
  });

  function dijkstra(src, target) {
    const dist = new Map([[src, 0]]);
    const prev = new Map();
    const visited = new Set();
    const pq = [[0, src]];

    while (pq.length) {
      pq.sort((a, b) => a[0] - b[0]);
      const [d, u] = pq.shift();
      if (visited.has(u)) continue;
      visited.add(u);
      if (u === target) break;

      for (const { to, weight } of adj.get(u) || []) {
        const nd = d + weight;
        if (!dist.has(to) || nd < dist.get(to)) {
          dist.set(to, nd);
          prev.set(to, u);
          pq.push([nd, to]);
        }
      }
    }

    if (!dist.has(target)) return { path: [], totalDistance: -1 };
    const path = [target];
    let cur = target;
    while (cur !== src) {
      cur = prev.get(cur);
      path.unshift(cur);
    }
    return { path, totalDistance: dist.get(target) };
  }

  let current = start;
  let remaining = [...stops];
  const finalPath = [start];
  let totalDistance = 0;

  while (remaining.length) {
    let best = null;
    let bestIdx = -1;
    for (let i = 0; i < remaining.length; i++) {
      const r = dijkstra(current, remaining[i]);
      if (r.totalDistance >= 0 && (!best || r.totalDistance < best.totalDistance)) {
        best = r;
        bestIdx = i;
      }
    }
    if (!best) break;
    finalPath.push(...best.path.slice(1));
    totalDistance += best.totalDistance;
    current = remaining[bestIdx];
    remaining.splice(bestIdx, 1);
  }

  return { path: finalPath, distance: totalDistance };
}

function jsFallbackQueue(counters) {
  const withPriority = counters.map((c) => ({
    ...c,
    estimatedWait: c.queueLength * c.avgServiceTime,
  }));
  withPriority.sort((a, b) => a.estimatedWait - b.estimatedWait);
  return {
    counters: withPriority,
    recommended: withPriority.length ? withPriority[0].counterId : null,
  };
}

module.exports = { computeShortestRoute, computeQueueRecommendation };
