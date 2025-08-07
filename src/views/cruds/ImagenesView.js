import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Plus, Trash2 } from 'lucide-react';
import LayoutAdmin from '../layout/LayoutAdmin';
import { useHistory } from 'react-router-dom';

const ImagenesView = ({ showNotification }) => {
  const [vehiculos, setVehiculos] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [imagenes, setImagenes] = useState([]);
  const [filteredImagenes, setFilteredImagenes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({ idVehiculo: '', imagenes: [] });
  const [showForm, setShowForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [uploading, setUploading] = useState(false);
  const history = useHistory();
  const itemsPerPage = 10;

  // Auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      showNotification?.('No autorizado. Por favor inicia sesión.', 'error');
      history.push('/login');
      return null;
    }
    return { Authorization: `Bearer ${token}` };
  };

  useEffect(() => {
    fetchMarcas();
    fetchVehiculos();
  }, []);

  const fetchMarcas = async () => {
    const headers = getAuthHeaders();
    if (!headers) return;
    try {
      const res = await axios.get('http://localhost:3000/ https://financiera-backend.vercel.app/api/marcas', { headers });
      if (res.data.success) setMarcas(res.data.data);
    } catch {
      showNotification?.('Error al cargar marcas', 'error');
    }
  };

  const fetchVehiculos = async () => {
    const headers = getAuthHeaders();
    if (!headers) return;
    try {
      const res = await axios.get('http://localhost:3000/ https://financiera-backend.vercel.app/api/catalogo', { headers });
      if (res.data.success) {
        setVehiculos(res.data.data);
        const imgs = [];
        res.data.data.forEach(vehicle => {
          (vehicle.imagenes || []).forEach((url, idx) => {
            imgs.push({
              idImagen: `${vehicle.idVehiculo}-${idx + 1}`,
              idVehiculo: vehicle.idVehiculo,
              urlImagen: url
            });
          });
        });
        setImagenes(imgs);
        setFilteredImagenes(imgs);
      }
    } catch {
      showNotification?.('Error al cargar imágenes', 'error');
    }
  };

  useEffect(() => {
    const lower = searchTerm.toLowerCase();
    const filtered = imagenes.filter(im => {
      const veh = vehiculos.find(v => v.idVehiculo === im.idVehiculo) || {};
      const marca = marcas.find(m => m.idMarca === veh.idMarca)?.nombre_marca.toLowerCase() || '';
      const modelo = veh.modelo?.toLowerCase() || '';
      const url = im.urlImagen.toLowerCase();
      const filename = url.substring(url.lastIndexOf('/') + 1);
      return (
        marca.includes(lower) ||
        modelo.includes(lower) ||
        url.includes(lower) ||
        filename.includes(lower)
      );
    });
    setFilteredImagenes(filtered);
    setCurrentPage(1);
  }, [searchTerm, imagenes, vehiculos, marcas]);

  const paginatedImagenes = filteredImagenes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredImagenes.length / itemsPerPage);

  const handleFileChange = e => {
    const files = Array.from(e.target.files);
    if (files.length + formData.imagenes.length > 5) {
      showNotification?.('Máximo 5 imágenes por vehículo', 'error');
      return;
    }
    setFormData(fd => ({ ...fd, imagenes: fd.imagenes.concat(files) }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!formData.idVehiculo) return;
    const headers = getAuthHeaders();
    if (!headers) return;
    setUploading(true);
    const fd = new FormData();
    formData.imagenes.forEach(file => fd.append('imagenes', file));
    try {
      await axios.post(
        `http://localhost:3000/ https://financiera-backend.vercel.app/api/catalogo/${formData.idVehiculo}/imagenes`,
        fd,
        { headers }
      );
      showNotification?.('Imágenes agregadas correctamente');
      setFormData({ idVehiculo: '', imagenes: [] });
      setShowForm(false);
      fetchVehiculos();
    } catch {
      showNotification?.('Error al agregar imágenes', 'error');
    }
    setUploading(false);
  };

  const handleCancel = () => {
    setFormData({ idVehiculo: '', imagenes: [] });
    setShowForm(false);
  };

  const handleDelete = id => {
    setImagenes(imgs => imgs.filter(i => i.idImagen !== id));
    showNotification?.('Imagen eliminada');
  };

  return (
    <LayoutAdmin>
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Gestión de Imágenes</h3>
          <div className="header-actions">
            <div className="search-box">
              <Search size={18} />
              <input
                type="text"
                placeholder="Buscar imágenes..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="btn btn-primary" onClick={() => setShowForm(sf => !sf)}>
              <Plus size={18} /> {showForm ? 'Cancelar' : 'Nueva Imagen'}
            </button>
          </div>
        </div>

        {showForm && (
          <div className="card-body form-section">
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Vehículo</label>
                  <select
                    value={formData.idVehiculo}
                    onChange={e => setFormData(fd => ({ ...fd, idVehiculo: e.target.value }))}
                    required
                  >
                    <option value="">Seleccionar vehículo</option>
                    {vehiculos.map(v => (
                      <option key={v.idVehiculo} value={v.idVehiculo}>
                        {marcas.find(m => m.idMarca === v.idMarca)?.nombre_marca} {v.modelo}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Imágenes (máx. 5)</label>
                  <input type="file" multiple accept="image/*" onChange={handleFileChange} />
                </div>
              </div>
              <div className="form-actions">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={uploading || !formData.idVehiculo || !formData.imagenes.length}
                >
                  {uploading ? 'Subiendo...' : 'Agregar Imágenes'}
                </button>
                <button type="button" className="btn btn-secondary ml-2" onClick={handleCancel}>
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
                <th>ID Imagen</th>
                <th>Vehículo</th>
                <th>Imagen</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginatedImagenes.map(im => (
                <tr key={im.idImagen}>
                  <td>{im.idImagen}</td>
                  <td>
                    {marcas.find(m => m.idMarca === vehiculos.find(v => v.idVehiculo === im.idVehiculo)?.idMarca)?.nombre_marca} {vehiculos.find(v => v.idVehiculo === im.idVehiculo)?.modelo}
                  </td>
                  <td>
                    <img
                      src={im.urlImagen}
                      alt="Imagen Vehículo"
                      className="table-image"
                      onError={e => (e.target.src = 'https://via.placeholder.com/100')}
                    />
                  </td>
                  <td className="actions">
                    <button className="btn-icon btn-danger" onClick={() => handleDelete(im.idImagen)}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
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

export default ImagenesView;
