// src/views/Perfil.js
import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import HeaderPrivado from './component/headerPrivado';
import Footer from './component/footer';
import { Helmet } from 'react-helmet';
import './perfil.css';

const Perfil = () => {
  const history = useHistory();
  const [userData, setUserData] = useState({
    nombre: '',
    email: '',
    telefono: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token, redirecting to /login');
      history.push('/login');
      return;
    }

    // Simular datos del usuario basados en el token
    const email = token.split('-')[2]; // Extraer el correo del token simulado
    const simulatedUserData = {
      nombre: email === 'angel@gmail.com' ? 'Angel Cliente' : 'Usuario Desconocido',
      email: email,
      telefono: '1234567890',
    };

    setTimeout(() => {
      setUserData(simulatedUserData);
      setLoading(false);
    }, 1000); // Simular una carga de datos
  }, [history]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Simular actualización de datos
    setSuccessMessage('Perfil actualizado correctamente');
    setTimeout(() => setSuccessMessage(null), 3000);
    console.log('Datos actualizados:', userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('idRol');
    history.push('/login');
  };

  return (
    <div className="desktop-container">
      <Helmet>
        <title>Perfil - Cars Get Financiamiento</title>
        <meta name="description" content="Administra tu perfil y actualiza tus datos personales" />
      </Helmet>

      <HeaderPrivado />

      <main>
        <section className="perfil-section">
          <h2 className="section-title">Mi Perfil</h2>
          {loading && <p>Cargando datos...</p>}
          {error && <p className="error-message">{error}</p>}
          {successMessage && <p className="success-message">{successMessage}</p>}

          {!loading && !error && (
            <div className="form-container">
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="nombre">Nombre</label>
                  <input
                    type="text"
                    name="nombre"
                    value={userData.nombre}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Correo Electrónico</label>
                  <input
                    type="email"
                    name="email"
                    value={userData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="telefono">Teléfono</label>
                  <input
                    type="tel"
                    name="telefono"
                    value={userData.telefono}
                    onChange={handleInputChange}
                  />
                </div>
                <button type="submit" className="submit-button">
                  Guardar Cambios
                </button>
              </form>
              <button className="logout-button" onClick={handleLogout}>
                Cerrar Sesión
              </button>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Perfil;