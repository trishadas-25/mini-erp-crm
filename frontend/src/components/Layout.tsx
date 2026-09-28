import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Users, Package, FileText, LogOut, LayoutDashboard, ShieldAlert } from 'lucide-react';
import './Layout.css';

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>Mini ERP</h2>
      </div>
      
      <div className="user-info">
        <div className="user-avatar">
          {user?.name.charAt(0)}
        </div>
        <div className="user-details">
          <p className="user-name">{user?.name}</p>
          <p className="user-role">{user?.role}</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} end>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/customers" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <Users size={20} />
          <span>Customers CRM</span>
        </NavLink>
        <NavLink to="/products" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <Package size={20} />
          <span>Inventory</span>
        </NavLink>
        <NavLink to="/challans" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <FileText size={20} />
          <span>Sales Challans</span>
        </NavLink>
        {user?.role === 'ADMIN' && (
          <NavLink to="/users" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <ShieldAlert size={20} />
            <span>User Management</span>
          </NavLink>
        )}
      </nav>
      
      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

const Layout: React.FC = () => {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="topbar">
          {/* Topbar can include search or breadcrumbs later */}
        </div>
        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
