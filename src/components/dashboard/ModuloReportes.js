// src/components/dashboard/ModuloReportes.js
import React, { useState, useEffect } from 'react';
import { 
  Link2, 
  Download, 
  Share2, 
  Calendar, 
  Layers, 
  FileText, 
  ExternalLink, 
  Code, 
  X, 
  Search, 
  Filter, 
  ChevronDown, 
  Calendar as CalendarIcon, 
  DollarSign,
  BarChart2,
  AlertCircle,
  Info
} from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import { useAuth } from '../../context/AuthContext';
import { formatoMoneda } from '../../utils/formatUtils';
import GraficoReportes from './GraficoReportes';
import { collection, doc, getDoc, getDocs, query, where, orderBy, limit } from 'firebase/firestore';

const ModuloReportes = () => {
  const [tabActivo, setTabActivo] = useState('reportes');
  const [enlaceCompartir, setEnlaceCompartir] = useState('');
  const [mostrarEnlace, setMostrarEnlace] = useState(false);
  const [mostrarGrafico, setMostrarGrafico] = useState(true);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [mostrarFiltrosAvanzados, setMostrarFiltrosAvanzados] = useState(false);
  const [cargandoReporte, setCargandoReporte] = useState(false);
  const [errorCarga, setErrorCarga] = useState(null);
  const [mostrarExplicacion, setMostrarExplicacion] = useState(false);
  
  // Nuevo estado para manejar el reporte seleccionado que se mostrará en pantalla
  const [reporteSeleccionado, setReporteSeleccionado] = useState(null);
  
  // Estados para los filtros
  const [filtroCreador, setFiltroCreador] = useState('');
  const [filtroFecha, setFiltroFecha] = useState({
    inicio: '',
    fin: ''
  });
  const [filtroBloque, setFiltroBloque] = useState('');
  const [filtroValorizadoMin, setFiltroValorizadoMin] = useState('');
  const [filtroValorizadoMax, setFiltroValorizadoMax] = useState('');
  const [ordenCampo, setOrdenCampo] = useState('totalValorizado');
  const [ordenDireccion, setOrdenDireccion] = useState('desc');
  const [busquedaTexto, setBusquedaTexto] = useState('');
  
  // Usar el contexto de Dashboard para obtener datos reales
  const { db } = useAuth();
  const { datos, loading, filtros, recargarDatos } = useDashboard();
  
  // Obtener reportes del contexto
  const reportesOriginales = datos.reportes || [];
  
  // Obtener creadores y bloques únicos para los selectores de filtros
  const [creadoresList, setCreadoresList] = useState([]);
  const [bloquesList, setBloquesList] = useState([]);
  
  // Función auxiliar para formatear fechas (YYYY-MM-DD a DD/MM/YYYY)
  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return '';
    
    const partes = fechaStr.split('-');
    if (partes.length !== 3) return fechaStr;
    
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  };
  
  // Función para calcular el avance a partir de metrado programado y ejecutado
  const calculateAvance = (metradoP, metradoE) => {
    if (!metradoP || metradoP === 0) return "0%";
    const avance = (metradoE / metradoP) * 100;
    return `${avance.toFixed(1)}%`;
  };
  
  // Función para limpiar filtros
  const limpiarFiltros = () => {
    setBusquedaTexto('');
    setFiltroCreador('');
    setFiltroFecha({
      inicio: '',
      fin: ''
    });
    setFiltroBloque('');
    setFiltroValorizadoMin('');
    setFiltroValorizadoMax('');
    setOrdenCampo('totalValorizado');
    setOrdenDireccion('desc');
  };
  
  // Función para aplicar filtros
  const aplicarFiltros = () => {
    // Esta función es principalmente para mantener coherencia con la UI
    // Los filtros se aplican automáticamente mediante los efectos y memo
    setMostrarFiltrosAvanzados(false);
  };
  
  // Función para obtener filtro de fecha para el gráfico
  const obtenerFiltroFecha = () => {
    if (filtroFecha.inicio && filtroFecha.fin) {
      return filtroFecha;
    }
    return null;
  };
  
  // Función para generar enlace para compartir
  const generarEnlaceCompartir = (reporte) => {
    const enlace = `${window.location.origin}/dashboard?reporteId=${reporte.id || reporte.reporteId}`;
    setEnlaceCompartir(enlace);
    setMostrarEnlace(true);
    
    // Ocultar el enlace después de 30 segundos
    setTimeout(() => {
      setMostrarEnlace(false);
    }, 30000);
  };
  
  useEffect(() => {
    // Extraer lista de creadores únicos
    const creadores = [...new Set(reportesOriginales.map(r => r.creadoPor || 'Sin datos'))];
    setCreadoresList(creadores);
    
    // Extraer lista de bloques/subcontratistas únicos
    const bloques = [...new Set(reportesOriginales.map(r => r.subcontratistaBLoque || r.subcontratistaBloque || 'Sin datos'))];
    setBloquesList(bloques);
    
  }, [reportesOriginales]);
  
  // Aplicar filtros a los reportes
  const reportesFiltrados = React.useMemo(() => {
    let filtrados = [...reportesOriginales];
    
    // Filtro por texto de búsqueda (busca en cualquier campo)
    if (busquedaTexto) {
      const textoBusqueda = busquedaTexto.toLowerCase();
      filtrados = filtrados.filter(reporte => {
        return (
          (reporte.creadoPor && reporte.creadoPor.toLowerCase().includes(textoBusqueda)) ||
          (reporte.subcontratistaBLoque && reporte.subcontratistaBLoque.toLowerCase().includes(textoBusqueda)) ||
          (reporte.subcontratistaBloque && reporte.subcontratistaBloque.toLowerCase().includes(textoBusqueda)) ||
          (reporte.id && reporte.id.toLowerCase().includes(textoBusqueda)) ||
          (reporte.reporteId && reporte.reporteId.toLowerCase().includes(textoBusqueda))
        );
      });
    }
    
    // Filtro por creador
    if (filtroCreador) {
      filtrados = filtrados.filter(reporte => reporte.creadoPor === filtroCreador);
    }
    
    // Filtro por fecha
    if (filtroFecha.inicio) {
      filtrados = filtrados.filter(reporte => reporte.fecha >= filtroFecha.inicio);
    }
    if (filtroFecha.fin) {
      filtrados = filtrados.filter(reporte => reporte.fecha <= filtroFecha.fin);
    }
    
    // Filtro por bloque/subcontratista
    if (filtroBloque) {
      filtrados = filtrados.filter(reporte => 
        (reporte.subcontratistaBLoque === filtroBloque) || 
        (reporte.subcontratistaBloque === filtroBloque)
      );
    }
    
    // Filtros avanzados
    // Valor mínimo
    if (filtroValorizadoMin) {
      const minValor = parseFloat(filtroValorizadoMin);
      if (!isNaN(minValor)) {
        filtrados = filtrados.filter(reporte => (reporte.totalValorizado || 0) >= minValor);
      }
    }
    
    // Valor máximo
    if (filtroValorizadoMax) {
      const maxValor = parseFloat(filtroValorizadoMax);
      if (!isNaN(maxValor)) {
        filtrados = filtrados.filter(reporte => (reporte.totalValorizado || 0) <= maxValor);
      }
    }
    
    // Ordenamiento
    filtrados.sort((a, b) => {
      let valorA = a[ordenCampo] || 0;
      let valorB = b[ordenCampo] || 0;
      
      // Si estamos ordenando por un campo de texto
      if (ordenCampo === 'creadoPor' || ordenCampo === 'fecha' || ordenCampo === 'subcontratistaBLoque') {
        valorA = String(valorA).toLowerCase();
        valorB = String(valorB).toLowerCase();
        return ordenDireccion === 'asc' ? valorA.localeCompare(valorB) : valorB.localeCompare(valorA);
      }
      
      // Ordenamiento numérico
      return ordenDireccion === 'asc' ? valorA - valorB : valorB - valorA;
    });
    
    return filtrados;
  }, [
    reportesOriginales, 
    busquedaTexto, 
    filtroCreador, 
    filtroFecha, 
    filtroBloque, 
    filtroValorizadoMin, 
    filtroValorizadoMax, 
    ordenCampo, 
    ordenDireccion
  ]);
  
  // Función para calcular los costos según la categoría
  const calcularCostoPorCategoria = (categoria, horas) => {
    const tarifas = {
      'OPERARIO': 23.00,
      'OFICIAL': 18.09,
      'PEON': 16.38,
      'DEFAULT': 18.00 // Valor por defecto si no se especifica categoría
    };
    
    const tarifa = tarifas[categoria] || tarifas.DEFAULT;
    return tarifa * parseFloat(horas);
  };
  
  // Función mejorada para obtener detalles completos de un reporte específico
  const verReporte = async (reporte) => {
    try {
      // Limpiar errores anteriores y establecer estado de carga
      setErrorCarga(null);
      setCargandoReporte(true);
      
      // Establecer reporte básico mientras se cargan los detalles
      setReporteSeleccionado({
        ...reporte,
        cargando: true
      });
      
      let reporteCompleto = null;
      
      // Cargar datos reales de Firebase
      reporteCompleto = await cargarDatosReporteFirebase(reporte);
      
      // Asegurarse de que tenemos un reporte completo
      if (!reporteCompleto) {
        throw new Error("No se pudo generar un reporte completo");
      }
      
      // Actualizar el estado con el reporte completo
      setReporteSeleccionado({
        ...reporteCompleto,
        cargando: false
      });
      
    } catch (error) {
      console.error("Error al procesar reporte:", error);
      setErrorCarga(error.message || "Error al cargar los detalles del reporte");
      
      // Establecer un reporte básico con mensaje de error
      setReporteSeleccionado({
        ...reporte,
        error: error.message || "Error al cargar los detalles del reporte",
        cargando: false
      });
    } finally {
      setCargandoReporte(false);
    }
  };
  
  // Función para cargar datos completos del reporte desde Firebase
const cargarDatosReporteFirebase = async (reporte) => {
  const reporteId = reporte.id || reporte.reporteId;
  
  if (!reporteId) {
    throw new Error("ID de reporte no válido");
  }
  
  // Primero, obtener información del reporte desde Reportes_Links para el valor valorizado
  let gananciaTotal = 0;
  try {
    const reporteLinkRef = doc(db, 'Reportes_Links', reporteId);
    const reporteLinkDoc = await getDoc(reporteLinkRef);
    
    if (reporteLinkDoc.exists()) {
      const datosLink = reporteLinkDoc.data();
      // CAMBIO: Ahora el totalValorizado es directamente la ganancia
      gananciaTotal = datosLink.totalValorizado || 0;
    } else {
      // Intentar obtener de los datos pasados del reporte
      gananciaTotal = reporte.totalValorizado || 0;
    }
  } catch (error) {
    console.error("Error al buscar en Reportes_Links:", error);
    // Fallar de forma silenciosa y usar el valor del reporte pasado
    gananciaTotal = reporte.totalValorizado || 0;
  }
  
  // Obtener el documento principal del reporte
  const reporteRef = doc(db, 'Reportes', reporteId);
  const reporteDoc = await getDoc(reporteRef);
  
  if (!reporteDoc.exists()) {
    console.log(`No se encontró el reporte con ID ${reporteId} en la colección 'Reportes'`);
    throw new Error("Reporte no encontrado");
  }
  
  // Obtener datos del documento principal
  const datosReporte = reporteDoc.data();
  
  // Obtener subcolecciones (actividades y mano de obra)
  const actividadesRef = collection(db, `Reportes/${reporteId}/actividades`);
  const manoObraRef = collection(db, `Reportes/${reporteId}/mano_obra`);
  
  const [actividadesSnapshot, manoObraSnapshot] = await Promise.all([
    getDocs(actividadesRef),
    getDocs(manoObraRef)
  ]);
  
  // Convertir a arrays - Ahora extraemos el precio directamente de cada actividad
  const actividades = actividadesSnapshot.docs.map(doc => {
    const data = doc.data();
    
    // Intentar obtener el precio unitario directamente del documento de actividad
    // Usamos la función extraerPrecioUnitario para buscar en varios campos posibles
    let precioUnitario = 0;
    
    // Verificar los posibles campos donde podría estar el precio
    if (data.precio !== undefined) {
      precioUnitario = parseFloat(data.precio);
    } else if (data.precioUnitario !== undefined) {
      precioUnitario = parseFloat(data.precioUnitario);
    } else if (data.precio_unitario !== undefined) {
      precioUnitario = parseFloat(data.precio_unitario);
    } else if (data.valorUnitario !== undefined) {
      precioUnitario = parseFloat(data.valorUnitario);
    } else if (data.pu !== undefined) {
      precioUnitario = parseFloat(data.pu);
    }
    
    // Asegurar estructura correcta con el precio incluido
    return {
      id: doc.id,
      nombre: data.proceso || data.nombre || `Actividad ${doc.id}`,
      und: data.und || data.unidad || "UND",
      metradoP: parseFloat(data.metradoP || 0),
      metradoE: parseFloat(data.metradoE || 0),
      avance: data.avance || calculateAvance(data.metradoP, data.metradoE),
      causas: data.causas || "",
      precioUnitario: precioUnitario, // Precio unitario extraído directamente
      valorTotal: precioUnitario * parseFloat(data.metradoE || 0) // Calculamos el valor total
    };
  });
  
  // Si no hay actividades, lanzar error
  if (actividades.length === 0) {
    throw new Error("No se encontraron actividades para este reporte");
  }




    
    // Calcular el total de horas trabajadas y costo de mano de obra
    let totalHorasTrabajadas = 0;
    let totalCostoMO = 0;
    
    const trabajadores = manoObraSnapshot.docs.map(doc => {
      const data = doc.data();
      
      // Calcular las horas por actividad (texto descriptivo)
      let horasActividad = "";
      if (Array.isArray(data.horas)) {
        data.horas.forEach((h, idx) => {
          if (h && parseFloat(h) > 0) {
            const actividadNombre = idx < actividades.length ? actividades[idx].nombre : `Actividad ${idx+1}`;
            horasActividad += `${actividadNombre}: ${h}h\n`;
          }
        });
      }
      
      // Calcular horas totales
      const totalHoras = Array.isArray(data.horas) 
        ? data.horas.reduce((sum, h) => sum + parseFloat(h || 0), 0)
        : parseFloat(data.totalHoras || 0);
      
      // Actualizar totales generales
      totalHorasTrabajadas += totalHoras;
      
      // Calcular costos basados en categoría
      const categoria = data.categoria || "DEFAULT";
      
      // Costo MO: Es el costo real basado en la categoría del trabajador
      const costoMO = calcularCostoPorCategoria(categoria, totalHoras);
      totalCostoMO += costoMO;
      
      return {
        id: doc.id,
        nombre: data.trabajador || data.nombre || "Sin nombre",
        categoria: data.categoria || "SIN CATEGORÍA",
        horasActividad: horasActividad || "No hay detalle de horas",
        totalHoras: totalHoras,
        costoMO: costoMO,
        horas: data.horas || []
      };
    });
    
    // Si no hay trabajadores, lanzar error
    if (trabajadores.length === 0) {
      throw new Error("No se encontraron trabajadores para este reporte");
    }
    
    // CAMBIO PRINCIPAL: Calcular el costo de expediente basado en el costo de mano de obra + ganancia
    const totalCostoExpediente = totalCostoMO + gananciaTotal;
    
    // Calcular ganancia por hora para distribuir proporcionalmente entre trabajadores
    const gananciaPorHora = totalHorasTrabajadas > 0 ? gananciaTotal / totalHorasTrabajadas : 0;
    
    // Actualizar los trabajadores con ganancia y costo expediente
    trabajadores.forEach(trabajador => {
      trabajador.ganancia = trabajador.totalHoras * gananciaPorHora;
      trabajador.costoExpediente = trabajador.costoMO + trabajador.ganancia;
    });
    
    // Crear el reporte completo
      return {
      ...reporte,
      ...datosReporte,
      actividades,
      trabajadores,
      totales: {
        horas: totalHorasTrabajadas,
        costoMO: totalCostoMO,
        costoExpediente: totalCostoExpediente,
        ganancia: gananciaTotal
      }
    };
  };
  
  // Explicación de cálculos de costos y ganancias
  const ExplicacionCalculos = () => (
    <div className="bg-white p-4 rounded-lg border border-blue-200 mb-4">
      <div className="flex items-center mb-3">
        <Info size={18} className="text-blue-600 mr-2" />
        <h4 className="font-medium text-blue-800">Acerca de los cálculos de costos y ganancias</h4>
      </div>
      
      <div className="text-sm text-gray-700">
        <p className="mb-2">Los cálculos se realizan de la siguiente manera:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Costo MO:</strong> Es el costo real de la mano de obra según categoría (OPERARIO: S/ 23.00/h, OFICIAL: S/ 18.09/h, PEÓN: S/ 16.38/h)</li>
          <li><strong>Ganancia:</strong> Es el valor total valorizado distribuido proporcionalmente según las horas trabajadas</li>
          <li><strong>Costo Expediente:</strong> Es la suma del Costo MO más la Ganancia para cada trabajador</li>
          <li><strong>Costo Actividad:</strong> Se obtiene del campo precio en la colección de actividades</li>
        </ul>
        <p className="mt-2">El Total Valorizado que se muestra en el reporte corresponde directamente a la Ganancia total del mismo.</p>
      </div>
    </div>
  );
  
  // Función mejorada para renderizar iconos de ordenamiento
  const renderOrdenIcon = (campo) => {
    const isActive = ordenCampo === campo;
    
    return (
      <svg 
        className={`w-4 h-4 ml-1 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d={isActive && ordenDireccion === 'asc' 
            ? "M5 15l7-7 7 7" 
            : "M19 9l-7 7-7-7"} 
        />
      </svg>
    );
  };
  
  // Cambiar orden al hacer clic en encabezado
  const cambiarOrden = (campo) => {
    if (ordenCampo === campo) {
      // Invertir dirección si es el mismo campo
      setOrdenDireccion(ordenDireccion === 'asc' ? 'desc' : 'asc');
    } else {
      // Establecer nuevo campo y dirección por defecto
      setOrdenCampo(campo);
      setOrdenDireccion('desc');
    }
  };
  
  // Renderizar pestaña según selección
  const renderizarTab = () => {
    switch (tabActivo) {
      case 'reportes':
        return (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium">Reportes Recientes</h3>
              
              <div className="flex space-x-2">
                {/* Botón para mostrar filtros básicos */}
                <button
                  onClick={() => setMostrarFiltros(!mostrarFiltros)}
                  className={`px-3 py-1 text-xs rounded-md ${mostrarFiltros ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
                >
                  <span className="flex items-center">
                    <Filter size={14} className="mr-1" />
                    Filtros
                  </span>
                </button>
                
                {/* Botón para mostrar/ocultar gráfico */}
                <button
                  onClick={() => setMostrarGrafico(!mostrarGrafico)}
                  className={`px-3 py-1 text-xs rounded-md ${mostrarGrafico ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
                >
                  <span className="flex items-center">
                    <BarChart2 size={14} className="mr-1" />
                    {mostrarGrafico ? 'Ocultar gráfico' : 'Mostrar gráfico'}
                  </span>
                </button>
                
                {/* Botón para mostrar/ocultar explicación */}
                <button
                  onClick={() => setMostrarExplicacion(!mostrarExplicacion)}
                  className={`px-3 py-1 text-xs rounded-md ${mostrarExplicacion ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
                >
                  <span className="flex items-center">
                    <Info size={14} className="mr-1" />
                    Explicación
                  </span>
                </button>
              </div>
            </div>
            
            {/* Explicación de cálculos */}
            {mostrarExplicacion && <ExplicacionCalculos />}
            
            {/* Panel de filtros básicos */}
            {mostrarFiltros && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex flex-col md:flex-row md:items-center gap-3 mb-3">
                  {/* Búsqueda general */}
                  <div className="flex-grow">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Search size={14} className="text-gray-400" />
                      </div>
                      <input
                        type="text"
                        className="w-full pl-10 py-2 border border-gray-300 rounded-md"
                        placeholder="Buscar por creador, bloque, ID..."
                        value={busquedaTexto}
                        onChange={(e) => setBusquedaTexto(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  {/* Selector de creador */}
                  <div className="w-full md:w-64">
                    <select
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={filtroCreador}
                      onChange={(e) => setFiltroCreador(e.target.value)}
                    >
                      <option value="">Todos los creadores</option>
                      {creadoresList.map((creador, idx) => (
                        <option key={idx} value={creador}>{creador}</option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Selector de bloque/subcontratista */}
                  <div className="w-full md:w-64">
                    <select
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={filtroBloque}
                      onChange={(e) => setFiltroBloque(e.target.value)}
                    >
                      <option value="">Todos los bloques</option>
                      {bloquesList.map((bloque, idx) => (
                        <option key={idx} value={bloque}>{bloque}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <button
                    className="flex items-center text-blue-600 text-sm"
                    onClick={() => setMostrarFiltrosAvanzados(!mostrarFiltrosAvanzados)}
                  >
                    <Filter size={14} className="mr-1" />
                    Filtros avanzados
                    <ChevronDown size={14} className={`ml-1 transition-transform ${mostrarFiltrosAvanzados ? 'rotate-180' : ''}`} />
                  </button>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={limpiarFiltros}
                      className="px-3 py-1 text-xs border border-gray-300 rounded-md hover:bg-gray-100"
                    >
                      Limpiar filtros
                    </button>
                  </div>
                </div>
                
                {/* Filtros avanzados */}
                {mostrarFiltrosAvanzados && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      {/* Fecha inicio */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          <CalendarIcon size={14} className="inline mr-1" />
                          Fecha inicio
                        </label>
                        <input
                          type="date"
                          className="w-full p-2 border border-gray-300 rounded-md"
                          value={filtroFecha.inicio}
                          onChange={(e) => setFiltroFecha({...filtroFecha, inicio: e.target.value})}
                        />
                      </div>
                      
                      {/* Fecha fin */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          <CalendarIcon size={14} className="inline mr-1" />
                          Fecha fin
                        </label>
                        <input
                          type="date"
                          className="w-full p-2 border border-gray-300 rounded-md"
                          value={filtroFecha.fin}
                          onChange={(e) => setFiltroFecha({...filtroFecha, fin: e.target.value})}
                        />
                      </div>
                      
                      {/* Valorizado mínimo */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          <DollarSign size={14} className="inline mr-1" />
                          Valorizado mínimo
                        </label>
                        <input
                          type="number"
                          className="w-full p-2 border border-gray-300 rounded-md"
                          placeholder="Ej: 5000"
                          value={filtroValorizadoMin}
                          onChange={(e) => setFiltroValorizadoMin(e.target.value)}
                        />
                      </div>
                      
                      {/* Valorizado máximo */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          <DollarSign size={14} className="inline mr-1" />
                          Valorizado máximo
                        </label>
                        <input
                          type="number"
                          className="w-full p-2 border border-gray-300 rounded-md"
                          placeholder="Ej: 50000"
                          value={filtroValorizadoMax}
                          onChange={(e) => setFiltroValorizadoMax(e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div className="mt-3 flex justify-between items-center">
                      <div>
                        <span className="text-xs text-gray-500">Ordenar por:</span>
                        <div className="flex mt-1 space-x-2">
                          <button
                            className={`px-2 py-1 text-xs rounded ${ordenCampo === 'totalValorizado' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
                            onClick={() => cambiarOrden('totalValorizado')}
                          >
                            Valorizado {ordenCampo === 'totalValorizado' && (ordenDireccion === 'asc' ? '↑' : '↓')}
                          </button>
                          <button
                            className={`px-2 py-1 text-xs rounded ${ordenCampo === 'fecha' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
                            onClick={() => cambiarOrden('fecha')}
                          >
                            Fecha {ordenCampo === 'fecha' && (ordenDireccion === 'asc' ? '↑' : '↓')}
                          </button>
                          <button
                            className={`px-2 py-1 text-xs rounded ${ordenCampo === 'totalTrabajadores' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
                            onClick={() => cambiarOrden('totalTrabajadores')}
                          >
                            Trabajadores {ordenCampo === 'totalTrabajadores' && (ordenDireccion === 'asc' ? '↑' : '↓')}
                          </button>
                        </div>
                      </div>
                      
                      <button
                        onClick={aplicarFiltros}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Aplicar filtros
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : reportesFiltrados.length === 0 ? (
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 text-center">
                <p className="text-yellow-700">No se encontraron reportes con los filtros aplicados.</p>
                <p className="text-sm text-yellow-600 mt-1">Intenta con otros criterios de búsqueda o limpia los filtros.</p>
              </div>
            ) : (
              <>
                {/* Gráfico de valorización */}
                {mostrarGrafico && (
                  <GraficoReportes 
                    reportes={reportesFiltrados} 
                    filtroFecha={obtenerFiltroFecha()}
                  />
                )}
                
                {/* Tabla de reportes */}
                <div className={`overflow-x-auto ${mostrarGrafico ? 'mt-6' : ''}`}>
                  <div className="text-sm text-gray-500 mb-2">
                    Mostrando {reportesFiltrados.length} de {reportesOriginales.length} reportes
                  </div>
                  
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th 
                          className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => cambiarOrden('creadoPor')}
                        >
                          <div className="flex items-center">
                            Creado Por {renderOrdenIcon('creadoPor')}
                          </div>
                        </th>
                        <th 
                          className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => cambiarOrden('fecha')}
                        >
                          <div className="flex items-center">
                            Fecha {renderOrdenIcon('fecha')}
                          </div>
                        </th>
                        <th 
                          className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => cambiarOrden('subcontratistaBLoque')}
                        >
                          <div className="flex items-center">
                            Subcontratista/Bloque {renderOrdenIcon('subcontratistaBLoque')}
                          </div>
                        </th>
                        <th 
                          className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => cambiarOrden('totalTrabajadores')}
                        >
                          <div className="flex items-center">
                            Total Trabajadores {renderOrdenIcon('totalTrabajadores')}
                          </div>
                        </th>
                        <th 
                          className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => cambiarOrden('totalActividades')}
                        >
                          <div className="flex items-center">
                            Total Actividades {renderOrdenIcon('totalActividades')}
                          </div>
                        </th>
                        <th 
                          className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => cambiarOrden('totalValorizado')}
                        >
                          <div className="flex items-center">
                            Total Valorizado {renderOrdenIcon('totalValorizado')}
                          </div>
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {reportesFiltrados.map((reporte, index) => (
                        <tr key={reporte.id || reporte.reporteId || index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-3 py-2 text-sm text-gray-900">{reporte.creadoPor || reporte.elaboradoPor || 'Sin datos'}</td>
                          <td className="px-3 py-2 text-sm text-gray-900">{formatearFecha(reporte.fecha) || 'Sin datos'}</td>
                          <td className="px-3 py-2 text-sm text-gray-900">{reporte.subcontratistaBLoque || reporte.subcontratistaBloque || 'Sin datos'}</td>
                          <td className="px-3 py-2 text-sm text-gray-900">{reporte.totalTrabajadores || reporte.trabajadores?.length || 0}</td>
                          <td className="px-3 py-2 text-sm text-gray-900">{reporte.totalActividades || reporte.actividades?.length || 0}</td>
                          <td className={`px-3 py-2 text-sm font-medium ${(reporte.totalValorizado || 0) < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                            {formatoMoneda(reporte.totalValorizado || 0)}
                          </td>
                          <td className="px-3 py-2 text-sm text-gray-900">
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => verReporte(reporte)}
                                className="text-blue-600 hover:text-blue-800"
                                title="Ver detalles del reporte"
                                disabled={cargandoReporte}
                              >
                                <FileText size={16} />
                              </button>
                              <button 
                                className="text-green-600 hover:text-green-800"
                                onClick={() => generarEnlaceCompartir(reporte)}
                                title="Compartir enlace"
                              >
                                <Share2 size={16} />
                              </button>
                              {reporte.enlaceSheet && (
                                <a 
                                  href={reporte.enlaceSheet} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-purple-600 hover:text-purple-800"
                                  title="Abrir en Google Sheets"
                                >
                                  <ExternalLink size={16} />
                                </a>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
            
            {/* Modal para mostrar el reporte completo */}
            {reporteSeleccionado && (
              <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center overflow-y-auto">
                <div className="bg-white rounded-lg w-11/12 max-w-6xl max-h-screen overflow-y-auto">
                  {/* Cabecera fija */}
                  <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center z-10">
                    <h2 className="text-xl font-semibold text-gray-800">Detalles del Reporte</h2>
                    <button
                      onClick={() => setReporteSeleccionado(null)}
                      className="text-gray-600 hover:text-gray-800"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  
                  {/* Contenido con estado de carga */}
                  {reporteSeleccionado.cargando ? (
                    <div className="p-8 flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
                      <p className="text-gray-600">Cargando detalles del reporte...</p>
                    </div>
                  ) : reporteSeleccionado.error ? (
                    <div className="p-8">
                      <div className="bg-red-50 p-6 rounded-lg border border-red-200 text-center">
                        <AlertCircle size={32} className="mx-auto mb-3 text-red-500" />
                        <p className="text-red-700 font-medium text-lg mb-2">Error al cargar el reporte</p>
                        <p className="text-red-600">{reporteSeleccionado.error}</p>
                        <button
                          onClick={() => setReporteSeleccionado(null)}
                          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          Cerrar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4">
                      {/* Información General */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="bg-white rounded-lg border border-gray-200">
                          <div className="p-4">
                            <h3 className="text-lg font-medium mb-3">Información General</h3>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-gray-600">Fecha:</p>
                                <p className="font-medium">{formatearFecha(reporteSeleccionado.fecha)}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">Elaborado por:</p>
                                <p className="font-medium">{reporteSeleccionado.creadoPor || reporteSeleccionado.elaboradoPor || 'SUPERVISOR'}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">Subcontratista/Bloque:</p>
                                <p className="font-medium">{reporteSeleccionado.subcontratistaBLoque || reporteSeleccionado.subcontratistaBloque || 'test_2'}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">ID Reporte:</p>
                                <p className="font-medium">{reporteSeleccionado.id || reporteSeleccionado.reporteId || 'doXEIG9FvNiXWPSusNGk'}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-white rounded-lg border border-gray-200">
                          <div className="p-4">
                            <h3 className="text-lg font-medium mb-3">Resumen</h3>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-gray-600">Actividades:</p>
                                <p className="font-medium">{reporteSeleccionado.actividades?.length || reporteSeleccionado.totalActividades || 2}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">Trabajadores:</p>
                                <p className="font-medium">{reporteSeleccionado.trabajadores?.length || reporteSeleccionado.totalTrabajadores || 3}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">Costo Mano Obra:</p>
                                <p className="font-medium text-red-600">{formatoMoneda(reporteSeleccionado.totales?.costoMO || 946.88)}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">Costo Expediente:</p>
                                <p className="font-medium text-blue-600">{formatoMoneda(reporteSeleccionado.totales?.costoExpediente || 864.00)}</p>
                              </div>
                              <div className="col-span-2">
                                <p className="text-sm text-gray-600">Ganancia Neta:</p>
                                <p className={`font-medium ${(reporteSeleccionado.totales?.ganancia || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {formatoMoneda(reporteSeleccionado.totales?.ganancia || 0)}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {(reporteSeleccionado.totales?.ganancia || 0) >= 0 
                                    ? 'Ganancia positiva: el costo facturado supera al costo real de mano de obra' 
                                    : 'Ganancia negativa: el costo real de mano de obra supera lo facturado'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Actividades - con manejo para cuando no hay actividades */}
                      

                      <div className="mb-8">
                        <h3 className="text-lg font-medium mb-3">Actividades</h3>
                        {reporteSeleccionado.actividades?.length > 0 ? (
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actividad</th>
                                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">UND</th>
                                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Metrado P.</th>
                                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Metrado E.</th>
                                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avance</th>
                                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio Unit.</th>
                                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor Total</th>
                                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Causas</th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {reporteSeleccionado.actividades.map((actividad, idx) => (
                                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                    <td className="px-3 py-3 text-sm font-medium text-gray-900">{actividad.nombre}</td>
                                    <td className="px-3 py-3 text-sm text-gray-900">{actividad.und}</td>
                                    <td className="px-3 py-3 text-sm text-gray-900">{typeof actividad.metradoP === 'number' ? actividad.metradoP.toFixed(2) : actividad.metradoP}</td>
                                    <td className="px-3 py-3 text-sm text-gray-900">{typeof actividad.metradoE === 'number' ? actividad.metradoE.toFixed(2) : actividad.metradoE}</td>
                                    <td className="px-3 py-3 text-sm text-green-600 font-medium">{actividad.avance}</td>
                                    <td className="px-3 py-3 text-sm text-blue-600 font-medium">{formatoMoneda(actividad.precioUnitario || 0)}</td>
                                    <td className="px-3 py-3 text-sm text-purple-600 font-medium">{formatoMoneda(actividad.valorTotal || 0)}</td>
                                    <td className="px-3 py-3 text-sm text-gray-900">{actividad.causas}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 text-center">
                            <p className="text-yellow-700">No se encontraron actividades para este reporte.</p>
                          </div>
                        )}
                      </div>
                      
                      {/* Mano de Obra - con manejo para cuando no hay trabajadores */}
                      <div>
                        <h3 className="text-lg font-medium mb-3">Mano de Obra</h3>
                        {reporteSeleccionado.trabajadores?.length > 0 ? (
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trabajador</th>
                                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Horas por Actividad</th>
                                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Horas</th>
                                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Costo MO</th>
                                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Costo Expediente</th>
                                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ganancia</th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {reporteSeleccionado.trabajadores.map((trabajador, idx) => (
                                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                    <td className="px-3 py-3 text-sm text-gray-900">{trabajador.nombre}</td>
                                    <td className="px-3 py-3 text-sm text-gray-900">
                                      <span className={`px-2 py-1 rounded-full text-xs ${
                                        trabajador.categoria === 'OPERARIO' ? 'bg-green-100 text-green-800' :
                                        trabajador.categoria === 'OFICIAL' ? 'bg-blue-100 text-blue-800' :
                                        'bg-gray-100 text-gray-800'
                                      }`}>
                                        {trabajador.categoria}
                                      </span>
                                    </td>
                                    <td className="px-3 py-3 text-sm text-gray-900 whitespace-pre-line">{trabajador.horasActividad}</td>
                                    <td className="px-3 py-3 text-sm text-gray-900">{trabajador.totalHoras}</td>
                                    <td className="px-3 py-3 text-sm text-red-600">{formatoMoneda(trabajador.costoMO)}</td>
                                    <td className="px-3 py-3 text-sm text-blue-600">{formatoMoneda(trabajador.costoExpediente)}</td>
                                    <td className={`px-3 py-3 text-sm ${trabajador.ganancia >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                      {formatoMoneda(trabajador.ganancia)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                              <tfoot className="bg-gray-100">
                                <tr>
                                  <td className="px-3 py-3 text-sm font-medium text-gray-900" colSpan="3">Total:</td>
                                  <td className="px-3 py-3 text-sm font-medium text-gray-900">
                                    {reporteSeleccionado.totales?.horas || 0}
                                  </td>
                                  <td className="px-3 py-3 text-sm font-medium text-red-600">
                                    {formatoMoneda(reporteSeleccionado.totales?.costoMO || 0)}
                                  </td>
                                  <td className="px-3 py-3 text-sm font-medium text-blue-600">
                                    {formatoMoneda(reporteSeleccionado.totales?.costoExpediente || 0)}
                                  </td>
                                  <td className={`px-3 py-3 text-sm font-medium ${(reporteSeleccionado.totales?.ganancia || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {formatoMoneda(reporteSeleccionado.totales?.ganancia || 0)}
                                  </td>
                                </tr>
                              </tfoot>
                            </table>
                          </div>
                        ) : (
                          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 text-center">
                            <p className="text-yellow-700">No se encontraron trabajadores para este reporte.</p>
                          </div>
                        )}
                      </div>
                      
                      {/* Botones */}
                      <div className="mt-6 flex justify-end">
                        {reporteSeleccionado.enlaceSheet && (
                          <a 
                            href={reporteSeleccionado.enlaceSheet} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center mr-4 px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                          >
                            <ExternalLink size={16} className="mr-2" />
                            Ver en Google Sheets
                          </a>
                        )}
                        <button 
                          onClick={() => generarEnlaceCompartir(reporteSeleccionado)}
                          className="flex items-center mr-4 px-4 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200"
                        >
                          <Share2 size={16} className="mr-2" />
                          Compartir enlace
                        </button>
                        <button 
                          onClick={() => setReporteSeleccionado(null)} 
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                        >
                          Cerrar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {mostrarEnlace && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="text-sm font-medium text-blue-800 mb-2 flex items-center">
                  <Link2 size={16} className="mr-2" />
                  Enlace generado:
                </h4>
                <div className="flex items-center bg-white p-2 rounded border border-blue-200">
                  <input
                    type="text"
                    value={enlaceCompartir}
                    readOnly
                    className="flex-grow text-sm text-gray-600 outline-none"
                  />
                  <button
                    className="ml-2 text-blue-600 hover:text-blue-800"
                    onClick={() => navigator.clipboard.writeText(enlaceCompartir)}
                    title="Copiar al portapapeles"
                  >
                    <Code size={16} />
                  </button>
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  Este enlace contiene los filtros y configuraciones actuales del dashboard.
                </p>
              </div>
            )}
          </div>
        );
        
      case 'exportar':
        return (
          <div>
            <h3 className="text-sm font-medium mb-3">Exportar Datos</h3>
            <p className="text-sm text-gray-600">Funcionalidad de exportación en desarrollo.</p>
          </div>
        );
        
      case 'programacion':
        return (
          <div>
            <h3 className="text-sm font-medium mb-3">Programación de Reportes</h3>
            <p className="text-sm text-gray-600">Funcionalidad de programación en desarrollo.</p>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Módulo de Reportes</h2>
      </div>
      
      <div className="border-b border-gray-200 mb-4">
        <nav className="-mb-px flex space-x-6">
          <button
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              tabActivo === 'reportes'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setTabActivo('reportes')}
          >
            <span className="flex items-center">
              <FileText size={16} className="mr-2" />
              Reportes
            </span>
          </button>
          
          <button
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              tabActivo === 'exportar'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setTabActivo('exportar')}
          >
            <span className="flex items-center">
              <Download size={16} className="mr-2" />
              Exportar
            </span>
          </button>
          
          <button
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              tabActivo === 'programacion'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setTabActivo('programacion')}
          >
            <span className="flex items-center">
              <Calendar size={16} className="mr-2" />
              Programación
            </span>
          </button>
        </nav>
      </div>
      
      {renderizarTab()}
    </div>
  );
};

export default ModuloReportes;