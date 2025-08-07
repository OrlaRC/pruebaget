import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import LayoutAdmin from '../layout/LayoutAdmin';
import { useHistory } from 'react-router-dom';

const MarcasView = ({ showNotification }) => {
  const [marcas, setMarcas] = useState([]);
  const [filteredMarcas, setFilteredMarcas] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    nombre_marca: '',
    enlace_imagen: null
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const history = useHistory();

  // Igual que en UsuariosView: obtenemos token y si no hay, forzamos login
  const getAuthHeaders = (isJson = false) => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      showNotification?.('No autorizado. Por favor inicia sesión.', 'error');
      history.push('/login');
      return null;
    }
    return isJson
      ? { 
          'Content-Type': 'application/json', 
          Authorization: `Bearer ${token}` 
        }
      : {
          Authorization: `Bearer ${token}`
        };
  };

  // 🔹 GET marcas (JSON)
  useEffect(() => {
    const headers = getAuthHeaders(true);
    if (!headers) return;

    let isMounted = true;
    fetch('http://localhost:3000/ https://financiera-backend.vercel.app/api/marcas', { headers })
      .then(res => {
        if (res.status === 401) throw new Error('401');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(json => {
        if (!json.success) throw new Error(json.message);
        if (isMounted) {
          setMarcas(json.data);
          setFilteredMarcas(json.data);
        }
      })
      .catch(err => {
        console.error('Error al cargar marcas:', err);
        if (err.message === '401') {
          showNotification?.('Token inválido o expirado', 'error');
          history.push('/login');
        } else {
          showNotification?.('Error al cargar marcas', 'error');
        }
      });

    return () => { isMounted = false; };
  }, [showNotification, history]);

  // Filtrado local
  useEffect(() => {
    const lower = searchTerm.toLowerCase();
    setFilteredMarcas(
      marcas.filter(m => m.nombre_marca.toLowerCase().includes(lower))
    );
    setCurrentPage(1);
  }, [searchTerm, marcas]);

  const paginatedMarcas = filteredMarcas.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredMarcas.length / itemsPerPage);

  // Inputs
  const handleInputChange = e => {
    const { name } = e.target;
    if (name === 'enlace_imagen') {
      const file = e.target.files[0];
      setFormData(fd => ({ ...fd, enlace_imagen: file }));
      setPreviewImage(file ? URL.createObjectURL(file) : null);
    } else {
      const value = e.target.value;
      setFormData(fd => ({ ...fd, [name]: value }));
    }
  };

  // POST / PUT (multipart/form-data)
  const handleSubmit = e => {
    e.preventDefault();
    const headers = getAuthHeaders();
    if (!headers) return;

    const fd = new FormData();
    fd.append('nombre_marca', formData.nombre_marca);
    if (formData.enlace_imagen) {
      fd.append('enlace_imagen', formData.enlace_imagen);
    }

    let url = 'http://localhost:3000/ https://financiera-backend.vercel.app/api/marcas';
    let method = 'POST';
    if (editingId) {
      url += `/${editingId}`;
      method = 'PUT';
    }

    fetch(url, {
      method,
      headers,
      body: fd
    })
      .then(res => {
        if (res.status === 401) throw new Error('401');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(json => {
        if (!json.success) throw new Error(json.message);
        if (editingId) {
          setMarcas(ms =>
            ms.map(m => (m.idMarca === editingId ? json.data : m))
          );
          showNotification?.('Marca actualizada correctamente');
        } else {
          setMarcas(ms => [...ms, json.data]);
          showNotification?.('Marca creada correctamente');
        }
        resetForm();
      })
      .catch(err => {
        console.error('Error al guardar marca:', err);
        if (err.message === '401') {
          showNotification?.('Token inválido o expirado', 'error');
          history.push('/login');
        } else {
          showNotification?.('Error al guardar la marca', 'error');
        }
      });
  };

  // Cargar edición
  const handleEdit = marca => {
    setFormData({ nombre_marca: marca.nombre_marca, enlace_imagen: null });
    setPreviewImage(marca.enlace_imagen);
    setEditingId(marca.idMarca);
    setShowForm(true);
  };

  // DELETE
  const handleDelete = id => {
    if (!window.confirm('¿Estás seguro de eliminar esta marca?')) return;
    const headers = getAuthHeaders(true);
    if (!headers) return;

    fetch(`http://localhost:3000/ https://financiera-backend.vercel.app/api/marcas/${id}`, {
      method: 'DELETE',
      headers
    })
      .then(res => {
        if (res.status === 401) throw new Error('401');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(json => {
        if (!json.success) throw new Error(json.message);
        setMarcas(ms => ms.filter(m => m.idMarca !== id));
        showNotification?.('Marca eliminada correctamente');
      })
      .catch(err => {
        console.error('Error al eliminar marca:', err);
        if (err.message === '401') {
          showNotification?.('Token inválido o expirado', 'error');
          history.push('/login');
        } else {
          showNotification?.('Error al eliminar la marca', 'error');
        }
      });
  };

  const resetForm = () => {
    setFormData({ nombre_marca: '', enlace_imagen: null });
    setPreviewImage(null);
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <LayoutAdmin>
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Gestión de Marcas</h3>
          <div className="header-actions">
            <div className="search-box">
              <Search size={18} />
              <input
                type="text"
                placeholder="Buscar marcas..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              className="btn btn-primary"
              onClick={() => setShowForm(sf => !sf)}
            >
              <Plus size={18} /> {showForm ? 'Cancelar' : 'Nueva Marca'}
            </button>
          </div>
        </div>

        {showForm && (
          <div className="card-body form-section">
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Nombre de la Marca</label>
                  <input
                    type="text"
                    name="nombre_marca"
                    value={formData.nombre_marca}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Imagen de la Marca</label>
                  <input
                    type="file"
                    name="enlace_imagen"
                    accept="image/*"
                    onChange={handleInputChange}
                  />
                  {previewImage && (
                    <div className="image-preview">
                      <img
                        src={previewImage}
                        alt="Vista previa"
                        onError={e => (e.target.style.display = 'none')}
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  {editingId ? 'Actualizar Marca' : 'Crear Marca'}
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
                <th>Nombre</th>
                <th>Logo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginatedMarcas.length > 0 ? (
                paginatedMarcas.map(marca => (
                  <tr key={marca.idMarca}>
                    <td>{marca.idMarca}</td>
                    <td>{marca.nombre_marca}</td>
                    <td>
                      {marca.enlace_imagen ? (
                        <img
                          src={marca.enlace_imagen}
                          alt={marca.nombre_marca}
                          className="table-image"
                          onError={e => (e.target.style.display = 'none')}
                        />
                      ) : (
                        'No disponible'
                      )}
                    </td>
                    <td className="actions">
                      <button className="btn-icon btn-warning" onClick={() => handleEdit(marca)} title="Editar">
                        <Edit size={16} />
                      </button>
                      <button className="btn-icon btn-danger" onClick={() => handleDelete(marca.idMarca)} title="Eliminar">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="no-results">No se encontraron marcas</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
              Anterior
            </button>
            <span>Página {currentPage} de {totalPages}</span>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
              Siguiente
            </button>
          </div>
        )}
      </div>
    </LayoutAdmin>
  );
};

export default MarcasView;
