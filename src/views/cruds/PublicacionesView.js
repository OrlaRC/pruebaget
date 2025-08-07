import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import LayoutAdmin from '../layout/LayoutAdmin';

const PublicacionesView = ({ showNotification }) => {
  const [publicaciones, setPublicaciones] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [filteredPublicaciones, setFilteredPublicaciones] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // URL de la API (usando localhost por ahora)
  const API_URL = 'http://localhost:3000/ https://financiera-backend.vercel.app/api/catalogo';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_URL}/`);
        if (!res.ok) throw new Error('Error al cargar vehículos');
        const data = await res.json();
        console.log('Respuesta API /catalogo:', data);
        const vehiculosArray = Array.isArray(data.data) ? data.data : [];
        if (vehiculosArray.length > 0) {
          const vehiculosApi = vehiculosArray.map(v => ({
            idVehiculo: v.idVehiculo,
            modelo: v.modelo,
            marca: v.version || '',
            descripcion: v.descripcion || ''
          }));
          setVehiculos(vehiculosApi);
          setPublicaciones(vehiculosApi);
          setFilteredPublicaciones(vehiculosApi);
        } else {
          console.warn('La API devolvió un array vacío, manteniendo datos previos');
          if (showNotification) {
            showNotification('No se encontraron nuevos datos en la API', 'warning');
          }
        }
      } catch (error) {
        console.error('Error en fetchData:', error);
        if (showNotification) {
          showNotification('Error al cargar datos, usando datos previos', 'error');
        }
      }
    };

    fetchData();
  }, [showNotification]);

  useEffect(() => {
    const filtered = publicaciones.filter(p =>
      getVehiculoInfo(p.idVehiculo).toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPublicaciones(filtered);
    setCurrentPage(1);
  }, [searchTerm, publicaciones]);

  const paginatedPublicaciones = filteredPublicaciones.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredPublicaciones.length / itemsPerPage);

  const getVehiculoInfo = (idVehiculo) => {
    const vehiculo = vehiculos.find(v => v.idVehiculo === idVehiculo);
    return vehiculo ? `${vehiculo.marca} ${vehiculo.modelo}` : 'Desconocido';
  };

  return (
    <LayoutAdmin>
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Gestión de Publicaciones</h3>
          <div className="header-actions">
            <div className="search-box">
              <Search size={18} />
              <input
                type="text"
                placeholder="Buscar publicaciones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Vehículo</th>
                <th>Descripción</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {paginatedPublicaciones.length > 0 ? (
                paginatedPublicaciones.map((publicacion) => (
                  <tr key={publicacion.idVehiculo}>
                    <td>{publicacion.idVehiculo}</td>
                    <td>{getVehiculoInfo(publicacion.idVehiculo)}</td>
                    <td>
                      {publicacion.descripcion.length > 50
                        ? `${publicacion.descripcion.substring(0, 50)}...`
                        : publicacion.descripcion}
                    </td>
                    <td>{publicacion.fecha || new Date().toISOString().split('T')[0]}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="no-results">
                    No se encontraron publicaciones
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Anterior
            </button>
            <span>Página {currentPage} de {totalPages}</span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Siguiente
            </button>
          </div>
        )}
      </div>
    </LayoutAdmin>
  );
};

export default PublicacionesView;