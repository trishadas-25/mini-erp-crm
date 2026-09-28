import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Search, Plus, Edit, Eye, X } from 'lucide-react';
import './Customers.css';

interface Customer {
  id: string;
  name: string;
  mobile: string;
  email: string | null;
  businessName: string | null;
  status: string;
  type: string;
}

const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [submitError, setSubmitError] = useState('');
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    mobile: '',
    email: '',
    businessName: '',
    type: 'RETAIL',
    status: 'LEAD',
  });

  const fetchCustomers = async () => {
    try {
      const response = await api.get(`/customers?search=${search}`);
      setCustomers(response.data);
    } catch (error) {
      console.error('Failed to fetch customers', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsEditing(true);
    setSubmitError('');
  };

  const handleUpdateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;
    setSubmitError('');
    try {
      await api.put(`/customers/${editingCustomer.id}`, editingCustomer);
      setIsEditing(false);
      setEditingCustomer(null);
      fetchCustomers();
    } catch (error: any) {
      setSubmitError(error.response?.data?.message || 'Failed to update customer');
    }
  };

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    try {
      await api.post('/customers', newCustomer);
      setIsAdding(false);
      setNewCustomer({
        name: '',
        mobile: '',
        email: '',
        businessName: '',
        type: 'RETAIL',
        status: 'LEAD',
      });
      fetchCustomers();
    } catch (error: any) {
      setSubmitError(error.response?.data?.message || 'Failed to add customer');
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [search]);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Customers CRM</h1>
        <button className="btn-primary" onClick={() => setIsAdding(true)}>
          <Plus size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
          Add Customer
        </button>
      </div>

      <div className="card">
        <div className="table-toolbar">
          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search customers..." 
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
                  <th>Name</th>
                  <th>Contact</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center">No customers found</td>
                  </tr>
                ) : (
                  customers.map(c => (
                    <tr key={c.id}>
                      <td>
                        <div className="customer-name">{c.name}</div>
                        {c.businessName && <div className="customer-business">{c.businessName}</div>}
                      </td>
                      <td>
                        <div>{c.mobile}</div>
                        {c.email && <div className="text-muted text-sm">{c.email}</div>}
                      </td>
                      <td>
                        <span className={`badge badge-${c.type.toLowerCase()}`}>{c.type}</span>
                      </td>
                      <td>
                        <span className={`status-dot status-${c.status.toLowerCase()}`}></span>
                        {c.status}
                      </td>
                      <td className="actions">
                        <button className="icon-btn" title="View" onClick={() => alert(JSON.stringify(c, null, 2))}><Eye size={18} /></button>
                        <button className="icon-btn" title="Edit" onClick={() => handleEditClick(c)}><Edit size={18} /></button>
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
              <h2>Add New Customer</h2>
              <button className="icon-btn" onClick={() => setIsAdding(false)}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddCustomer} className="modal-form">
              {submitError && <div className="error-alert">{submitError}</div>}
              <div className="form-group">
                <label>Name *</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                  required 
                />
              </div>
              <div className="form-group">
                <label>Mobile *</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={newCustomer.mobile}
                  onChange={(e) => setNewCustomer({...newCustomer, mobile: e.target.value})}
                  required 
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input 
                  type="email" 
                  className="input-field" 
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Business Name</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={newCustomer.businessName}
                  onChange={(e) => setNewCustomer({...newCustomer, businessName: e.target.value})}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Type</label>
                  <select 
                    className="input-field"
                    value={newCustomer.type}
                    onChange={(e) => setNewCustomer({...newCustomer, type: e.target.value})}
                  >
                    <option value="RETAIL">Retail</option>
                    <option value="WHOLESALE">Wholesale</option>
                    <option value="DISTRIBUTOR">Distributor</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select 
                    className="input-field"
                    value={newCustomer.status}
                    onChange={(e) => setNewCustomer({...newCustomer, status: e.target.value})}
                  >
                    <option value="LEAD">Lead</option>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-outline" onClick={() => setIsAdding(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Save Customer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditing && editingCustomer && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Edit Customer</h2>
              <button className="icon-btn" onClick={() => setIsEditing(false)}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleUpdateCustomer} className="modal-form">
              {submitError && <div className="error-alert">{submitError}</div>}
              <div className="form-group">
                <label>Name *</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={editingCustomer.name}
                  onChange={(e) => setEditingCustomer({...editingCustomer, name: e.target.value})}
                  required 
                />
              </div>
              <div className="form-group">
                <label>Mobile *</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={editingCustomer.mobile}
                  onChange={(e) => setEditingCustomer({...editingCustomer, mobile: e.target.value})}
                  required 
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input 
                  type="email" 
                  className="input-field" 
                  value={editingCustomer.email || ''}
                  onChange={(e) => setEditingCustomer({...editingCustomer, email: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Business Name</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={editingCustomer.businessName || ''}
                  onChange={(e) => setEditingCustomer({...editingCustomer, businessName: e.target.value})}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Type</label>
                  <select 
                    className="input-field"
                    value={editingCustomer.type}
                    onChange={(e) => setEditingCustomer({...editingCustomer, type: e.target.value})}
                  >
                    <option value="RETAIL">Retail</option>
                    <option value="WHOLESALE">Wholesale</option>
                    <option value="DISTRIBUTOR">Distributor</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select 
                    className="input-field"
                    value={editingCustomer.status}
                    onChange={(e) => setEditingCustomer({...editingCustomer, status: e.target.value})}
                  >
                    <option value="LEAD">Lead</option>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-outline" onClick={() => setIsEditing(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Update Customer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
