import React, { useState, useEffect } from 'react';
import { Link, useHistory, useLocation } from 'react-router-dom';
import './header.css';

const Header = () => {
  const history = useHistory();
  const location = useLocation();
  const path = location.pathname;
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    // Verificar si hay token en localStorage
    const token = localStorage.getItem('accessToken');
    setIsLoggedIn(!!token);

    // Leer idUsuario directamente desde localStorage igual que en Desktop4.js
    const storedUserId = localStorage.getItem('idUsuario');
    if (storedUserId) {
      setUserId(parseInt(storedUserId, 10));
    } else {
      setUserId(null);
    }
  }, [location]);

  const handleLogoClick = () => {
    history.push('/');
  };

  const handleLogout = () => {
    // Eliminar tokens y redirigir
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('idUsuario');
    setIsLoggedIn(false);
    setUserId(null);
    history.push('/');
  };

  return (
    <header className="header-main">
      <div
        className="header-logo-container"
        onClick={handleLogoClick}
        style={{ cursor: 'pointer' }}
      >
        <img
          src="/external/logo1390-enlh-200h.png"
          alt="Cars Get Financiamiento"
          className="header-logo"
        />
        <h1 className="header-company-name">
          <span>CARS</span> <span>GET</span> <br />
          <span className="header-financiamiento">
            FINANCIAMIENTO
          </span>
        </h1>
      </div>

      <nav className="header-nav-menu">
        {path !== '/catalogo' && <Link to="/catalogo" className="header-nav-link">Catálogo</Link>}
        {path !== '/contacto' && <Link to="/contacto" className="header-nav-link">Contacto</Link>}
        {path !== '/testimonios' && <Link to="/testimonios" className="header-nav-link">Testimonios</Link>}
        {path !== '/sucursales' && <Link to="/sucursales" className="header-nav-link">Sucursales</Link>}
        {isLoggedIn ? (
          <>
            {path !== '/perfil' && (
              <Link
                to={{
                  pathname: '/perfil',
                  state: { idCliente: userId }, // pasamos idUsuario igual que Desktop4.js
                }}
                className="header-nav-link"
              >
                Perfil
              </Link>
            )}
            <button onClick={handleLogout} className="header-primary-button">
              Cerrar sesión
            </button>
          </>
        ) : (
          path !== '/login' && (
            <Link to="/login" className="header-primary-button">
              Iniciar sesión
            </Link>
          )
        )}
      </nav>
    </header>
  );
};

export default Header;
