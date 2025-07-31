import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Header from './component/header';
import HeaderPrivado from './component/headerPrivado';
import Footer from './component/footer';
import './testimonios.css';

const testimonios = [
  {
    nombre: 'Luis Martínez',
    comentario: 'Comprar mi auto con CARS GET fue rápido y sencillo. El financiamiento me permitió adquirir el coche que necesitaba sin complicaciones.',
    ciudad: 'Guadalajara, Jalisco',
  },
  {
    nombre: 'Ana López',
    comentario: 'Excelente atención al cliente. Me guiaron durante todo el proceso y ahora disfruto de mi auto nuevo.',
    ciudad: 'Monterrey, Nuevo León',
  },
  {
    nombre: 'Carlos Ramírez',
    comentario: 'Los plazos y opciones de pago se ajustaron perfectamente a mis necesidades. Muy recomendado.',
    ciudad: 'CDMX',
  },
];

const Testimonios = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  useEffect(() => {
    const checkAuth = () => {
      setIsAuthenticated(!!localStorage.getItem('token'));
    };
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  return (
    <div className="testimonios-page">
      <Helmet>
        <title>Testimonios | CARS GET</title>
        <meta name="description" content="Conoce las experiencias de nuestros clientes con Cars Get" />
      </Helmet>

      {isAuthenticated ? <HeaderPrivado /> : <Header />}

      <main className="testimonios-main">
        <h2 className="testimonios-title">Testimonios</h2>

        <div className="testimonios-grid">
          {testimonios.map((testimonio, index) => (
            <div key={index} className="testimonio-item">
              <p className="testimonio-comentario">"{testimonio.comentario}"</p>
              <p className="testimonio-nombre">- {testimonio.nombre}</p>
              <p className="testimonio-ciudad">{testimonio.ciudad}</p>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Testimonios;