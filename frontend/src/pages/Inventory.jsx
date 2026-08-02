import { useEffect, useState } from 'react';
import { productAPI } from '../services/api.js';
import socket from '../services/socket.js';

const emptyForm = { name: '', price: '', stock: '', aisle: '', category: '' };

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  const loadProducts = async (query = '') => {
    try {
      const res = await productAPI.getAll(query);
      setProducts(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load inventory');
    }
  };

  useEffect(() => {
    loadProducts();

    const refresh = () => loadProducts(search);
    socket.on('inventoryUpdated', refresh);
    return () => socket.off('inventoryUpdated', refresh);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    loadProducts(search);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const payload = {
      name: form.name,
      price: Number(form.price),
      stock: Number(form.stock),
      aisle: Number(form.aisle),
      category: form.category || 'general',
    };
    try {
      if (editingId) {
        await productAPI.update(editingId, payload);
      } else {
        await productAPI.create(payload);
      }
      resetForm();
      loadProducts(search);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save product');
    }
  };

  const handleEdit = (p) => {
    setForm({
      name: p.name,
      price: p.price,
      stock: p.stock,
      aisle: p.aisle,
      category: p.category,
    });
    setEditingId(p._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await productAPI.remove(id);
      loadProducts(search);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete product');
    }
  };

  const handleStockChange = async (p, delta) => {
    const newStock = Math.max(0, p.stock + delta);
    try {
      await productAPI.update(p._id, { stock: newStock });
      loadProducts(search);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update stock');
    }
  };

  return (
    <div className="container">
      <h2>Inventory</h2>

      <form onSubmit={handleSearch} style={{ marginBottom: 16, display: 'flex', gap: 10 }}>
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, padding: 10, borderRadius: 6, border: '1px solid #cbd2d9' }}
        />
        <button className="btn-primary" style={{ width: 120 }} type="submit">
          Search
        </button>
      </form>

      <button className="btn-add" onClick={() => { resetForm(); setShowForm(true); }}>
        + Add Product
      </button>

      {error && <div className="error-text">{error}</div>}

      {showForm && (
        <div className="card">
          <div className="section-title" style={{ marginTop: 0 }}>
            {editingId ? 'Edit Product' : 'New Product'}
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
              <input name="price" type="number" step="0.01" placeholder="Price" value={form.price} onChange={handleChange} required />
              <input name="stock" type="number" placeholder="Stock" value={form.stock} onChange={handleChange} required />
              <input name="aisle" type="number" placeholder="Aisle (graph node id)" value={form.aisle} onChange={handleChange} required />
              <input name="category" placeholder="Category" value={form.category} onChange={handleChange} />
            </div>
            <button className="btn-primary" type="submit" style={{ width: 160 }}>
              {editingId ? 'Update' : 'Add'} Product
            </button>
            <button
              type="button"
              onClick={resetForm}
              style={{ marginLeft: 10, background: 'none', border: 'none', color: '#7b8794', cursor: 'pointer' }}
            >
              Cancel
            </button>
          </form>
        </div>
      )}

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Aisle</th>
              <th>Category</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id}>
                <td>{p.name}</td>
                <td>${p.price}</td>
                <td>
                  <button className="btn-sm" onClick={() => handleStockChange(p, -1)}>-</button>
                  {p.stock}
                  <button className="btn-sm" onClick={() => handleStockChange(p, 1)}>+</button>
                </td>
                <td>{p.aisle}</td>
                <td>{p.category}</td>
                <td>
                  <button className="btn-sm btn-edit" onClick={() => handleEdit(p)}>Edit</button>
                  <button className="btn-sm btn-delete" onClick={() => handleDelete(p._id)}>Delete</button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={6}>No products found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
