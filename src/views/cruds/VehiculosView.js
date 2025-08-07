import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import LayoutAdmin from '../layout/LayoutAdmin';
import { useHistory } from 'react-router-dom';

const VehiculosView = ({ showNotification }) => {
  const [vehiculos, setVehiculos] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [vendedores, setVendedores] = useState([]);
  const [filteredVehiculos, setFilteredVehiculos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    idVendedor: '', idMarca: '', modelo: '', version: '', ano: '',
    kilometraje: '', precio: '', caracteristicas: '', descripcion: '',
    estado: 'disponible', tipoCombustible: '', transmision: '', imagenes: []
  });
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const history = useHistory();

  // Auth headers
  const getAuthHeaders = (json = false) => {
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
    fetchMarcas(); fetchVendedores(); fetchVehiculos();
  }, []);

  const fetchVehiculos = async () => {
    const headers = getAuthHeaders(true);
    if (!headers) return;
    try {
      const res = await axios.get('http://localhost:3000/api/catalogo/admin', { headers });
      if (res.data.success) setVehiculos(res.data.data);
    } catch {
      showNotification?.('Error al cargar vehículos', 'error');
    }
  };

  const fetchMarcas = async () => {
    const headers = getAuthHeaders(true);
    if (!headers) return;
    try {
      const res = await axios.get('http://localhost:3000/api/marcas', { headers });
      if (res.data.success) setMarcas(res.data.data);
    } catch {
      showNotification?.('Error al cargar marcas', 'error');
    }
  };

  const fetchVendedores = async () => {
    const headers = getAuthHeaders(true);
    if (!headers) return;
    try {
      const res = await axios.get('http://localhost:3000/api/usuarios', { headers });
      if (res.data.success) {
        setVendedores(res.data.data.filter(u => u.idRol === 2));
      }
    } catch {
      showNotification?.('Error al cargar vendedores', 'error');
    }
  };

  useEffect(() => {
    const lower = searchTerm.toLowerCase();
    const filtered = vehiculos.filter(v => {
      const m = marcas.find(x => x.idMarca === v.idMarca);
      const nombre = m?.nombre_marca.toLowerCase() || '';
      return nombre.includes(lower) ||
             v.modelo.toLowerCase().includes(lower) ||
             v.ano.toString().includes(lower);
    });
    setFilteredVehiculos(filtered);
    setCurrentPage(1);
  }, [searchTerm, vehiculos, marcas]);

  const paginatedVehiculos = filteredVehiculos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredVehiculos.length / itemsPerPage);

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(fd => ({ ...fd, [name]: value }));
  };

  const handleFileChange = e => {
    setFormData(fd => ({ ...fd, imagenes: Array.from(e.target.files) }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const headers = getAuthHeaders();
    if (!headers) return;
    const fd = new FormData();
    Object.entries(formData).forEach(([k, v]) => {
      if (k === 'imagenes') v.forEach(f => fd.append('imagenes', f));
      else fd.append(k, v);
    });
    try {
      if (editingId) {
        await axios.put(
          `http://localhost:3000/api/catalogo/${editingId}`, fd, { headers }
        );
        showNotification?.('Vehículo actualizado correctamente');
      } else {
        await axios.post(
          'http://localhost:3000/api/catalogo', fd, { headers }
        );
        showNotification?.('Vehículo creado correctamente');
      }
      resetForm(); fetchVehiculos();
    } catch {
      showNotification?.('Error al guardar el vehículo', 'error');
    }
  };

  const handleEdit = async v => {
    const headers = getAuthHeaders(true);
    if (!headers) return;
    try {
      const res = await axios.get(
        `http://localhost:3000/api/catalogo/${v.idVehiculo}`, { headers }
      );
      if (res.data.success) {
        const d = res.data.data;
        setFormData({
          idVendedor: d.idVendedor,
          idMarca: d.idMarca,
          modelo: d.modelo,
          version: d.version,
          ano: d.ano,
          kilometraje: d.kilometraje,
          precio: d.precio,
          caracteristicas: d.caracteristicas || '',
          descripcion: d.descripcion || '',
          estado: d.estado,
          tipoCombustible: d.tipoCombustible || '',
          transmision: d.transmision || '',
          imagenes: []
        });
        setEditingId(d.idVehiculo);
        setShowForm(true);
      }
    } catch {
      showNotification?.('Error al cargar datos del vehículo', 'error');
    }
  };

  const handleDelete = async id => {
    if (!window.confirm('¿Estás seguro de eliminar este vehículo?')) return;
    const headers = getAuthHeaders(true);
    if (!headers) return;
    try {
      await axios.delete(
        `http://localhost:3000/api/catalogo/${id}`, { headers }
      );
      showNotification?.('Vehículo eliminado correctamente');
      fetchVehiculos();
    } catch {
      showNotification?.('Error al eliminar el vehículo', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      idVendedor: '', idMarca: '', modelo: '', version: '', ano: '',
      kilometraje: '', precio: '', caracteristicas: '', descripcion: '',
      estado: 'disponible', tipoCombustible: '', transmision: '', imagenes: []
    });
    setEditingId(null);
    setShowForm(false);
  };

  const formatPrice = p => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(p);
  const getMarcaNombre = id => marcas.find(m => m.idMarca === id)?.nombre_marca || 'Desconocido';
  const getVendedorNombre = id => vendedores.find(x => x.idUsuario === id)?.nombre || 'Desconocido';

  return (
    <LayoutAdmin>
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Gestión de Vehículos</h3>
          <div className="header-actions">
            <div className="search-box">
              <Search size={18}/>
              <input
                type="text"
                placeholder="Buscar vehículos..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="btn btn-primary" onClick={() => setShowForm(sf => !sf)}>
              <Plus size={18}/>{' '}{showForm ? 'Cancelar' : 'Nuevo Vehículo'}
            </button>
          </div>
        </div>

        {showForm && (
          <div className="card-body form-section">
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Vendedor</label>
                  <select
                    name="idVendedor"
                    value={formData.idVendedor}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Seleccionar vendedor</option>
                    {vendedores.map(v => (
                      <option key={v.idUsuario} value={v.idUsuario}>{v.nombre}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Marca</label>
                  <select
                    name="idMarca"
                    value={formData.idMarca}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Seleccionar marca</option>
                    {marcas.map(m => (
                      <option key={m.idMarca} value={m.idMarca}>{m.nombre_marca}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Modelo</label>
                  <input
                    type="text"
                    name="modelo"
                    value={formData.modelo}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Versión</label>
                  <input
                    type="text"
                    name="version"
                    value={formData.version}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Año</label>
                  <input
                    type="number"
                    name="ano"
                    value={formData.ano}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Kilometraje</label>
                  <input
                    type="number"
                    name="kilometraje"
                    value={formData.kilometraje}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Precio</label>
                  <input
                    type="number"
                    step="0.01"
                    name="precio"
                    value={formData.precio}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Características</label>
                  <input
                    type="text"
                    name="caracteristicas"
                    value={formData.caracteristicas}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Descripción</label>
                  <input
                    type="text"
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleInputChange}
                  />
                </div>
               <div className="form-group">
                  <label>Estado</label>
                  <select
                    name="estado"
                    value={formData.estado}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="disponible">Disponible</option>
                    <option value="no_disponible">No disponible</option>
                    <option value="reservado">Reservado</option>
                    <option value="vendido">Vendido</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Tipo de Combustible</label>
                  <input
                    type="text"
                    name="tipoCombustible"
                    value={formData.tipoCombustible}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Transmisión</label>
                  <input
                    type="text"
                    name="transmision"
                    value={formData.transmision}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Imágenes</label>
                  <input
                    type="file"
                    name="imagenes"
                    multiple
                    onChange={handleFileChange}
                  />
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  {editingId ? 'Actualizar Vehículo' : 'Crear Vehículo'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Marca</th>
                <th>Modelo</th>
                <th>Año</th>
                <th>Precio</th>
                <th>Estado</th>
                <th>Vendedor</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginatedVehiculos.length > 0 ? (
                paginatedVehiculos.map(v => (
                  <tr key={v.idVehiculo}>
                    <td>{v.idVehiculo}</td>
                    <td>{getMarcaNombre(v.idMarca)}</td>
                    <td>{v.modelo}{v.version && ` (${v.version})`}</td>
                    <td>{v.ano}</td>
                    <td>{formatPrice(v.precio)}</td>
                   <td>
                     <span className={`badge ${
                      v.estado === 'disponible' ? 'badge-success' :
                      v.estado === 'reservado' ? 'badge-warning' :
                      v.estado === 'vendido' ? 'badge-primary' :
                      v.estado === 'no_disponible' ? 'badge-danger' :
                      'badge-secondary'
                    }`}>
                      {v.estado === 'no_disponible' ? 'No disponible' : v.estado}
                    </span>

                      </td>
                    <td>{getVendedorNombre(v.idVendedor)}</td>
                    <td className="actions">
                      <button className="btn-icon btn-warning" onClick={() => handleEdit(v)} title="Editar"><Edit size={16}/></button>
                      <button className="btn-icon btn-danger" onClick={() => handleDelete(v.idVehiculo)} title="Eliminar"><Trash2 size={16}/></button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="8" className="no-results">No se encontraron vehículos</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Anterior</button>
            <span>Página {currentPage} de {totalPages}</span>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Siguiente</button>
          </div>
        )}
      </div>
    </LayoutAdmin>
  );
};

export default VehiculosView;
