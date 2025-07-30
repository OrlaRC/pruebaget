import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useHistory } from 'react-router-dom';
import Footer from './component/footer';
import './registro.css';
import HeaderPrivado from './component/headerPrivado';

const Registro = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');

    if (formData.password !== formData.confirmPassword) {
      setMensaje('⚠️ Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:3000/api/usuarios/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nombre: formData.nombre,
          email: formData.email,
          password: formData.password
        })
      });

      const data = await res.json();

      if (res.ok) {
        // Guardar tokens si quieres usarlos
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('user', JSON.stringify(data.user));

        // Redirigir de nuevo a registro (forzoso)
        window.location.href = '/registro';
      } else {
        setMensaje(`❌ Error: ${data.message || 'No se pudo registrar.'}`);
      }
    } catch (error) {
      setMensaje('❌ Error de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="desktop-container">
      <Helmet>
        <title>CARS GET</title>
      </Helmet>

      <HeaderPrivado />

      <h1 className="desktop-text48">¡Únete solo a lo mejor!</h1>

      <section className="desktop3-group5">
        <img
          alt="carsgetlogo"
          src="/external/carsgetlogo11268-be6i-300h.png"
          className="desktop3-carsgetlogo1"
        />
        <div className="desktop3-group1">
          <h1 className="desktop3-logo-line1">
            <span className="text-orange">CARS</span><span className="text-black"> GET</span>
          </h1>
          <h2 className="desktop3-logo-line2">FINANCIAMIENTO</h2>
        </div>
      </section>

      <section className="desktop-form-contact">
        <form onSubmit={handleSubmit}>
          <div className="desktop-input-field">
            <label htmlFor="nombre">Nombre</label>
            <input
              id="nombre"
              type="text"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Nombre completo"
              className="desktop-input"
              required
            />
          </div>
          <div className="desktop-input-field">
            <label htmlFor="email">Correo Electrónico</label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="ejemplo@gmail.com"
              className="desktop-input"
              required
            />
          </div>
          <div className="desktop-input-field">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Al menos 8 caracteres"
              className="desktop-input"
              minLength={8}
              required
            />
          </div>
          <div className="desktop-input-field">
            <label htmlFor="confirmPassword">Confirma Contraseña</label>
            <input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Repite la contraseña"
              className="desktop-input"
              minLength={8}
              required
            />
          </div>
          <button type="submit" className="desktop-button primary" disabled={loading}>
            {loading ? 'Registrando...' : 'Confirmar'}
          </button>
        </form>

        {mensaje && <p className="desktop-message">{mensaje}</p>}

        <button
          type="button"
          className="desktop-button google-button"
          onClick={() => {
            window.location.href = 'http://localhost:3000/api/auth/google';
          }}
        >
          <img
            src="/external/google1317054511267-rgmw-200h.png"
            alt="Google icon"
            className="google-icon"
          />
          <span>Registrarse con Google</span>
        </button>
      </section>

      <Footer />
    </div>
  );
};

export default Registro;