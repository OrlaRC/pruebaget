import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useHistory } from 'react-router-dom';
import HeaderPrivado from './component/headerPrivado';
import Footer from './component/footer';
import Header from './component/header'; // Cambiar a Header (público)
import './inicio_sesion.css';

const InicioSesion = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const history = useHistory();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password) {
      setErrorMsg('⚠️ Por favor llena todos los campos');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('https://financiera-backend.vercel.app/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const { data, message } = await res.json();
      if (!res.ok) {
        // Mensaje corregido para login fallido
        setErrorMsg(message || '❌ Contraseña o correo incorrectos');
        return;
      }

      const { accessToken, refreshToken, user } = data;

      // Guardar tokens y usuario
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));

      // Redirigir según rol
      if (user.idRol === 1) {
        history.push('/dashboard');
        } else if (user.idRol === 2) {
          history.push('/dashboard-vendedor');
        } else if (user.idRol === 3) {
          history.push('/'); // Redirigir a la página principal para clientes
        } else {
          history.push('/');
        }
      }
    catch (error) {
      console.error(error);
      setErrorMsg('❌ Error de conexión con el servidor.');
    } finally {
      setLoading(false);
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

        <form className="desktop3-form-contact" onSubmit={handleLogin}>
          {errorMsg && <p className="desktop3-error">{errorMsg}</p>}
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
          <button className="desktop3-button3" type="submit" disabled={loading}>
            <span className="desktop3-text42">
              {loading ? 'Procesando...' : 'Confirmar'}
            </span>
          </button>
          <button
            className="desktop3-button4"
            type="button"
            onClick={() => window.location.href = 'https://financiera-backend.vercel.app/api/auth/google'}
          >
            <img
              src="/external/google1317054511267-rgmw-200h.png"
              alt="Google Icon"
              className="desktop3-google131705451"
            />
            <span className="desktop3-text43">Inicia con Google</span>
          </button>
        </form>

        <div className="desktop3-actions">
          <div className="desktop3-secondary-buttons">
            <button className="desktop3-button2" onClick={() => history.push('/')}>Regresa</button>
            <button className="desktop3-button1" onClick={() => history.push('/registro')}>Regístrate</button>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default InicioSesion;
