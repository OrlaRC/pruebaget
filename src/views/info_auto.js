import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { useHistory, useLocation } from 'react-router-dom';
import HeaderPrivado from './component/header';
import Footer from './component/footer';
import './info_auto.css';
import Modal from 'react-modal';

const InfoAuto = () => {
  const history = useHistory();
  const { state } = useLocation();
  const titleRef = useRef(null);

  const [vehiculo, setVehiculo] = useState(null);
  const [brandName, setBrandName] = useState('');
  const [mainImage, setMainImage] = useState('');
  const [thumbnails, setThumbnails] = useState([]);
  const [otrosVehiculos, setOthers] = useState([]);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    message: ''
  });

  const idFromState = state?.idVehiculo;
  const storedId = localStorage.getItem('idVehiculo');
  const idVehiculo = idFromState || storedId;

  const isAuthenticated = () => {
    return !!localStorage.getItem('accessToken');
  };

  const handleCotizarClick = () => {
    if (isAuthenticated()) {
      history.push('/cotizacion');
    } else {
      setShowLoginModal(true);
    }
  };

  const handleLoginRedirect = () => {
    localStorage.setItem('redirectAfterLogin', JSON.stringify({
      path: '/info-auto',
      state: { idVehiculo }
    }));
    history.push('/login');
  };

  useEffect(() => {
    if (state?.mensaje) {
      setConfirmationModal({
        isOpen: true,
        message: state.mensaje
      });
      const timer = setTimeout(() => {
        setConfirmationModal(prev => ({ ...prev, isOpen: false }));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [state]);

  useEffect(() => {
    if (idFromState) localStorage.setItem('idVehiculo', idFromState);
  }, [idFromState]);

  useEffect(() => {
    if (!idVehiculo) return;
    const fetchVehiculo = async () => {
      try {
        const res = await fetch(`https://financiera-backend.vercel.app/api/catalogo/${idVehiculo}`);
        const { success, data: v } = await res.json();
        if (success) {
          setVehiculo(v);
          const imgs = v.imagenes || [];
          if (imgs.length) {
            setMainImage(imgs[0]);
            setThumbnails(imgs.slice(1));
          }
          if (v.idMarca) {
            const r = await fetch(`https://financiera-backend.vercel.app/api/marcas/${v.idMarca}`);
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
        const res = await fetch('https://financiera-backend.vercel.app/api/catalogo');
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

  const handleThumbnailClick = (idx) => {
    const clicked = thumbnails[idx];
    const newThumbs = [...thumbnails];
    newThumbs[idx] = mainImage;
    setMainImage(clicked);
    setThumbnails(newThumbs);
  };

  const handleVehicleClick = (id) => {
    history.push('/info-auto', { idVehiculo: id });
    setTimeout(() => {
      if (titleRef.current) {
        titleRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 100);
  };

  const cerrarModal = () => {
    setConfirmationModal(prev => ({ ...prev, isOpen: false }));
  };

  const caracteristicasList = vehiculo?.caracteristicas
    ? vehiculo.caracteristicas.split(', ').map(item => item.trim())
    : [];

  if (!idVehiculo) {
    return React.createElement('div', null, 'No se ha especificado el vehículo.');
  }

  if (!vehiculo) {
    return React.createElement(
      'div',
      {
        style: {
          textAlign: 'center',
          padding: '2rem',
          position: 'fixed',
          top: 0,
          width: '100%',
          background: 'rgba(0,0,0,0.7)',
          color: 'white',
          zIndex: 1000
        }
      },
      'Cargando información del vehículo...'
    );
  }

  return React.createElement(
    'div',
    { className: 'desktop2-container' },
    [
      React.createElement(
        Helmet,
        { key: 'helmet' },
        React.createElement('title', null, `${vehiculo.modelo} | CARS GET`)
      ),
      React.createElement(HeaderPrivado, { key: 'header' }),
      React.createElement(
        'main',
        { className: 'desktop2-main', key: 'main' },
        [
          React.createElement(
            'div',
            { className: 'titulo-busqueda', ref: titleRef, key: 'titulo' },
            React.createElement(
              'h1',
              null,
              `${vehiculo.modelo} ${vehiculo.version}`
            )
          ),
          React.createElement(
            'div',
            { className: 'detalle-principal', key: 'detalle' },
            [
              React.createElement(
                'section',
                { className: 'galeria-principal', key: 'galeria' },
                [
                  React.createElement(
                    'div',
                    { className: 'imagen-principal', key: 'imagen-principal' },
                    [
                      React.createElement('img', {
                        src: '/external/rectangle34750521211-zpe8-1000h.png',
                        alt: 'Fondo',
                        key: 'fondo'
                      }),
                      React.createElement('img', {
                        src: mainImage,
                        alt: 'Principal',
                        className: 'vehiculo',
                        key: 'principal'
                      })
                    ]
                  ),
                  React.createElement(
                    'div',
                    { className: 'miniaturas', key: 'miniaturas' },
                    thumbnails.map((src, i) =>
                      React.createElement('img', {
                        key: i,
                        src: src,
                        alt: `Vista ${i+2}`,
                        onClick: () => handleThumbnailClick(i)
                      })
                    )
                  )
                ]
              ),
              React.createElement(
                'section',
                { className: 'info-vehiculo descripcion-ancha', key: 'info' },
                [
                  React.createElement('h2', { key: 'desc-titulo' }, 'Descripción'),
                  React.createElement(
                    'ul',
                    { key: 'desc-lista' },
                    [
                      React.createElement('li', { key: 'marca' }, [
                        React.createElement('strong', null, 'Marca:'),
                        ' ',
                        React.createElement('span', { title: brandName }, brandName)
                      ]),
                      React.createElement('li', { key: 'modelo' }, [
                        React.createElement('strong', null, 'Modelo:'),
                        ' ',
                        vehiculo.modelo
                      ]),
                      React.createElement('li', { key: 'version' }, [
                        React.createElement('strong', null, 'Versión:'),
                        ' ',
                        vehiculo.version
                      ]),
                      React.createElement('li', { key: 'ano' }, [
                        React.createElement('strong', null, 'Año:'),
                        ' ',
                        vehiculo.ano
                      ]),
                      React.createElement('li', { key: 'transmision' }, [
                        React.createElement('strong', null, 'Transmisión:'),
                        ' ',
                        vehiculo.transmision
                      ]),
                      React.createElement('li', { key: 'kilometraje' }, [
                        React.createElement('strong', null, 'Kilometraje:'),
                        ' ',
                        `${vehiculo.kilometraje} km`
                      ]),
                      React.createElement('li', { key: 'combustible' }, [
                        React.createElement('strong', null, 'Combustible:'),
                        ' ',
                        vehiculo.tipoCombustible
                      ])
                    ]
                  ),
                  React.createElement(
                    'p',
                    { className: 'descripcion-detalle', key: 'desc-detalle' },
                    vehiculo.descripcion
                  ),
                  caracteristicasList.length > 0 && [
                    React.createElement('h2', { key: 'carac-titulo' }, 'Características'),
                    React.createElement(
                      'ul',
                      { key: 'carac-lista' },
                      caracteristicasList.map((carac, i) =>
                        React.createElement('li', { key: i }, carac)
                      )
                    )
                  ],
                  React.createElement(
                    'p',
                    { className: 'precio', key: 'precio' },
                    `Precio: $${parseFloat(vehiculo.precio).toLocaleString()}`
                  ),
                  React.createElement(
                    'button',
                    {
                      className: 'cotiza-btn',
                      onClick: handleCotizarClick,
                      key: 'cotiza-btn'
                    },
                    '¡COTIZA AHORA!'
                  )
                ]
              )
            ]
          ),
          React.createElement(
            'section',
            { className: 'otros-vehiculos', key: 'otros' },
            [
              React.createElement('h2', { key: 'titulo-otros' }, 'OTROS VEHÍCULOS'),
              React.createElement(
                'div',
                { className: 'galeria-otros', key: 'galeria-otros' },
                otrosVehiculos.map(auto =>
                  React.createElement(
                    'div',
                    { className: 'producto', key: auto.idVehiculo },
                    [
                      React.createElement('img', {
                        src: auto.imagenes[0] || '',
                        alt: auto.modelo,
                        key: 'img'
                      }),
                      React.createElement(
                        'span',
                        { className: 'marca', key: 'marca' },
                        auto.modelo
                      ),
                      React.createElement(
                        'span',
                        { className: 'año', key: 'año' },
                        auto.ano
                      ),
                      React.createElement(
                        'span',
                        { className: 'precio', key: 'precio' },
                        `$${Number(auto.precio).toLocaleString()}`
                      ),
                      React.createElement(
                        'button',
                        {
                          className: 'mas-info',
                          onClick: () => handleVehicleClick(auto.idVehiculo),
                          key: 'btn-mas-info'
                        },
                        'Más información'
                      )
                    ]
                  )
                )
              )
            ]
          )
        ]
      ),
      React.createElement(Footer, { key: 'footer' }),
      React.createElement(
        Modal,
        {
          isOpen: showLoginModal,
          onRequestClose: () => setShowLoginModal(false),
          className: 'login-modal',
          overlayClassName: 'login-modal-overlay',
          key: 'login-modal'
        },
        React.createElement(
          'div',
          { className: 'modal-content', key: 'login-modal-content' },
          [
            React.createElement('h2', { key: 'login-modal-title' }, 'Inicia sesión para continuar'),
            React.createElement(
              'p',
              { key: 'login-modal-text' },
              'Para poder cotizar este vehículo, necesitas iniciar sesión primero.'
            ),
            React.createElement(
              'div',
              { className: 'modal-buttons', key: 'login-modal-buttons' },
              [
                React.createElement(
                  'button',
                  {
                    className: 'modal-btn cancel',
                    onClick: () => setShowLoginModal(false),
                    key: 'login-cancel'
                  },
                  'Cancelar'
                ),
                React.createElement(
                  'button',
                  {
                    className: 'modal-btn confirm',
                    onClick: handleLoginRedirect,
                    key: 'login-confirm'
                  },
                  'Iniciar sesión'
                )
              ]
            )
          ]
        )
      ),
      React.createElement(
        Modal,
        {
          isOpen: confirmationModal.isOpen,
          onRequestClose: cerrarModal,
          className: 'custom-modal',
          overlayClassName: 'custom-modal-overlay',
          key: 'confirmation-modal'
        },
        React.createElement(
          'div',
          { style: { padding: '1rem', textAlign: 'center' }, key: 'confirmation-content' },
          [
            React.createElement(
              'p',
              { style: { fontSize: '1.1rem', marginBottom: '1rem' }, key: 'confirmation-message' },
              confirmationModal.message
            ),
            React.createElement(
              'button',
              {
                onClick: cerrarModal,
                style: {
                  backgroundColor: '#f8791d',
                  color: 'white',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                },
                key: 'confirmation-button'
              },
              'Aceptar'
            )
          ]
        )
      )
    ]
  );
};

export default InfoAuto;