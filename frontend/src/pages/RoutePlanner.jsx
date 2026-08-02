import { useEffect, useState } from 'react';
import { productAPI, routeAPI } from '../services/api.js';

export default function RoutePlanner() {
  const [products, setProducts] = useState([]);
  const [selected, setSelected] = useState([]);
  const [route, setRoute] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    productAPI
      .getAll()
      .then((res) => setProducts(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load products'));
  }, []);

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handlePlanRoute = async () => {
    if (selected.length === 0) {
      setError('Select at least one product first');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await routeAPI.plan(selected);
      setRoute(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to plan route');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h2>Route Planner</h2>
      <p style={{ color: '#7b8794' }}>
        Select the products you want to buy. The backend calls the C++ Dijkstra engine to
        compute the shortest walking route through the store.
      </p>

      <div className="card">
        <div className="section-title" style={{ marginTop: 0 }}>Select Products</div>
        <div className="checkbox-list">
          {products.length === 0 && <p>No products yet — add some in Inventory first.</p>}
          {products.map((p) => (
            <label key={p._id}>
              <input
                type="checkbox"
                checked={selected.includes(p._id)}
                onChange={() => toggleSelect(p._id)}
              />
              {p.name} — Aisle {p.aisle} — ${p.price}
            </label>
          ))}
        </div>
        <button className="btn-primary" style={{ marginTop: 16 }} onClick={handlePlanRoute} disabled={loading}>
          {loading ? 'Calculating shortest route...' : 'Generate Optimal Route'}
        </button>
        {error && <div className="error-text">{error}</div>}
      </div>

      {route && (
        <div className="card">
          <div className="section-title" style={{ marginTop: 0 }}>Generated Route</div>
          <div className="route-path">
            {route.path.map((node, idx) => (
              <span key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="route-node">{node === 0 ? 'Entrance' : `Aisle ${node}`}</span>
                {idx < route.path.length - 1 && <span className="arrow">→</span>}
              </span>
            ))}
          </div>
          <p style={{ marginTop: 12 }}>
            <strong>Total walking distance:</strong> {route.distance}
          </p>
          <p style={{ marginTop: 6, color: '#7b8794' }}>
            Products covered: {route.products.map((p) => p.name).join(', ')}
          </p>
        </div>
      )}
    </div>
  );
}
