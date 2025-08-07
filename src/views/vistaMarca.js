import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useHistory } from 'react-router-dom';
import Header from './component/header';
import Footer from './component/footer';
import './vistaMarca.css';

const VistaMarca = () => {
  const { idMarca } = useParams();
  const { state } = useLocation();
  const history = useHistory();

  const [nombreMarca, setNombreMarca] = useState(state?.nombre || 'Marca');
  const [autos, setAutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar nombre de la marca si no viene en state
  useEffect(() => {
    if (!state?.nombre && idMarca) {
      fetch(`http://localhost:3000/api/marcas/${idMarca}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data?.nombre_marca) {
            setNombreMarca(data.data.nombre_marca);
          }
        })
        .catch(() => console.error('Error al obtener nombre de la marca'));
    }
  }, [idMarca, state]);

  // Cargar autos de la marca
  useEffect(() => {
    if (!idMarca) return;
    fetch(`http://localhost:3000/api/marcas/${idMarca}/vehiculos`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setAutos(data.data);
        } else {
          setError('Error al obtener vehículos');
        }
      })
      .catch(() => setError('Error de conexión'))
      .finally(() => setLoading(false));
  }, [idMarca]);

  if (loading) {
    return (
      <>
        <Header />
        <div className="vista-marca-loading">Cargando vehículos...</div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="vista-marca-error">{error}</div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div
        className="vista-marca-container"
        style={{
          /* padding: top right&left bottom */
          padding: '0 40px 40px'
        }}
      >
        <h1
          className="vista-marca-title"
          style={{ marginBottom: '32px', textAlign: 'left' }}
        >
          <br></br>
          Vehículos de {nombreMarca}
        </h1>

        {autos.length > 0 ? (
          <div className="catalogo">
            {autos.map(auto => (
              <div className="producto" key={auto.idVehiculo}>
                <img
                  src={auto.imagenes?.[0] || ''}
                  alt={auto.modelo}
                  className="auto"
                />
                <span className="marca">{auto.modelo}</span>
                <span className="año">{auto.ano}</span>
                <span className="precio">
                  ${parseFloat(auto.precio).toLocaleString()}
                </span>
                <button
                  className="mas-info"
                  onClick={() =>
                    history.push('/info-auto', { idVehiculo: auto.idVehiculo })
                  }
                >
                  Más información
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p>No hay vehículos disponibles para la marca seleccionada.</p>
        )}
      </div>
      <Footer />
    </>
  );
};

export default VistaMarca;
