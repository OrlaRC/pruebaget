import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import {
  Car, FileText,
  Plus, Edit, Check, Clock, Users
} from 'lucide-react';
import LayoutAdmin from '../layout/LayoutAdmin';
import axios from 'axios';

const DashboardView = ({ showNotification }) => {
  const [stats, setStats] = useState({
    vendedores: 0,
    vehiculos: 0,
    publicaciones: 0
  });
  const history = useHistory();

  // Auth headers
  const getAuthHeaders = (json = true) => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      showNotification?.('No autorizado. Por favor inicia sesión.', 'error');
      history.push('/login');
      return null;
    }
    return json
      ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
      : { Authorization: `Bearer ${token}` };
  };

  useEffect(() => {
    const fetchData = async () => {
      const headers = getAuthHeaders(true);
      if (!headers) return;

      try {
        // Fetch usuarios
        const usuariosRes = await axios.get('https://financiera-backend.vercel.app/api/usuarios', { headers });
        if (usuariosRes.data.success) {
          const usuarios = usuariosRes.data.data;
          const vendedores = usuarios.filter(u => u.idRol === 2).length;

          // Fetch vehiculos
          const vehiculosRes = await axios.get('https://financiera-backend.vercel.app/api/catalogo', { headers });
          const vehiculosCount = vehiculosRes.data.success ? vehiculosRes.data.data.length : 0;

          // Update stats
          setStats({
            vendedores,
            vehiculos: vehiculosCount,
            publicaciones: vehiculosCount
          });

          showNotification?.('Estadísticas cargadas correctamente');
        } else {
          throw new Error(usuariosRes.data.message || 'Error al cargar usuarios');
        }
      } catch (err) {
        console.error('Error al cargar datos:', err);
        showNotification?.('Error al cargar estadísticas', 'error');
      }
    };

    fetchData();
  }, [showNotification]);

  const handleLogout = () => {
    localStorage.clear();
    history.push('/login');
  };

  return (
    <LayoutAdmin>
      <div className="dashboard-container" style={{ minHeight: '100vh', position: 'relative' }}>
        <div className="dashboard-grid">

          {/* Recuadro de Administradores eliminado */}

          <div className="metric-card">
            <div className="metric-header">
              <h3>Vendedores</h3>
              <Users size={20} className="metric-icon" />
            </div>
            <p className="metric-value green">{stats.vendedores}</p>
            <p className="metric-change positive">+0% desde el mes pasado</p>
          </div>

          <div className="metric-card">
            <div className="metric-header">
              <h3>Vehículos</h3>
              <Car size={20} className="metric-icon" />
            </div>
            <p className="metric-value green">{stats.vehiculos}</p>
            <p className="metric-change positive">+5% desde el mes pasado</p>
          </div>

          <div className="metric-card">
            <div className="metric-header">
              <h3>Publicaciones</h3>
              <FileText size={20} className="metric-icon" />
            </div>
            <p className="metric-value yellow">{stats.publicaciones}</p>
            <p className="metric-change negative">-2% desde el mes pasado</p>
          </div>
        </div>

        <div className="recent-activity">
          <h3>Actividad Reciente</h3>
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-icon">
                <Plus size={16} />
              </div>
              <div className="activity-content">
                <p>Nuevo vehículo agregado: Toyota Corolla 2022</p>
                <small className="activity-time">
                  <Clock size={14} /> Hace 15 minutos
                </small>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">
                <Edit size={16} />
              </div>
              <div className="activity-content">
                <p>Usuario actualizado: Juan Pérez</p>
                <small className="activity-time">
                  <Clock size={14} /> Hace 2 horas
                </small>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">
                <Check size={16} />
              </div>
              <div className="activity-content">
                <p>Venta completada: Ford F-150</p>
                <small className="activity-time">
                  <Clock size={14} /> Ayer a las 14:30
                </small>
              </div>
            </div>
          </div>
        </div>

        <div className="logout-section">
          <button className="logout-button" onClick={handleLogout}>
            Cerrar Sesión
          </button>
        </div>
      </div>
    </LayoutAdmin>
  );
};

export default DashboardView;
