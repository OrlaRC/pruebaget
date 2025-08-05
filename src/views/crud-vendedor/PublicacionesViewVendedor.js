import React, { useState, useEffect, useRef, useContext, useCallback } from 'react';
import { Search, Plus, Edit, Trash2, Upload, XCircle } from 'lucide-react';
import LayoutVendedor from '../layout/LayoutVendedor';
import { NotificationContext } from '../../context/NotificationContext';
import { useHistory } from 'react-router-dom';
import debounce from 'lodash/debounce';

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
    tipoCombustible: '',
    transmision: 'manual',
    imagenes: [],
  });
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const itemsPerPage = 10;
  const history = useHistory();
  const { showNotification } = useContext(NotificationContext);
  const shownNotifications = useRef(new Set());

  const debouncedShowNotification = useCallback(
    debounce((message, type) => {
      const notificationKey = `${message}-${type}`;
      if (!shownNotifications.current.has(notificationKey)) {
        showNotification(message, type);
        shownNotifications.current.add(notificationKey);
        setTimeout(() => shownNotifications.current.delete(notificationKey), 5000);
      }
    }, 500),
    [showNotification]
  );

  const getAccessToken = async () => {
    let accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        debouncedShowNotification('No autorizado. Por favor inicia sesión.', 'error');
        history.push('/inicio-sesion');
        return null;
      }
      try {
        const res = await fetch('http://localhost:3000/api/auth/refresh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });
        if (!res.ok) throw new Error('Error en la respuesta del servidor');
        const data = await res.json();
        if (data.success) {
          accessToken = data.accessToken;
          localStorage.setItem('accessToken', accessToken);
        } else {
          throw new Error(data.message || 'No se pudo refrescar el token');
        }
      } catch (error) {
        debouncedShowNotification('Error de autenticación. Inicia sesión nuevamente.', 'error');
        localStorage.clear();
        history.push('/inicio-sesion');
        return null;
      }
    }
    return accessToken;
  };

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (!userData || userData.idRol !== 2) {
      debouncedShowNotification('Acceso no autorizado. Debes ser vendedor.', 'error');
      history.push('/inicio-sesion');
      return;
    }
    setUser(userData);
    setFormData((prev) => ({ ...prev, idVendedor: userData.idUsuario }));

    const fetchInitialData = async () => {
      const accessToken = await getAccessToken();
      if (!accessToken) return;

      try {
        const marcasRes = await fetch('http://localhost:3000/api/marcas', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!marcasRes.ok) throw new Error('Error al cargar marcas');
        const marcasData = await marcasRes.json();
        if (marcasData.success) {
          setMarcas(marcasData.data);
        } else {
          throw new Error(marcasData.message || 'No se pudieron cargar las marcas');
        }

        const publicacionesRes = await fetch('http://localhost:3000/api/catalogo/admin', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!publicacionesRes.ok) throw new Error('Error al cargar publicaciones');
        const publicacionesData = await publicacionesRes.json();
        if (publicacionesData.success) {
          const userPublicaciones = publicacionesData.data.filter(
            (pub) => pub.idVendedor === userData.idUsuario
          );
          setPublicaciones(userPublicaciones);
          setFilteredPublicaciones(userPublicaciones);
        } else {
          throw new Error(publicacionesData.message || 'No se pudieron cargar las publicaciones');
        }
      } catch (error) {
        debouncedShowNotification(`Error al cargar datos: ${error.message}`, 'error');
      }
    };

    fetchInitialData();
  }, [history]);

  useEffect(() => {
    const filtered = publicaciones.filter((pub) => {
      const marca = marcas.find((m) => m.idMarca === pub.idMarca)?.nombre_marca || '';
      const info = `${marca} ${pub.modelo} ${pub.version} ${pub.ano}`.toLowerCase();
      return (
        info.includes(searchTerm.toLowerCase()) ||
        pub.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
    setFilteredPublicaciones(filtered);
    setCurrentPage(1);
  }, [searchTerm, publicaciones, marcas]);

  const paginatedPublicaciones = filteredPublicaciones.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'precio' || name === 'kilometraje' || name === 'ano' ? parseFloat(value) || '' : value,
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const currentImageCount = formData.imagenes.length;
    const maxNewImages = 5 - currentImageCount;

    if (files.length > maxNewImages) {
      debouncedShowNotification(`Solo puedes subir hasta ${maxNewImages} imagen(es) adicional(es)`, 'error');
      return;
    }

    const validFiles = files.filter((f) => {
      if (!f.type.includes('image/')) {
        debouncedShowNotification(`${f.name} no es una imagen válida`, 'error');
        return false;
      }
      if (f.size > 5 * 1024 * 1024) {
        debouncedShowNotification(`${f.name} excede los 5MB`, 'error');
        return false;
      }
      return true;
    });

    if (validFiles.length !== files.length) {
      debouncedShowNotification('Algunas imágenesTECH no son válidas', 'error');
      return;
    }

    setFormData((prev) => ({
      ...prev,
      imagenes: [...prev.imagenes, ...validFiles],
    }));
  };

  const removeImage = (index) => {
    setFormData((prev) => {
      const newImages = [...prev.imagenes];
      newImages.splice(index, 1);
      return { ...prev, imagenes: newImages };
    });
    debouncedShowNotification(
      `Imagen eliminada. ${formData.imagenes.length - 1}/5 imágenes restantes.`,
      'warning'
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.imagenes.length !== 5) {
      debouncedShowNotification(`Debes tener exactamente 5 imágenes para guardar la publicación`, 'error');
      return;
    }

    const accessToken = await getAccessToken();
    if (!accessToken) return;

    const formDataToSend = new FormData();
    
    Object.entries(formData).forEach(([key, value]) => {
      if (key !== 'imagenes') {
        formDataToSend.append(key, value);
      }
    });

    formData.imagenes.forEach((file) => formDataToSend.append('imagenes', file));

    try {
      setUploading(true);
      let res;
      if (editingId) {
        res = await fetch(`http://localhost:3000/api/catalogo/${editingId}`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${accessToken}` },
          body: formDataToSend,
        });
      } else {
        res = await fetch('http://localhost:3000/api/catalogo', {
          method: 'POST',
          headers: { Authorization: `Bearer ${accessToken}` },
          body: formDataToSend,
        });
      }

      if (!res.ok) throw new Error('Error en la respuesta del servidor');
      const data = await res.json();
      if (data.success) {
        debouncedShowNotification(
          editingId ? 'Publicación actualizada correctamente' : 'Publicación creada correctamente',
          'success'
        );
        const publicacionesRes = await fetch('http://localhost:3000/api/catalogo/admin', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (publicacionesRes.ok) {
          const publicacionesData = await publicacionesRes.json();
          if (publicacionesData.success) {
            const userPublicaciones = publicacionesData.data.filter(
              (pub) => pub.idVendedor === user.idUsuario
            );
            setPublicaciones(userPublicaciones);
            setFilteredPublicaciones(userPublicaciones);
          }
        }
        resetForm();
      } else {
        throw new Error(data.message || 'Error al guardar publicación');
      }
    } catch (error) {
      debouncedShowNotification(`Error al guardar publicación: ${error.message}`, 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = async (pub) => {
    if (!pub || (!pub.idVehiculo && !pub.idPublicacion)) {
      debouncedShowNotification('No se puede editar: publicación inválida', 'error');
      return;
    }
    const accessToken = await getAccessToken();
    if (!accessToken) return;
    try {
      const id = pub.idVehiculo || pub.idPublicacion;
      const res = await fetch(`http://localhost:3000/api/catalogo/${id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error('Error en la respuesta del servidor');
      const result = await res.json();
      if (!result.success) throw new Error(result.message || 'No se pudieron cargar los datos de la publicación');

      const d = result.data;
      const imagenesFiles = await Promise.all(
        d.imagenes.map(async (url) => {
          const response = await fetch(url);
          const blob = await response.blob();
          return new File([blob], url.split('/').pop(), { type: blob.type });
        })
      );

      setFormData({
        idVendedor: user.idUsuario,
        idMarca: d.idMarca || '',
        modelo: d.modelo || '',
        version: d.version || '',
        ano: d.ano || '',
        kilometraje: d.kilometraje || '',
        precio: d.precio || '',
        caracteristicas: d.caracteristicas || '',
        descripcion: d.descripcion || '',
        estado: d.estado || 'disponible',
        tipoCombustible: d.tipoCombustible || '',
        transmision: d.transmision || 'manual',
        imagenes: imagenesFiles,
      });
      setEditingId(id);
      setShowForm(true);
    } catch (error) {
      debouncedShowNotification(`Error al cargar datos de la publicación: ${error.message}`, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!id) {
      debouncedShowNotification('No se puede eliminar: ID inválido', 'error');
      return;
    }
    if (!window.confirm('¿Eliminar publicación?')) return;
    const accessToken = await getAccessToken();
    if (!accessToken) return;
    try {
      const res = await fetch(`http://localhost:3000/api/catalogo/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error('Error en la respuesta del servidor');
      const data = await res.json();
      if (data.success) {
        debouncedShowNotification('Publicación eliminada correctamente', 'success');
        const publicacionesRes = await fetch('http://localhost:3000/api/catalogo/admin', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (publicacionesRes.ok) {
          const publicacionesData = await publicacionesRes.json();
          if (publicacionesData.success) {
            const userPublicaciones = publicacionesData.data.filter(
              (pub) => pub.idVendedor === user.idUsuario
            );
            setPublicaciones(userPublicaciones);
            setFilteredPublicaciones(userPublicaciones);
          }
        }
      } else {
        throw new Error(data.message || 'Error al eliminar publicación');
      }
    } catch (error) {
      debouncedShowNotification(`Error al eliminar publicación: ${error.message}`, 'error');
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
      tipoCombustible: '',
      transmision: 'manual',
      imagenes: [],
    });
    setEditingId(null);
    setShowForm(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getVehiculoInfo = (pub) => {
    const marca = marcas.find((m) => m.idMarca === pub.idMarca);
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
    return null;
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
            <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
              <Plus size={18} /> {showForm ? 'Cancelar' : 'Nueva Publicación'}
            </button>
          </div>
        </div>

        {showForm && (
          <div className="card-body form-section">
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Vendedor *</label>
                  <input
                    type="text"
                    value={user.nombre || `Vendedor ${user.idUsuario}`}
                    readOnly
                    className="form-control"
                  />
                  <input type="hidden" name="idVendedor" value={formData.idVendedor} />
                </div>

                <div className="form-group">
                  <label>Marca *</label>
                  <select name="idMarca" value={formData.idMarca} onChange={handleInputChange} required>
                    <option value="">Seleccionar marca</option>
                    {marcas.map((m) => (
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
                    step="0.01"
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
                  <select name="estado" value={formData.estado} onChange={handleInputChange} required>
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
                    <option value="diésel">Diésel</option>
                    <option value="eléctrico">Eléctrico</option>
                    <option value="híbrido">Híbrido</option>
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
                    <option value="automática">Automática</option>
                    <option value="CVT">CVT</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>

                <div className="form-group span-2">
                  <label>Imágenes del vehículo (Exactamente 5 al guardar)</label>
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
                      disabled={uploading || formData.imagenes.length >= 5}
                    >
                      {uploading ? (
                        'Subiendo...'
                      ) : (
                        <>
                          <Upload size={16} /> Seleccionar Imágenes
                        </>
                      )}
                    </button>
                    <small>Formatos aceptados: JPG, PNG (máx 5MB cada una, exactamente 5 al guardar)</small>
                  </div>

                  {formData.imagenes.length > 0 && (
                    <div className="images-preview-container">
                      <div className="images-grid">
                        {formData.imagenes.map((img, index) => (
                          <div key={index} className="image-preview-item">
                            <img
                              src={typeof img === 'string' ? img : URL.createObjectURL(img)}
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
                <button type="submit" className="btn btn-primary" disabled={uploading}>
                  {editingId ? 'Actualizar Publicación' : 'Crear Publicación'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={resetForm} disabled={uploading}>
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
                <th>ID Vehículo</th>
                <th>Vehículo</th>
                <th>Descripción</th>
                <th>Imágenes</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginatedPublicaciones.length > 0 ? (
                paginatedPublicaciones.map((publicacion) => (
                  <tr key={publicacion.idVehiculo || publicacion.idPublicacion}>
                    <td>{publicacion.idVehiculo || 'N/A'}</td>
                    <td>{getVehiculoInfo(publicacion)}</td>
                    <td>
                      {publicacion.descripcion.length > 50
                        ? `${publicacion.descripcion.substring(0, 50)}...`
                        : publicacion.descripcion}
                    </td>
                    <td>
                      <div className="table-images">
                        {publicacion.imagenes && publicacion.imagenes.length > 0 ? (
                          publicacion.imagenes.slice(0, 2).map((img, index) => (
                            <img
                              key={`${publicacion.idVehiculo || publicacion.idPublicacion}-${index}`}
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
                        onClick={() => handleDelete(publicacion.idVehiculo || publicacion.idPublicacion)}
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="no-results">
                    No se encontraron publicaciones
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
              Anterior
            </button>
            <span>Página {currentPage} de {totalPages}</span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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