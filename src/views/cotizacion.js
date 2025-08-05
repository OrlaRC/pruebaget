import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useLocation, useHistory } from 'react-router-dom';
import HeaderPrivado from './component/header';
import Footer from './component/footer';
import './cotizacion.css';

const Desktop4 = () => {
  const history = useHistory();
  const { state } = useLocation();
  const [vehiculo, setVehiculo] = useState(null);
  const [mainImage, setMainImage] = useState('');
  const [thumbnails, setThumbnails] = useState([]);
  const [enganche, setEnganche] = useState('');
  const [plazo, setPlazo] = useState('');

  // Obtener id de vehículo de state o localStorage
  const idVehiculo = state?.idVehiculo || localStorage.getItem('idVehiculo');

  useEffect(() => {
    if (state?.idVehiculo) {
      localStorage.setItem('idVehiculo', state.idVehiculo);
    }
  }, [state]);

  useEffect(() => {
    if (!idVehiculo) return;
    const fetchVehiculo = async () => {
      try {
        const res = await fetch(`https://financiera-backend.vercel.app/api/catalogo/${idVehiculo}`);
        const data = await res.json();
        if (data.success) {
          setVehiculo(data.data);
          const imgs = data.data.imagenes || [];
          if (imgs.length) {
            setMainImage(imgs[0]);
            setThumbnails(imgs.slice(1));
          }
        }
      } catch (err) {
        console.error('Error fetching vehículo para cotización:', err);
      }
    };
    fetchVehiculo();
  }, [idVehiculo]);

  const calcularMensualidad = () => {
    // Lógica de cálculo (puedes adaptar)
    if (!vehiculo) return;
    const precio = parseFloat(vehiculo.precio);
    const montoEnganche = parseFloat(enganche) || 0;
    const plazoMeses = parseInt(plazo) || 1;
    const montoFinanciado = precio - montoEnganche;
    const tasaInteresAnual = 0.12; // ejemplo
    const interesMensual = tasaInteresAnual / 12;
    const mensualidad = (montoFinanciado * interesMensual) /
      (1 - Math.pow(1 + interesMensual, -plazoMeses));
    alert(`Tu mensualidad sería: $${mensualidad.toFixed(2)}`);
  };

  if (!vehiculo) {
    return (
      <>
        <HeaderPrivado />
        <div className="desktop4-loading">Cargando datos para cotización...</div>
        <Footer />
      </>
    );
  }

  return (
    <div className="desktop4-container">
      <Helmet>
        <title>Cotización | CarsGet</title>
      </Helmet>

      <HeaderPrivado />

      <main className="desktop4-main">
        <section className="desktop4-cotiza">
          <h2 className="desktop4-subtitulo">COTIZA JUSTO AQUÍ</h2>

          <div className="desktop4-input-field">
            <label>PRECIO:</label>
            <input
              type="text"
              value={`$${parseFloat(vehiculo.precio).toLocaleString()}`}
              disabled
            />

            <label>Monto de enganche</label>
            <input
              type="number"
              placeholder="20000"
              value={enganche}
              onChange={e => setEnganche(e.target.value)}
            />

            <label>Meses de plazo</label>
            <input
              type="number"
              placeholder="60"
              value={plazo}
              onChange={e => setPlazo(e.target.value)}
            />

            <button
              className="desktop4-button"
              onClick={calcularMensualidad}
            >
              CALCULA TU MENSUALIDAD
            </button>
            <Link to="/solicitud-credito">
              <button className="desktop4-button">
                SOLICITUD DE CRÉDITO
              </button>
            </Link>
          </div>

          <div className="desktop4-requisitos">
            <h3>Requisitos</h3>
            <ul>
              <li>Comprobante de ingresos</li>
              <li>Investigación socioeconómica en línea</li>
              <li>Capacidad de pagos</li>
              <li>INE, CURP, referencias personales</li>
              <li>Enganche inicial</li>
              <li>GPS inmovilizador (con contrato)</li>
              <li>Seguro vehicular y de vida</li>
            </ul>
          </div>
        </section>

        <section className="desktop4-galeria">
          {mainImage && <img src={mainImage} alt="Principal" />}
          {thumbnails.map((src, i) => (
            <img key={i} src={src} alt={`Vista ${i+2}`} />
          ))}
        </section>

        <section className="desktop4-descripcion">
          <h2>Descripción del Vehículo</h2>
          <p className="desktop4-texto-descripcion">
            {vehiculo.descripcion}
          </p>

          <ul className="desktop4-especificaciones">
            {vehiculo.caracteristicas
              ?.split(', ')
              .map((c, i) => <li key={i}>✔ {c}</li>)}
          </ul>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Desktop4;
