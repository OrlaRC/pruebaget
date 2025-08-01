import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { useHistory, useLocation } from 'react-router-dom';
import HeaderPrivado from './component/header';
import Footer from './component/footer';
import './info_auto.css';

const InfoAuto = () => {
  const history = useHistory();
  const { state } = useLocation();
  const titleRef = useRef(null);

  const [vehiculo, setVehiculo] = useState(null);
  const [brandName, setBrandName] = useState('');
  const [mainImage, setMainImage] = useState('');
  const [thumbnails, setThumbnails] = useState([]);
  const [otrosVehiculos, setOthers] = useState([]);

  const idFromState = state?.idVehiculo;
  const storedId = localStorage.getItem('idVehiculo');
  const idVehiculo = idFromState || storedId;

  useEffect(() => {
    if (idFromState) localStorage.setItem('idVehiculo', idFromState);
  }, [idFromState]);

  useEffect(() => {
    if (!idVehiculo) return;
    const fetchVehiculo = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/catalogo/${idVehiculo}`);
        const { success, data: v } = await res.json();
        if (success) {
          setVehiculo(v);
          const imgs = v.imagenes || [];
          if (imgs.length) {
            setMainImage(imgs[0]);
            setThumbnails(imgs.slice(1));
          }
          if (v.idMarca) {
            const r = await fetch(`http://localhost:3000/api/marcas/${v.idMarca}`);
            const { data: bd } = await r.json();
            setBrandName(bd?.nombre_marca || '');
          }
        } else {
          setVehiculo(null);
        }
      } catch {
        setVehiculo(null);
      }
    };
    fetchVehiculo();
  }, [idVehiculo]);

  useEffect(() => {
    const fetchOthers = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/catalogo');
        const { success, data } = await res.json();
        if (success) {
          setOthers(
            data.filter(v => v.idVehiculo !== idVehiculo).slice(0, 5)
          );
        }
      } catch {}
    };
    fetchOthers();
  }, [idVehiculo]);

  if (!idVehiculo) return <div>No se ha especificado el vehículo.</div>;
  if (!vehiculo) return (
    <div style={{
      textAlign: 'center', padding: '2rem',
      position: 'fixed', top: 0, width: '100%',
      background: 'rgba(0,0,0,0.7)', color: 'white', zIndex: 1000
    }}>
      Cargando información del vehículo...
    </div>
  );

  const handleThumbnailClick = idx => {
    const clicked = thumbnails[idx];
    const newThumbs = [...thumbnails];
    newThumbs[idx] = mainImage;
    setMainImage(clicked);
    setThumbnails(newThumbs);
  };

  const handleVehicleClick = id => {
    history.push('/info-auto', { idVehiculo: id });
    setTimeout(() => {
      if (titleRef.current) {
        titleRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 100);
  };

  // ← aquí cambiamos split(',') por split(', ')
  const caracteristicasList = vehiculo.caracteristicas
    ? vehiculo.caracteristicas
        .split(', ')      // ahora sólo parte donde hay "coma + espacio"
        .map(item => item.trim())
    : [];

  return (
    <div className="desktop2-container">
      <Helmet>
        <title>{vehiculo.modelo} | CARS GET</title>
      </Helmet>
      <HeaderPrivado />
      <main className="desktop2-main">
        <div className="titulo-busqueda" ref={titleRef}>
          <h1>{vehiculo.modelo} {vehiculo.version}</h1>
        </div>
        <div className="detalle-principal">
          <section className="galeria-principal">
            <div className="imagen-principal">
              <img src="/external/rectangle34750521211-zpe8-1000h.png" alt="Fondo" />
              <img src={mainImage} alt="Principal" className="vehiculo" />
            </div>
            <div className="miniaturas">
              {thumbnails.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt={`Vista ${i+2}`}
                  onClick={() => handleThumbnailClick(i)}
                />
              ))}
            </div>
          </section>
          <section className="info-vehiculo descripcion-ancha">
            <h2>Descripción</h2>
            <ul>
              <li><strong>Marca:</strong> <span title={brandName}>{brandName}</span></li>
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
            <p className="precio">
              Precio: ${parseFloat(vehiculo.precio).toLocaleString()}
            </p>
            <button className="cotiza-btn" onClick={() => history.push('/cotizacion')}>
              ¡COTIZA AHORA!
            </button>
          </section>
        </div>
        <section className="otros-vehiculos">
          <h2>OTROS VEHÍCULOS</h2>
          <div className="galeria-otros">
            {otrosVehiculos.map(auto => (
              <div key={auto.idVehiculo} className="producto">
                <img src={auto.imagenes[0]||''} alt={auto.modelo} />
                <span className="marca">{auto.modelo}</span>
                <span className="año">{auto.ano}</span>
                <span className="precio">${Number(auto.precio).toLocaleString()}</span>
                <button className="mas-info" onClick={() => handleVehicleClick(auto.idVehiculo)}>
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
