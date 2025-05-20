// src/components/dashboard/AnalisisProductividad.js
import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, LineChart, Line, ComposedChart, 
  Cell, ReferenceLine
} from 'recharts';
import { 
  Activity, BarChart2, TrendingUp, 
  AlertCircle, Calendar, Filter, 
  Clock, DollarSign, ExternalLink,
  ChevronDown, ArrowUp, ArrowDown
} from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import { formatoMoneda, formatoNumero } from '../../utils/formatUtils';
import { useAuth } from '../../context/AuthContext'; // Importamos useAuth para acceder a db
import { fetchReportesAsociados } from '../../firebase/db'; // Importamos fetchReportesAsociados

const AnalisisProductividad = () => {
  const { datos, loading, filtros } = useDashboard();
  const { db } = useAuth(); // Obtenemos db desde el contexto de autenticación
  const [vistaActiva, setVistaActiva] = useState('actividades');
  const [actividadSeleccionada, setActividadSeleccionada] = useState(null);
  
  // Estados para filtrado
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [filtroProductividad, setFiltroProductividad] = useState('Productividad');
  const [filtroOrden, setFiltroOrden] = useState('Mayor a menor');
  const [filtroCategoria, setFiltroCategoria] = useState('Todas');
  
  // Datos de actividades desde el contexto del dashboard
  const actividades = datos.actividades || [];
  const [reportesActividad, setReportesActividad] = useState([]);
  
  // Ordenar y filtrar actividades según los criterios seleccionados
  const actividadesFiltradas = React.useMemo(() => {
    // Primero filtramos por categoría si es necesario
    let filtradas = [...actividades];
    
    if (filtroCategoria !== 'Todas') {
      // Aquí asumimos que la actividad tiene una propiedad 'categoria' o 'tipo'
      // Ajusta según tu estructura de datos real
      filtradas = filtradas.filter(act => 
        (act.categoria && act.categoria === filtroCategoria) || 
        (act.tipo && act.tipo === filtroCategoria) ||
        (act.nombre && act.nombre.includes(filtroCategoria))
      );
    }
    
    // Luego ordenamos según el criterio seleccionado
    return filtradas.sort((a, b) => {
      let valorA, valorB;
      
      // Determinar qué campo usar para ordenar
      switch (filtroProductividad) {
        case 'Productividad':
          valorA = a.productividad || 0;
          valorB = b.productividad || 0;
          break;
        case 'Metrado':
          valorA = a.metrado || 0;
          valorB = b.metrado || 0;
          break;
        case 'Inversión':
          valorA = a.costo || 0;
          valorB = b.costo || 0;
          break;
        default:
          valorA = a.productividad || 0;
          valorB = b.productividad || 0;
      }
      
      // Aplicar orden ascendente o descendente
      if (filtroOrden === 'Mayor a menor') {
        return valorB - valorA;
      } else {
        return valorA - valorB;
      }
    });
  }, [actividades, filtroCategoria, filtroProductividad, filtroOrden]);
  
  // Calcular la productividad media
  const productividadMedia = actividades.length > 0 
    ? actividades.reduce((sum, act) => sum + act.productividad, 0) / actividades.length 
    : 0;
  
  // Función para obtener el color según el rendimiento de la actividad
  const getBarColor = (actividad) => {
    // Colores según productividad absoluta
    if (actividad.productividad >= 2.5) return '#10b981'; // verde
    if (actividad.productividad >= 1.5) return '#f59e0b';  // amarillo
    return '#ef4444';  // rojo
  };
  
  // Historial de productividad (simulado) - optimizado para reducir carga
  const obtenerHistorialActividad = (actividad) => {
    if (!actividad) return [];
    
    // Datos simulados para el historial - versión simplificada
    const historico = [];
    const baseProductividad = actividad.productividad * 0.8;
    const baseMetrado = actividad.metrado / 6; // Reducido a 6 periodos
    
    for (let i = 0; i < 6; i++) {
      // Tendencia creciente
      const factor = 1 + (i * 0.04);
      const variacion = (Math.random() * 0.2) - 0.1; // Variación aleatoria
      
      historico.push({
        periodo: `S${i+1}`,
        productividad: Math.max(0, baseProductividad * factor + variacion),
        metrado: Math.round(baseMetrado * factor * (1 + variacion))
      });
    }
    
    return historico;
  };
  
  // Generar reportes simulados para la actividad
  const obtenerReportesActividad = async (actividad) => {
    if (!actividad) return [];
    
    // Si no hay conexión a Firebase, o no tiene ID, usar datos simulados
    if (!db || !actividad.id) {
      console.log("Generando reportes simulados para actividad:", actividad.nombre);
      // Datos simulados para pruebas
      return [
        { 
          id: `REP-${Math.floor(Math.random() * 1000)}`, 
          fecha: new Date().toISOString().split('T')[0],
          creadoPor: "Usuario de prueba",
          enlaceSheet: "https://docs.google.com/spreadsheets/d/example" 
        },
        { 
          id: `REP-${Math.floor(Math.random() * 1000)}`, 
          fecha: new Date(Date.now() - 86400000).toISOString().split('T')[0],
          creadoPor: "Usuario de prueba 2",
          enlaceSheet: "https://docs.google.com/spreadsheets/d/example2" 
        }
      ];
    }
    
    try {
      console.log("Obteniendo reportes reales para actividad ID:", actividad.id);
      // Pasamos 5 como número, no como función
      const reportes = await fetchReportesAsociados(db, actividad.id, 5);
      console.log("Reportes obtenidos:", reportes);
      return reportes;
    } catch (error) {
      console.error("Error al obtener reportes:", error);
      return [];
    }
  };
  
  // Método para aplicar filtros
  const aplicarFiltros = () => {
    // En esta implementación los filtros ya se aplican reactivamente
    // Esta función es para mantener coherencia con la UI
    console.log("Filtros aplicados:", { filtroProductividad, filtroOrden, filtroCategoria });
    setMostrarFiltros(false);
  };

  // Renderizar vista según la selección
  const renderizarVista = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }
    
    if (actividadesFiltradas.length === 0) {
      return (
        <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200 flex items-center justify-center">
          <AlertCircle size={20} className="text-yellow-500 mr-2" />
          <p className="text-yellow-700">
            No se encontraron actividades con los filtros seleccionados.
          </p>
        </div>
      );
    }
    
    switch (vistaActiva) {
      case 'actividades':
        return (
          <div>
            {/* Filtros */}
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Avance de Actividades</h3>
                
                <div className="flex items-center space-x-2">
                  <div>
                    <select 
                      className="p-1.5 border border-gray-300 rounded-md text-sm"
                      value={filtroCategoria}
                      onChange={(e) => setFiltroCategoria(e.target.value)}
                    >
                      <option value="Todas">Todas</option>
                      <option value="ENCOFRADO">ENCOFRADO</option>
                      <option value="INSTALACION">INSTALACION</option>
                      <option value="SUMINISTRO">SUMINISTRO</option>
                      <option value="SIMULACION">SIMULACION</option>
                      <option value="PRUEBAS">PRUEBAS</option>
                    </select>
                  </div>
                  
                  <button
                    className="flex items-center text-blue-600 text-sm"
                    onClick={() => setMostrarFiltros(!mostrarFiltros)}
                  >
                    <Filter size={14} className="mr-1" />
                    Filtros avanzados
                    <ChevronDown size={14} className={`ml-1 transition-transform ${mostrarFiltros ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              </div>
              
              {/* Filtros avanzados */}
              {mostrarFiltros && (
                <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex flex-wrap gap-2">
                    <div>
                      <label className="block mb-1 text-xs font-medium">Ordenar por:</label>
                      <select 
                        className="p-1.5 border border-gray-300 rounded-md text-sm"
                        value={filtroProductividad}
                        onChange={(e) => setFiltroProductividad(e.target.value)}
                      >
                        <option value="Productividad">Productividad</option>
                        <option value="Metrado">Metrado</option>
                        <option value="Inversión">Inversión</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block mb-1 text-xs font-medium">Orden:</label>
                      <select 
                        className="p-1.5 border border-gray-300 rounded-md text-sm"
                        value={filtroOrden}
                        onChange={(e) => setFiltroOrden(e.target.value)}
                      >
                        <option value="Mayor a menor">Mayor a menor</option>
                        <option value="Menor a mayor">Menor a mayor</option>
                      </select>
                    </div>
                    
                    <div className="md:ml-auto flex items-end">
                      <button 
                        className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm"
                        onClick={aplicarFiltros}
                      >
                        Aplicar filtros
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Gráfico de Productividad */}
            <div className="mb-4">
              <h3 className="text-sm font-medium mb-2">Productividad por Actividad (metrado/hora)</h3>
              <ResponsiveContainer width="100%" height={320}>
                <ComposedChart 
                  data={actividadesFiltradas}
                  margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="nombre" 
                    tick={{fontSize: 10}} 
                    interval={0} 
                    angle={-20} 
                    textAnchor="end" 
                    height={80} 
                  />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  
                  {/* Línea de productividad media como referencia */}
                  <ReferenceLine 
                    yAxisId="left"
                    y={productividadMedia} 
                    stroke="#9333ea" 
                    strokeDasharray="3 3"
                  />
                  
                  <Bar 
                    yAxisId="left"
                    dataKey="productividad" 
                    name="Productividad" 
                    onClick={(data) => setActividadSeleccionada(data)}
                  >
                    {actividadesFiltradas.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={getBarColor(entry)}
                        stroke="#8884d8"
                        strokeWidth={entry.nombre === actividadSeleccionada?.nombre ? 2 : 0}
                      />
                    ))}
                  </Bar>
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="horas" 
                    name="Horas Invertidas" 
                    stroke="#ff7300" 
                    strokeWidth={2} 
                    dot={false} 
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            
            {/* Detalle de actividad seleccionada */}
            {actividadSeleccionada ? (
              <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-medium text-blue-800 text-lg">{actividadSeleccionada.nombre}</h3>
                    <p className="text-blue-600 text-sm">
                      {actividadSeleccionada.ubicacion || 'Ubicación no especificada'} • 
                      {actividadSeleccionada.unidad || 'Unidad no especificada'}
                    </p>
                  </div>
                  <button 
                    className="text-sm text-blue-600 hover:text-blue-800"
                    onClick={() => setActividadSeleccionada(null)}
                  >
                    Cerrar detalles
                  </button>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-white p-3 rounded-lg border border-blue-100">
                    <div className="flex items-center mb-1">
                      <Activity size={16} className="text-blue-600 mr-2" />
                      <span className="text-sm text-gray-600">Productividad</span>
                    </div>
                    <p className="text-lg font-bold text-blue-700">{actividadSeleccionada.productividad.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">metrado/hora</p>
                  </div>
                  
                  <div className="bg-white p-3 rounded-lg border border-blue-100">
                    <div className="flex items-center mb-1">
                      <Clock size={16} className="text-green-600 mr-2" />
                      <span className="text-sm text-gray-600">Metrado Total</span>
                    </div>
                    <p className="text-lg font-bold text-green-700">{formatoNumero(actividadSeleccionada.metrado || 0)}</p>
                    <p className="text-xs text-gray-500">unidades completadas</p>
                  </div>
                  
                  <div className="bg-white p-3 rounded-lg border border-blue-100">
                    <div className="flex items-center mb-1">
                      <DollarSign size={16} className="text-purple-600 mr-2" />
                      <span className="text-sm text-gray-600">Inversión</span>
                    </div>
                    <p className="text-lg font-bold text-purple-700">{formatoMoneda(actividadSeleccionada.costo || 0)}</p>
                    <p className="text-xs text-gray-500">costo total</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-white p-3 rounded-lg border border-blue-100">
                    <h4 className="font-medium text-blue-800 mb-2">Evolución de Productividad y Metrado</h4>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={obtenerHistorialActividad(actividadSeleccionada)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="periodo" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip formatter={(value, name) => {
                          if (name === "productividad") return [value.toFixed(2), "Productividad"];
                          if (name === "metrado") return [formatoNumero(value), "Metrado"];
                          return [value, name];
                        }} />
                        <Legend />
                        <Line 
                          yAxisId="left"
                          type="monotone" 
                          dataKey="productividad" 
                          name="Productividad" 
                          stroke="#8884d8" 
                          activeDot={{ r: 8 }} 
                        />
                        <Line 
                          yAxisId="right"
                          type="monotone" 
                          dataKey="metrado" 
                          name="Metrado" 
                          stroke="#82ca9d" 
                          activeDot={{ r: 6 }} 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="bg-white p-3 rounded-lg border border-blue-100">
                    <h4 className="font-medium text-blue-800 mb-2">Reportes asociados</h4>
                    {reportesActividad.length > 0 ? (
                      <div className="space-y-2 max-h-52 overflow-y-auto">
                        {reportesActividad.map((reporte, index) => (
                          <div key={index} className="p-2 bg-blue-50 rounded-md text-sm border border-blue-100">
                            <div className="flex justify-between items-center">
                              <span className="font-medium">{reporte.id}</span>
                              <span className="text-gray-600 text-xs">{reporte.fecha}</span>
                            </div>
                            <p className="text-xs text-gray-600 mt-1">Por: {reporte.creadoPor || reporte.elaboradoPor || 'Sin datos'}</p>
                            <div className="mt-1">
                              {reporte.enlaceSheet ? (
                                <a 
                                  href={reporte.enlaceSheet} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="flex items-center text-blue-600 text-xs hover:text-blue-800"
                                >
                                  <ExternalLink size={12} className="mr-1" />
                                  Ver reporte
                                </a>
                              ) : (
                                <span className="text-xs text-gray-500">No hay enlace disponible</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No hay reportes asociados a esta actividad.</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actividad</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Productividad</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inversión (S/)</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Metrado Avanzado</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {actividadesFiltradas.map((act, index) => {
                        return (
                          <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-3 py-2 text-sm text-gray-900">{act.nombre}</td>
                            <td className="px-3 py-2 text-sm text-gray-900">{act.productividad.toFixed(2)}</td>
                            <td className="px-3 py-2 text-sm text-gray-900">{formatoMoneda(act.costo || 0)}</td>
                            <td className="px-3 py-2 text-sm font-medium text-gray-900">
                              {formatoNumero(act.metrado || 0)}
                            </td>
                            <td className="px-3 py-2 text-sm text-center">
                              <button 
                                className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                                onClick={() => setActividadSeleccionada(act)}
                              >
                                Ver detalle
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        );
        
      case 'tendencia':
        return (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Evolución de Productividad Global</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={datos.tendencias.productividad || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="semana" />
                    <YAxis />
                    <Tooltip formatter={(value) => value.toFixed(2)} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="productividad" 
                      name="Productividad Semanal" 
                      stroke="#8884d8" 
                      activeDot={{ r: 8 }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="promedio" 
                      name="Promedio Acumulado" 
                      stroke="#82ca9d" 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Relación Costo-Avance Semanal</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={datos.tendencias.costos || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="semana" />
                    <YAxis yAxisId="left" orientation="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip formatter={(value) => formatoMoneda(value)} />
                    <Legend />
                    <Bar yAxisId="left" dataKey="costo" name="Costo" fill="#8884d8" />
                    <Line yAxisId="right" type="monotone" dataKey="ganancia" name="Ganancia" stroke="#ff7300" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">Productividad Actual</p>
                <p className="text-lg font-bold text-blue-700">
                  {datos.tendencias.productividad && datos.tendencias.productividad.length > 0
                    ? datos.tendencias.productividad[datos.tendencias.productividad.length - 1].productividad.toFixed(2)
                    : '0.00'
                  }
                </p>
                <p className="text-xs text-gray-500 mt-1">Última semana registrada</p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">Mejora Productividad</p>
                <p className="text-lg font-bold text-green-700">
                  {datos.tendencias.productividad && datos.tendencias.productividad.length > 1 
                    ? ((datos.tendencias.productividad[datos.tendencias.productividad.length - 1].productividad / 
                        datos.tendencias.productividad[0].productividad - 1) * 100).toFixed(1) + '%'
                    : '+0.0%'
                  }
                </p>
                <p className="text-xs text-gray-500 mt-1">Desde inicio del período</p>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">Ganancia Última Semana</p>
                <p className="text-lg font-bold text-purple-700">
                  {datos.tendencias.costos && datos.tendencias.costos.length > 0
                    ? formatoMoneda(datos.tendencias.costos[datos.tendencias.costos.length - 1].ganancia)
                    : formatoMoneda(0)
                  }
                </p>
                <p className="text-xs text-gray-500 mt-1">Valor - Costo</p>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h4 className="font-medium text-gray-700 mb-2">Análisis de Tendencias de Productividad</h4>
              <p className="text-sm text-gray-600 mb-3">
                El análisis de las tendencias muestra la evolución de la productividad a lo largo del tiempo, 
                permitiendo identificar si las mejoras implementadas están generando resultados positivos.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-1">Principales Observaciones</h5>
                  <ul className="list-disc pl-5 text-sm space-y-1 text-gray-600">
                    <li>La productividad promedio ha mejorado un 
                      {datos.tendencias.productividad && datos.tendencias.productividad.length > 1 
                        ? ` ${((datos.tendencias.productividad[datos.tendencias.productividad.length - 1].promedio / 
                            datos.tendencias.productividad[0].promedio - 1) * 100).toFixed(1)}%`
                        : ' +0.0%'
                      } en el período analizado.
                    </li>
                    <li>Las actividades con mayor productividad son: 
                      {actividadesFiltradas.length > 0 ? ` ${actividadesFiltradas[0].nombre}, ${actividadesFiltradas.length > 1 ? actividadesFiltradas[1].nombre : ''}` : ' ninguna registrada'}.
                    </li>
                    <li>Se detecta una correlación positiva entre la productividad y la ganancia semanal.</li>
                  </ul>
                </div>
                
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-1">Recomendaciones</h5>
                  <ul className="list-disc pl-5 text-sm space-y-1 text-gray-600">
                    <li>Reforzar capacitación en las actividades con productividad por debajo del promedio.</li>
                    <li>Analizar los factores de éxito de las actividades con mayor productividad para replicarlos.</li>
                    <li>Implementar incentivos basados en productividad para mantener la tendencia positiva.</li>
                    <li>Evaluar los costos por metrado para identificar oportunidades de optimización.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'optimizacion':
        // Vista de optimización - simplificada para reducir uso de Firebase
        return (
          <div>
            <h3 className="text-sm font-medium mb-3">Análisis de Optimización para Control de Sobrecostos</h3>
            
            <div className="bg-white p-4 rounded-lg border border-gray-200 mb-5">
              <h4 className="font-medium text-gray-700 mb-2">Top Actividades por Productividad</h4>
              <div className="grid grid-cols-1 gap-3">
                {actividadesFiltradas.slice(0, 5).map((act, index) => (
                  <div key={index} className="bg-blue-50 p-3 rounded">
                    <h5 className="text-sm font-medium text-blue-800">{act.nombre}</h5>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm text-gray-600">Productividad: <span className="font-medium">{act.productividad.toFixed(2)}</span></span>
                      <span className="text-sm text-gray-600">Metrado: <span className="font-medium">{formatoNumero(act.metrado || 0)}</span></span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                      <div 
                        className="h-2.5 rounded-full bg-blue-600"
                        style={{ width: `${Math.min(100, (act.productividad / 3) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-800 mb-2">Recomendaciones para Optimizar Costos</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="text-sm font-medium text-blue-700 mb-1">Acciones Inmediatas</h5>
                  <ul className="list-disc pl-5 text-sm space-y-1 text-gray-700">
                    <li>Revisar la asignación de personal en actividades con alta inversión</li>
                    <li>Analizar la proporción de trabajadores por categoría para optimizar costos</li>
                    <li>Implementar controles diarios de productividad en actividades críticas</li>
                    <li>Evaluar posibles cuellos de botella en el flujo de trabajo</li>
                  </ul>
                </div>
                
                <div>
                  <h5 className="text-sm font-medium text-blue-700 mb-1">Estrategias a Mediano Plazo</h5>
                  <ul className="list-disc pl-5 text-sm space-y-1 text-gray-700">
                    <li>Implementar capacitaciones específicas para mejorar rendimiento</li>
                    <li>Documentar las metodologías aplicadas en actividades de alta productividad</li>
                    <li>Revisar la planificación de actividades para optimizar secuencias</li>
                    <li>Considerar revisión del presupuesto según costos reales</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  useEffect(() => {
    const cargarReportesActividad = async () => {
      if (actividadSeleccionada) {
        console.log("Cargando reportes para actividad seleccionada:", actividadSeleccionada.nombre);
        const reportes = await obtenerReportesActividad(actividadSeleccionada);
        console.log("Reportes cargados:", reportes);
        setReportesActividad(reportes);
      } else {
        setReportesActividad([]);
      }
    };
    
    cargarReportesActividad();
  }, [actividadSeleccionada, db]);

  
  return (
    <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Análisis de Productividad</h2>
        
        <div className="flex flex-wrap gap-2">
          <button
            className={`px-3 py-1 text-xs rounded-md ${vistaActiva === 'actividades' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
            onClick={() => setVistaActiva('actividades')}
          >
            <span className="flex items-center">
              <BarChart2 size={14} className="mr-1" />
              Por Actividad
            </span>
          </button>
          <button
            className={`px-3 py-1 text-xs rounded-md ${vistaActiva === 'tendencia' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
            onClick={() => setVistaActiva('tendencia')}
          >
            <span className="flex items-center">
              <TrendingUp size={14} className="mr-1" />
              Tendencia
            </span>
          </button>
          <button
            className={`px-3 py-1 text-xs rounded-md ${vistaActiva === 'optimizacion' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
            onClick={() => setVistaActiva('optimizacion')}
          >
            <span className="flex items-center">
              <Activity size={14} className="mr-1" />
              Optimización
            </span>
          </button>
        </div>
      </div>
      
      {renderizarVista()}
    </div>
  );
};

export default AnalisisProductividad;