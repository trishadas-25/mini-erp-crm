import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Users, Package, FileText, ShieldAlert } from 'lucide-react';
import './Dashboard.css';

interface DashboardStats {
  totalCustomers: number;
  totalProducts: number;
  totalChallans: number;
  totalInventoryValue: number;
  totalUsers?: number;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/dashboard/stats');
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Dashboard</h1>
        {user?.role !== 'ADMIN' && (
          <button className="btn-outline" onClick={() => window.location.href = '/login'}>
            <ShieldAlert size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            Admin Login
          </button>
        )}
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>
          Welcome back, <strong>{user?.name}</strong>! Here is an overview of your Mini ERP + CRM Portal.
        </p>
      </div>

      {loading ? (
        <p>Loading stats...</p>
      ) : stats ? (
        <>
          <div className="dashboard-grid">
            <div className="stat-card">
              <div className="stat-icon">
                <Users size={28} />
              </div>
              <div className="stat-info">
                <span className="stat-title">Customers</span>
                <span className="stat-value">{stats.totalCustomers}</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <Package size={28} />
              </div>
              <div className="stat-info">
                <span className="stat-title">Products</span>
                <span className="stat-value">{stats.totalProducts}</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <FileText size={28} />
              </div>
              <div className="stat-info">
                <span className="stat-title">Sales Challans</span>
                <span className="stat-value">{stats.totalChallans}</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>$</span>
              </div>
              <div className="stat-info">
                <span className="stat-title">Inventory Value</span>
                <span className="stat-value">${stats.totalInventoryValue.toLocaleString()}</span>
              </div>
            </div>

            {user?.role === 'ADMIN' && stats.totalUsers !== undefined && (
              <div className="stat-card">
                <div className="stat-icon" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)' }}>
                  <ShieldAlert size={28} />
                </div>
                <div className="stat-info">
                  <span className="stat-title">System Users</span>
                  <span className="stat-value">{stats.totalUsers}</span>
                </div>
              </div>
            )}
          </div>

          <div className="card">
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Quick Actions</h2>
            <div className="quick-links">
              <button className="quick-link-btn" onClick={() => navigate('/customers')}>
                <Users size={20} />
                Manage Customers
              </button>
              <button className="quick-link-btn" onClick={() => navigate('/products')}>
                <Package size={20} />
                Manage Inventory
              </button>
              <button className="quick-link-btn" onClick={() => navigate('/challans')}>
                <FileText size={20} />
                Create Challan
              </button>
              {user?.role === 'ADMIN' && (
                <button className="quick-link-btn" onClick={() => navigate('/users')}>
                  <ShieldAlert size={20} />
                  Manage Users
                </button>
              )}
            </div>
          </div>
        </>
      ) : (
        <p className="error-alert">Failed to load dashboard data.</p>
      )}
    </div>
  );
};

export default Dashboard;
