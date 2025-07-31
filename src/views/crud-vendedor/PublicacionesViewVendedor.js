import React, { useState, useEffect, useRef, useContext } from 'react';
import { Search, Plus, Edit, Trash2, Upload, XCircle } from 'lucide-react';
import LayoutVendedor from '../layout/LayoutVendedor';
import { NotificationContext } from '../../context/NotificationContext';
import { useHistory } from 'react-router-dom';

const PublicacionesViewVendedor = () => {
  const [publicaciones, setPublicaciones] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [filteredPublicaciones, setFilteredPublicaciones] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    idVendedor: '',
    idMarca: '',
    modelo: '',
    version: '',
    ano: '',
    kilometraje: '',
    precio: '',
    caracteristicas: '',
    descripcion: '',
    estado: 'disponible',
    tipoCombustible: 'gasolina',
    transmision: 'manual',
    imagenes: []
  });
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const itemsPerPage = 10;
  const history = useHistory();

  const { showNotification } = useContext(NotificationContext);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (!userData || userData.idRol !== 2) {
      showNotification('Acceso no autorizado. Debes ser vendedor.', 'error');
      history.push('/inicio-sesion');
      return;
    }
    setUser(userData);
    setFormData(prev => ({ ...prev, idVendedor: userData.idUsuario }));
  }, [history, showNotification]);

  const getAccessToken = async () => {
    let accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');

    if (!accessToken && refreshToken) {
      try {
        const res = await fetch('http://localhost:3000/api/auth/refresh', {
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

      const res = await fetch('http://localhost:3000/api/marcas', {
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

      const res = await fetch('http://localhost:3000/api/catalogo', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const { success, data } = await res.json();
      if (success) {
        // Filter publications to show only those belonging to the logged-in vendor
        const userPublicaciones = data.filter(pub => pub.idVendedor === user.idUsuario);
        setPublicaciones(userPublicaciones);
        setFilteredPublicaciones(userPublicaciones);
      } else {
        throw new Error('Failed to fetch publicaciones');
      }
    } catch (error) {
      showNotification('Error al cargar publicaciones', 'error');
    }
  };

  useEffect(() => {
    if (user) {
      fetchMarcas();
      fetchPublicaciones();
    }
  }, [user]);

  useEffect(() => {
    const filtered = publicaciones.filter(pub => {
      const info = `${pub.modelo} ${pub.version}`.toLowerCase();
      return (
        info.includes(searchTerm.toLowerCase()) ||
        pub.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
    setFilteredPublicaciones(filtered);
    setCurrentPage(1);
  }, [searchTerm, publicaciones]);

  const paginatedPublicaciones = filteredPublicaciones.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: name === 'precio' ? parseInt(value) || '' : value });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length !== 5) {
      showNotification('Debe seleccionar exactamente 5 imágenes', 'error');
      return;
    }

    const valid = files.filter(f => {
      if (!f.type.includes('image/')) {
        showNotification(`${f.name} no es una imagen válida`, 'error');
        return false;
      }
      if (f.size > 5 * 1024 * 1024) {
        showNotification(`${f.name} excede los 5MB`, 'error');
        return false;
      }
      return true;
    });

    if (valid.length !== 5) {
      showNotification('Todas las imágenes deben ser válidas', 'error');
      return;
    }

    setUploading(true);
    setFormData(prev => ({
      ...prev,
      imagenes: valid // Store actual File objects
    }));
    setUploading(false);
    showNotification('Imágenes seleccionadas con éxito');
  };

  const removeImage = (i) => {
    showNotification('No se puede eliminar imágenes, debe mantener exactamente 5', 'error');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.imagenes.length !== 5) {
      showNotification('Debe subir exactamente 5 imágenes', 'error');
      return;
    }

    try {
      const accessToken = await getAccessToken();
      if (!accessToken) return;

      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'imagenes') {
          formData.imagenes.forEach((file, index) => {
            formDataToSend.append('imagenes', file);
          });
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      setUploading(true);
      let res;
      if (editingId) {
        res = await fetch(`http://localhost:3000/api/catalogo/${editingId}`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${accessToken}` },
          body: formDataToSend
        });
      } else {
        res = await fetch('http://localhost:3000/api/catalogo', {
          method: 'POST',
          headers: { Authorization: `Bearer ${accessToken}` },
          body: formDataToSend
        });
      }

      const { success, message } = await res.json();
      if (success) {
        showNotification(editingId ? 'Publicación actualizada correctamente' : 'Publicación creada correctamente');
        fetchPublicaciones();
        resetForm();
      } else {
        throw new Error(message || 'Error al guardar publicación');
      }
    } catch (error) {
      showNotification(error.message || 'Error al guardar publicación', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (pub) => {
    setFormData({
      idVendedor: user.idUsuario, // Always use the logged-in user's ID
      idMarca: pub.idMarca,
      modelo: pub.modelo,
      version: pub.version,
      ano: pub.ano,
      kilometraje: pub.kilometraje,
      precio: pub.precio,
      caracteristicas: pub.caracteristicas,
      descripcion: pub.descripcion,
      estado: pub.estado,
      tipoCombustible: pub.tipoCombustible,
      transmision: pub.transmision,
      imagenes: [] // Images will need to be re-uploaded
    });
    setEditingId(pub.idPublicacion);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar publicación?')) return;

    try {
      const accessToken = await getAccessToken();
      if (!accessToken) return;

      const res = await fetch(`http://localhost:3000/api/catalogo/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      const { success, message } = await res.json();
      if (success) {
        showNotification('Publicación eliminada correctamente');
        fetchPublicaciones();
      } else {
        throw new Error(message || 'Error al eliminar publicación');
      }
    } catch (error) {
      showNotification(error.message || 'Error al eliminar publicación', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      idVendedor: user ? user.idUsuario : '',
      idMarca: '',
      modelo: '',
      version: '',
      ano: '',
      kilometraje: '',
      precio: '',
      caracteristicas: '',
      descripcion: '',
      estado: 'disponible',
      tipoCombustible: 'gasolina',
      transmision: 'manual',
      imagenes: []
    });
    setEditingId(null);
    setShowForm(false);
  };

  const getVehiculoInfo = (pub) => {
    const marca = marcas.find(m => m.idMarca === pub.idMarca);
    return `${marca ? marca.nombre_marca : 'Desconocida'} ${pub.modelo} (${pub.version}) - ${pub.ano}`;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(price);
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const totalPages = Math.ceil(filteredPublicaciones.length / itemsPerPage);

  if (!user) {
    return null; // Prevent rendering until user is loaded
  }

  return (
    <LayoutVendedor>
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
            <button
              className="btn btn-primary"
              onClick={() => setShowForm(!showForm)}
            >
              <Plus size={18} /> {showForm ? 'Cancelar' : 'Nueva Publicación'}
            </button>
          </div>
        </div>

        {showForm && (
          <div className="card-body form-section">
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                {/* Display vendor as read-only */}
                <div className="form-group">
                  <label>Vendedor *</label>
                  <input
                    type="text"
                    value={user.nombre || `Vendedor ${user.idUsuario}`}
                    readOnly
                    className="form-control"
                  />
                  <input
                    type="hidden"
                    name="idVendedor"
                    value={formData.idVendedor}
                  />
                </div>

                <div className="form-group">
                  <label>Marca *</label>
                  <select
                    name="idMarca"
                    value={formData.idMarca}
                    onChange={handleInputChange}
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
                  <label>Modelo *</label>
                  <input
                    type="text"
                    name="modelo"
                    value={formData.modelo}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Versión *</label>
                  <input
                    type="text"
                    name="version"
                    value={formData.version}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Año *</label>
                  <input
                    type="number"
                    name="ano"
                    value={formData.ano}
                    onChange={handleInputChange}
                    required
                    min="1900"
                    max={new Date().getFullYear() + 1}
                  />
                </div>

                <div className="form-group">
                  <label>Kilometraje *</label>
                  <input
                    type="number"
                    name="kilometraje"
                    value={formData.kilometraje}
                    onChange={handleInputChange}
                    required
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label>Precio *</label>
                  <input
                    type="number"
                    name="precio"
                    value={formData.precio}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="1"
                  />
                </div>

                <div className="form-group span-2">
                  <label>Características *</label>
                  <textarea
                    name="caracteristicas"
                    value={formData.caracteristicas}
                    onChange={handleInputChange}
                    required
                    rows="3"
                  />
                </div>

                <div className="form-group span-2">
                  <label>Descripción *</label>
                  <textarea
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleInputChange}
                    required
                    rows="5"
                  />
                </div>

                <div className="form-group">
                  <label>Estado *</label>
                  <select
                    name="estado"
                    value={formData.estado}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="disponible">Disponible</option>
                    <option value="no_disponible">No Disponible</option>
                    <option value="vendido">Vendido</option>
                    <option value="reservado">Reservado</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Tipo de Combustible *</label>
                  <select
                    name="tipoCombustible"
                    value={formData.tipoCombustible}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="gasolina">Gasolina</option>
                    <option value="diesel">Diesel</option>
                    <option value="hibrido">Híbrido</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Transmisión *</label>
                  <select
                    name="transmision"
                    value={formData.transmision}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="manual">Manual</option>
                    <option value="automatica">Automática</option>
                    <option value="CVT">CVT</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>

                <div className="form-group span-2">
                  <label>Imágenes del vehículo (Exactamente 5)</label>
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
                      disabled={uploading || formData.imagenes.length === 5}
                    >
                      {uploading ? (
                        'Subiendo...'
                      ) : (
                        <>
                          <Upload size={16} /> Seleccionar Imágenes
                        </>
                      )}
                    </button>
                    <small>Formatos aceptados: JPG, PNG (max 5MB cada una, exactamente 5 imágenes)</small>
                  </div>

                  {formData.imagenes.length > 0 && (
                    <div className="images-preview-container">
                      <div className="images-grid">
                        {formData.imagenes.map((img, index) => (
                          <div key={index} className="image-preview-item">
                            <img
                              src={URL.createObjectURL(img)}
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
                      <small>{formData.imagenes.length}/5 imágenes seleccionadas</small>
                    </div>
                  )}
                </div>
              </div>
              <div className="form-actions">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={uploading}
                >
                  {editingId ? 'Actualizar Publicación' : 'Crear Publicación'}
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
                <th>Descripción</th>
                <th>Imágenes</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginatedPublicaciones.length > 0 ? (
                paginatedPublicaciones.map((publicacion) => (
                  <tr key={publicacion.idPublicacion}>
                    <td>{publicacion.idPublicacion}</td>
                    <td>{getVehiculoInfo(publicacion)}</td>
                    <td>
                      {publicacion.descripcion.length > 50
                        ? `${publicacion.descripcion.substring(0, 50)}...`
                        : publicacion.descripcion}
                    </td>
                    <td>
                      <div className="table-images">
                        {publicacion.imagenes && publicacion.imagenes.slice(0, 2).map((img, index) => (
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
                        ))}
                      </div>
                    </td>
                    <td>{publicacion.fecha}</td>
                    <td className="actions">
                      <button 
                        className="btn-icon btn-warning"
                        onClick={() => handleEdit(publicacion)}
                        title="Editar"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        className="btn-icon btn-danger"
                        onClick={() => handleDelete(publicacion.idPublicacion)}
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="no-results">
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
    </LayoutVendedor>
  );
};

export default PublicacionesViewVendedor;