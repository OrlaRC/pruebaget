import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useHistory } from 'react-router-dom';
import { ArrowBigLeft, ArrowLeft, ArrowRight, ArrowBigRight } from 'lucide-react';
import Header from './component/header';
import HeaderPrivado from './component/headerPrivado';
import Footer from './component/footer';
import './catalogo.css';

const Catalogo = () => {
  const history = useHistory();
  const [marcas, setMarcas] = useState([]);
  const [autos, setAutos] = useState([]);
  const [selectedYears, setSelectedYears] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const años = ['2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017'];

  useEffect(() => {
    const checkAuth = () => setIsAuthenticated(!!localStorage.getItem('token'));
    window.addEventListener('storage', checkAuth);

    // Cargar marcas
    fetch('https://financiera-backend.vercel.app/api/marcas')
      .then(res => res.json())
      .then(data => { if (data.success) setMarcas(data.data); });

    // Cargar autos
    fetch('https://financiera-backend.vercel.app/api/catalogo')
      .then(res => res.json())
      .then(data => { if (data.success) setAutos(data.data); });

    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  const handleYearChange = year => {
    setSelectedYears(prev =>
      prev.includes(year) ? prev.filter(y => y !== year) : [...prev, year]
    );
    setCurrentPage(1);
  };

  // Filtrar autos por año y búsqueda (marca o modelo)
  const filteredAutos = autos.filter(auto => {
    const matchesYear = selectedYears.length ? selectedYears.includes(auto.ano.toString()) : true;
    const marca = marcas.find(m => m.idMarca === auto.idMarca);
    const search = searchQuery.toLowerCase();
    const matchesSearch = search
      ? auto.modelo.toLowerCase().includes(search) || (marca && marca.nombre_marca.toLowerCase().includes(search))
      : true;
    return matchesYear && matchesSearch;
  });

  const totalPages = Math.ceil(filteredAutos.length / itemsPerPage);
  const paginatedAutos = filteredAutos.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Paginación
  const goToFirst = () => setCurrentPage(1);
  const goToLast = () => setCurrentPage(totalPages);
  const goToPrev = () => setCurrentPage(prev => Math.max(1, prev - 1));
  const goToNext = () => setCurrentPage(prev => Math.min(totalPages, prev + 1));

  return (
    <div className="desktop1-container">
      <Helmet>
        <title>Catálogo de Vehículos</title>
        <meta name="description" content="Explora nuestro catálogo de vehículos" />
      </Helmet>

      {isAuthenticated ? <HeaderPrivado /> : <Header />}

      <div className="search-bar">
        <input
          type="text"
          placeholder="Buscar por marca o modelo"
          value={searchQuery}
          onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
          className="search-input"
        />
      </div>

      <div className="desktop1-desktop">
        <aside className="filtro">
          <h3>Marca</h3>
          <div className="marcas">
            {marcas.map(marca => (
              <Link
                key={marca.idMarca}
                to={`/marca/${marca.idMarca}`}
                state={{ nombre: marca.nombre_marca }}
                className="marca-card"
              >
                <img src={marca.enlace_imagen} alt={marca.nombre_marca} />
                <span title={marca.nombre_marca}>{marca.nombre_marca}</span>
              </Link>
            ))}
          </div>

          <h3>Año</h3>
          <div className="años">
            {años.map(year => (
              <label className="checkbox" key={year}>
                <input
                  type="checkbox"
                  checked={selectedYears.includes(year)}
                  onChange={() => handleYearChange(year)}
                />
                <span>{year}</span>
              </label>
            ))}
          </div>
        </aside>

        <section className="catalogo">
          {paginatedAutos.length > 0 ? (
            paginatedAutos.map(auto => {
              // Obtener nombre de la marca para mostrar
              const marca = marcas.find(m => m.idMarca === auto.idMarca);

              return (
                <div className="producto" key={auto.idVehiculo}>
                  <img
                    src={auto.imagenes[0] || ''}
                    alt={auto.modelo}
                    className="auto"
                  />

                  {/* Marca en negrita + Modelo */}
                  <span className="marca">
                    <strong>{marca ? marca.nombre_marca : 'Marca desconocida'}</strong> {auto.modelo}
                  </span>

                  <span className="año">{auto.ano}</span>
                  <span className="precio">${Number(auto.precio).toLocaleString()}</span>

                  <button
                    className="mas-info"
                    onClick={() => history.push('/info-auto', { idVehiculo: auto.idVehiculo })}
                  >
                    Más información
                  </button>
                </div>
              );
            })
          ) : (
            <p>No hay autos disponibles para los filtros seleccionados.</p>
          )}

          {totalPages > 1 && (
            <div className="pagination-bottom">
              <button onClick={goToFirst} disabled={currentPage === 1} title="Primera página">
                <ArrowBigLeft size={16} />
              </button>
              <button onClick={goToPrev} disabled={currentPage === 1} title="Anterior">
                <ArrowLeft size={16} />
              </button>
              <span>Página {currentPage} de {totalPages}</span>
              <button onClick={goToNext} disabled={currentPage === totalPages} title="Siguiente">
                <ArrowRight size={16} />
              </button>
              <button onClick={goToLast} disabled={currentPage === totalPages} title="Última página">
                <ArrowBigRight size={16} />
              </button>
            </div>
          )}
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default Catalogo;
