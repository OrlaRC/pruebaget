/* src/pages/Desktop4.js */
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useLocation, useHistory } from 'react-router-dom';
import HeaderPrivado from './component/header';
import Footer from './component/footer';
import Modal from 'react-modal';
import './cotizacion.css';

const Desktop4 = () => {
  const history = useHistory();
  const { state } = useLocation();
  const [vehiculo, setVehiculo] = useState(null);
  const [mainImage, setMainImage] = useState('');
  const [thumbnails, setThumbnails] = useState([]);
  const [enganche, setEnganche] = useState('');
  const [plazo, setPlazo] = useState('');
  const [mensualidad, setMensualidad] = useState(null);
  const [modalMessage, setModalMessage] = useState('');
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [idCliente, setIdCliente] = useState(null);
  const [cotizacionEnviada, setCotizacionEnviada] = useState(false);

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
        const res = await fetch(`http://localhost:3000/ https://financiera-backend.vercel.app/api/catalogo/${idVehiculo}`);
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

  const abrirModal = (mensaje) => {
    setModalMessage(mensaje);
    setModalIsOpen(true);
  };

  const cerrarModal = () => {
    setModalIsOpen(false);
    setModalMessage('');
  };

  const validarDatos = (engancheNum, plazoNum, precio) => {
    if (isNaN(engancheNum) || engancheNum < 0) {
      abrirModal('El monto de enganche debe ser un número válido y mayor o igual a 0.');
      return false;
    }
    if (isNaN(plazoNum) || ![12, 24, 36, 48, 60].includes(plazoNum)) {
      abrirModal('El plazo debe ser uno de los valores permitidos: 12, 24, 36, 48, 60 meses.');
      return false;
    }
    if (engancheNum > precio) {
      abrirModal('El monto de enganche no puede ser mayor al precio del vehículo.');
      return false;
    }

    // Validaciones según reglas backend
    if (precio >= 160000 && precio <= 200000 && engancheNum < 20000) {
      abrirModal('El enganche debe ser al menos de 20,000 para precios netos entre 160,000 y 200,000.');
      return false;
    }
    if (precio > 200000 && engancheNum < precio * 0.1) {
      abrirModal(`El enganche debe ser al menos el 10% del precio neto cuando el precio es mayor a $${precio.toLocaleString()}.`);
      return false;
    }

    if (engancheNum > precio * 0.5) {
      abrirModal('El enganche no puede ser mayor al 50% del precio neto del vehículo.');
      return false;
    }

    return true;
  };

  const calcularMensualidad = () => {
    if (enganche === '') {
      abrirModal('Por favor, ingresa el monto de enganche.');
      return;
    }
    if (plazo === '') {
      abrirModal('Por favor, selecciona un plazo válido.');
      return;
    }

    const montoEngancheNum = parseFloat(enganche);
    const plazoNum = parseInt(plazo);
    const precio = parseFloat(vehiculo.precio);

    if (!validarDatos(montoEngancheNum, plazoNum, precio)) {
      return;
    }

    const restante = precio - montoEngancheNum;
    const mensual = restante / plazoNum;

    setMensualidad(mensual);
  };

  const enviarCotizacion = async () => {
    if (mensualidad === null) {
      abrirModal('Primero calcula la mensualidad antes de enviar la cotización.');
      return;
    }

    const precio = parseFloat(vehiculo.precio);
    const montoEngancheNum = parseFloat(enganche);
    const plazoNum = parseInt(plazo);
    const accessToken = localStorage.getItem('accessToken');
    const clienteId = parseInt(localStorage.getItem('idUsuario'), 10);

    if (!accessToken) {
      abrirModal('No estás autenticado. Por favor inicia sesión.');
      return;
    }

    if (!clienteId) {
      abrirModal('No se encontró el id de usuario. Por favor inicia sesión de nuevo.');
      return;
    }

    if (!validarDatos(montoEngancheNum, plazoNum, precio)) {
      return;
    }

    setIdCliente(clienteId);

    const payload = {
      idCliente: clienteId,
      idVehiculo: vehiculo.idVehiculo,
      idVendedor: vehiculo.idVendedor,
      enganche: montoEngancheNum,
      plazos: plazoNum,
      whatsapp: "",
      estatus: "pendiente",
      precioNeto: precio
    };

    try {
      const res = await fetch('http://localhost:3000/ https://financiera-backend.vercel.app/api/cotizaciones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify(payload)
      });

      const result = await res.json();

      if (res.ok) {
        abrirModal('Cotización enviada correctamente.');
        setCotizacionEnviada(true);
      } else {
        abrirModal(result.message || 'Error al enviar la cotización.');
      }
    } catch (error) {
      abrirModal('Error de red al enviar la cotización.');
      console.error(error);
    }
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
            <input type="text" value={`$${parseFloat(vehiculo.precio).toLocaleString()}`} disabled />

            <label>Monto de enganche</label>
            <input
              type="number"
              placeholder="20000"
              value={enganche}
              onChange={e => setEnganche(e.target.value)}
            />

            <label>Meses de plazo</label>
            <select value={plazo} onChange={e => setPlazo(e.target.value)}>
              <option value="">Selecciona plazo</option>
              <option value="12">12</option>
              <option value="24">24</option>
              <option value="36">36</option>
              <option value="48">48</option>
              <option value="60">60</option>
            </select>

            {mensualidad !== null && (
              <>
                <label>Mensualidad:</label>
                <input
                  type="text"
                  value={`$${Number(mensualidad).toLocaleString()}`}
                  disabled
                />
              </>
            )}

            <button
              className="desktop4-button"
              onClick={calcularMensualidad}
              style={{ minWidth: '180px' }}
            >
              CALCULAR MENSUALIDAD
            </button>

            <button
              className="desktop4-button"
              onClick={enviarCotizacion}
              disabled={mensualidad === null}
              title={mensualidad === null ? "Primero calcula la mensualidad" : ""}
              style={{
                opacity: mensualidad === null ? 0.5 : 1,
                cursor: mensualidad === null ? 'not-allowed' : 'pointer',
                minWidth: '180px',
              }}
            >
              ENVIAR COTIZACIÓN
            </button>

            {cotizacionEnviada && (
              <Link to={{
                pathname: "/solicitud-credito",
                state: {
                  idCliente,
                  cotizacionData: {
                    idVehiculo: vehiculo.idVehiculo,
                    idVendedor: vehiculo.idVendedor,
                    enganche: parseFloat(enganche),
                    plazos: parseInt(plazo),
                    precioNeto: parseFloat(vehiculo.precio),
                    mensualidad: mensualidad
                  }
                }
              }}>
                <button className="desktop4-button" style={{ marginTop: '1rem' }}>
                  SOLICITUD DE CRÉDITO
                </button>
              </Link>
            )}
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
            <img key={i} src={src} alt={`Vista ${i + 2}`} />
          ))}
        </section>

        <section className="desktop4-descripcion">
          <h2>Descripción del Vehículo</h2>
          <p className="desktop4-texto-descripcion">
            {vehiculo.descripcion}
          </p>
          <ul className="desktop4-especificaciones">
            {vehiculo.caracteristicas?.split(', ').map((c, i) => <li key={i}>✔ {c}</li>)}
          </ul>
        </section>
      </main>

      <Footer />

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={cerrarModal}
        className="custom-modal"
        overlayClassName="custom-modal-overlay"
      >
        <div style={{ padding: '1rem', textAlign: 'center' }}>
          <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>{modalMessage}</p>
          <button
            onClick={cerrarModal}
            style={{
              backgroundColor: '#f8791d',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            Cerrar
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Desktop4;
