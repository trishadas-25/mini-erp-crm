import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Search, Plus, Edit, ArrowRightLeft, X } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  unitPrice: number;
  stock: number;
  minStockAlert: number;
}

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [submitError, setSubmitError] = useState('');
  const [newProduct, setNewProduct] = useState({
    name: '',
    sku: '',
    category: 'Electronics',
    unitPrice: '',
    minStockAlert: '10',
    location: '',
  });

  const fetchProducts = async () => {
    try {
      const response = await api.get(`/products?search=${search}`);
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to fetch products', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    try {
      await api.post('/products', {
        ...newProduct,
        unitPrice: parseFloat(newProduct.unitPrice),
        minStockAlert: parseInt(newProduct.minStockAlert, 10) || 0,
      });
      setIsAdding(false);
      setNewProduct({
        name: '',
        sku: '',
        category: 'Electronics',
        unitPrice: '',
        minStockAlert: '10',
        location: '',
      });
      fetchProducts();
    } catch (error: any) {
      setSubmitError(error.response?.data?.message || 'Failed to add product');
    }
  };

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setIsEditing(true);
    setSubmitError('');
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setSubmitError('');
    try {
      await api.put(`/products/${editingProduct.id}`, {
        ...editingProduct,
        unitPrice: parseFloat(editingProduct.unitPrice as any),
        minStockAlert: parseInt(editingProduct.minStockAlert as any, 10) || 0,
      });
      setIsEditing(false);
      setEditingProduct(null);
      fetchProducts();
    } catch (error: any) {
      setSubmitError(error.response?.data?.message || 'Failed to update product');
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search]);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Inventory</h1>
        <button className="btn-primary" onClick={() => setIsAdding(true)}>
          <Plus size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
          Add Product
        </button>
      </div>

      <div className="card">
        <div className="table-toolbar">
          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search products by SKU or Name..." 
              className="input-field pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Product Details</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center">No products found</td>
                  </tr>
                ) : (
                  products.map(p => (
                    <tr key={p.id}>
                      <td>
                        <div className="customer-name">{p.name}</div>
                      </td>
                      <td><span style={{fontFamily: 'monospace', color: 'var(--text-muted)'}}>{p.sku}</span></td>
                      <td>{p.category}</td>
                      <td>${p.unitPrice.toFixed(2)}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ 
                            fontWeight: 600, 
                            color: p.stock <= p.minStockAlert ? 'var(--danger)' : 'var(--success)' 
                          }}>
                            {p.stock}
                          </span>
                          {p.stock <= p.minStockAlert && (
                            <span className="badge badge-retail" style={{backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)'}}>Low Stock</span>
                          )}
                        </div>
                      </td>
                      <td className="actions">
                        <button className="icon-btn" title="Stock Movement"><ArrowRightLeft size={18} /></button>
                        <button className="icon-btn" title="Edit" onClick={() => handleEditClick(p)}><Edit size={18} /></button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isAdding && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add New Product</h2>
              <button className="icon-btn" onClick={() => setIsAdding(false)}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddProduct} className="modal-form">
              {submitError && <div className="error-alert">{submitError}</div>}
              <div className="form-group">
                <label>Name *</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  required 
                />
              </div>
              <div className="form-group">
                <label>SKU *</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={newProduct.sku}
                  onChange={(e) => setNewProduct({...newProduct, sku: e.target.value})}
                  required 
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Category *</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Unit Price ($) *</label>
                  <input 
                    type="number" 
                    step="0.01"
                    className="input-field" 
                    value={newProduct.unitPrice}
                    onChange={(e) => setNewProduct({...newProduct, unitPrice: e.target.value})}
                    required 
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Min Stock Alert</label>
                  <input 
                    type="number" 
                    className="input-field" 
                    value={newProduct.minStockAlert}
                    onChange={(e) => setNewProduct({...newProduct, minStockAlert: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Location</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    value={newProduct.location}
                    onChange={(e) => setNewProduct({...newProduct, location: e.target.value})}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-outline" onClick={() => setIsAdding(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditing && editingProduct && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Edit Product</h2>
              <button className="icon-btn" onClick={() => setIsEditing(false)}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleUpdateProduct} className="modal-form">
              {submitError && <div className="error-alert">{submitError}</div>}
              <div className="form-group">
                <label>Name *</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                  required 
                />
              </div>
              <div className="form-group">
                <label>SKU *</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={editingProduct.sku}
                  onChange={(e) => setEditingProduct({...editingProduct, sku: e.target.value})}
                  required 
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Category *</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct({...editingProduct, category: e.target.value})}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Unit Price ($) *</label>
                  <input 
                    type="number" 
                    step="0.01"
                    className="input-field" 
                    value={editingProduct.unitPrice}
                    onChange={(e) => setEditingProduct({...editingProduct, unitPrice: e.target.value as any})}
                    required 
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Min Stock Alert</label>
                  <input 
                    type="number" 
                    className="input-field" 
                    value={editingProduct.minStockAlert}
                    onChange={(e) => setEditingProduct({...editingProduct, minStockAlert: e.target.value as any})}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-outline" onClick={() => setIsEditing(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Update Product</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
