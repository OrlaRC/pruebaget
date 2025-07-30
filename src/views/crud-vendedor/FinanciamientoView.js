import React, { useState, useEffect, useContext } from 'react';
import {
  FileText, UserCheck, Shield, DollarSign, Percent,
  Clock, Users, Heart, Car, CheckCircle, Calculator,
  History, ChevronDown, ChevronUp, Copy, Trash2,
  Search, ArrowRight, Calendar, CreditCard, Image, ImagePlus,
  Info, AlertCircle, Download, Share2, Filter, SortAsc
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import LayoutVendedor from '../layout/LayoutVendedor';
import { NotificationContext } from '../../context/NotificationContext';
import './FinanciamientoView.css';

// Base de datos de vehículos con precios del "Libro Azul"
const vehiculosDisponibles = [
  {
    id: 1,
    marca: 'Toyota',
    modelo: 'Corolla',
    año: 2020,
    precio: 189000,
    imagen: 'https://via.placeholder.com/600x400?text=Toyota+Corolla+2020',
    imagenesAlternativas: [
      'https://via.placeholder.com/600x400?text=Toyota+Corolla+Front',
      'https://via.placeholder.com/600x400?text=Toyota+Corolla+Side',
      'https://via.placeholder.com/600x400?text=Toyota+Corolla+Rear'
    ],
    categoria: 'Sedán',
    combustible: 'Gasolina',
    transmision: 'Automático'
  },
  {
    id: 2,
    marca: 'Honda',
    modelo: 'Civic',
    año: 2021,
    precio: 280000,
    imagen: 'https://via.placeholder.com/600x400?text=Honda+Civic+2021',
    categoria: 'Sedán',
    combustible: 'Gasolina',
    transmision: 'Automático'
  },
  {
    id: 3,
    marca: 'Nissan',
    modelo: 'Sentra',
    año: 2019,
    precio: 220000,
    imagen: 'https://via.placeholder.com/600x400?text=Nissan+Sentra+2019',
    categoria: 'Sedán',
    combustible: 'Gasolina',
    transmision: 'Automático'
  }
];

const FinanciamientoView = () => {
  const { showNotification } = useContext(NotificationContext);

  const [cotizacion, setCotizacion] = useState({
    vehiculo: null,
    enganche: 20000,
    plazo: 12,
    mensualidad: 0,
    comision: 0,
    mensualidadesDisponibles: [],
    imagenIndex: 0,
    tasaInteres: 7.2
  });

  const [historial, setHistorial] = useState([]);
  const [showHistorial, setShowHistorial] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [ordenamiento, setOrdenamiento] = useState('precio');
  const [generatingPDF, setGeneratingPDF] = useState(false);

  useEffect(() => {
    const historialInicial = [];
    setHistorial(historialInicial);
  }, []);

  const vehiculosFiltrados = vehiculosDisponibles
    .filter(vehiculo => {
      const matchBusqueda = vehiculo.marca.toLowerCase().includes(busqueda.toLowerCase()) ||
                           vehiculo.modelo.toLowerCase().includes(busqueda.toLowerCase());
      const matchCategoria = !filtroCategoria || vehiculo.categoria === filtroCategoria;
      return matchBusqueda && matchCategoria;
    })
    .sort((a, b) => {
      switch (ordenamiento) {
        case 'precio':
          return a.precio - b.precio;
        case 'año':
          return b.año - a.año;
        case 'marca':
          return a.marca.localeCompare(b.marca);
        default:
          return 0;
      }
    });

  const categorias = [...new Set(vehiculosDisponibles.map(v => v.categoria))];

  const seleccionarVehiculo = (vehiculo) => {
    let enganche = 20000;
    const precio = vehiculo.precio;
    const tasaMensual = cotizacion.tasaInteres / 100 / 12;
    const montoFinanciado = precio - enganche;

    const mensualidad = Math.round(
      (tasaMensual * montoFinanciado) / (1 - Math.pow(1 + tasaMensual, -cotizacion.plazo))
    );

    const comision = Math.round(precio * 0.05);

    setCotizacion({
      vehiculo,
      enganche,
      plazo: cotizacion.plazo,
      mensualidad,
      comision,
      mensualidadesDisponibles: [{ plazo: 12, mensualidad, totalIntereses: Math.round(mensualidad * 12 - montoFinanciado) }],
      imagenIndex: 0,
      tasaInteres: cotizacion.tasaInteres
    });

    showNotification('Vehículo seleccionado correctamente', 'success');
  };

  const calcularCotizacion = () => {
    if (!cotizacion.vehiculo) {
      showNotification('Por favor selecciona un vehículo primero', 'error');
      return;
    }

    const nuevaCotizacion = {
      ...cotizacion,
      fecha: new Date().toLocaleString(),
      id: Date.now()
    };

    setHistorial(prev => [nuevaCotizacion, ...prev].slice(0, 10));
    showNotification('Cotización guardada en el historial', 'success');
  };

  const handleEngancheChange = (e) => {
    if (!cotizacion.vehiculo) return;

    const enganche = parseFloat(e.target.value) || 0;
    const precio = cotizacion.vehiculo?.precio || 0;

    let engancheFinal = enganche;
    const engancheMinimo = 20000;
    const engancheMaximo = precio * 0.5;

    if (enganche < engancheMinimo) {
      engancheFinal = engancheMinimo;
      showNotification(`El enganche mínimo es ${formatPrice(engancheMinimo)}`, 'warning');
    } else if (enganche > engancheMaximo) {
      engancheFinal = engancheMaximo;
      showNotification(`El enganche máximo es ${formatPrice(engancheMaximo)}`, 'warning');
    }

    const tasaMensual = cotizacion.tasaInteres / 100 / 12;
    const montoFinanciado = precio - engancheFinal;
    const mensualidad = Math.round(
      (tasaMensual * montoFinanciado) / (1 - Math.pow(1 + tasaMensual, -cotizacion.plazo))
    );

    setCotizacion(prev => ({
      ...prev,
      enganche: engancheFinal,
      mensualidadesDisponibles: [{
        plazo: prev.plazo,
        mensualidad,
        totalIntereses: Math.round(mensualidad * prev.plazo - montoFinanciado)
      }],
      mensualidad
    }));
  };

  const handleTasaInteresChange = (e) => {
    // This function is no longer needed since the input is disabled
    // Keeping it as a no-op to avoid breaking existing references
  };

  const seleccionarMensualidad = (plazo, mensualidad) => {
    setCotizacion(prev => ({
      ...prev,
      plazo,
      mensualidad
    }));
  };

  const cambiarImagen = () => {
    if (!cotizacion.vehiculo || !cotizacion.vehiculo.imagenesAlternativas) return;

    const nextIndex = (cotizacion.imagenIndex + 1) % cotizacion.vehiculo.imagenesAlternativas.length;
    setCotizacion(prev => ({
      ...prev,
      imagenIndex: nextIndex
    }));
  };

  const copiarCotizacion = (cotizacion) => {
    setCotizacion({
      vehiculo: cotizacion.vehiculo,
      enganche: cotizacion.enganche,
      plazo: cotizacion.plazo,
      mensualidad: cotizacion.mensualidad,
      comision: cotizacion.comision,
      mensualidadesDisponibles: cotizacion.mensualidadesDisponibles,
      imagenIndex: 0,
      tasaInteres: cotizacion.tasaInteres
    });
    showNotification('Cotización copiada correctamente', 'success');
  };

  const eliminarDelHistorial = (id) => {
    setHistorial(prev => prev.filter(item => item.id !== id));
    showNotification('Cotización eliminada del historial', 'success');
  };

  const exportarCotizacion = () => {
    if (!cotizacion.vehiculo) {
      showNotification('No hay cotización para exportar', 'error');
      return;
    }

    setGeneratingPDF(true);

    try {
      const doc = new jsPDF();
      let startY = 20;

      // Configuración del documento
      doc.setFontSize(18);
      doc.setTextColor(40, 40, 40);
      doc.text("Cotización de Financiamiento", 14, startY);
      startY += 10;

      const date = new Date().toLocaleDateString();
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generado el: ${date}`, 14, startY);
      startY += 10;
      doc.text(`Vehículo: ${getNombreVehiculo(cotizacion.vehiculo)}`, 14, startY);
      startY += 15;

      // Detalles del vehículo
      doc.setFontSize(14);
      doc.setTextColor(40, 40, 40);
      doc.text('Detalles del Vehículo', 14, startY);
      startY += 10;

      autoTable(doc, {
        startY: startY,
        head: [['Marca', 'Modelo', 'Año', 'Precio']],
        body: [[
          cotizacion.vehiculo.marca,
          cotizacion.vehiculo.modelo,
          cotizacion.vehiculo.año,
          formatPrice(cotizacion.vehiculo.precio)
        ]],
        theme: 'grid',
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: 'bold'
        }
      });
      startY = doc.lastAutoTable.finalY + 10;

      // Detalles de financiamiento
      doc.setFontSize(14);
      doc.text('Detalles de Financiamiento', 14, startY);
      startY += 10;

      autoTable(doc, {
        startY: startY,
        head: [['Concepto', 'Valor']],
        body: [
          ['Enganche', formatPrice(cotizacion.enganche)],
          ['Monto a financiar', formatPrice(cotizacion.vehiculo.precio - cotizacion.enganche)],
          ['Plazo', `${cotizacion.plazo} meses`],
          ['Tasa de interés', `${cotizacion.tasaInteres}% anual`],
          ['Mensualidad', formatPrice(cotizacion.mensualidad)],
          ['Comisión', formatPrice(cotizacion.comision)],
          ['Total a pagar', formatPrice(cotizacion.enganche + (cotizacion.mensualidad * cotizacion.plazo))],
          ['Intereses totales', formatPrice(cotizacion.mensualidad * cotizacion.plazo - (cotizacion.vehiculo.precio - cotizacion.enganche))]
        ],
        theme: 'grid',
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: 'bold'
        }
      });
      startY = doc.lastAutoTable.finalY + 10;

      // Beneficios incluidos
      doc.setFontSize(14);
      doc.text('Beneficios Incluidos', 14, startY);
      startY += 10;

      doc.setFontSize(10);
      doc.text('• Garantía mecánica', 14, startY);
      startY += 5;
      doc.text('• Trámite de placas', 14, startY);
      startY += 5;
      doc.text('• Seguro de vida', 14, startY);
      startY += 5;
      doc.text('• Seguro vehicular (sujeto a promoción)', 14, startY);
      startY += 5;
      doc.text('• GPS inmovilizador', 14, startY);
      startY += 10;

      // Notas al pie
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text('* Esta cotización es válida por 15 días a partir de la fecha de emisión.', 14, startY);
      startY += 5;
      doc.text('* Los términos y condiciones están sujetos a aprobación de crédito.', 14, startY);

      // Guardar el PDF
      doc.save(`cotizacion_${getNombreVehiculo(cotizacion.vehiculo).replace(/\s+/g, '_')}.pdf`);
      showNotification('Cotización exportada como PDF', 'success');
    } catch (error) {
      console.error('Error al generar PDF:', error);
      showNotification('Error al generar el PDF', 'error');
    } finally {
      setGeneratingPDF(false);
    }
  };

  const compartirCotizacion = () => {
    if (!cotizacion.vehiculo) {
      showNotification('No hay cotización para compartir', 'error');
      return;
    }

    const texto = `Cotización de ${getNombreVehiculo(cotizacion.vehiculo)}:
Precio: ${formatPrice(cotizacion.vehiculo.precio)}
Enganche: ${formatPrice(cotizacion.enganche)}
Monto a financiar: ${formatPrice(cotizacion.vehiculo.precio - cotizacion.enganche)}
Mensualidad: ${formatPrice(cotizacion.mensualidad)} (${cotizacion.plazo} meses)
Tasa de interés: ${cotizacion.tasaInteres}%
Beneficios: Garantía mecánica, trámite de placas, seguro de vida, seguro vehicular (sujeto a promoción), GPS inmovilizador`;

    if (navigator.share) {
      navigator.share({
        title: 'Cotización de Financiamiento',
        text: texto
      }).then(() => {
        showNotification('Cotización compartida correctamente', 'success');
      }).catch(() => {
        showNotification('Error al compartir la cotización', 'error');
      });
    } else {
      navigator.clipboard.writeText(texto).then(() => {
        showNotification('Cotización copiada al portapapeles', 'success');
      }).catch(() => {
        showNotification('Error al copiar la cotización', 'error');
      });
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0
    }).format(price || 0);
  };

  const getNombreVehiculo = (vehiculo) => {
    return vehiculo ? `${vehiculo.marca} ${vehiculo.modelo} ${vehiculo.año}` : '';
  };

  const getImagenActual = () => {
    if (!cotizacion.vehiculo) return '';
    if (!cotizacion.vehiculo.imagenesAlternativas) return cotizacion.vehiculo.imagen;
    return cotizacion.vehiculo.imagenesAlternativas[cotizacion.imagenIndex] || cotizacion.vehiculo.imagen;
  };

  const calcularAhorro = () => {
    if (!cotizacion.vehiculo) return 0;
    const precioContado = cotizacion.vehiculo.precio;
    const totalFinanciado = cotizacion.enganche + (cotizacion.mensualidad * cotizacion.plazo);
    return totalFinanciado - precioContado;
  };

  return (
    <LayoutVendedor>
      <div className="fin-min-h-screen fin-bg-gradient-to-br from-blue-50 to-indigo-100 fin-p-4">
        <div className="fin-max-w-7xl fin-mx-auto">
          {/* Header */}
          <div className="fin-bg-white fin-rounded-xl fin-shadow-lg fin-p-6 fin-mb-6">
            <div className="fin-flex fin-items-center fin-justify-between">
              <div className="fin-flex fin-items-center fin-space-x-3">
                <div className="fin-bg-blue-500 fin-p-3 fin-rounded-full">
                  <Calculator className="fin-w-6 fin-h-6 fin-text-white" />
                </div>
                <div>
                  <h1 className="fin-text-2xl fin-font-bold fin-text-gray-800">Calculadora de Financiamiento</h1>
                  <p className="fin-text-gray-600">Encuentra la mejor opción para tu vehículo</p>
                </div>
              </div>
              <div className="fin-flex fin-space-x-2">
                <button
                  className="fin-px-4 fin-py-2 fin-rounded-lg fin-font-medium fin-transition-colors fin-bg-blue-500 fin-text-white"
                  onClick={() => setCotizacion(prev => ({...prev, vehiculo: null, enganche: 20000, mensualidad: 0, comision: 0}))}
                >
                  <Calculator className="fin-w-4 fin-h-4 fin-inline fin-mr-2" />
                  Nueva Cotización
                </button>
                <button
                  className="fin-px-4 fin-py-2 fin-rounded-lg fin-font-medium fin-transition-colors fin-bg-green-500 fin-text-white"
                  onClick={exportarCotizacion}
                  disabled={generatingPDF || !cotizacion.vehiculo}
                >
                  <Download className="fin-w-4 fin-h-4 fin-inline fin-mr-2" />
                  {generatingPDF ? 'Generando...' : 'Descargar PDF'}
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="fin-grid fin-grid-cols-1 lg:fin-grid-cols-3 fin-gap-6">
            {/* Vehicle Selection */}
            <div className="fin-bg-white fin-rounded-xl fin-shadow-lg fin-p-6">
              <h2 className="fin-text-xl fin-font-semibold fin-mb-4">Seleccionar Vehículo</h2>
              <div className="fin-flex fin-mb-4 fin-space-x-2">
                <div className="fin-relative fin-flex-1">
                  <Search className="fin-absolute fin-left-3 fin-top-2.5 fin-w-5 fin-h-5 fin-text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar vehículo..."
                    className="fin-w-full fin-pl-10 fin-pr-4 fin-py-2 fin-rounded-lg fin-border fin-border-gray-300 fin-focus:outline-none fin-focus:ring-2 fin-focus:ring-blue-500"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                  />
                </div>
                <select
                  className="fin-px-4 fin-py-2 fin-rounded-lg fin-border fin-border-gray-300 fin-focus:outline-none fin-focus:ring-2 fin-focus:ring-blue-500"
                  value={filtroCategoria}
                  onChange={(e) => setFiltroCategoria(e.target.value)}
                >
                  <option value="">Todas las categorías</option>
                  {categorias.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <select
                  className="fin-px-4 fin-py-2 fin-rounded-lg fin-border fin-border-gray-300 fin-focus:outline-none fin-focus:ring-2 fin-focus:ring-blue-500"
                  value={ordenamiento}
                  onChange={(e) => setOrdenamiento(e.target.value)}
                >
                  <option value="precio">Ordenar por precio</option>
                  <option value="año">Ordenar por año</option>
                  <option value="marca">Ordenar por marca</option>
                </select>
              </div>
              <div className="fin-grid fin-grid-cols-1 sm:fin-grid-cols-2 fin-gap-4 fin-max-h-96 fin-overflow-y-auto">
                {vehiculosFiltrados.map(vehiculo => (
                  <div
                    key={vehiculo.id}
                    className={`fin-p-4 fin-rounded-lg fin-border fin-cursor-pointer fin-transition-all ${
                      cotizacion.vehiculo?.id === vehiculo.id
                        ? 'fin-bg-blue-50 fin-border-blue-500'
                        : 'fin-bg-white fin-border-gray-200 hover:fin-bg-gray-50'
                    }`}
                    onClick={() => seleccionarVehiculo(vehiculo)}
                  >
                    <img src={vehiculo.imagen} alt={getNombreVehiculo(vehiculo)} className="fin-w-full fin-h-32 fin-object-cover fin-rounded-lg fin-mb-2" />
                    <h3 className="fin-font-semibold">{getNombreVehiculo(vehiculo)}</h3>
                    <p className="fin-text-gray-600">{formatPrice(vehiculo.precio)}</p>
                    <p className="fin-text-sm fin-text-gray-500">{vehiculo.categoria} • {vehiculo.combustible}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Financing Details */}
            <div className="fin-bg-white fin-rounded-xl fin-shadow-lg fin-p-6 lg:fin-col-span-2">
              <h2 className="fin-text-xl fin-font-semibold fin-mb-4">Detalles de Financiamiento</h2>
              {cotizacion.vehiculo ? (
                <div className="fin-grid fin-grid-cols-1 md:fin-grid-cols-2 fin-gap-6">
                  <div>
                    <img
                      src={getImagenActual()}
                      alt={getNombreVehiculo(cotizacion.vehiculo)}
                      className="fin-w-full fin-h-64 fin-object-cover fin-rounded-lg fin-mb-4"
                    />
                    {cotizacion.vehiculo.imagenesAlternativas && (
                      <button
                        className="fin-px-4 fin-py-2 fin-bg-gray-200 fin-rounded-lg fin-text-sm fin-font-medium fin-w-full"
                        onClick={cambiarImagen}
                      >
                        <ImagePlus className="fin-w-4 fin-h-4 fin-inline fin-mr-2" />
                        Cambiar imagen
                      </button>
                    )}
                  </div>
                  <div>
                    <h3 className="fin-text-lg fin-font-semibold fin-mb-2">{getNombreVehiculo(cotizacion.vehiculo)}</h3>
                    <p className="fin-text-gray-600 fin-mb-4">Precio: {formatPrice(cotizacion.vehiculo.precio)}</p>
                    <div className="fin-space-y-4">
                      <div>
                        <label className="fin-block fin-text-sm fin-font-medium fin-text-gray-700">Enganche</label>
                        <input
                          type="number"
                          value={cotizacion.enganche}
                          onChange={handleEngancheChange}
                          className="fin-w-full fin-px-4 fin-py-2 fin-rounded-lg fin-border fin-border-gray-300 fin-focus:outline-none fin-focus:ring-2 fin-focus:ring-blue-500"
                          placeholder="Ingresa el enganche"
                        />
                      </div>
                      <div>
                        <label className="fin-block fin-text-sm fin-font-medium fin-text-gray-700">Tasa de interés (% anual)</label>
                        <input
                          type="number"
                          value={cotizacion.tasaInteres}
                          disabled // Added to prevent modification
                          className="fin-w-full fin-px-4 fin-py-2 fin-rounded-lg fin-border fin-border-gray-300 fin-focus:outline-none fin-focus:ring-2 fin-focus:ring-blue-500"
                          step="0.1"
                        />
                      </div>
                      <div>
                        <label className="fin-block fin-text-sm fin-font-medium fin-text-gray-700">Plazo</label>
                        <select
                          className="fin-w-full fin-px-4 fin-py-2 fin-rounded-lg fin-border fin-border-gray-300 fin-focus:outline-none fin-focus:ring-2 fin-focus:ring-blue-500"
                          value={cotizacion.plazo}
                          onChange={(e) => seleccionarMensualidad(parseInt(e.target.value), cotizacion.mensualidadesDisponibles.find(m => m.plazo === parseInt(e.target.value))?.mensualidad || 0)}
                        >
                          {cotizacion.mensualidadesDisponibles.map(({ plazo, mensualidad }) => (
                            <option key={plazo} value={plazo}>{plazo} meses - {formatPrice(mensualidad)}</option>
                          ))}
                        </select>
                      </div>
                      <div className="fin-p-4 fin-bg-blue-50 fin-rounded-lg">
                        <p><strong>Mensualidad:</strong> {formatPrice(cotizacion.mensualidad)}</p>
                        <p><strong>Monto a financiar:</strong> {formatPrice(cotizacion.vehiculo.precio - cotizacion.enganche)}</p>
                        <p><strong>Total a pagar:</strong> {formatPrice(cotizacion.enganche + (cotizacion.mensualidad * cotizacion.plazo))}</p>
                        <p><strong>Intereses totales:</strong> {formatPrice(cotizacion.mensualidad * cotizacion.plazo - (cotizacion.vehiculo.precio - cotizacion.enganche))}</p>
                        <p><strong>Comisión:</strong> {formatPrice(cotizacion.comision)}</p>
                      </div>
                      <div className="fin-flex fin-space-x-2">
                        <button
                          className="fin-flex-1 fin-px-4 fin-py-2 fin-bg-blue-500 fin-text-white fin-rounded-lg fin-font-medium fin-transition-colors"
                          onClick={calcularCotizacion}
                        >
                          <Calculator className="fin-w-4 fin-h-4 fin-inline fin-mr-2" />
                          Guardar Cotización
                        </button>
                        <button
                          className="fin-flex-1 fin-px-4 fin-py-2 fin-bg-green-500 fin-text-white fin-rounded-lg fin-font-medium fin-transition-colors"
                          onClick={exportarCotizacion}
                          disabled={generatingPDF}
                        >
                          <Download className="fin-w-4 fin-h-4 fin-inline fin-mr-2" />
                          {generatingPDF ? 'Generando...' : 'Exportar PDF'}
                        </button>
                        <button
                          className="fin-flex-1 fin-px-4 fin-py-2 fin-bg-indigo-500 fin-text-white fin-rounded-lg fin-font-medium fin-transition-colors"
                          onClick={compartirCotizacion}
                        >
                          <Share2 className="fin-w-4 fin-h-4 fin-inline fin-mr-2" />
                          Compartir
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="fin-text-center fin-py-10">
                  <Car className="fin-w-16 fin-h-16 fin-mx-auto fin-text-gray-400 fin-mb-4" />
                  <p className="fin-text-gray-600">Selecciona un vehículo para comenzar</p>
                </div>
              )}
            </div>

            {/* History */}
            <div className="fin-bg-white fin-rounded-xl fin-shadow-lg fin-p-6 lg:fin-col-span-3">
              <button
                className="fin-flex fin-items-center fin-space-x-2 fin-mb-4 fin-text-lg fin-font-semibold"
                onClick={() => setShowHistorial(!showHistorial)}
              >
                <History className="fin-w-5 fin-h-5" />
                <span>Historial de Cotizaciones</span>
                {showHistorial ? <ChevronUp className="fin-w-5 fin-h-5" /> : <ChevronDown className="fin-w-5 fin-h-5" />}
              </button>
              {showHistorial && (
                <div className="fin-space-y-4">
                  {historial.length > 0 ? (
                    historial.map(cot => (
                      <div key={cot.id} className="fin-p-4 fin-bg-gray-50 fin-rounded-lg fin-flex fin-justify-between fin-items-center">
                        <div>
                          <p className="fin-font-semibold">{getNombreVehiculo(cot.vehiculo)}</p>
                          <p className="fin-text-sm fin-text-gray-600">
                            {formatPrice(cot.mensualidad)}/mes | {cot.plazo} meses | {formatPrice(cot.enganche)} enganche
                          </p>
                          <p className="fin-text-sm fin-text-gray-500">{cot.fecha}</p>
                        </div>
                        <div className="fin-flex fin-space-x-2">
                          <button
                            className="fin-p-2 fin-bg-blue-500 fin-text-white fin-rounded-lg"
                            onClick={() => copiarCotizacion(cot)}
                          >
                            <Copy className="fin-w-4 fin-h-4" />
                          </button>
                          <button
                            className="fin-p-2 fin-bg-red-500 fin-text-white fin-rounded-lg"
                            onClick={() => eliminarDelHistorial(cot.id)}
                          >
                            <Trash2 className="fin-w-4 fin-h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="fin-text-gray-600">No hay cotizaciones en el historial</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </LayoutVendedor>
  );
};

export default FinanciamientoView;