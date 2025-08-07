import React, { useState, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import Header from './component/header';
import Footer from './component/footer';
import { Helmet } from 'react-helmet';
import './perfil.css';

const Perfil = () => {
  const history = useHistory();
  const { state } = useLocation();

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

    const idClienteFromState = state?.idCliente;
    let idCliente = idClienteFromState;

    if (!idCliente) {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      idCliente = storedUser?.id || storedUser?.idUsuario || storedUser?.userId;
    }

    if (!idCliente) {
      setError('No se encontró el id del usuario.');
      setLoading(false);
      return;
    }

    fetch(`http://localhost:3000/ https://financiera-backend.vercel.app/api/usuarios/${idCliente}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(async (res) => {
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Error al obtener perfil: ${res.status} - ${errorText}`);
        }
        return res.json();
      })
      .then((data) => {
        if (data.success && data.data) {
          setUserData({
            nombre: data.data.nombre || '',
            email: data.data.email || '',
            telefono: data.data.telefono || '',
            direccion: data.data.direccion || '',
            password: ''
          });
          setError(null);
        } else {
          setError(data.message || 'Error al obtener datos del usuario.');
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error al obtener datos de usuario:', err);
        const storedUser = JSON.parse(localStorage.getItem('user')) || {};
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
  }, [history, state]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    try {
      const token = localStorage.getItem('accessToken');

      const idClienteFromState = state?.idCliente;
      let idCliente = idClienteFromState;

      if (!idCliente) {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        idCliente = storedUser?.id || storedUser?.idUsuario || storedUser?.userId;
      }

      if (!idCliente) {
        setError('No se encontró el id del usuario.');
        return;
      }

      // Construye payload sin incluir password si está vacío
      const payload = {
        nombre: userData.nombre,
        telefono: userData.telefono,
        direccion: userData.direccion,
        idRol: 3,
        estado: 'activo'
      };

      if (userData.password) {
        payload.password = userData.password;
      }

      const response = await fetch(`http://localhost:3000/ https://financiera-backend.vercel.app/api/usuarios/${idCliente}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        let errorMessage = 'Error al actualizar perfil';

        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
          } else {
            const errorText = await response.text();
            errorMessage = errorText || errorMessage;
          }
        } catch (e) {
          errorMessage = 'Error desconocido del servidor';
        }

        throw new Error(errorMessage);
      }

      setSuccessMessage('Perfil actualizado correctamente');

      const storedUser = JSON.parse(localStorage.getItem('user')) || {};
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
                    placeholder="Dejar en blanco para mantener la actual"
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
