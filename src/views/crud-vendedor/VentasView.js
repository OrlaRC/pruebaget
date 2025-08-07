import React, { useState, useEffect, useRef, useContext } from 'react';
import { 
  Edit, Trash2, DollarSign, Check,
  X, Percent, Calculator, Upload, Image, XCircle
} from 'lucide-react';
import LayoutVendedor from '../layout/LayoutVendedor';
import { NotificationContext } from '../../context/NotificationContext';
import { useHistory } from 'react-router-dom';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, ArcElement, Title, Tooltip, Legend);

const VentasView = () => {
  const [publicaciones, setPublicaciones] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [filteredVentas, setFilteredVentas] = useState([]);
  const [formData, setFormData] = useState({
    idVehiculo: '',
    idCliente: '',
    fecha: new Date().toISOString().split('T')[0],
    precioVenta: '',
    enganche: '',
    plazo: 60,
    mensualidad: '',
    comision: '',
    metodoPago: 'efectivo',
    estado: 'completada',
    imagenes: []
  });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [user, setUser] = useState(null);
  const itemsPerPage = 10;
  const history = useHistory();

  const { showNotification } = useContext(NotificationContext);

  const getAccessToken = async () => {
    let accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');

    if (!accessToken && refreshToken) {
      try {
        const res = await fetch('https://financiera-backend.vercel.app/api/auth/refresh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken })
        });
        const { data } = await res.json();
        if (res.ok) {
          accessToken = data.accessToken;
          localStorage.setItem('accessToken', accessToken);
        } else {
          throw new Error('Failed to refresh token');
        }
      } catch (error) {
        localStorage.clear();
        history.push('/inicio-sesion');
        return null;
      }
    }
    return accessToken;
  };

  const fetchMarcas = async () => {
    try {
      const accessToken = await getAccessToken();
      if (!accessToken) return;

      const res = await fetch('https://financiera-backend.vercel.app/api/marcas', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const { success, data } = await res.json();
      if (success) {
        setMarcas(data);
      } else {
        throw new Error('Failed to fetch marcas');
      }
    } catch (error) {
      showNotification('Error al cargar marcas', 'error');
    }
  };

  const fetchPublicaciones = async () => {
    try {
      const accessToken = await getAccessToken();
      if (!accessToken || !user) return;

      const res = await fetch('https://financiera-backend.vercel.app/api/catalogo/admin', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const { success, data } = await res.json();
      if (success) {
        const userPublicaciones = data.filter(pub => pub.idVendedor === user.idUsuario);
        setPublicaciones(userPublicaciones);
        setFilteredVentas(userPublicaciones.map(pub => ({
          idVenta: pub.idPublicacion,
          idVehiculo: pub.idMarca,
          idCliente: pub.idVendedor,
          fecha: pub.fecha,
          precioVenta: pub.precio,
          enganche: Math.round(pub.precio * 0.10),
          plazo: 60,
          mensualidad: Math.round(pub.precio * 0.022),
          comision: Math.round(pub.precio * 0.05),
          metodoPago: 'desconocido',
          estado: pub.estado === 'vendido' ? 'completada' : pub.estado,
          imagenes: Array.isArray(pub.imagenes) ? pub.imagenes : [],
          modelo: pub.modelo,
          transmision: pub.transmision
        })));
      } else {
        throw new Error('Failed to fetch publicaciones');
      }
    } catch (error) {
      showNotification('Error al cargar publicaciones', 'error');
      setPublicaciones([]);
      setFilteredVentas([]);
    }
  };

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (!userData || userData.idRol !== 2) {
      showNotification('Acceso no autorizado. Debes ser vendedor.', 'error');
      history.push('/inicio-sesion');
      return;
    }
    setUser(userData);
  }, [history, showNotification]);

  useEffect(() => {
    if (user) {
      fetchMarcas();
      fetchPublicaciones();
    }
  }, [user]);

  useEffect(() => {
    const filtered = publicaciones.map(pub => ({
      idVenta: pub.idPublicacion,
      idVehiculo: pub.idMarca,
      idCliente: pub.idVendedor,
      fecha: pub.fecha,
      precioVenta: pub.precio,
      enganche: Math.round(pub.precio * 0.10),
      plazo: 60,
      mensualidad: Math.round(pub.precio * 0.022),
      comision: Math.round(pub.precio * 0.05),
      metodoPago: 'desconocido',
      estado: pub.estado === 'vendido' ? 'completada' : pub.estado,
      imagenes: Array.isArray(pub.imagenes) ? pub.imagenes : [],
      modelo: pub.modelo,
      transmision: pub.transmision
    }));
    setFilteredVentas(filtered);
    setCurrentPage(1);
  }, [publicaciones, marcas]);

  const paginatedVentas = filteredVentas.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredVentas.length / itemsPerPage);

  // Statistics calculations (focused on all publications)
  const totalPublicaciones = publicaciones.length;
  const totalValor = publicaciones.reduce((sum, pub) => sum + parseFloat(pub.precio || 0), 0);
  const promedioPrecio = totalPublicaciones > 0 ? totalValor / totalPublicaciones : 0;
  const disponibles = publicaciones.filter(pub => pub.estado === 'disponible').length;

  // Chart data preparation
  const vehiculosPorTransmision = {};
  publicaciones.forEach(pub => {
    const transmision = pub.transmision || 'Desconocida';
    vehiculosPorTransmision[transmision] = (vehiculosPorTransmision[transmision] || 0) + 1;
  });

  const pieChartData = {
    labels: Object.keys(vehiculosPorTransmision),
    datasets: [{
      label: 'Vehículos por Transmisión',
      data: Object.values(vehiculosPorTransmision),
      backgroundColor: [
        'rgba(255, 99, 132, 0.6)', // e.g., Automática
        'rgba(54, 162, 235, 0.6)', // e.g., Manual
        'rgba(255, 206, 86, 0.6)', // e.g., Desconocida or other
        'rgba(75, 192, 192, 0.6)'  // e.g., Other transmission types
      ]
    }]
  };

  const publicacionesPorMarca = marcas.map(marca => ({
    marca: marca.nombre_marca,
    count: publicaciones.filter(pub => pub.idMarca === marca.idMarca).length
  }));

  const barChartData = {
    labels: publicacionesPorMarca.map(m => m.marca),
    datasets: [{
      label: 'Publicaciones por Marca',
      data: publicacionesPorMarca.map(m => m.count),
      backgroundColor: 'rgba(75, 192, 192, 0.6)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === 'precioVenta' && value) {
      const precio = parseFloat(value);
      const comision = Math.round(precio * 0.05);
      let enganche = Math.round(precio * 0.10);

      if (precio < 200000 && enganche < 20000) {
        enganche = 20000;
      }

      const mensualidad = Math.round(precio * 0.022);

      setFormData(prev => ({
        ...prev,
        comision: comision,
        enganche: enganche,
        mensualidad: mensualidad
      }));
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);

    if (files.length === 0) return;

    if (formData.imagenes.length + files.length > 2) {
      showNotification('Solo puedes subir un máximo de 2 imágenes', 'error');
      return;
    }

    const validFiles = files.filter(file => {
      if (!file.type.match('image.*')) {
        showNotification(`El archivo ${file.name} no es una imagen válida`, 'error');
        return false;
      }

      if (file.size > 5 * 1024 * 1024) {
        showNotification(`La imagen ${file.name} excede el tamaño máximo de 5MB`, 'error');
        return false;
      }

      return true;
    });

    if (validFiles.length === 0) return;

    setUploading(true);

    setTimeout(() => {
      const newImages = validFiles.map(file => URL.createObjectURL(file));

      setFormData(prev => ({
        ...prev,
        imagenes: [...prev.imagenes, ...newImages].slice(0, 2)
      }));

      setUploading(false);
      showNotification('Imágenes subidas correctamente');
    }, 1500);
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      imagenes: prev.imagenes.filter((_, i) => i !== index)
    }));
  };

  const calculateFinancing = () => {
    const precio = parseFloat(formData.precioVenta);
    if (!precio || isNaN(precio)) return;

    let enganche = Math.round(precio * 0.10);

    if (precio < 200000 && enganche < 20000) {
      enganche = 20000;
    }

    const mensualidad = Math.round(precio * 0.022);
    const comision = Math.round(precio * 0.05);

    setFormData(prev => ({
      ...prev,
      enganche: enganche,
      mensualidad: mensualidad,
      comision: comision,
      plazo: 60
    }));

    showNotification('Financiamiento calculado correctamente');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const accessToken = await getAccessToken();
      if (!accessToken) return;

      const ventaData = {
        ...formData,
        idVenta: editingId || publicaciones.length + 1,
        comision: formData.comision || Math.round(parseFloat(formData.precioVenta) * 0.05)
      };

      const res = await fetch('https://financiera-backend.vercel.app/api/ventas', {
        method: editingId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify(ventaData)
      });

      const { success, message } = await res.json();
      if (success) {
        showNotification(editingId ? 'Venta actualizada correctamente' : 'Venta registrada correctamente');
        fetchPublicaciones();
        resetForm();
      } else {
        throw new Error(message || 'Error al guardar venta');
      }
    } catch (error) {
      showNotification('Error al guardar la venta', 'error');
    }
  };

  const handleEdit = (venta) => {
    setFormData({
      idVehiculo: venta.idVehiculo,
      idCliente: venta.idCliente,
      fecha: venta.fecha,
      precioVenta: venta.precioVenta,
      enganche: venta.enganche,
      plazo: venta.plazo,
      mensualidad: venta.mensualidad,
      comision: venta.comision,
      metodoPago: venta.metodoPago,
      estado: venta.estado,
      imagenes: Array.isArray(venta.imagenes) ? [...venta.imagenes] : []
    });
    setEditingId(venta.idVenta);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta venta?')) {
      try {
        const accessToken = await getAccessToken();
        if (!accessToken) return;

        const res = await fetch(`https://financiera-backend.vercel.app/api/ventas/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${accessToken}` }
        });

        const { success, message } = await res.json();
        if (success) {
          showNotification('Venta eliminada correctamente');
          fetchPublicaciones();
        } else {
          throw new Error(message || 'Error al eliminar venta');
        }
      } catch (error) {
        showNotification('Error al eliminar venta', 'error');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      idVehiculo: '',
      idCliente: '',
      fecha: new Date().toISOString().split('T')[0],
      precioVenta: '',
      enganche: '',
      plazo: 60,
      mensualidad: '',
      comision: '',
      metodoPago: 'efectivo',
      estado: 'completada',
      imagenes: []
    });
    setEditingId(null);
    setShowForm(false);
  };

  const getVehiculoInfo = (idVehiculo, modelo) => {
    const marca = marcas.find(m => m.idMarca === idVehiculo);
    return marca ? `${marca.nombre_marca} ${modelo || 'Desconocido'}` : 'Desconocido';
  };

  const getClienteInfo = () => {
    return 'Desconocido'; // No client data available
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(price);
  };

  if (!user) {
    return null;
  }

  return (
    <LayoutVendedor>
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Gestión de Ventas</h3>
        </div>

        {/* Statistics Dashboard */}
        <div className="card-body dashboard-section">
          <h4>Estadísticas de Publicaciones</h4>
          <div className="stats-grid">
            <div className="stat-card">
              <h5>Total Publicaciones</h5>
              <p>{totalPublicaciones}</p>
            </div>
            <div className="stat-card">
              <h5>Valor Total</h5>
              <p>{formatPrice(totalValor)}</p>
            </div>
            <div className="stat-card">
              <h5>Precio Promedio</h5>
              <p>{formatPrice(promedioPrecio)}</p>
            </div>
            <div className="stat-card">
              <h5>Vehículos Disponibles</h5>
              <p>{disponibles}</p>
            </div>
          </div>

          <div className="charts-grid">
            <div className="chart-container">
              <h5>Publicaciones por Marca</h5>
              <div style={{ height: '300px' }}>
                <Bar data={barChartData} options={chartOptions} />
              </div>
            </div>
            <div className="chart-container">
              <h5>Distribución de Vehículos</h5>
              <div style={{ height: '300px' }}>
                <Pie data={pieChartData} options={chartOptions} />
              </div>
            </div>
          </div>
        </div>

        {showForm && (
          <div className="card-body form-section">
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Vehículo</label>
                  <select
                    name="idVehiculo"
                    value={formData.idVehiculo}
                    onChange={(e) => {
                      const marca = marcas.find(m => m.idMarca === parseInt(e.target.value));
                      if (marca) {
                        setFormData(prev => ({
                          ...prev,
                          idVehiculo: e.target.value,
                          precioVenta: ''
                        }));
                        calculateFinancing();
                      } else {
                        setFormData(prev => ({ ...prev, idVehiculo: e.target.value }));
                      }
                    }}
                    required
                  >
                    <option value="">Seleccionar marca</option>
                    {marcas.map(m => (
                      <option key={m.idMarca} value={m.idMarca}>
                        {m.nombre_marca}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Cliente</label>
                  <select
                    name="idCliente"
                    value={formData.idCliente}
                    onChange={handleInputChange}
                    required
                    disabled
                  >
                    <option value="">No disponible</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Fecha</label>
                  <input
                    type="date"
                    name="fecha"
                    value={formData.fecha}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Precio de Venta</label>
                  <input
                    type="number"
                    name="precioVenta"
                    value={formData.precioVenta}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="form-group">
                  <label>Enganche (10% mínimo)</label>
                  <input
                    type="number"
                    name="enganche"
                    value={formData.enganche}
                    onChange={handleInputChange}
                    required
                    min="0"
                  />
                  {formData.precioVenta && formData.precioVenta < 200000 && (
                    <small className="hint">Mínimo $20,000 para vehículos bajo $200,000</small>
                  )}
                </div>

                <div className="form-group">
                  <label>Plazo (meses)</label>
                  <input
                    type="number"
                    name="plazo"
                    value={formData.plazo}
                    onChange={handleInputChange}
                    required
                    min="12"
                    max="60"
                    disabled
                  />
                  <small className="hint">Máximo 60 meses</small>
                </div>

                <div className="form-group">
                  <label>Mensualidad</label>
                  <input
                    type="number"
                    name="mensualidad"
                    value={formData.mensualidad}
                    onChange={handleInputChange}
                    required
                    min="0"
                    readOnly
                  />
                  <small className="hint">Precio × 0.022</small>
                </div>

                <div className="form-group">
                  <label>Comisión (5%)</label>
                  <input
                    type="number"
                    name="comision"
                    value={formData.comision}
                    onChange={handleInputChange}
                    required
                    min="0"
                    readOnly
                  />
                </div>

                <div className="form-group">
                  <label>Método de Pago</label>
                  <select
                    name="metodoPago"
                    value={formData.metodoPago}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="efectivo">Efectivo</option>
                    <option value="transferencia">Transferencia</option>
                    <option value="tarjeta">Tarjeta</option>
                    <option value="financiamiento">Financiamiento</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Estado</label>
                  <select
                    name="estado"
                    value={formData.estado}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="completada">Completada</option>
                    <option value="pendiente">Pendiente</option>
                    <option value="cancelada">Cancelada</option>
                  </select>
                </div>

                <div className="form-group span-2">
                  <label>Imágenes del vehículo (Máximo 2)</label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    multiple
                    style={{ display: 'none' }}
                  />
                  <div className="file-upload-container">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={triggerFileInput}
                      disabled={uploading || formData.imagenes.length >= 2}
                    >
                      {uploading ? (
                        'Subiendo...'
                      ) : (
                        <>
                          <Upload size={16} /> Seleccionar Imágenes
                        </>
                      )}
                    </button>
                    <small>Formatos aceptados: JPG, PNG (max 5MB cada una)</small>
                  </div>

                  {formData.imagenes.length > 0 && (
                    <div className="images-preview-container">
                      <div className="images-grid">
                        {formData.imagenes.map((img, index) => (
                          <div key={index} className="image-preview-item">
                            <img
                              src={img}
                              alt={`Vehículo ${index + 1}`}
                              className="image-preview-thumbnail"
                            />
                            <button
                              type="button"
                              className="remove-image-btn"
                              onClick={() => removeImage(index)}
                              title="Eliminar imagen"
                            >
                              <XCircle size={18} />
                            </button>
                          </div>
                        ))}
                      </div>
                      <small>{formData.imagenes.length}/2 imágenes seleccionadas</small>
                    </div>
                  )}
                </div>

                <div className="form-group span-2">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={calculateFinancing}
                  >
                    <Calculator size={16} /> Calcular Financiamiento
                  </button>
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={uploading}
                >
                  {editingId ? 'Actualizar Venta' : 'Registrar Venta'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={resetForm}
                  disabled={uploading}
                >
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
                <th>Vehículo</th>
                <th>Precio</th>
                <th>Enganche</th>
                <th>Mensualidad</th>
                <th>Imágenes</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {paginatedVentas.length > 0 ? (
                paginatedVentas.map((venta) => (
                  <tr key={venta.idVenta}>
                    <td>{venta.idVenta}</td>
                    <td>{getVehiculoInfo(venta.idVehiculo, venta.modelo)}</td>
                    <td>{formatPrice(venta.precioVenta)}</td>
                    <td>{formatPrice(venta.enganche)}</td>
                    <td>{formatPrice(venta.mensualidad)}</td>
                    <td>
                      <div className="table-images">
                        {Array.isArray(venta.imagenes) && venta.imagenes.length > 0 ? (
                          venta.imagenes.slice(0, 2).map((img, index) => (
                            <img
                              key={index}
                              src={img}
                              alt={`Vehículo ${index + 1}`}
                              className="table-image-thumbnail"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://via.placeholder.com/50?text=Imagen+no+disponible';
                              }}
                            />
                          ))
                        ) : (
                          <span>Sin imágenes</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${
                        venta.estado === 'completada' ? 'badge-success' :
                        venta.estado === 'pendiente' ? 'badge-warning' :
                        venta.estado === 'disponible' ? 'badge-info' :
                        venta.estado === 'reservado' ? 'badge-primary' : 'badge-danger'
                      }`}>
                        {venta.estado.charAt(0).toUpperCase() + venta.estado.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="no-results">
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

      <style jsx>{`
        .dashboard-section {
          padding: 20px;
          border-bottom: 1px solid #e5e7eb;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .stat-card {
          background: #f8fafc;
          padding: 20px;
          border-radius: 8px;
          text-align: center;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .stat-card h5 {
          margin: 0 0 10px;
          color: #1f2937;
          font-size: 1.1rem;
        }

        .stat-card p {
          margin: 0;
          font-size: 1.5rem;
          font-weight: bold;
          color: #2563eb;
        }

        .charts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
        }

        .chart-container {
          background: #fff;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .chart-container h5 {
          margin: 0 0 15px;
          color: #1f2937;
        }

        .badge-info {
          background-color: #3b82f6;
          color: white;
        }

        .badge-primary {
          background-color: #8b5cf6;
          color: white;
        }
      `}</style>
    </LayoutVendedor>
  );
};

export default VentasView;