import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useHistory, useLocation } from 'react-router-dom';
import HeaderPrivado from './component/headerPrivado';
import Footer from './component/footer';
import './info_auto.css';

const InfoAuto = () => {
  const history = useHistory();
  const { state } = useLocation();

  const [vehiculo, setVehiculo] = useState(null);
  const [brandName, setBrandName] = useState('');
  const [mainImage, setMainImage] = useState('');
  const [thumbnails, setThumbnails] = useState([]);
  const [otrosVehiculos, setOtrosVehiculos] = useState([]);

  const idFromState = state?.idVehiculo;
  const storedId = localStorage.getItem('idVehiculo');
  const idVehiculo = idFromState || storedId;

  useEffect(() => {
    if (idFromState) localStorage.setItem('idVehiculo', idFromState);
  }, [idFromState]);

  useEffect(() => {
    if (!idVehiculo) return;
    fetch(`http://localhost:3000/api/catalogo/${idVehiculo}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const v = data.data;
          setVehiculo(v);

          const imgs = v.imagenes || [];
          if (imgs.length) {
            setMainImage(imgs[0]);
            setThumbnails(imgs.slice(1));
          }

          if (v.idMarca) {
            fetch(`http://localhost:3000/api/marcas/${v.idMarca}`)
              .then(r => r.json())
              .then(bd => setBrandName(bd.data?.nombre_marca || ''))
              .catch(() => setBrandName(''));
          }
        }
      })
      .catch(err => console.error(err));
  }, [idVehiculo]);

  useEffect(() => {
    fetch('http://localhost:3000/api/catalogo')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const otros = data.data.filter(v => v.idVehiculo !== idVehiculo).slice(0, 5);
          setOtrosVehiculos(otros);
        }
      })
      .catch(err => console.error(err));
  }, [idVehiculo]);

  if (!idVehiculo) return <div>No se ha especificado el vehículo.</div>;
  if (!vehiculo) return <div>Cargando información del vehículo...</div>;

  const handleThumbnailClick = idx => {
    const clicked = thumbnails[idx];
    const newThumbs = [...thumbnails];
    newThumbs[idx] = mainImage;
    setMainImage(clicked);
    setThumbnails(newThumbs);
  };

  const caracteristicasList = vehiculo.caracteristicas
    ? vehiculo.caracteristicas.split(',').map(item => item.trim())
    : [];

  return (
    <div className="desktop2-container">
      <Helmet>
        <title>{vehiculo.modelo} | CARS GET</title>
      </Helmet>

      <HeaderPrivado />

      <main className="desktop2-main">
        <div className="titulo-busqueda">
          <h1>{vehiculo.modelo} {vehiculo.version}</h1>
        </div>

        <div className="detalle-principal">
          <section className="galeria-principal">
            <div className="imagen-principal">
              <img src="/external/rectangle34750521211-zpe8-1000h.png" alt="Fondo del vehículo" />
              <img src={mainImage} alt="Principal" className="vehiculo" />
            </div>
            <div className="miniaturas">
              {thumbnails.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt={`Vista ${i + 2}`}
                  onClick={() => handleThumbnailClick(i)}
                  style={{ cursor: 'pointer' }}
                />
              ))}
            </div>
          </section>

          <section className="info-vehiculo descripcion-ancha">
            <h2>Descripción</h2>
            <ul>
              <li><strong>Marca:</strong> {brandName}</li>
              <li><strong>Modelo:</strong> {vehiculo.modelo}</li>
              <li><strong>Versión:</strong> {vehiculo.version}</li>
              <li><strong>Año:</strong> {vehiculo.ano}</li>
              <li><strong>Transmisión:</strong> {vehiculo.transmision}</li>
              <li><strong>Kilometraje:</strong> {vehiculo.kilometraje} km</li>
              <li><strong>Combustible:</strong> {vehiculo.tipoCombustible}</li>
            </ul>
            <p className="descripcion-detalle">{vehiculo.descripcion}</p>

            {caracteristicasList.length > 0 && (
              <>
                <h2>Características</h2>
                <ul>
                  {caracteristicasList.map((carac, i) => (
                    <li key={i}>{carac}</li>
                  ))}
                </ul>
              </>
            )}

            <p className="precio" style={{ marginTop: '1rem', fontWeight: 'bold', fontSize: '1.5rem' }}>
              Precio: ${parseFloat(vehiculo.precio).toLocaleString()}
            </p>

            <button className="cotiza-btn" onClick={() => history.push('/cotizacion')}>
              ¡COTIZA AHORA!
            </button>
          </section>
        </div>

        <section className="otros-vehiculos" style={{ textAlign: 'center' }}>
          <h2>OTROS VEHÍCULOS</h2>
          <div
            className="galeria-otros"
            style={{
              display: 'flex',
              gap: '1rem',
              flexWrap: 'wrap',
              justifyContent: 'center',
              marginTop: '1rem',
            }}
          >
            {otrosVehiculos.map(auto => (
              <div
                key={auto.idVehiculo}
                className="producto"
                style={{
                  width: '180px',
                  border: '1px solid #ccc',
                  borderRadius: '8px',
                  padding: '1rem',
                  boxSizing: 'border-box',
                  textAlign: 'center',
                }}
              >
                {auto.imagenes && auto.imagenes[0] && (
                  <img
                    src={auto.imagenes[0]}
                    alt={auto.modelo}
                    style={{
                      width: '100%',
                      height: 'auto',
                      marginBottom: '0.5rem',
                      borderRadius: '4px',
                    }}
                  />
                )}
                <span className="marca" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  {auto.modelo}
                </span>
                <span className="año" style={{ display: 'block', marginBottom: '0.5rem' }}>
                  {auto.ano}
                </span>
                <button
                  className="mas-info"
                  onClick={() => {
                    window.location.href = `/info-auto?idVehiculo=${auto.idVehiculo}`;
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  Más información
                </button>

              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default InfoAuto;
