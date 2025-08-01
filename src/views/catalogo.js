import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useHistory } from 'react-router-dom';
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
  const años = ['2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017'];

  useEffect(() => {
    const checkAuth = () => {
      setIsAuthenticated(!!localStorage.getItem('token'));
    };
    window.addEventListener('storage', checkAuth);

    fetch('http://localhost:3000/api/marcas')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          console.log('Marcas recibidas:', data.data);
          setMarcas(data.data);
        } else {
          console.error('Error fetching marcas:', data.message);
        }
      })
      .catch(err => console.error('Error fetching marcas:', err));

    fetch('http://localhost:3000/api/catalogo')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setAutos(data.data);
        } else {
          console.error('Error fetching autos:', data.message);
        }
      })
      .catch(err => console.error('Error fetching autos:', err));

    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  const handleYearChange = year => {
    setSelectedYears(prev =>
      prev.includes(year)
        ? prev.filter(y => y !== year)
        : [...prev, year]
    );
  };

  const filteredAutos = autos.filter(auto => {
    const matchesYear = selectedYears.length
      ? selectedYears.includes(auto.ano.toString())
      : true;
    const matchesSearch = searchQuery
      ? auto.modelo.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchesYear && matchesSearch;
  });

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
          placeholder="Buscar por modelo"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
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
          {filteredAutos.length > 0 ? (
            filteredAutos.slice(0, 8).map(auto => (
              <div className="producto" key={auto.idVehiculo}>
                <img
                  src={auto.imagenes[0] || ''}
                  alt={auto.modelo}
                  className="auto"
                />
                <span className="marca">{auto.modelo}</span>
                <span className="año">{auto.ano}</span>
                <span className="precio">
                  ${Number(auto.precio).toLocaleString()}
                </span>
                <button
                  className="mas-info"
                  onClick={() =>
                    history.push('/info-auto', { idVehiculo: auto.idVehiculo })
                  }
                >
                  Más información
                </button>
              </div>
            ))
          ) : (
            <p>No hay autos disponibles para los filtros seleccionados.</p>
          )}
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default Catalogo;