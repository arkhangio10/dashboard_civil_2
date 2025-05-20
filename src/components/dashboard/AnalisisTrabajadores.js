// src/components/dashboard/AnalisisTrabajadores.js
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Users, Award, Clock, DollarSign, List, Search, AlertCircle, TrendingUp, Filter, ChevronDown, Calendar } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import { formatoMoneda } from '../../utils/formatUtils';

const AnalisisTrabajadores = () => {
  const { datos, loading, filtros } = useDashboard();
  const [vistaActiva, setVistaActiva] = useState('ranking');
  const [filtroCategoria, setFiltroCategoria] = useState('TODAS');
  const [busqueda, setBusqueda] = useState('');
  const [mostrarFiltrosAvanzados, setMostrarFiltrosAvanzados] = useState(false);
  const [ordenarPor, setOrdenarPor] = useState('productividad');
  const [trabajadorSeleccionado, setTrabajadorSeleccionado] = useState(null);
  const [orden, setOrden] = useState('desc');
  
  // Obtener datos de trabajadores
  const trabajadores = datos.trabajadores || [];
  
  // Datos de distribución por categoría
  const distribucionCategorias = datos.distribucion?.categorias || [];
  
  // Colores para gráficos
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
  
  // Ordenar trabajadores
  const ordenarTrabajadores = (lista) => {
    return [...lista].sort((a, b) => {
      let valorA = a[ordenarPor];
      let valorB = b[ordenarPor];
      
      if (typeof valorA === 'string') {
        return orden === 'asc' 
          ? valorA.localeCompare(valorB)
          : valorB.localeCompare(valorA);
      }
      
      return orden === 'asc' ? valorA - valorB : valorB - valorA;
    });
  };
  
  // Trabajadores con datos enriquecidos
  const trabajadoresEnriquecidos = React.useMemo(() => {
    // Mapear datos originales a formato esperado por el componente
    return trabajadores.map(trab => {
      // Asegurar que los campos requeridos existan
      return {
        id: trab.id || 'sin-id',
        nombre: trab.datos?.nombre || trab.nombre || 'Sin nombre',
        categoria: trab.datos?.categoria || trab.categoria || 'SIN CATEGORÍA',
        
        // Datos de producción - del objeto resumen.totalProduccion
        horas: trab.resumen?.totalProduccion?.horas || trab.horas || 0,
        productividad: trab.resumen?.totalProduccion?.productividadMedia || trab.productividad || 0,
        valor: trab.resumen?.totalProduccion?.valorGenerado || trab.valor || 0,
        costo: trab.resumen?.totalProduccion?.costo || trab.costo || 0,
        eficiencia: trab.resumen?.rendimientoComparativo || trab.eficiencia || 1,
        
        // Datos adicionales
        ultimaActividad: trab.resumen?.ultimaActividad || trab.ultimaActividad || '',
        
        // Comprobar si tenemos datos de actividades frecuentes
        actividadesFrecuentes: trab.resumen?.actividadesFrecuentes || trab.actividadesFrecuentes || []
      };
    });
  }, [trabajadores]);
  
  // Filtrar trabajadores según categoría y búsqueda
  const trabajadoresFiltrados = React.useMemo(() => {
    // Primero filtrar
    const filtrados = trabajadoresEnriquecidos.filter(t => 
      (filtroCategoria === 'TODAS' || t.categoria === filtroCategoria) &&
      (busqueda === '' || t.nombre.toLowerCase().includes(busqueda.toLowerCase()))
    );
    
    // Luego ordenar
    return ordenarTrabajadores(filtrados);
  }, [trabajadoresEnriquecidos, filtroCategoria, busqueda, ordenarPor, orden]);

  // Calcular estadísticas para vista de resumen
  const calcularEstadisticas = React.useCallback(() => {
    const totalTrabajadores = trabajadoresFiltrados.length;
    
    if (totalTrabajadores === 0) {
      return {
        totalTrabajadores: 0,
        totalHoras: 0,
        productividadPromedio: 0,
        costoTotal: 0,
        mejorProductividad: null,
        mejorEficiencia: null,
        masHoras: null
      };
    }
    
    const totalHoras = trabajadoresFiltrados.reduce((sum, t) => sum + (t.horas || 0), 0);
    const productividadPromedio = trabajadoresFiltrados.reduce((sum, t) => sum + (t.productividad || 0), 0) / totalTrabajadores;
    const costoTotal = trabajadoresFiltrados.reduce((sum, t) => sum + (t.costo || 0), 0);
    
    // Mejor productividad
    const mejorProductividad = [...trabajadoresFiltrados].sort((a, b) => b.productividad - a.productividad)[0];
    const mejorEficiencia = [...trabajadoresFiltrados].sort((a, b) => b.eficiencia - a.eficiencia)[0];
    const masHoras = [...trabajadoresFiltrados].sort((a, b) => b.horas - a.horas)[0];
    
    return {
      totalTrabajadores,
      totalHoras,
      productividadPromedio,
      costoTotal,
      mejorProductividad,
      mejorEficiencia,
      masHoras
    };
  }, [trabajadoresFiltrados]);
  
  // Memorizar las estadísticas
  const estadisticas = React.useMemo(() => calcularEstadisticas(), [calcularEstadisticas]);
  
  // Obtener detalle de actividades del trabajador desde sus datos almacenados
  const obtenerActividadesTrabajador = (trabajador) => {
    // En el caso real, extraemos estas actividades de la subcolección "actividades" del trabajador
    // De acuerdo con la estructura en dashboard-integration.js:
    // trabajador.resumen.actividadesFrecuentes
    
    if (!trabajador || !trabajador.actividadesFrecuentes) {
      // Si no tiene actividades, generamos algunos datos de ejemplo para la vista
      return [
        { nombre: 'Encofrado columnas', horas: Math.round(trabajador.horas * 0.3), productividad: trabajador.productividad * 0.9 },
        { nombre: 'Vaciado concreto', horas: Math.round(trabajador.horas * 0.2), productividad: trabajador.productividad * 0.8 },
        { nombre: 'Acero estructural', horas: Math.round(trabajador.horas * 0.4), productividad: trabajador.productividad * 1.1 },
        { nombre: 'Acabados', horas: Math.round(trabajador.horas * 0.1), productividad: trabajador.productividad * 0.7 },
      ];
    }
    
    // Convertir las actividades frecuentes a formato esperado por el gráfico
    return trabajador.actividadesFrecuentes.map(act => ({
      nombre: act.nombre,
      horas: act.horas || 0,
      productividad: act.productividad || 0
    }));
  };
  
  // Historial de productividad para un trabajador (simulado)
  const obtenerHistorialProductividad = (trabajador) => {
    if (!trabajador) return [];
    
    // Generar datos para las últimas 8 semanas
    const semanas = [];
    const baseProductividad = trabajador.productividad * 0.7;
    
    for (let i = 0; i < 8; i++) {
      // Tendencia ligeramente creciente
      const factor = 1 + (i * 0.05);
      const variacion = (Math.random() * 0.4) - 0.2; // Variación de ±20%
      
      semanas.push({
        semana: `S${i+1}`,
        productividad: Math.max(0, baseProductividad * factor + variacion),
        promedio: baseProductividad * (1 + (i * 0.02)) // Promedio histórico con menor variación
      });
    }
    
    return semanas;
  };
  
  // Limpiar estado de trabajador seleccionado cuando cambian los filtros
  useEffect(() => {
    setTrabajadorSeleccionado(null);
  }, [filtroCategoria, busqueda]);
  
  // Manejar cambio de encabezado de tabla (ordenamiento)
  const manejarCambioOrden = (campo) => {
    if (ordenarPor === campo) {
      // Si ya estamos ordenando por este campo, cambiamos la dirección
      setOrden(orden === 'asc' ? 'desc' : 'asc');
    } else {
      // Si es un nuevo campo, ordenamos descendente por defecto
      setOrdenarPor(campo);
      setOrden('desc');
    }
  };
  
  // Renderizar indicador de ordenamiento
  const renderizarIndicadorOrden = (campo) => {
    if (ordenarPor !== campo) return null;
    
    return (
      <span className="ml-1">
        {orden === 'asc' ? '↑' : '↓'}
      </span>
    );
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
    
    if (trabajadoresFiltrados.length === 0) {
      return (
        <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200 flex items-center justify-center">
          <AlertCircle size={20} className="text-yellow-500 mr-2" />
          <p className="text-yellow-700">
            No se encontraron trabajadores con los filtros seleccionados.
          </p>
        </div>
      );
    }
    
    switch (vistaActiva) {
      case 'ranking':
        return (
          <div>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="flex items-center flex-wrap gap-2">
                  <div className="flex items-center">
                    <label className="mr-2 text-sm font-medium">Categoría:</label>
                    <select 
                      className="p-1.5 border border-gray-300 rounded-md text-sm"
                      value={filtroCategoria}
                      onChange={(e) => setFiltroCategoria(e.target.value)}
                    >
                      <option value="TODAS">Todas</option>
                      <option value="OPERARIO">OPERARIO</option>
                      <option value="OFICIAL">OFICIAL</option>
                      <option value="PEON">PEON</option>
                    </select>
                  </div>
                  
                  <button
                    className="flex items-center text-blue-600 text-sm font-medium"
                    onClick={() => setMostrarFiltrosAvanzados(!mostrarFiltrosAvanzados)}
                  >
                    <Filter size={16} className="mr-1" />
                    Filtros avanzados
                    <ChevronDown size={16} className={`ml-1 transform transition-transform ${mostrarFiltrosAvanzados ? 'rotate-180' : ''}`} />
                  </button>
                </div>
                
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none">
                    <Search size={14} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Buscar trabajador..."
                    className="pl-8 p-1.5 border border-gray-300 rounded-md text-sm w-full"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                  />
                </div>
              </div>
            
            {mostrarFiltrosAvanzados && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex flex-wrap gap-3">
                  <div>
                    <label className="block mb-1 text-xs font-medium">Ordenar por:</label>
                    <select 
                      className="p-1.5 border border-gray-300 rounded-md text-sm"
                      value={ordenarPor}
                      onChange={(e) => setOrdenarPor(e.target.value)}
                    >
                      <option value="productividad">Productividad</option>
                      <option value="eficiencia">Eficiencia</option>
                      <option value="horas">Horas</option>
                      <option value="costo">Costo</option>
                      <option value="nombre">Nombre</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block mb-1 text-xs font-medium">Orden:</label>
                    <select 
                      className="p-1.5 border border-gray-300 rounded-md text-sm"
                      value={orden}
                      onChange={(e) => setOrden(e.target.value)}
                    >
                      <option value="desc">Mayor a menor</option>
                      <option value="asc">Menor a mayor</option>
                    </select>
                  </div>
                  
                  <div className="md:ml-4 flex items-end">
                    <button 
                      className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm"
                      onClick={() => {
                        // Aplicar filtros (ya está implementado reactivamente)
                      }}
                    >
                      Aplicar filtros
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            <h3 className="text-sm font-medium mb-2">Ranking de Trabajadores</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => manejarCambioOrden('nombre')}>
                      <div className="flex items-center">
                        Trabajador {renderizarIndicadorOrden('nombre')}
                      </div>
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => manejarCambioOrden('horas')}>
                      <div className="flex items-center">
                        Horas {renderizarIndicadorOrden('horas')}
                      </div>
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => manejarCambioOrden('productividad')}>
                      <div className="flex items-center">
                        Productividad {renderizarIndicadorOrden('productividad')}
                      </div>
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => manejarCambioOrden('eficiencia')}>
                      <div className="flex items-center">
                        Eficiencia {renderizarIndicadorOrden('eficiencia')}
                      </div>
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => manejarCambioOrden('costo')}>
                      <div className="flex items-center">
                        Costo {renderizarIndicadorOrden('costo')}
                      </div>
                    </th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {trabajadoresFiltrados.map((trab, index) => (
                    <tr 
                      key={trab.id} 
                      className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} ${trabajadorSeleccionado?.id === trab.id ? 'bg-blue-50' : ''}`}
                    >
                      <td className="px-3 py-2 text-sm text-gray-900">{trab.nombre}</td>
                      <td className="px-3 py-2 text-sm text-gray-900">{trab.categoria}</td>
                      <td className="px-3 py-2 text-sm text-gray-900">{trab.horas}</td>
                      <td className="px-3 py-2 text-sm text-gray-900">{trab.productividad.toFixed(2)}</td>
                      <td className={`px-3 py-2 text-sm font-medium ${trab.eficiencia >= 1 ? 'text-green-600' : 'text-red-600'}`}>
                        {trab.eficiencia.toFixed(2)}x
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-900">{formatoMoneda(trab.costo)}</td>
                      <td className="px-3 py-2 text-sm text-gray-900 text-center">
                        <button 
                          onClick={() => setTrabajadorSeleccionado(trabajadorSeleccionado?.id === trab.id ? null : trab)}
                          className={`px-2 py-1 text-xs rounded ${trabajadorSeleccionado?.id === trab.id ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                        >
                          {trabajadorSeleccionado?.id === trab.id ? 'Ocultar' : 'Detalles'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Detalle del trabajador seleccionado */}
            {trabajadorSeleccionado && (
              <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-blue-800">{trabajadorSeleccionado.nombre}</h3>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                    {trabajadorSeleccionado.categoria}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h4 className="text-sm font-medium mb-3 flex items-center">
                      <TrendingUp size={16} className="mr-2 text-blue-600" />
                      Productividad histórica
                    </h4>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={obtenerHistorialProductividad(trabajadorSeleccionado)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="semana" />
                        <YAxis />
                        <Tooltip formatter={(value) => value.toFixed(2)} />
                        <Legend />
                        <Line type="monotone" dataKey="productividad" name="Productividad" stroke="#8884d8" activeDot={{ r: 8 }} />
                        <Line type="monotone" dataKey="promedio" name="Promedio acumulado" stroke="#82ca9d" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-3 flex items-center">
                      <Clock size={16} className="mr-2 text-green-600" />
                      Distribución de horas por actividad
                    </h4>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={obtenerActividadesTrabajador(trabajadorSeleccionado)}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({name, percent}) => `${name.substring(0, 10)}... ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="horas"
                          nameKey="nombre"
                        >
                          {obtenerActividadesTrabajador(trabajadorSeleccionado).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Métricas de desempeño</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-600">Total horas</p>
                      <p className="text-lg font-bold text-blue-700">{trabajadorSeleccionado.horas}</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-600">Productividad</p>
                      <p className="text-lg font-bold text-green-700">{trabajadorSeleccionado.productividad.toFixed(2)}</p>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-600">Eficiencia</p>
                      <p className="text-lg font-bold text-purple-700">{trabajadorSeleccionado.eficiencia.toFixed(2)}x</p>
                    </div>
                    <div className="bg-amber-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-600">Costo</p>
                      <p className="text-lg font-bold text-amber-700">{formatoMoneda(trabajadorSeleccionado.costo)}</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Actividades principales</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actividad</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Horas</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Productividad</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {obtenerActividadesTrabajador(trabajadorSeleccionado).map((act, idx) => (
                          <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-3 py-2 text-sm text-gray-900">{act.nombre}</td>
                            <td className="px-3 py-2 text-sm text-gray-900">{act.horas}</td>
                            <td className="px-3 py-2 text-sm text-gray-900">{act.productividad.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                <div className="mt-4 text-right">
                  <button 
                    className="px-3 py-1 text-xs rounded-md bg-blue-600 text-white hover:bg-blue-700"
                    onClick={() => setTrabajadorSeleccionado(null)}
                  >
                    Cerrar detalles
                  </button>
                </div>
              </div>
            )}
            
            {/* Gráfico de barras */}
            {!trabajadorSeleccionado && (
              <div className="mt-6">
                <h3 className="text-sm font-medium mb-2">Distribución de Costos por Trabajador</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={trabajadoresFiltrados.slice(0, 10)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="nombre" tick={{fontSize: 10}} interval={0} angle={-20} textAnchor="end" height={80} />
                    <YAxis tickFormatter={(value) => `S/ ${value}`} />
                    <Tooltip formatter={(value) => formatoMoneda(value)} />
                    <Legend />
                    <Bar dataKey="costo" name="Costo Total" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        );
        
      case 'categorias':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Distribución por Categoría</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={distribucionCategorias}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="valor"
                    nameKey="nombre"
                  >
                    {distribucionCategorias.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatoMoneda(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Resumen por Categoría</h3>
              <div className="bg-white rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Horas</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Costo</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {distribucionCategorias.map((cat, index) => (
                      <tr key={cat.nombre} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-3 py-2 text-sm text-gray-900">{cat.nombre}</td>
                        <td className="px-3 py-2 text-sm text-gray-900">{cat.cantidad}</td>
                        <td className="px-3 py-2 text-sm text-gray-900">{cat.horas}</td>
                        <td className="px-3 py-2 text-sm text-gray-900">{formatoMoneda(cat.costo)}</td>
                      </tr>
                    ))}
                    <tr className="bg-gray-100 font-medium">
                      <td className="px-3 py-2 text-sm text-gray-900">TOTAL</td>
                      <td className="px-3 py-2 text-sm text-gray-900">
                        {distribucionCategorias.reduce((sum, cat) => sum + cat.cantidad, 0)}
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-900">
                        {distribucionCategorias.reduce((sum, cat) => sum + cat.horas, 0)}
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-900">
                        {formatoMoneda(distribucionCategorias.reduce((sum, cat) => sum + cat.costo, 0))}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div className="mt-4">
                <h3 className="text-sm font-medium mb-2">Tarifa por Categoría</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center bg-blue-50 p-2 rounded">
                    <span className="font-medium">OPERARIO</span>
                    <span className="text-blue-700">S/ 23.00 / hora</span>
                  </div>
                  <div className="flex justify-between items-center bg-green-50 p-2 rounded">
                    <span className="font-medium">OFICIAL</span>
                    <span className="text-green-700">S/ 18.09 / hora</span>
                  </div>
                  <div className="flex justify-between items-center bg-amber-50 p-2 rounded">
                    <span className="font-medium">PEON</span>
                    <span className="text-amber-700">S/ 16.38 / hora</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'estadisticas':
        return (
          <div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center mb-1">
                  <Users size={18} className="text-blue-600 mr-2" />
                  <p className="text-sm text-gray-600 font-medium">Total Trabajadores</p>
                </div>
                <p className="text-lg font-bold text-blue-800">{estadisticas.totalTrabajadores}</p>
              </div>
              
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="flex items-center mb-1">
                  <Clock size={18} className="text-green-600 mr-2" />
                  <p className="text-sm text-gray-600 font-medium">Horas Totales</p>
                </div>
                <p className="text-lg font-bold text-green-800">{estadisticas.totalHoras}</p>
              </div>
              
              <div className="bg-purple-50 p-3 rounded-lg">
                <div className="flex items-center mb-1">
                  <Award size={18} className="text-purple-600 mr-2" />
                  <p className="text-sm text-gray-600 font-medium">Productividad Media</p>
                </div>
                <p className="text-lg font-bold text-purple-800">{estadisticas.productividadPromedio.toFixed(2)}</p>
              </div>
              
              <div className="bg-amber-50 p-3 rounded-lg">
                <div className="flex items-center mb-1">
                  <DollarSign size={18} className="text-amber-600 mr-2" />
                  <p className="text-sm text-gray-600 font-medium">Costo Total</p>
                </div>
                <p className="text-lg font-bold text-amber-800">{formatoMoneda(estadisticas.costoTotal)}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {estadisticas.mejorProductividad && (
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-700 mb-2 flex items-center">
                    <Award size={16} className="text-yellow-500 mr-2" />
                    Mejor Productividad
                  </h4>
                  <p className="font-bold text-lg mb-1">{estadisticas.mejorProductividad.nombre}</p>
                  <p className="text-sm text-gray-600">{estadisticas.mejorProductividad.categoria}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Productividad: <span className="font-medium">{estadisticas.mejorProductividad.productividad.toFixed(2)}</span>
                  </p>
                </div>
              )}
              
              {estadisticas.mejorEficiencia && (
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-700 mb-2 flex items-center">
                    <Award size={16} className="text-green-500 mr-2" />
                    Mejor Eficiencia
                  </h4>
                  <p className="font-bold text-lg mb-1">{estadisticas.mejorEficiencia.nombre}</p>
                  <p className="text-sm text-gray-600">{estadisticas.mejorEficiencia.categoria}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Eficiencia: <span className="font-medium">{estadisticas.mejorEficiencia.eficiencia.toFixed(2)}x</span>
                  </p>
                </div>
              )}
              
              {estadisticas.masHoras && (
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-700 mb-2 flex items-center">
                    <Clock size={16} className="text-blue-500 mr-2" />
                    Más Horas Trabajadas
                  </h4>
                  <p className="font-bold text-lg mb-1">{estadisticas.masHoras.nombre}</p>
                  <p className="text-sm text-gray-600">{estadisticas.masHoras.categoria}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Horas: <span className="font-medium">{estadisticas.masHoras.horas}</span>
                  </p>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h4 className="font-medium text-gray-700 mb-2">Distribución de Horas por Categoría</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={distribucionCategorias}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="nombre" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="horas" name="Horas Totales" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h4 className="font-medium text-gray-700 mb-2">Distribución de Costos</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={distribucionCategorias}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="nombre" />
                    <YAxis tickFormatter={(value) => `S/ ${value}`} />
                    <Tooltip formatter={(value) => formatoMoneda(value)} />
                    <Legend />
                    <Bar dataKey="costo" name="Costo Total" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="mt-6 bg-white p-4 rounded-lg border border-gray-200">
              <h4 className="font-medium text-gray-700 mb-2">Recomendaciones de Mejora</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <h5 className="font-medium text-blue-800 mb-2">Asignación de Personal</h5>
                  <ul className="list-disc pl-5 text-sm space-y-1">
                    <li>Asignar trabajadores con alta productividad a actividades críticas.</li>
                    <li>Formar equipos balanceados combinando personal con distintos niveles de experiencia.</li>
                    <li>Rotar personal en actividades repetitivas para evitar fatiga y mantener productividad.</li>
                  </ul>
                </div>
                
                <div className="bg-green-50 p-3 rounded-lg">
                  <h5 className="font-medium text-green-800 mb-2">Desarrollo de Competencias</h5>
                  <ul className="list-disc pl-5 text-sm space-y-1">
                    <li>Realizar capacitaciones específicas para actividades con menor productividad.</li>
                    <li>Implementar programa de mentoring donde los mejores trabajadores compartan prácticas.</li>
                    <li>Establecer incentivos basados en mejoras de productividad.</li>
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

  return (
    <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Análisis de Trabajadores</h2>
        
        <div className="flex flex-wrap gap-2">
          <button
            className={`px-3 py-1 text-xs rounded-md ${vistaActiva === 'ranking' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
            onClick={() => setVistaActiva('ranking')}
          >
            <span className="flex items-center">
              <List size={14} className="mr-1" />
              Ranking
            </span>
          </button>
          <button
            className={`px-3 py-1 text-xs rounded-md ${vistaActiva === 'categorias' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
            onClick={() => setVistaActiva('categorias')}
          >
            <span className="flex items-center">
              <Users size={14} className="mr-1" />
              Por Categoría
            </span>
          </button>
          <button
            className={`px-3 py-1 text-xs rounded-md ${vistaActiva === 'estadisticas' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
            onClick={() => setVistaActiva('estadisticas')}
          >
            <span className="flex items-center">
              <Award size={14} className="mr-1" />
              Estadísticas
            </span>
          </button>
        </div>
      </div>
      
      {renderizarVista()}
    </div>
  );
};

export default AnalisisTrabajadores;