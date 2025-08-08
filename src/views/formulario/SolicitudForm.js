import React, { useState, useEffect } from 'react';
import { withRouter } from 'react-router-dom';
import HeaderPrivado from '../component/header';
import Footer from '../component/footer';
import './SolicitudForm.css';

const SolicitudForm = ({ history, location }) => {
  const cotizacionData = location.state?.cotizacionData || {};

  const [dataModified, setDataModified] = useState({
    enganche: false,
    plazo: false,
    descripcion: false
  });

  const [formData, setFormData] = useState({
    idVehiculo: cotizacionData.idVehiculo || null,
    idCotizacion: cotizacionData.idCotizacion || null,
    enganche_propuesto: cotizacionData.enganche || 0,
    plazos_propuestos: Math.min(cotizacionData.plazo || 0, 60),
    descripcion_vehiculo_adicional: cotizacionData.descripcion || '',
    idCliente: '',
    idVendedor: '',
    nombre_completo: '',
    telefono: '',
    direccion: '',
    curp: '',
    fecha_nacimiento: '',
    estado_civil: 'soltero',
    cantidad_dependientes: 0,
    tipo_vivienda: 'propia',
    ingreso_familiar: 0,
    direccion_trabajo: '',
    empresa: '',
    puesto: '',
    ingreso_mensual: 0,
    tiempo_laborando: 0,
    tipo_credito: 'automotriz',
    comprobante_ingresos: false,
    acepta_terminos: false
  });

  const [currentSection, setCurrentSection] = useState('vehiculo');

  useEffect(() => {
    setDataModified({
      enganche: cotizacionData.enganche !== undefined && 
               cotizacionData.enganche !== formData.enganche_propuesto,
      plazo: cotizacionData.plazo !== undefined && 
             cotizacionData.plazo !== formData.plazos_propuestos,
      descripcion: cotizacionData.descripcion !== undefined && 
                  cotizacionData.descripcion !== formData.descripcion_vehiculo_adicional
    });
  }, [formData, cotizacionData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    let processedValue = value;
    if (name === 'plazos_propuestos') {
      const numericValue = parseInt(value) || 0;
      processedValue = Math.min(numericValue, 60);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : 
             (type === 'number' ? parseFloat(processedValue) || 0 : processedValue)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateCurp(formData.curp)) {
      alert('Por favor ingrese una CURP válida');
      return;
    }
    
    if (!formData.acepta_terminos) {
      alert('Debe aceptar los términos y condiciones');
      return;
    }
    
    console.log('Datos enviados:', {
      ...formData,
      fecha_solicitud: new Date().toISOString()
    });
    
    history.push('/confirmacion', { 
      solicitudId: `SOL-${Date.now()}`,
      datosVehiculo: {
        idVehiculo: formData.idVehiculo,
        idCotizacion: formData.idCotizacion,
        descripcion: formData.descripcion_vehiculo_adicional
      }
    });
  };

  const validateCurp = (curp) => {
    const regex = /^[A-Z]{4}\d{6}[A-Z]{6}\d{2}$/;
    return regex.test(curp.toUpperCase());
  };

  const nextSection = () => {
    setCurrentSection(prev => {
      if (prev === 'vehiculo') return 'personal';
      if (prev === 'personal') return 'laboral';
      return 'documentos';
    });
  };

  const prevSection = () => {
    setCurrentSection(prev => {
      if (prev === 'documentos') return 'laboral';
      if (prev === 'laboral') return 'personal';
      return 'vehiculo';
    });
  };

  return (
    <div className="solicitud-page">
      <HeaderPrivado />
      
      <div className="solicitud-container">
        <h2>Solicitud de Financiamiento Automotriz</h2>
        
        <input type="hidden" name="idVehiculo" value={formData.idVehiculo || ''} />
        <input type="hidden" name="idCotizacion" value={formData.idCotizacion || ''} />

        <form onSubmit={handleSubmit}>
          {/* Sección de IDs vinculados */}
          <div className="vinculacion-section">
            <h3>Información de Vinculación</h3>
            <div className="id-display-container">
              <div className="id-display">
                <span className="id-label">ID Vehículo:</span>
                <span className="id-value">{formData.idVehiculo || 'No especificado'}</span>
              </div>
              <div className="id-display">
                <span className="id-label">ID Cotización:</span>
                <span className="id-value">{formData.idCotizacion || 'No especificado'}</span>
              </div>
            </div>
          </div>

          {/* Navegación entre secciones */}
          <div className="section-navigation">
            <button
              type="button"
              onClick={prevSection}
              disabled={currentSection === 'vehiculo'}
              className="nav-button"
            >
              Anterior
            </button>
            <button
              type="button"
              onClick={nextSection}
              disabled={currentSection === 'documentos'}
              className="nav-button"
            >
              Siguiente
            </button>
          </div>

          {/* Sección Vehículo */}
          {currentSection === 'vehiculo' && (
            <div className="seccion-vehiculo" key="vehiculo">
              <h3>Información del Vehículo</h3>
              
              {Object.values(dataModified).some(v => v) && (
                <div className="modification-alert">
                  <i className="warning-icon">⚠️</i>
                  <div>
                    <strong>Atención:</strong> Has modificado datos de la cotización original.
                    {formData.idCotizacion && (
                      <p>La cotización original (ID: {formData.idCotizacion}) permanece vinculada.</p>
                    )}
                  </div>
                </div>
              )}

              <div className="campo">
                <label>Descripción del vehículo:</label>
                <textarea
                  name="descripcion_vehiculo_adicional"
                  value={formData.descripcion_vehiculo_adicional}
                  onChange={handleChange}
                  required
                />
                {dataModified.descripcion && cotizacionData.descripcion && (
                  <div className="original-value">
                    <span>Valor original:</span> {cotizacionData.descripcion}
                  </div>
                )}
              </div>

              <div className="dos-columnas">
                <div className="campo">
                  <label>Enganche propuesto ($):</label>
                  <input
                    type="number"
                    name="enganche_propuesto"
                    value={formData.enganche_propuesto}
                    onChange={handleChange}
                    min="0"
                    required
                  />
                  {dataModified.enganche && cotizacionData.enganche && (
                    <div className="original-value">
                      <span>Valor original:</span> ${cotizacionData.enganche.toLocaleString()}
                    </div>
                  )}
                </div>

                <div className="campo">
                  <label>Plazo solicitado (meses):</label>
                  <input
                    type="number"
                    name="plazos_propuestos"
                    value={formData.plazos_propuestos}
                    onChange={handleChange}
                    min="1"
                    max="60"
                    required
                  />
                  <div className="plazo-info">
                    Máximo 60 meses (5 años)
                  </div>
                  {dataModified.plazo && cotizacionData.plazo && (
                    <div className="original-value">
                      <span>Valor original:</span> {cotizacionData.plazo} meses
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Sección Información Personal */}
          {currentSection === 'personal' && (
            <div className="seccion-personal" key="personal">
              <h3>Información Personal</h3>
              
              <div className="campo">
                <label>Nombre completo:</label>
                <input
                  type="text"
                  name="nombre_completo"
                  value={formData.nombre_completo}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="dos-columnas">
                <div className="campo">
                  <label>Teléfono:</label>
                  <input
                    type="tel"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="campo">
                  <label>CURP:</label>
                  <input
                    type="text"
                    name="curp"
                    value={formData.curp}
                    onChange={handleChange}
                    pattern="[A-Z]{4}[0-9]{6}[A-Z]{6}[0-9]{2}"
                    required
                  />
                  {!validateCurp(formData.curp) && formData.curp && (
                    <span className="error">
                      Formato de CURP inválido
                    </span>
                  )}
                </div>
              </div>
              
              <div className="campo">
                <label>Dirección completa:</label>
                <input
                  type="text"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="dos-columnas">
                <div className="campo">
                  <label>Fecha de nacimiento:</label>
                  <input
                    type="date"
                    name="fecha_nacimiento"
                    value={formData.fecha_nacimiento}
                    onChange={handleChange}
                    required
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
                
                <div className="campo">
                  <label>Estado civil:</label>
                  <select
                    name="estado_civil"
                    value={formData.estado_civil}
                    onChange={handleChange}
                    required
                  >
                    <option value="soltero">Soltero(a)</option>
                    <option value="casado">Casado(a)</option>
                    <option value="divorciado">Divorciado(a)</option>
                    <option value="viudo">Viudo(a)</option>
                    <option value="concubinato">Concubinato</option>
                  </select>
                </div>
              </div>
              
              <div className="dos-columnas">
                <div className="campo">
                  <label>Dependientes económicos:</label>
                  <input
                    type="number"
                    name="cantidad_dependientes"
                    value={formData.cantidad_dependientes}
                    onChange={handleChange}
                    min="0"
                    required
                  />
                </div>
                
                <div className="campo">
                  <label>Tipo de vivienda:</label>
                  <select
                    name="tipo_vivienda"
                    value={formData.tipo_vivienda}
                    onChange={handleChange}
                    required
                  >
                    <option value="propia">Propia</option>
                    <option value="rentada">Rentada</option>
                    <option value="familiar">Familiar</option>
                  </select>
                </div>
              </div>
              
              <div className="campo">
                <label>Ingreso familiar total ($):</label>
                <input
                  type="number"
                  name="ingreso_familiar"
                  value={formData.ingreso_familiar}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>
          )}

          {/* Sección Información Laboral */}
          {currentSection === 'laboral' && (
            <div className="seccion-laboral" key="laboral">
              <h3>Información Laboral</h3>
              
              <div className="campo">
                <label>Empresa donde trabaja:</label>
                <input
                  type="text"
                  name="empresa"
                  value={formData.empresa}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="campo">
                <label>Puesto:</label>
                <input
                  type="text"
                  name="puesto"
                  value={formData.puesto}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="campo">
                <label>Dirección de trabajo:</label>
                <input
                  type="text"
                  name="direccion_trabajo"
                  value={formData.direccion_trabajo}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="dos-columnas">
                <div className="campo">
                  <label>Ingreso mensual ($):</label>
                  <input
                    type="number"
                    name="ingreso_mensual"
                    value={formData.ingreso_mensual}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                
                <div className="campo">
                  <label>Tiempo laborando (meses):</label>
                  <input
                    type="number"
                    name="tiempo_laborando"
                    value={formData.tiempo_laborando}
                    onChange={handleChange}
                    min="0"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* Sección Documentación */}
          {currentSection === 'documentos' && (
            <div className="seccion-documentos" key="documentos">
              <h3>Documentación Requerida</h3>
              
              <div className="campo-checkbox">
                <input
                  type="checkbox"
                  name="comprobante_ingresos"
                  checked={formData.comprobante_ingresos}
                  onChange={handleChange}
                  id="comprobante_ingresos"
                />
                <label htmlFor="comprobante_ingresos">
                  ¿Cuenta con comprobante de ingresos?
                </label>
              </div>
              
              <div className="campo-checkbox">
                <input
                  type="checkbox"
                  name="acepta_terminos"
                  checked={formData.acepta_terminos}
                  onChange={handleChange}
                  id="acepta_terminos"
                  required
                />
                <label htmlFor="acepta_terminos">
                  Acepto los términos y condiciones del financiamiento
                </label>
              </div>
            </div>
          )}

          <div className="form-actions">
            <button type="submit" className="btn-enviar">
              Enviar Solicitud
            </button>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  );
};

export default withRouter(SolicitudForm);