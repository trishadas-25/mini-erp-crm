import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, FileText, X, Trash2, Check, XCircle } from 'lucide-react';

interface Customer {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  unitPrice: number;
  stock: number;
}

interface Challan {
  id: string;
  challanNo: string;
  customer: { name: string };
  totalQuantity: number;
  status: string;
  timestamp: string;
}

const Challans: React.FC = () => {
  const [challans, setChallans] = useState<Challan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [submitError, setSubmitError] = useState('');
  
  // Data for the form
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
  const [newChallan, setNewChallan] = useState({
    customerId: '',
    status: 'DRAFT',
    items: [{ productId: '', quantity: 1 }]
  });

  const fetchChallans = async () => {
    try {
      const response = await api.get('/challans');
      setChallans(response.data);
    } catch (error) {
      console.error('Failed to fetch challans', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFormData = async () => {
    try {
      const [custRes, prodRes] = await Promise.all([
        api.get('/customers'),
        api.get('/products')
      ]);
      setCustomers(custRes.data);
      setProducts(prodRes.data);
    } catch (error) {
      console.error('Failed to fetch form data', error);
    }
  };

  const handleAddChallan = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    if (!newChallan.customerId) {
      setSubmitError('Please select a customer');
      return;
    }
    
    // filter out empty items
    const validItems = newChallan.items
      .filter(item => item.productId)
      .map(item => ({
        productId: item.productId,
        quantity: parseInt(item.quantity as any, 10)
      }));
      
    if (validItems.length === 0) {
      setSubmitError('Please add at least one product');
      return;
    }

    try {
      await api.post('/challans', {
        customerId: newChallan.customerId,
        status: newChallan.status,
        items: validItems
      });
      setIsAdding(false);
      setNewChallan({
        customerId: '',
        status: 'DRAFT',
        items: [{ productId: '', quantity: 1 }]
      });
      fetchChallans();
    } catch (error: any) {
      setSubmitError(error.response?.data?.message || 'Failed to create challan');
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    if (!window.confirm(`Are you sure you want to mark this challan as ${status}?`)) return;
    try {
      await api.put(`/challans/${id}`, { status });
      fetchChallans();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update challan status');
    }
  };

  useEffect(() => {
    fetchChallans();
    fetchFormData();
  }, []);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Sales Challans</h1>
        <button className="btn-primary" onClick={() => setIsAdding(true)}>
          <Plus size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
          Create Challan
        </button>
      </div>

      <div className="card">
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Challan No</th>
                  <th>Customer</th>
                  <th>Total Quantity</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {challans.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center">No challans found</td>
                  </tr>
                ) : (
                  challans.map(c => (
                    <tr key={c.id}>
                      <td>
                        <span style={{fontFamily: 'monospace', fontWeight: 600, color: 'var(--primary-color)'}}>
                          {c.challanNo}
                        </span>
                      </td>
                      <td>{c.customer?.name}</td>
                      <td>{c.totalQuantity} items</td>
                      <td>{new Date(c.timestamp).toLocaleDateString()}</td>
                      <td>
                        <span className={`badge ${c.status === 'CONFIRMED' ? 'badge-wholesale' : 'badge-retail'}`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="actions">
                        <button className="icon-btn" title="View"><FileText size={18} /></button>
                        {c.status === 'DRAFT' && (
                          <>
                            <button className="icon-btn" title="Confirm Challan" onClick={() => handleUpdateStatus(c.id, 'CONFIRMED')} style={{ color: 'var(--success)' }}><Check size={18} /></button>
                            <button className="icon-btn" title="Cancel Challan" onClick={() => handleUpdateStatus(c.id, 'CANCELLED')} style={{ color: 'var(--danger)' }}><XCircle size={18} /></button>
                          </>
                        )}
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
          <div className="modal-content large">
            <div className="modal-header">
              <h2>Create New Challan</h2>
              <button className="icon-btn" onClick={() => setIsAdding(false)}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddChallan} className="modal-form">
              {submitError && <div className="error-alert">{submitError}</div>}
              
              <div className="form-row">
                <div className="form-group">
                  <label>Customer *</label>
                  <select 
                    className="input-field" 
                    value={newChallan.customerId}
                    onChange={(e) => setNewChallan({...newChallan, customerId: e.target.value})}
                    required
                  >
                    <option value="">Select a customer</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select 
                    className="input-field" 
                    value={newChallan.status}
                    onChange={(e) => setNewChallan({...newChallan, status: e.target.value})}
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="CONFIRMED">Confirmed</option>
                  </select>
                </div>
              </div>

              <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Products</h3>
                
                {newChallan.items.map((item, index) => (
                  <div key={index} className="form-row" style={{ alignItems: 'flex-end', marginBottom: '0.5rem' }}>
                    <div className="form-group" style={{ flex: 2 }}>
                      {index === 0 && <label>Product</label>}
                      <select 
                        className="input-field" 
                        value={item.productId}
                        onChange={(e) => {
                          const newItems = [...newChallan.items];
                          newItems[index].productId = e.target.value;
                          setNewChallan({...newChallan, items: newItems});
                        }}
                      >
                        <option value="">Select product...</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock})</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      {index === 0 && <label>Qty</label>}
                      <input 
                        type="number" 
                        min="1"
                        className="input-field" 
                        value={item.quantity}
                        onChange={(e) => {
                          const newItems = [...newChallan.items];
                          newItems[index].quantity = parseInt(e.target.value) || 1;
                          setNewChallan({...newChallan, items: newItems});
                        }}
                      />
                    </div>
                    <button 
                      type="button" 
                      className="icon-btn" 
                      style={{ marginBottom: '0.5rem' }}
                      onClick={() => {
                        const newItems = newChallan.items.filter((_, i) => i !== index);
                        setNewChallan({...newChallan, items: newItems});
                      }}
                      disabled={newChallan.items.length === 1}
                    >
                      <Trash2 size={20} style={{ color: newChallan.items.length === 1 ? 'var(--text-muted)' : 'var(--danger)' }} />
                    </button>
                  </div>
                ))}
                
                <button 
                  type="button" 
                  className="btn-outline" 
                  style={{ marginTop: '1rem', width: '100%' }}
                  onClick={() => setNewChallan({
                    ...newChallan, 
                    items: [...newChallan.items, { productId: '', quantity: 1 }]
                  })}
                >
                  <Plus size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                  Add Another Product
                </button>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-outline" onClick={() => setIsAdding(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Create Challan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Challans;
