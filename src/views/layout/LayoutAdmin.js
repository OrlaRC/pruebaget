import React, { useState } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import {
  Home, User, Tag, Car, Image, FileText, BarChart3, Settings,
  Menu, X
} from 'lucide-react';
import './layout-admin.css';

const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: Home },
  { path: '/usuarios', label: 'Usuarios', icon: User },
  { path: '/marcas', label: 'Marcas', icon: Tag },
  { path: '/vehiculos', label: 'Vehículos', icon: Car },
  { path: '/imagenes', label: 'Imágenes', icon: Image },
  { path: '/publicaciones', label: 'Publicaciones', icon: FileText },
  { path: '/auditoria', label: 'Auditoría', icon: BarChart3 },
];

const LayoutAdmin = ({ children }) => {
  const location = useLocation();
  const history = useHistory();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="admin-layout">
      <div className={`sidebar ${sidebarOpen ? 'expanded' : 'collapsed'}`}>
        <div className="sidebar-header">
          {sidebarOpen && <h1 className="sidebar-title">Admin Panel</h1>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="sidebar-toggle">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        <nav className="sidebar-nav">
          {menuItems.map(item => (
            <button
              key={item.path}
              onClick={() => history.push(item.path)}
              className={`menu-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              <item.icon size={20} className="menu-item-icon" />
              <span className="menu-item-text">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="admin-content">
        <header className="main-header">
          <h2>{menuItems.find(item => item.path === location.pathname)?.label || 'Panel'}</h2>
        </header>

        <main className="main-body">
          {children}
        </main>
      </div>
    </div>
  );
};

export default LayoutAdmin;