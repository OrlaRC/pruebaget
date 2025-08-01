import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useHistory } from 'react-router-dom';
import Footer from './component/footer';
import Header from './component/header';  // Usamos solo este Header ahora
import './home.css';
import carsGif from '../context/carsget.gif';

const testimonials = [
  {
    id: 1,
    image: "/external/testimonialimage1409-ki5c-300h.png",
    name: "Laura - 26 años",
    text:
      "Después de ahorrar durante dos años, por fin compré mi primer auto. Es un modelo compacto, perfecto para moverme por la ciudad y visitar a mi familia los fines de semana. Me siento libre e independiente, y ya estoy planeando mi primer viaje por carretera.",
    advisor: "Roberto Osvaldo Orea Mesta",
  },
  {
    id: 2,
    image: "/external/testimonialimage1414-4u1d-300h.png",
    name: "Miriam - 23 años",
    text:
      "Soy ingeniera ambiental y desde hace tiempo quería un auto eléctrico. Finalmente lo compré, y me encanta. No solo contribuyo a cuidar el medio ambiente, sino que también ahorro mucho en gasolina. Me siento bien con mi decisión y la recomiendo a todos.",
    advisor: "José Villa Rosales",
  },
  {
    id: 3,
    image: "/external/testimonialimage1420-252-300h.png",
    name: "José - 32 años",
    text:
      "Hace poco cambié mi sedán por una camioneta más amplia. Tengo dos hijos y necesitábamos más espacio y comodidad para nuestros viajes. Me siento tranquilo sabiendo que ahora viajamos más seguros y cómodos. Fue una buena decisión para mi familia.",
    advisor: "Alexis Rico Herrera",
  },
];

const Home = () => {
  const [vehicles, setVehicles] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [loadingBrands, setLoadingBrands] = useState(true);
  const [errorVehicles, setErrorVehicles] = useState(null);
  const [errorBrands, setErrorBrands] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('accessToken'));

  const history = useHistory();

  useEffect(() => {
    // Actualizar isAuthenticated si el token cambia
    const checkAuth = () => {
      setIsAuthenticated(!!localStorage.getItem('accessToken'));
    };
    window.addEventListener('storage', checkAuth);

    // Fetch vehicles
    fetch("http://localhost:3000/api/catalogo")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setVehicles(json.data);
        else setErrorVehicles("Error al obtener vehículos");
      })
      .catch(() => setErrorVehicles("Error de red al cargar vehículos"))
      .finally(() => setLoadingVehicles(false));

    // Fetch brands
    fetch("http://localhost:3000/api/marcas")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setBrands(json.data);
        else setErrorBrands("Error al obtener marcas");
      })
      .catch(() => setErrorBrands("Error de red al cargar marcas"))
      .finally(() => setLoadingBrands(false));

    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    history.push("/");
  };

  return (
    <div className="desktop-container">
      <Helmet>
        <title>Cars Get Financiamiento - Compra tu auto ideal</title>
        <meta
          name="description"
          content="Encuentra el auto perfecto con nuestro financiamiento flexible y tasas competitivas"
        />
      </Helmet>

      {/* Solo Header, que internamente maneja el menú según login */}
      <Header />

      <main>
        {/* Barra de búsqueda con fondo GIF CarsGet */}
        <section
          className="search-section"
         style={{
                height: '600px',
                backgroundImage: `url(${carsGif})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                alignItems: 'center',      // Centrado vertical
                justifyContent: 'center',  // Centrado horizontal
              }}
        >
          <div className="search-container">
            <h2 className="search-title">Encuentra exactamente lo que buscas</h2>
          </div>
        </section>

        {/* Logos de marcas dinámicos */}
        <section className="brands-section">
          <h2 className="section-title">¡DESCUBRE NUESTRO CATÁLOGO AQUÍ!</h2>
          {loadingBrands && <p>Cargando marcas...</p>}
          {errorBrands && <p className="error-message">{errorBrands}</p>}
          {!loadingBrands && !errorBrands && (
            <div className="brands-grid">
              {brands.map((brand) => (
                <Link to={`/marca/${brand.idMarca}`} key={brand.idMarca} className="brand-card">
                  <img src={brand.enlace_imagen} alt={brand.nombre_marca} className="brand-logo" />
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Vehículos destacados */}
        <section className="featured-section">
          <h2 className="section-title">VEHÍCULOS DESTACADOS</h2>
          {loadingVehicles && <p>Cargando vehículos...</p>}
          {errorVehicles && <p className="error-message">{errorVehicles}</p>}
          {!loadingVehicles && !errorVehicles && (
            <div className="vehicles-grid">
              {vehicles.slice(0, 4).map((vehicle) => (
                <div key={vehicle.idVehiculo} className="vehicle-card">
                  <img src={vehicle.imagenes[0]} alt={`${vehicle.modelo} ${vehicle.version}`} />
                  <p className="vehicle-model">{vehicle.modelo} {vehicle.version} ({vehicle.ano})</p>
                  <p className="vehicle-price">${Number(vehicle.precio).toLocaleString()}</p>
                  <button
                    className="mas-info-btn"
                    onClick={() => {
                      window.location.href = `/info-auto?idVehiculo=${vehicle.idVehiculo}`;
                    }}
                  >
                    Más información
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Testimonios */}
        <section className="testimonials-section">
          <h2 className="section-title">CONOCE LA EXPERIENCIA DE NUESTROS CLIENTES</h2>
          <div className="testimonials-carousel">
            <img src="/external/testimonialbackground1405-j3zb-1400w.png" alt="" className="testimonials-bg" />
            <div className="testimonials-grid">
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="testimonial-card">
                  <img src={testimonial.image} alt={testimonial.name} className="testimonial-image" />
                  <p className="testimonial-text">{testimonial.text}</p>
                  <p className="testimonial-advisor">Asesor que atendió: {testimonial.advisor}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Promociones */}
        <section className="promo-section">
          <div className="promo-item">
            <p>Solicitud digital con un</p>
            <h3>90% <span>de APROBACIÓN</span></h3>
          </div>
          <div className="promo-item">
            <p>Plazos forzosos</p>
            <h3>NO MANEJAMOS</h3>
          </div>
          <div className="promo-item">
            <p>Con enganches hasta del</p>
            <h3>12%</h3>
          </div>
        </section>

        {/* ¿Por qué elegirnos? */}
        <section className="why-choose-us">
          <h2 className="section-title">¿POR QUÉ ELEGIRNOS?</h2>
          <div className="benefits-grid">
            <div className="benefit-card"><h3>Preparados para tu compra</h3><p>Nuestros vehículos se preparan para su entrega y darlos en su mejor estado</p></div>
            <div className="benefit-card"><h3>¿Qué opinan nuestros clientes?</h3><p>Satisfacerlos, darles seguridad y brindarles calma es nuestra máxima prioridad</p></div>
            <div className="benefit-card"><h3>Atención al cliente</h3><p>Te ofrecemos una guía de servicios fácil y rápida para ti</p></div>
            <div className="benefit-card"><h3>Sencillo</h3><p>Con nuestra asesoría, entenderás todo el proceso. Siempre estaremos atentos a ti.</p></div>
            <div className="benefit-card"><h3>Variedad</h3><p>En nuestro catálogo podrás encontrar todo tipo de vehículos.</p></div>
            <div className="benefit-card"><h3>Tú eres la prioridad</h3><p>Buscamos, mejoramos y te ofrecemos el mejor camino para ti</p></div>
            <div className="benefit-card"><h3>Ahorra tiempo y dinero</h3><p>Proceso de aprobación eficiente, veloz y eficaz.</p></div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Home;
