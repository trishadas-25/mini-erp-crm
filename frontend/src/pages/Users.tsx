import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Search, Plus, Edit, Trash2, X, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

const Users: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [submitError, setSubmitError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'SALES',
  });

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    try {
      await api.post('/users', formData);
      setIsAdding(false);
      setFormData({ name: '', email: '', password: '', role: 'SALES' });
      fetchUsers();
    } catch (error: any) {
      setSubmitError(error.response?.data?.message || 'Failed to add user');
    }
  };

  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
    });
    setIsEditing(true);
    setSubmitError('');
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setSubmitError('');
    try {
      await api.put(`/users/${editingUser.id}`, formData);
      setIsEditing(false);
      setEditingUser(null);
      fetchUsers();
    } catch (error: any) {
      setSubmitError(error.response?.data?.message || 'Failed to update user');
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await api.delete(`/users/${id}`);
        fetchUsers();
      } catch (error: any) {
        alert(error.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  if (currentUser?.role !== 'ADMIN') {
    return (
      <div className="page-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <ShieldAlert size={64} style={{ color: 'var(--danger)', marginBottom: '1rem' }} />
        <h2>Access Denied</h2>
        <p>You do not have permission to view this page. Only administrators can manage users.</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>User Management</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn-outline" onClick={() => window.location.href = '/login'}>
            <ShieldAlert size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            Admin Login
          </button>
          <button className="btn-primary" onClick={() => {
            setIsAdding(true);
            setFormData({ name: '', email: '', password: '', role: 'SALES' });
          }}>
          <Plus size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
          Add User
        </button>
        </div>
      </div>

      <div className="card">
        <div className="table-toolbar">
          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search users..." 
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
                  <th>Email</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center">No users found</td>
                  </tr>
                ) : (
                  filteredUsers.map(u => (
                    <tr key={u.id}>
                      <td>
                        <div className="customer-name">{u.name}</div>
                      </td>
                      <td>{u.email}</td>
                      <td>
                        <span className={`badge ${u.role === 'ADMIN' ? 'badge-distributor' : 'badge-retail'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="actions">
                        <button className="icon-btn" title="Edit" onClick={() => handleEditClick(u)}>
                          <Edit size={18} />
                        </button>
                        <button 
                          className="icon-btn" 
                          title="Delete" 
                          onClick={() => handleDeleteUser(u.id)}
                          disabled={u.id === currentUser.id}
                        >
                          <Trash2 size={18} style={{ color: u.id === currentUser.id ? 'var(--text-muted)' : 'var(--danger)' }} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {isAdding && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add New User</h2>
              <button className="icon-btn" onClick={() => setIsAdding(false)}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddSubmit} className="modal-form">
              {submitError && <div className="error-alert">{submitError}</div>}
              
              <div className="form-group">
                <label>Name *</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required 
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input 
                  type="email" 
                  className="input-field" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required 
                />
              </div>
              <div className="form-group">
                <label>Password *</label>
                <input 
                  type="password" 
                  className="input-field" 
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required 
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select 
                  className="input-field" 
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                >
                  <option value="ADMIN">Admin</option>
                  <option value="SALES">Sales</option>
                  <option value="WAREHOUSE">Warehouse</option>
                  <option value="ACCOUNTS">Accounts</option>
                </select>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-outline" onClick={() => setIsAdding(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Create User</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {isEditing && editingUser && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Edit User</h2>
              <button className="icon-btn" onClick={() => setIsEditing(false)}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="modal-form">
              {submitError && <div className="error-alert">{submitError}</div>}
              
              <div className="form-group">
                <label>Name *</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required 
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input 
                  type="email" 
                  className="input-field" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required 
                />
              </div>
              <div className="form-group">
                <label>Change Password (Leave blank to keep unchanged)</label>
                <input 
                  type="password" 
                  className="input-field" 
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select 
                  className="input-field" 
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                >
                  <option value="ADMIN">Admin</option>
                  <option value="SALES">Sales</option>
                  <option value="WAREHOUSE">Warehouse</option>
                  <option value="ACCOUNTS">Accounts</option>
                </select>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-outline" onClick={() => setIsEditing(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Update User</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
