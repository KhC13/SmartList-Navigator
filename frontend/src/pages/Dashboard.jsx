import { useEffect, useState } from 'react';
import { statsAPI, queueAPI } from '../services/api.js';
import socket from '../services/socket.js';

export default function Dashboard() {
  const [stats, setStats] = useState({ totalProducts: 0, activeCustomers: 0 });
  const [recommendedCounter, setRecommendedCounter] = useState(null);
  const [lastRoute, setLastRoute] = useState(null);

  const loadStats = async () => {
    try {
      const res = await statsAPI.get();
      setStats(res.data);
    } catch (err) {
      console.error('Failed to load stats', err);
    }
  };

  const loadQueue = async () => {
    try {
      const res = await queueAPI.getStatus();
      const rec = res.data.counters.find((c) => c.counterId === res.data.recommended);
      setRecommendedCounter(rec || null);
    } catch (err) {
      console.error('Failed to load queue', err);
    }
  };

  useEffect(() => {
    loadStats();
    loadQueue();

    const onActiveCustomers = ({ count }) =>
      setStats((prev) => ({ ...prev, activeCustomers: count }));
    const onInventoryUpdated = () => loadStats();
    const onQueueUpdated = (data) => {
      const rec = data.counters.find((c) => c.counterId === data.recommended);
      setRecommendedCounter(rec || null);
    };
    const onRouteGenerated = (data) => setLastRoute(data);

    socket.on('activeCustomers', onActiveCustomers);
    socket.on('inventoryUpdated', onInventoryUpdated);
    socket.on('queueUpdated', onQueueUpdated);
    socket.on('routeGenerated', onRouteGenerated);

    return () => {
      socket.off('activeCustomers', onActiveCustomers);
      socket.off('inventoryUpdated', onInventoryUpdated);
      socket.off('queueUpdated', onQueueUpdated);
      socket.off('routeGenerated', onRouteGenerated);
    };
  }, []);

  return (
    <div className="container">
      <h2>Dashboard</h2>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="label">Total Products</div>
          <div className="value">{stats.totalProducts}</div>
        </div>
        <div className="stat-card">
          <div className="label">Active Customers</div>
          <div className="value">{stats.activeCustomers}</div>
        </div>
        <div className="stat-card">
          <div className="label">Recommended Checkout</div>
          <div className="value">
            {recommendedCounter ? `Counter ${recommendedCounter.counterId}` : '—'}
          </div>
        </div>
      </div>

      <div className="section-title">Recommended Checkout Details</div>
      <div className="card">
        {recommendedCounter ? (
          <>
            <p>
              <strong>{recommendedCounter.cashierName}</strong> at Counter{' '}
              {recommendedCounter.counterId}
            </p>
            <p>
              Queue length: {recommendedCounter.queueLength} | Estimated wait:{' '}
              {recommendedCounter.estimatedWait}s
            </p>
          </>
        ) : (
          <p>No queue data yet.</p>
        )}
      </div>

      <div className="section-title">Last Generated Shopping Route</div>
      <div className="card">
        {lastRoute ? (
          <>
            <div className="route-path">
              {lastRoute.path.map((node, idx) => (
                <span key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="route-node">Aisle {node}</span>
                  {idx < lastRoute.path.length - 1 && <span className="arrow">→</span>}
                </span>
              ))}
            </div>
            <p style={{ marginTop: 10 }}>Total distance: {lastRoute.distance}</p>
          </>
        ) : (
          <p>No route generated yet. Visit the Route Planner page to create one.</p>
        )}
      </div>
    </div>
  );
}
