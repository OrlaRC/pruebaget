import React from 'react';
import { Helmet } from 'react-helmet';
import { useHistory } from 'react-router-dom';
import Footer from './component/footer';
import './registro.css';
import HeaderPrivado from './component/headerPrivado';

const Registro = () => {
  const history = useHistory();

  const handleSubmit = (e) => {
    e.preventDefault();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    // Validación: contraseña debe tener al menos 8 caracteres
    if (password.length < 8) {
      alert('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    // Validación: contraseñas deben coincidir
    if (password !== confirmPassword) {
      alert('Las contraseñas no coinciden.');
      return;
    }

    // Si pasa las validaciones, redirige a /login
    history.push('/login');
  };

  return (
    <div className="desktop-container">
      <Helmet>
        <title>CARS GET</title>
      </Helmet>

      <HeaderPrivado />

      {/* Form Title */}
      <h1 className="desktop-text48">¡Únete solo a lo mejor!</h1>

      {/* Logo grande */}
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

      {/* Contact Form */}
      <section className="desktop-form-contact">
        <form onSubmit={handleSubmit}>
          <div className="desktop-input-field">
            <label htmlFor="nombre">Nombre</label>
            <input
              id="nombre"
              type="text"
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
              placeholder="Al menos 8 caracteres"
              className="desktop-input"
              minLength={8}
              required
            />
          </div>
          <div className="desktop-input-field">
            <label htmlFor="confirm-password">Confirma Contraseña</label>
            <input
              id="confirm-password"
              type="password"
              placeholder="Repite la contraseña"
              className="desktop-input"
              minLength={8}
              required
            />
          </div>
          <button type="submit" className="desktop-button primary">
            Confirmar
          </button>
        </form>

        <button type="button" className="desktop-button google-button">
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