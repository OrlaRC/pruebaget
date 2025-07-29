import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useHistory } from 'react-router-dom';
import { Link } from 'react-router-dom';
import Header from './component/header';
import Footer from './component/footer';
import './catalogo.css';

const Desktop1 = () => {
  const history = useHistory();
  const [selectedYears, setSelectedYears] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);

  const colores = ['Rojo', 'Azul', 'Blanco', 'Negro', 'Gris'];
  const años = ['2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017'];

  // Function to get a random year
  const getRandomYear = () => {
    return años[Math.floor(Math.random() * años.length)];
  };

  // Initialize products with unique brands and random years on mount
  useEffect(() => {
    setProducts([
      { brand: 'Toyota', year: getRandomYear() },
      { brand: 'Honda', year: getRandomYear() },
      { brand: 'Ford', year: getRandomYear() },
      { brand: 'Chevrolet', year: getRandomYear() },
      { brand: 'Audi', year: getRandomYear() },
      { brand: 'BMW', year: getRandomYear() },
      { brand: 'Nissan', year: getRandomYear() },
      { brand: 'Hyundai', year: getRandomYear() },
    ]);
  }, []);

  // Handle checkbox change
  const handleYearChange = (year) => {
    if (selectedYears.includes(year)) {
      setSelectedYears(selectedYears.filter((y) => y !== year));
    } else {
      setSelectedYears([...selectedYears, year]);
    }
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Filter products based on selected years and search query
  const filteredProducts = products.filter((product) => {
    const matchesYear = selectedYears.length > 0 ? selectedYears.includes(product.year) : true;
    const matchesSearch = searchQuery
      ? product.brand.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchesYear && matchesSearch;
  });

  // Define individual products for rendering
  const product1 = products[0] || { brand: 'Toyota', year: '2025' };
  const product2 = products[1] || { brand: 'Honda', year: '2024' };
  const product3 = products[2] || { brand: 'Ford', year: '2023' };
  const product4 = products[3] || { brand: 'Chevrolet', year: '2022' };
  const product5 = products[4] || { brand: 'Audi', year: '2021' };
  const product6 = products[5] || { brand: 'BMW', year: '2020' };
  const product7 = products[6] || { brand: 'Nissan', year: '2019' };
  const product8 = products[7] || { brand: 'Hyundai', year: '2018' };

  return (
    <div className="desktop1-container">
      <Helmet>
        <title>Catálogo de Vehículos</title>
      </Helmet>

      <Header />

      <div className="search-bar">
        <input
          type="text"
          placeholder="Buscar por marca"
          value={searchQuery}
          onChange={handleSearchChange}
          className="search-input"
        />
        <img src="/external/searchi113-4ayv.svg" alt="Buscar" />
      </div>

      <div className="desktop1-desktop">
        <aside className="filtro">
          <div>
            <h3>Marca</h3>
            <div className="marcas">
              {[
                { name: "ford", img: "/external/ford1513-6hxm-200h.png" },
                { name: "chevrolet", img: "/external/chevrolet1516-oqty-200h.png" },
                { name: "bentley", img: "/external/bentley1519-dvky-200h.png" },
                { name: "suzuki", img: "/external/suzuki11528-yf6t-200h.png" },
                { name: "kia", img: "/external/kia1522-t3zc-200h.png" },
                { name: "audi", img: "/external/audi1525-a9ld-200h.png" },
                { name: "honda", img: "/external/honda1531-0gn-200h.png" },
                { name: "bmw", img: "/external/bmw1534-lfrd-200h.png" },
                { name: "toyota", img: "/external/toyota1537-8pm-200h.png" },
                { name: "seat", img: "/external/seat1555-pqyc-200h.png" },
                { name: "subaru", img: "/external/subaru1540-d56o-200h.png" },
                { name: "renault", img: "/external/renault1543-23z-200h.png" },
                { name: "fiat", img: "/external/fiat1546-452g-200h.png" },
                { name: "hyundai", img: "/external/hyundai1549-obex-200h.png" },
                { name: "nissan", img: "/external/nissan1552-kn7-200h.png" },
                { name: "mazda", img: "/external/mazda51558-0vco-200h.png" },
              ].map((brand, i) => (
                <Link to={`/marca/${brand.name}`} key={i} className="marca-card">
                  <img src={brand.img} alt={brand.name} />
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3>Año</h3>
            <div className="años">
              {años.map((year, i) => (
                <label className="checkbox" key={i}>
                  <input
                    type="checkbox"
                    name="año"
                    value={year}
                    checked={selectedYears.includes(year)}
                    onChange={() => handleYearChange(year)}
                  />
                  <span>{year}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        <section className="catalogo">
          {filteredProducts.length > 0 ? (
            <>
              {filteredProducts.includes(product1) && (
                <div className="producto">
                  <img src="/external/auto1.png" alt={product1.brand} className="auto" />
                  <span className="marca">{product1.brand}</span>
                  <span className="año">{product1.year}</span>
                  <span className="precio">$15,000</span>
                  <button
                    className="mas-info"
                    onClick={() => history.push('/info-auto')}
                  >
                    Más información
                  </button>
                </div>
              )}
              {filteredProducts.includes(product2) && (
                <div className="producto">
                  <img src="/external/auto1.png" alt={product2.brand} className="auto" />
                  <span className="marca">{product2.brand}</span>
                  <span className="año">{product2.year}</span>
                  <span className="precio">$15,000</span>
                  <button
                    className="mas-info"
                    onClick={() => history.push('/info-auto')}
                  >
                    Más información
                  </button>
                </div>
              )}
              {filteredProducts.includes(product3) && (
                <div className="producto">
                  <img src="/external/auto1.png" alt={product3.brand} className="auto" />
                  <span className="marca">{product3.brand}</span>
                  <span className="año">{product3.year}</span>
                  <span className="precio">$15,000</span>
                  <button
                    className="mas-info"
                    onClick={() => history.push('/info-auto')}
                  >
                    Más información
                  </button>
                </div>
              )}
              {filteredProducts.includes(product4) && (
                <div className="producto">
                  <img src="/external/auto1.png" alt={product4.brand} className="auto" />
                  <span className="marca">{product4.brand}</span>
                  <span className="año">{product4.year}</span>
                  <span className="precio">$15,000</span>
                  <button
                    className="mas-info"
                    onClick={() => history.push('/info-auto')}
                  >
                    Más información
                  </button>
                </div>
              )}
              {filteredProducts.includes(product5) && (
                <div className="producto">
                  <img src="/external/auto1.png" alt={product5.brand} className="auto" />
                  <span className="marca">{product5.brand}</span>
                  <span className="año">{product5.year}</span>
                  <span className="precio">$15,000</span>
                  <button
                    className="mas-info"
                    onClick={() => history.push('/info-auto')}
                  >
                    Más información
                  </button>
                </div>
              )}
              {filteredProducts.includes(product6) && (
                <div className="producto">
                  <img src="/external/auto1.png" alt={product6.brand} className="auto" />
                  <span className="marca">{product6.brand}</span>
                  <span className="año">{product6.year}</span>
                  <span className="precio">$15,000</span>
                  <button
                    className="mas-info"
                    onClick={() => history.push('/info-auto')}
                  >
                    Más información
                  </button>
                </div>
              )}
              {filteredProducts.includes(product7) && (
                <div className="producto">
                  <img src="/external/auto1.png" alt={product7.brand} className="auto" />
                  <span className="marca">{product7.brand}</span>
                  <span className="año">{product7.year}</span>
                  <span className="precio">$15,000</span>
                  <button
                    className="mas-info"
                    onClick={() => history.push('/info-auto')}
                  >
                    Más información
                  </button>
                </div>
              )}
              {filteredProducts.includes(product8) && (
                <div className="producto">
                  <img src="/external/auto1.png" alt={product8.brand} className="auto" />
                  <span className="marca">{product8.brand}</span>
                  <span className="año">{product8.year}</span>
                  <span className="precio">$15,000</span>
                  <button
                    className="mas-info"
                    onClick={() => history.push('/info-auto')}
                  >
                    Más información
                  </button>
                </div>
              )}
            </>
          ) : (
            <p>No hay autos disponibles para los filtros seleccionados.</p>
          )}
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default Desktop1;