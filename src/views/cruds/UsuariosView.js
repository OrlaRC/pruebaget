import React, { useState, useEffect, useMemo } from 'react';
import { Search, Plus, Edit, Trash2, ChevronDown, ChevronUp, Fingerprint } from 'lucide-react';
import { useHistory } from 'react-router-dom';
import LayoutAdmin from '../layout/LayoutAdmin';
import FingerprintModal from './FingerprintModal';


const fetchWithValidation = async (url, options) => {
  const res = await fetch(url, options);
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP ${res.status}`);
  }
  
  return res.json();
};

const UsuariosView = ({ showNotification }) => {
  const [usuarios, setUsuarios] = useState([]);
  const [filteredUsuarios, setFilteredUsuarios] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'idUsuario', direction: 'asc' });
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    idRol: 2,
    estado: 'activo',
  });
  const [formErrors, setFormErrors] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFingerprintModal, setShowFingerprintModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const itemsPerPage = 10;
  const history = useHistory();

  const validateForm = () => {
    const errors = {};
    
    if (!formData.nombre.trim()) errors.nombre = 'Nombre es requerido';
    if (!formData.email.trim()) errors.email = 'Email es requerido';
    if (!formData.password && !editingId) errors.password = 'Contraseña es requerida';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  useEffect(() => {
    let isMounted = true;
    const fetchUsuarios = async () => {
      const token = localStorage.getItem('accessToken');
      try {
        const json = await fetchWithValidation('http://localhost:3000/api/usuarios', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (isMounted) {
          const list = json.data
            .filter(u => u.idRol === 2)
            .map(u => ({
              ...u,
              telefono: u.telefono ?? '-',
              direccion: u.direccion ?? '-',
              fingerprintStatus: u.fingerprintStatus ?? 'no registrado'
            }));
          setUsuarios(list);
          setFilteredUsuarios(list);
        }
      } catch (err) {
        console.error('Error al obtener usuarios:', err);
        showNotification?.('Error al cargar usuarios: ' + err.message, 'error');
      }
    };
    fetchUsuarios();
    return () => { isMounted = false; };
  }, [showNotification]);

  useEffect(() => {
    const lower = searchTerm.toLowerCase();
    setFilteredUsuarios(
      usuarios.filter(u =>
        u.nombre.toLowerCase().includes(lower) ||
        u.email.toLowerCase().includes(lower) ||
        u.telefono.toLowerCase().includes(lower) ||
        u.direccion.toLowerCase().includes(lower)
      )
    );
    setCurrentPage(1);
  }, [searchTerm, usuarios]);

  const requestSort = key => {
    const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key, direction });
  };
  
  const sortedUsuarios = useMemo(() => {
    const items = [...filteredUsuarios];
    items.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return items;
  }, [filteredUsuarios, sortConfig]);

  const totalPages = Math.ceil(sortedUsuarios.length / itemsPerPage);
  const paginatedUsuarios = sortedUsuarios.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(fd => ({ ...fd, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const resetForm = () => {
    setFormData({ nombre: '', email: '', password: '', idRol: 2, estado: 'activo' });
    setFormErrors({});
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (isLoading) return;
    
    if (!validateForm()) {
      showNotification?.('Por favor corrige los errores en el formulario', 'error');
      return;
    }
    
    setIsLoading(true);

    const token = localStorage.getItem('accessToken');

    try {
      let url = 'http://localhost:3000/api/usuarios';
      let method = 'POST';
      let bodyData = {};

      if (editingId) {
        url = `http://localhost:3000/api/usuarios/${editingId}`;
        method = 'PUT';
        bodyData = {
          nombre: formData.nombre,
          telefono: formData.telefono || null,
          direccion: formData.direccion || null,
          password: formData.password || undefined,
          idRol: 2,
          estado: formData.estado
        };
      } else {
        bodyData = {
          nombre: formData.nombre,
          email: formData.email,
          password: formData.password,
          idRol: 2
        };
      }

      const cleanBodyData = Object.fromEntries(
        Object.entries(bodyData).filter(([_, v]) => v !== undefined)
      );

      const json = await fetchWithValidation(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(cleanBodyData)
      });

      if (editingId) {
        setUsuarios(u => u.map(x => x.idUsuario === editingId ? { 
          ...x, 
          ...json.data,
          telefono: json.data.telefono ?? '-',
          direccion: json.data.direccion ?? '-'
        } : x));
        showNotification?.('Usuario actualizado con éxito');
      } else {
        setUsuarios(u => [...u, { 
          ...json.data, 
          telefono: '-', 
          direccion: '-', 
          fingerprintStatus: 'no registrado' 
        }]);
        showNotification?.('Usuario creado con éxito');
      }

      resetForm();
    } catch (err) {
      console.error('Error al guardar usuario:', err);
      showNotification?.('Error al guardar: ' + err.message, 'error');
      
      if (err.message.includes('email') || err.message.includes('nombre')) {
        setFormErrors(prev => ({ ...prev, 
          email: err.message.includes('email') ? err.message : '',
          nombre: err.message.includes('nombre') ? err.message : ''
        }));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = u => {
    setFormData({
      nombre: u.nombre,
      email: u.email,
      telefono: u.telefono === '-' ? '' : u.telefono,
      direccion: u.direccion === '-' ? '' : u.direccion,
      password: '',
      idRol: 2,
      estado: u.estado
    });
    setFormErrors({});
    setEditingId(u.idUsuario);
    setShowForm(true);
  };

  const handleDelete = async id => {
    if (window.confirm('¿Estás seguro de eliminar este usuario?')) {
      const token = localStorage.getItem('accessToken');
      try {
        await fetchWithValidation(`http://localhost:3000/api/usuarios/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });

        setUsuarios(u => u.filter(x => x.idUsuario !== id));
        showNotification?.('Usuario eliminado');
      } catch (err) {
        console.error('Error al eliminar usuario:', err);
        showNotification?.('Error al eliminar: ' + err.message, 'error');
      }
    }
  };

  const handleManageFingerprint = u => {
    setSelectedUser(u);
    setShowFingerprintModal(true);
  };
  
  const handleFingerprintSuccess = idUsuario => {
    setUsuarios(u => u.map(x => x.idUsuario === idUsuario ? { ...x, fingerprintStatus: 'verificado' } : x));
    setShowFingerprintModal(false);
    showNotification?.('Huella registrada');
  };

  const handleLogout = () => {
    localStorage.clear();
    history.push('/login');
  };

  return (
    <LayoutAdmin>
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Gestión de Usuarios</h3>
          <div className="header-actions">
            <div className="search-box">
              <Search size={18} />
              <input
                type="text"
                placeholder="Buscar usuarios..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
         <button
          className={`btn ${showForm ? "btn-danger" : "btn-primary"}`}
          onClick={() => setShowForm(sf => !sf)}
        >
          {showForm ? (
            <>
              ❌ Cancelar
            </>
          ) : (
            <>
              <Plus size={18} /> Nuevo Usuario
            </>
          )}
        </button>

            <button className="btn btn-secondary ml-2" onClick={handleLogout}>
              Cerrar Sesión
            </button>
          </div>
        </div>

        {showForm && (
          <div className="card-body form-section">
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Nombre</label>
                  <input 
                    name="nombre" 
                    value={formData.nombre} 
                    onChange={handleInputChange} 
                    disabled={isLoading}
                    className={formErrors.nombre ? 'is-invalid' : ''}
                  />
                  {formErrors.nombre && <div className="invalid-feedback">{formErrors.nombre}</div>}
                </div>
                
                <div className="form-group">
                  <label>Email</label>
                  <input 
                    type="email" 
                    name="email" 
                    value={formData.email} 
                    onChange={handleInputChange} 
                    disabled={isLoading || editingId}
                    className={formErrors.email ? 'is-invalid' : ''}
                  />
                  {formErrors.email && <div className="invalid-feedback">{formErrors.email}</div>}
                </div>
                
                {editingId && (
                  <>
                    <div className="form-group">
                      <label>Teléfono</label>
                      <input 
                        name="telefono" 
                        value={formData.telefono} 
                        onChange={handleInputChange} 
                        disabled={isLoading}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Dirección</label>
                      <input 
                        name="direccion" 
                        value={formData.direccion} 
                        onChange={handleInputChange} 
                        disabled={isLoading}
                      />
                    </div>
                  </>
                )}
                
                <div className="form-group">
                  <label>Contraseña</label>
                  <input 
                    type="password" 
                    name="password" 
                    value={formData.password} 
                    onChange={handleInputChange} 
                    disabled={isLoading}
                    className={formErrors.password ? 'is-invalid' : ''}
                    placeholder={editingId ? "Dejar vacío para no cambiar" : ""}
                  />
                  {formErrors.password && <div className="invalid-feedback">{formErrors.password}</div>}
                </div>
                
                <div className="form-group">
                  <label>Estado</label>
                  <select 
                    name="estado" 
                    value={formData.estado} 
                    onChange={handleInputChange}
                    disabled={isLoading}
                  >
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                  </select>
                </div>
              </div>
              
              <div className="form-actions">
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      {editingId ? ' Actualizando...' : ' Creando...'}
                    </>
                  ) : editingId ? 'Actualizar Usuario' : 'Crear Usuario'}
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={resetForm} 
                  disabled={isLoading}
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
                <th onClick={() => requestSort('idUsuario')}>
                  ID {sortConfig.key === 'idUsuario' && (sortConfig.direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
                </th>
                <th onClick={() => requestSort('nombre')}>
                  Nombre {sortConfig.key === 'nombre' && (sortConfig.direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
                </th>
                <th onClick={() => requestSort('email')}>
                  Email {sortConfig.key === 'email' && (sortConfig.direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
                </th>
                <th>Teléfono</th>
                <th>Dirección</th>
                <th onClick={() => requestSort('estado')}>
                  Estado {sortConfig.key === 'estado' && (sortConfig.direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
                </th>
                <th>Huella</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsuarios.length > 0 ? paginatedUsuarios.map(u => (
                <tr key={u.idUsuario}>
                  <td>{u.idUsuario}</td>
                  <td>{u.nombre}</td>
                  <td>{u.email}</td>
                  <td>{u.telefono}</td>
                  <td>{u.direccion}</td>
                  <td>
                    <span className={`badge ${u.estado === 'activo' ? 'badge-success' : 'badge-danger'}`}>
                      {u.estado}
                    </span>
                  </td>
                  <td style={{ paddingLeft: 20 }}>
                    <span className={`badge ${u.fingerprintStatus === 'verificado' ? 'badge-success' : 'badge-secondary'}`}>
                      {u.fingerprintStatus}
                    </span>
                    <button 
                      className="btn-icon btn-primary ml-2" 
                      onClick={() => handleManageFingerprint(u)} 
                      title="Gestionar Huella"
                      disabled={isLoading}
                    >
                      <Fingerprint size={16} />
                    </button>
                  </td>
                  <td className="actions">
                    <button 
                      className="btn-icon btn-warning" 
                      onClick={() => handleEdit(u)} 
                      title="Editar"
                      disabled={isLoading}
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      className="btn-icon btn-danger" 
                      onClick={() => handleDelete(u.idUsuario)} 
                      title="Eliminar"
                      disabled={isLoading}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="8" className="no-results">No se encontraron usuarios</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {showFingerprintModal && (
          <FingerprintModal
            user={selectedUser}
            onClose={() => setShowFingerprintModal(false)}
            onSuccess={() => handleFingerprintSuccess(selectedUser.idUsuario)}
          />
        )}

        {totalPages > 1 && (
          <div className="pagination">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
              disabled={currentPage === 1 || isLoading}
            >
              Anterior
            </button>
            <span>Página {currentPage} de {totalPages}</span>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
              disabled={currentPage === totalPages || isLoading}
            >
              Siguiente
            </button>
          </div>
        )}
      </div>
    </LayoutAdmin>
  );
};

export default UsuariosView;