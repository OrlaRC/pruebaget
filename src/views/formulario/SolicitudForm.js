import React, { useState, useEffect } from 'react';
import { withRouter } from 'react-router-dom';
import HeaderPrivado from '../component/header';
import Footer from '../component/footer';
import './SolicitudForm.css';

const SolicitudForm = ({ history, location }) => {
  const cotizacionData = location.state?.cotizacionData || {};
  const accessToken = localStorage.getItem('accessToken');
  const idCliente = parseInt(localStorage.getItem('idUsuario'), 10);

  const [loading, setLoading] = useState(true);
  const [cotizacionInfo, setCotizacionInfo] = useState(null);
  const [vehiculoInfo, setVehiculoInfo] = useState(null);
  const [clienteInfo, setClienteInfo] = useState(null);
  const [error, setError] = useState(null);

  const [dataModified, setDataModified] = useState({
    enganche: false,
    plazo: false,
    descripcion: false
  });

  const [formData, setFormData] = useState({
    idVehiculo: cotizacionData.idVehiculo || null,
    idCotizacion: cotizacionData.idCotizacion || null,
    idVendedor: cotizacionData.idVendedor || null,
    enganche_propuesto: cotizacionData.enganche || 0,
    plazos_propuestos: Math.min(cotizacionData.plazo || 0, 60),
    descripcion_vehiculo_adicional: cotizacionData.descripcion || '',
    idCliente: idCliente || '',
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
    const fetchData = async () => {
      try {
        if (!cotizacionData.idVehiculo) return;
        
        const clienteRes = await fetch(`http://localhost:3000/ https://financiera-backend.vercel.app/api/usuarios/${idCliente}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
        
        if (!clienteRes.ok) {
          throw new Error('Error al obtener datos del cliente');
        }
        
        const clienteJson = await clienteRes.json();
        setClienteInfo(clienteJson);
        
        setFormData(prev => ({
          ...prev,
          nombre_completo: clienteJson.nombre || '',
          telefono: clienteJson.telefono ? clienteJson.telefono.toString() : '',
          direccion: clienteJson.direccion || ''
        }));

        const cotizacionRes = await fetch(`http://localhost:3000/ https://financiera-backend.vercel.app/api/cotizaciones`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
        const cotizacionJson = await cotizacionRes.json();
        
        if (cotizacionJson.success) {
          const cotizacion = cotizacionJson.cotizaciones.find(
            c => c.idVehiculo === cotizacionData.idVehiculo && c.idCliente === idCliente
          );
          
          if (cotizacion) {
            setCotizacionInfo(cotizacion);
            setFormData(prev => ({
              ...prev,
              idCotizacion: cotizacion.idCotizacion,
              idVendedor: cotizacion.idVendedor,
              enganche_propuesto: parseFloat(cotizacion.enganche),
              plazos_propuestos: Math.min(cotizacion.plazos, 60)
            }));
          }
        }

        const vehiculoRes = await fetch(`http://localhost:3000/ https://financiera-backend.vercel.app/api/catalogo/${cotizacionData.idVehiculo}`);
        const vehiculoJson = await vehiculoRes.json();
        
        if (vehiculoJson.success) {
          setVehiculoInfo(vehiculoJson.data);
          setFormData(prev => ({
            ...prev,
            descripcion_vehiculo_adicional: vehiculoJson.data.descripcion || ''
          }));
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Error al cargar los datos. Por favor recarga la página.');
        setLoading(false);
      }
    };

    fetchData();
  }, [cotizacionData.idVehiculo, idCliente, accessToken]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateCurp(formData.curp)) {
      alert('Por favor ingrese una CURP válida');
      return;
    }
    
    if (!formData.acepta_terminos) {
      alert('Debe aceptar los términos y condiciones');
      return;
    }
    
    try {
      const response = await fetch('http://localhost:3000/ https://financiera-backend.vercel.app/api/solicitudes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          idVendedor: formData.idVendedor,
          idVehiculo: formData.idVehiculo,
          idCotizacion: formData.idCotizacion,
          nombre_completo: formData.nombre_completo,
          telefono: formData.telefono,
          direccion: formData.direccion,
          curp: formData.curp,
          fecha_nacimiento: formData.fecha_nacimiento,
          estado_civil: formData.estado_civil,
          cantidad_dependientes: formData.cantidad_dependientes,
          tipo_vivienda: formData.tipo_vivienda,
          ingreso_familiar: formData.ingreso_familiar,
          direccion_trabajo: formData.direccion_trabajo,
          empresa: formData.empresa,
          puesto: formData.puesto,
          ingreso_mensual: formData.ingreso_mensual,
          tiempo_laborando: formData.tiempo_laborando,
          tipo_credito: formData.tipo_credito,
          enganche_propuesto: formData.enganche_propuesto,
          plazos_propuestos: formData.plazos_propuestos,
          comprobante_ingresos: formData.comprobante_ingresos,
          descripcion_vehiculo_adicional: formData.descripcion_vehiculo_adicional
        })
      });

      const result = await response.json();

      if (response.ok) {
        history.push({
          pathname: '/info-auto',
          state: { 
            idVehiculo: formData.idVehiculo,
            mensaje: 'Solicitud de crédito enviada, espere respuesta.'
          }
        });
      } else {
        alert(result.message || 'Error al enviar la solicitud');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Error al enviar la solicitud. Por favor intenta nuevamente.');
    }
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

  if (loading) {
    return React.createElement(
      'div',
      { className: 'solicitud-page' },
      [
        React.createElement(HeaderPrivado, { key: 'header' }),
        React.createElement(
          'div',
          { className: 'solicitud-container', key: 'container' },
          [
            React.createElement('h2', { key: 'title' }, 'Solicitud de Financiamiento Automotriz'),
            React.createElement('p', { key: 'loading' }, 'Cargando datos...')
          ]
        ),
        React.createElement(Footer, { key: 'footer' })
      ]
    );
  }

  if (error) {
    return React.createElement(
      'div',
      { className: 'solicitud-page' },
      [
        React.createElement(HeaderPrivado, { key: 'header' }),
        React.createElement(
          'div',
          { className: 'solicitud-container', key: 'container' },
          [
            React.createElement('h2', { key: 'title' }, 'Solicitud de Financiamiento Automotriz'),
            React.createElement('p', { className: 'error-message', key: 'error' }, error)
          ]
        ),
        React.createElement(Footer, { key: 'footer' })
      ]
    );
  }

  return React.createElement(
    'div',
    { className: 'solicitud-page' },
    [
      React.createElement(HeaderPrivado, { key: 'header' }),
      
      React.createElement(
        'div',
        { className: 'solicitud-container', key: 'container' },
        [
          React.createElement('h2', { key: 'title' }, 'Solicitud de Financiamiento Automotriz'),
          
          React.createElement('input', { 
            type: 'hidden', 
            name: 'idVehiculo', 
            value: formData.idVehiculo || '', 
            key: 'idVehiculo' 
          }),
          React.createElement('input', { 
            type: 'hidden', 
            name: 'idCotizacion', 
            value: formData.idCotizacion || '', 
            key: 'idCotizacion' 
          }),
          React.createElement('input', { 
            type: 'hidden', 
            name: 'idVendedor', 
            value: formData.idVendedor || '', 
            key: 'idVendedor' 
          }),

          React.createElement(
            'form',
            { onSubmit: handleSubmit, key: 'form' },
            [
              React.createElement(
                'div',
                { className: 'vinculacion-section', key: 'vinculacion' },
                [
                  React.createElement('h3', { key: 'title' }, 'Información de Vinculación'),
                  React.createElement(
                    'div',
                    { className: 'id-display-container', key: 'ids' },
                    [
                      React.createElement(
                        'div',
                        { className: 'id-display', key: 'vehiculo' },
                        [
                          React.createElement('span', { className: 'id-label', key: 'label1' }, 'ID Vehículo:'),
                          React.createElement('span', { className: 'id-value', key: 'value1' }, formData.idVehiculo || 'No especificado')
                        ]
                      ),
                      React.createElement(
                        'div',
                        { className: 'id-display', key: 'cotizacion' },
                        [
                          React.createElement('span', { className: 'id-label', key: 'label2' }, 'ID Cotización:'),
                          React.createElement('span', { className: 'id-value', key: 'value2' }, formData.idCotizacion || 'No especificado')
                        ]
                      )
                    ]
                  )
                ]
              ),

              React.createElement(
                'div',
                { className: 'section-navigation', key: 'navigation' },
                [
                  React.createElement(
                    'button',
                    {
                      type: 'button',
                      onClick: prevSection,
                      disabled: currentSection === 'vehiculo',
                      className: 'nav-button',
                      key: 'prev'
                    },
                    'Anterior'
                  ),
                  React.createElement(
                    'button',
                    {
                      type: 'button',
                      onClick: nextSection,
                      disabled: currentSection === 'documentos',
                      className: 'nav-button',
                      key: 'next'
                    },
                    'Siguiente'
                  )
                ]
              ),

              currentSection === 'vehiculo' && React.createElement(
                'div',
                { className: 'seccion-vehiculo', key: 'vehiculo-section' },
                [
                  React.createElement('h3', { key: 'title' }, 'Información del Vehículo'),
                  
                  Object.values(dataModified).some(v => v) && React.createElement(
                    'div',
                    { className: 'modification-alert', key: 'alert' },
                    [
                      React.createElement('i', { className: 'warning-icon', key: 'icon' }, '⚠️'),
                      React.createElement(
                        'div',
                        { key: 'text' },
                        [
                          React.createElement('strong', { key: 'strong' }, 'Atención:'),
                          ' Has modificado datos de la cotización original.',
                          formData.idCotizacion && React.createElement(
                            'p',
                            { key: 'p' },
                            `La cotización original (ID: ${formData.idCotizacion}) permanece vinculada.`
                          )
                        ]
                      )
                    ]
                  ),

                  React.createElement(
                    'div',
                    { className: 'campo', key: 'descripcion' },
                    [
                      React.createElement('label', { key: 'label' }, 'Descripción del vehículo:'),
                      React.createElement('textarea', {
                        name: 'descripcion_vehiculo_adicional',
                        value: formData.descripcion_vehiculo_adicional,
                        onChange: handleChange,
                        required: true,
                        key: 'textarea'
                      }),
                      dataModified.descripcion && vehiculoInfo?.descripcion && React.createElement(
                        'div',
                        { className: 'original-value', key: 'original' },
                        [
                          React.createElement('span', { key: 'span' }, 'Valor original:'),
                          ' ',
                          vehiculoInfo.descripcion
                        ]
                      )
                    ]
                  ),

                  React.createElement(
                    'div',
                    { className: 'dos-columnas', key: 'dos-columnas' },
                    [
                      React.createElement(
                        'div',
                        { className: 'campo', key: 'enganche' },
                        [
                          React.createElement('label', { key: 'label' }, 'Enganche propuesto ($):'),
                          React.createElement('input', {
                            type: 'number',
                            name: 'enganche_propuesto',
                            value: formData.enganche_propuesto,
                            onChange: handleChange,
                            min: '0',
                            required: true,
                            key: 'input'
                          }),
                          dataModified.enganche && cotizacionInfo?.enganche && React.createElement(
                            'div',
                            { className: 'original-value', key: 'original' },
                            [
                              React.createElement('span', { key: 'span' }, 'Valor original:'),
                              ' $',
                              parseFloat(cotizacionInfo.enganche).toLocaleString()
                            ]
                          )
                        ]
                      ),

                      React.createElement(
                        'div',
                        { className: 'campo', key: 'plazo' },
                        [
                          React.createElement('label', { key: 'label' }, 'Plazo solicitado (meses):'),
                          React.createElement('input', {
                            type: 'number',
                            name: 'plazos_propuestos',
                            value: formData.plazos_propuestos,
                            onChange: handleChange,
                            min: '1',
                            max: '60',
                            required: true,
                            key: 'input'
                          }),
                          React.createElement(
                            'div',
                            { className: 'plazo-info', key: 'info' },
                            'Máximo 60 meses (5 años)'
                          ),
                          dataModified.plazo && cotizacionInfo?.plazos && React.createElement(
                            'div',
                            { className: 'original-value', key: 'original' },
                            [
                              React.createElement('span', { key: 'span' }, 'Valor original:'),
                              ' ',
                              cotizacionInfo.plazos,
                              ' meses'
                            ]
                          )
                        ]
                      )
                    ]
                  )
                ]
              ),

              currentSection === 'personal' && React.createElement(
                'div',
                { className: 'seccion-personal', key: 'personal-section' },
                [
                  React.createElement('h3', { key: 'title' }, 'Información Personal'),
                  
                  React.createElement(
                    'div',
                    { className: 'campo', key: 'nombre' },
                    [
                      React.createElement('label', { key: 'label' }, 'Nombre completo:'),
                      React.createElement('input', {
                        type: 'text',
                        name: 'nombre_completo',
                        value: formData.nombre_completo,
                        onChange: handleChange,
                        required: true,
                        key: 'input'
                      }),
                      clienteInfo?.nombre && React.createElement(
                        'div',
                        { className: 'original-value', key: 'original' },
                        [
                          React.createElement('span', { key: 'span' }, 'Valor original:'),
                          ' ',
                          clienteInfo.nombre
                        ]
                      )
                    ]
                  ),
                  
                  React.createElement(
                    'div',
                    { className: 'dos-columnas', key: 'dos-columnas' },
                    [
                      React.createElement(
                        'div',
                        { className: 'campo', key: 'telefono' },
                        [
                          React.createElement('label', { key: 'label' }, 'Teléfono:'),
                          React.createElement('input', {
                            type: 'tel',
                            name: 'telefono',
                            value: formData.telefono,
                            onChange: handleChange,
                            required: true,
                            key: 'input'
                          }),
                          clienteInfo?.telefono && React.createElement(
                            'div',
                            { className: 'original-value', key: 'original' },
                            [
                              React.createElement('span', { key: 'span' }, 'Valor original:'),
                              ' ',
                              clienteInfo.telefono
                            ]
                          )
                        ]
                      ),
                      
                      React.createElement(
                        'div',
                        { className: 'campo', key: 'curp' },
                        [
                          React.createElement('label', { key: 'label' }, 'CURP:'),
                          React.createElement('input', {
                            type: 'text',
                            name: 'curp',
                            value: formData.curp,
                            onChange: handleChange,
                            pattern: '[A-Z]{4}[0-9]{6}[A-Z]{6}[0-9]{2}',
                            required: true,
                            key: 'input'
                          }),
                          !validateCurp(formData.curp) && formData.curp && React.createElement(
                            'span',
                            { className: 'error', key: 'error' },
                            'Formato de CURP inválido'
                          )
                        ]
                      )
                    ]
                  ),
                  
                  React.createElement(
                    'div',
                    { className: 'campo', key: 'direccion' },
                    [
                      React.createElement('label', { key: 'label' }, 'Dirección completa:'),
                      React.createElement('input', {
                        type: 'text',
                        name: 'direccion',
                        value: formData.direccion,
                        onChange: handleChange,
                        required: true,
                        key: 'input'
                      }),
                      clienteInfo?.direccion && React.createElement(
                        'div',
                        { className: 'original-value', key: 'original' },
                        [
                          React.createElement('span', { key: 'span' }, 'Valor original:'),
                          ' ',
                          clienteInfo.direccion
                        ]
                      )
                    ]
                  ),
                  
                  React.createElement(
                    'div',
                    { className: 'dos-columnas', key: 'dos-columnas2' },
                    [
                      React.createElement(
                        'div',
                        { className: 'campo', key: 'fecha-nacimiento' },
                        [
                          React.createElement('label', { key: 'label' }, 'Fecha de nacimiento:'),
                          React.createElement('input', {
                            type: 'date',
                            name: 'fecha_nacimiento',
                            value: formData.fecha_nacimiento,
                            onChange: handleChange,
                            required: true,
                            max: new Date().toISOString().split('T')[0],
                            key: 'input'
                          })
                        ]
                      ),
                      
                      React.createElement(
                        'div',
                        { className: 'campo', key: 'estado-civil' },
                        [
                          React.createElement('label', { key: 'label' }, 'Estado civil:'),
                          React.createElement(
                            'select',
                            {
                              name: 'estado_civil',
                              value: formData.estado_civil,
                              onChange: handleChange,
                              required: true,
                              key: 'select'
                            },
                            [
                              React.createElement('option', { value: 'soltero', key: 'soltero' }, 'Soltero(a)'),
                              React.createElement('option', { value: 'casado', key: 'casado' }, 'Casado(a)'),
                              React.createElement('option', { value: 'divorciado', key: 'divorciado' }, 'Divorciado(a)'),
                              React.createElement('option', { value: 'viudo', key: 'viudo' }, 'Viudo(a)'),
                              React.createElement('option', { value: 'concubinato', key: 'concubinato' }, 'Concubinato')
                            ]
                          )
                        ]
                      )
                    ]
                  ),
                  
                  React.createElement(
                    'div',
                    { className: 'dos-columnas', key: 'dos-columnas3' },
                    [
                      React.createElement(
                        'div',
                        { className: 'campo', key: 'dependientes' },
                        [
                          React.createElement('label', { key: 'label' }, 'Dependientes económicos:'),
                          React.createElement('input', {
                            type: 'number',
                            name: 'cantidad_dependientes',
                            value: formData.cantidad_dependientes,
                            onChange: handleChange,
                            min: '0',
                            required: true,
                            key: 'input'
                          })
                        ]
                      ),
                      
                      React.createElement(
                        'div',
                        { className: 'campo', key: 'vivienda' },
                        [
                          React.createElement('label', { key: 'label' }, 'Tipo de vivienda:'),
                          React.createElement(
                            'select',
                            {
                              name: 'tipo_vivienda',
                              value: formData.tipo_vivienda,
                              onChange: handleChange,
                              required: true,
                              key: 'select'
                            },
                            [
                              React.createElement('option', { value: 'propia', key: 'propia' }, 'Propia'),
                              React.createElement('option', { value: 'rentada', key: 'rentada' }, 'Rentada'),
                              React.createElement('option', { value: 'familiar', key: 'familiar' }, 'Familiar')
                            ]
                          )
                        ]
                      )
                    ]
                  ),
                  
                  React.createElement(
                    'div',
                    { className: 'campo', key: 'ingreso-familiar' },
                    [
                      React.createElement('label', { key: 'label' }, 'Ingreso familiar total ($):'),
                      React.createElement('input', {
                        type: 'number',
                        name: 'ingreso_familiar',
                        value: formData.ingreso_familiar,
                        onChange: handleChange,
                        min: '0',
                        step: '0.01',
                        required: true,
                        key: 'input'
                      })
                    ]
                  )
                ]
              ),

              currentSection === 'laboral' && React.createElement(
                'div',
                { className: 'seccion-laboral', key: 'laboral-section' },
                [
                  React.createElement('h3', { key: 'title' }, 'Información Laboral'),
                  
                  React.createElement(
                    'div',
                    { className: 'campo', key: 'empresa' },
                    [
                      React.createElement('label', { key: 'label' }, 'Empresa donde trabaja:'),
                      React.createElement('input', {
                        type: 'text',
                        name: 'empresa',
                        value: formData.empresa,
                        onChange: handleChange,
                        required: true,
                        key: 'input'
                      })
                    ]
                  ),
                  
                  React.createElement(
                    'div',
                    { className: 'campo', key: 'puesto' },
                    [
                      React.createElement('label', { key: 'label' }, 'Puesto:'),
                      React.createElement('input', {
                        type: 'text',
                        name: 'puesto',
                        value: formData.puesto,
                        onChange: handleChange,
                        required: true,
                        key: 'input'
                      })
                    ]
                  ),
                  
                  React.createElement(
                    'div',
                    { className: 'campo', key: 'direccion-trabajo' },
                    [
                      React.createElement('label', { key: 'label' }, 'Dirección de trabajo:'),
                      React.createElement('input', {
                        type: 'text',
                        name: 'direccion_trabajo',
                        value: formData.direccion_trabajo,
                        onChange: handleChange,
                        required: true,
                        key: 'input'
                      })
                    ]
                  ),
                  
                  React.createElement(
                    'div',
                    { className: 'dos-columnas', key: 'dos-columnas' },
                    [
                      React.createElement(
                        'div',
                        { className: 'campo', key: 'ingreso-mensual' },
                        [
                          React.createElement('label', { key: 'label' }, 'Ingreso mensual ($):'),
                          React.createElement('input', {
                            type: 'number',
                            name: 'ingreso_mensual',
                            value: formData.ingreso_mensual,
                            onChange: handleChange,
                            min: '0',
                            step: '0.01',
                            required: true,
                            key: 'input'
                          })
                        ]
                      ),
                      
                      React.createElement(
                        'div',
                        { className: 'campo', key: 'tiempo-laborando' },
                        [
                          React.createElement('label', { key: 'label' }, 'Tiempo laborando (meses):'),
                          React.createElement('input', {
                            type: 'number',
                            name: 'tiempo_laborando',
                            value: formData.tiempo_laborando,
                            onChange: handleChange,
                            min: '0',
                            required: true,
                            key: 'input'
                          })
                        ]
                      )
                    ]
                  )
                ]
              ),

              currentSection === 'documentos' && React.createElement(
                'div',
                { className: 'seccion-documentos', key: 'documentos-section' },
                [
                  React.createElement('h3', { key: 'title' }, 'Documentación Requerida'),
                  
                  React.createElement(
                    'div',
                    { className: 'campo-checkbox', key: 'comprobante' },
                    [
                      React.createElement('input', {
                        type: 'checkbox',
                        name: 'comprobante_ingresos',
                        checked: formData.comprobante_ingresos,
                        onChange: handleChange,
                        id: 'comprobante_ingresos',
                        key: 'input'
                      }),
                      React.createElement(
                        'label',
                        { htmlFor: 'comprobante_ingresos', key: 'label' },
                        '¿Cuenta con comprobante de ingresos?'
                      )
                    ]
                  ),
                  
                  React.createElement(
                    'div',
                    { className: 'campo-checkbox', key: 'terminos' },
                    [
                      React.createElement('input', {
                        type: 'checkbox',
                        name: 'acepta_terminos',
                        checked: formData.acepta_terminos,
                        onChange: handleChange,
                        id: 'acepta_terminos',
                        required: true,
                        key: 'input'
                      }),
                      React.createElement(
                        'label',
                        { htmlFor: 'acepta_terminos', key: 'label' },
                        'Acepto los términos y condiciones del financiamiento'
                      )
                    ]
                  )
                ]
              ),

              React.createElement(
                'div',
                { className: 'form-actions', key: 'actions' },
                React.createElement(
                  'button',
                  { type: 'submit', className: 'btn-enviar', key: 'submit' },
                  'Enviar Solicitud'
                )
              )
            ]
          )
        ]
      ),

      React.createElement(Footer, { key: 'footer' })
    ]
  );
};

export default withRouter(SolicitudForm);