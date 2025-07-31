import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useHistory } from 'react-router-dom';
import Footer from './component/footer';
import Header from './component/header'; // Cambiar a Header (público)
import './inicio_sesion.css';

const InicioSesion = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const history = useHistory();

  const handleLogin = (e) => {
    e.preventDefault();
    if (!email || !password) {
      alert('Por favor llena todos los campos');
      return;
    }

    // Simulación de autenticación local
    const magicPassword = '1234';
    let idRol = 0;

    if (password === magicPassword) {
      if (email === 'irving@gmail.com') {
        idRol = 1; // Administrador
      } else if (email === 'diego@gmail.com') {
        idRol = 2; // Vendedor
      } else if (email === 'angel@gmail.com') {
        idRol = 3; // Cliente
      } else {
        idRol = 0; // No reconocido
      }

      if (idRol > 0) {
        // Guardar un token simulado en localStorage
        const token = `simulated-token-${email}-${idRol}`;
        localStorage.setItem('token', token);
        // Opcional: Guardar el rol para usarlo en otras vistas
        localStorage.setItem('idRol', idRol);

        if (idRol === 1) {
          history.push('/dashboard');
        } else if (idRol === 2) {
          history.push('/dashboard-vendedor');
        } else if (idRol === 3) {
          history.push('/'); // Redirigir a la página principal para clientes
        }
        alert('Inicio de sesión exitoso');
      } else {
        alert('Correo no reconocido');
      }
    } else {
      alert('Contraseña incorrecta. Usa 1234');
    }
  };

  return (
    <div className="desktop3-container">
      <Helmet>
        <title>Inicio de sesión</title>
      </Helmet>

      <div className="desktop3-desktop">
        <Header /> {/* Usar Header público */}

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

        {/* Formulario */}
        <form className="desktop3-form-contact" onSubmit={handleLogin}>
          <div className="desktop3-input-field">
            <label htmlFor="email" className="desktop3-text40">Correo Electrónico</label>
            <input
              id="email"
              type="email"
              placeholder="ejemplo@gmail.com"
              className="desktop3-input1"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="desktop3-group44">
            <label htmlFor="password" className="desktop3-text41">Contraseña</label>
            <input
              id="password"
              type="password"
              placeholder="Contraseña"
              className="desktop3-input2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button className="desktop3-button3" type="submit">
            <span className="desktop3-text42">Confirmar</span>
          </button>
          <button
            className="desktop3-button4"
            type="button"
            onClick={() => alert('Integración con Google pendiente')}
          >
            <img
              src="/external/google1317054511267-rgmw-200h.png"
              alt="Google Icon"
              className="desktop3-google131705451"
            />
            <span className="desktop3-text43">Inicia con Google</span>
          </button>
        </form>

        {/* Botones secundarios */}
        <div className="desktop3-actions">
          <div className="desktop3-secondary-buttons">
            <button
              className="desktop3-button2"
              onClick={() => history.push('/')}
            >
              <span className="desktop3-text39">Regresa</span>
            </button>
            <button
              className="desktop3-button1"
              onClick={() => history.push('/registro')}
            >
              <span className="desktop3-text38">Regístrate</span>
            </button>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default InicioSesion;