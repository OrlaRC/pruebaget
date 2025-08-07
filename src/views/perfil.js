import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import Header from './component/header';
import Footer from './component/footer';
import { Helmet } from 'react-helmet';
import './perfil.css';

const Perfil = () => {
  const history = useHistory();
  const [userData, setUserData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    direccion: '',
    password: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      history.push('/login');
      return;
    }

    const storedUser = JSON.parse(localStorage.getItem('user'));
    console.log('User from localStorage:', storedUser);

    if (!storedUser) {
      setError('No se encontró información del usuario en localStorage');
      setLoading(false);
      return;
    }

    // Aquí obtén el id de usuario correcto según la propiedad que tenga storedUser
    const userId = storedUser.id || storedUser.idUsuario || storedUser.userId;
    if (!userId) {
      setError('No se encontró el id del usuario en localStorage');
      setLoading(false);
      return;
    }

    // Petición GET para obtener los datos actualizados del usuario
    fetch(`https://financiera-backend.vercel.app/api/usuarios/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Error al obtener perfil: ${res.statusText}`);
        }
        const data = await res.json();
        return data;
      })
      .then((data) => {
        // Ajusta esto según la estructura real de la respuesta
        setUserData({
          nombre: data.nombre || '',
          email: data.email || storedUser.email || '',
          telefono: data.telefono || '',
          direccion: data.direccion || '',
          password: '' // Nunca llenes la contraseña por seguridad
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error('Fallo al obtener datos de usuario:', err);
        // En caso de error, usar datos de localStorage si existen
        setUserData({
          nombre: storedUser.nombre || '',
          email: storedUser.email || '',
          telefono: storedUser.telefono || '',
          direccion: storedUser.direccion || '',
          password: ''
        });
        setError('No se pudo obtener datos desde la API, mostrando datos guardados.');
        setLoading(false);
      });
  }, [history]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    try {
      const token = localStorage.getItem('accessToken');
      const storedUser = JSON.parse(localStorage.getItem('user'));
      const userId = storedUser.id || storedUser.idUsuario || storedUser.userId;

      const response = await fetch(`https://financiera-backend.vercel.app/api/usuarios/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          nombre: userData.nombre,
          telefono: userData.telefono,
          direccion: userData.direccion,
          password: userData.password,
          idRol: 3,
          estado: 'activo'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar perfil');
      }

      setSuccessMessage('Perfil actualizado correctamente');

      // Actualizar localStorage con datos nuevos excepto password
      localStorage.setItem(
        'user',
        JSON.stringify({
          ...storedUser,
          nombre: userData.nombre,
          telefono: userData.telefono,
          direccion: userData.direccion
        })
      );
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="desktop-container">
      <Helmet>
        <title>Perfil - Cars Get Financiamiento</title>
        <meta name="description" content="Administra tu perfil y actualiza tus datos personales" />
      </Helmet>

      <Header />

      <main>
        <section className="perfil-section">
          <h2 className="section-title">Mi Perfil</h2>
          {loading && <p>Cargando datos...</p>}
          {error && <p className="error-message">{error}</p>}
          {successMessage && <p className="success-message">{successMessage}</p>}

          {!loading && (
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
                  <input type="email" name="email" value={userData.email} readOnly />
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

                <div className="form-group">
                  <label htmlFor="direccion">Dirección</label>
                  <input
                    type="text"
                    name="direccion"
                    value={userData.direccion}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="password">Contraseña</label>
                  <input
                    type="password"
                    name="password"
                    value={userData.password}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <button type="submit" className="submit-button">
                  Guardar Cambios
                </button>
              </form>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Perfil;
