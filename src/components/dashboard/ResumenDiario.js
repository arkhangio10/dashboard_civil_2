// src/components/dashboard/ResumenDiario.js
import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, Line, ComposedChart, Cell
} from 'recharts';
import { 
  Calendar, Users, TrendingUp, DollarSign,
  RefreshCw, AlertCircle, ArrowUpCircle, ArrowDownCircle
} from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import { useAuth } from '../../context/AuthContext';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { formatoMoneda } from '../../utils/formatUtils';

const ResumenDiario = () => {
  const { db } = useAuth();
  const { filtros } = useDashboard();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [resumenData, setResumenData] = useState([]);
  const [filtroFecha, setFiltroFecha] = useState({
    inicio: obtenerFechaRetrocedida(30), // Por defecto 30 días atrás
    fin: obtenerFechaActual()
  });

  // Función para obtener la fecha actual en formato YYYY-MM-DD
  function obtenerFechaActual() {
    const fecha = new Date();
    return fecha.toISOString().split('T')[0];
  }

  // Función para obtener una fecha retrocedida X días
  function obtenerFechaRetrocedida(dias) {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() - dias);
    return fecha.toISOString().split('T')[0];
  }

  // Función para cargar los datos diarios
  const cargarDatosDiarios = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!db) {
        throw new Error("No hay conexión con Firebase");
      }

      // Consultar resúmenes diarios entre las fechas seleccionadas
      const resumeRef = collection(db, 'Dashboard_Resumenes');
      const resumeQuery = query(
        resumeRef,
        where('periodo', '==', 'diario'),
        where('fecha', '>=', filtroFecha.inicio),
        where('fecha', '<=', filtroFecha.fin),
        orderBy('fecha', 'asc')
      );

      const snapshot = await getDocs(resumeQuery);

      if (snapshot.empty) {
        console.log("No se encontraron datos para el rango seleccionado");
        setResumenData([]);
        setLoading(false);
        return;
      }

      // Procesar los datos para el formato requerido
      const datos = snapshot.docs.map(doc => {
        const data = doc.data();
        const totalTrabajadores = Object.values(data.porCategoria || {})
          .reduce((sum, cat) => sum + (cat.cantidad || 0), 0);
        
        const costoTotal = data.metricas?.costoTotal || 0;
        const valorTotal = data.metricas?.valorTotal || 0;
        const ganancia = valorTotal - costoTotal;
        const esGanancia = ganancia >= 0;

        return {
          fecha: data.fecha,
          fechaFormateada: formatearFecha(data.fecha),
          totalTrabajadores,
          costoTotal,
          valorTotal,
          ganancia,
          esGanancia,
          reportesProcesados: data.metricas?.reportesProcesados || 0
        };
      });

      // Ordenar por fecha
      datos.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
      
      setResumenData(datos);
    } catch (error) {
      console.error("Error al cargar datos diarios:", error);
      setError("Ocurrió un error al cargar los datos. " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Formatear fecha para mostrar DD/MM/YYYY
  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return '';
    
    const partes = fechaStr.split('-');
    if (partes.length !== 3) return fechaStr;
    
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  };

  // Cargar datos cuando cambian los filtros
  useEffect(() => {
    cargarDatosDiarios();
  }, [filtroFecha, db]);

  // Calcular totales y promedios
  const calcularEstadisticas = () => {
    if (resumenData.length === 0) return { 
      totalTrabajadores: 0, 
      totalDias: 0, 
      totalGanancia: 0,
      diasConGanancia: 0,
      diasConPerdida: 0,
      promedioDiario: 0
    };

    const totalTrabajadores = resumenData.reduce((max, item) => 
      Math.max(max, item.totalTrabajadores), 0);
    
    const totalDias = resumenData.length;
    const totalGanancia = resumenData.reduce((sum, item) => sum + item.ganancia, 0);
    const diasConGanancia = resumenData.filter(item => item.esGanancia).length;
    const diasConPerdida = totalDias - diasConGanancia;
    const promedioDiario = totalDias > 0 ? totalGanancia / totalDias : 0;

    return {
      totalTrabajadores,
      totalDias,
      totalGanancia,
      diasConGanancia,
      diasConPerdida,
      promedioDiario
    };
  };

  const estadisticas = calcularEstadisticas();

  // Color de barra según ganancia o pérdida
  const getBarColor = (item) => {
    return item.esGanancia ? '#10b981' : '#ef4444';
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center">
          <Calendar size={20} className="mr-2 text-blue-600" />
          Resumen Diario de Trabajadores y Ganancia
        </h2>

        <div className="flex space-x-2">
          <button
            onClick={cargarDatosDiarios}
            className="flex items-center px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
          >
            <RefreshCw size={14} className="mr-1" />
            Actualizar
          </button>
        </div>
      </div>

      {/* Filtros de fecha */}
      <div className="flex flex-col md:flex-row md:items-end space-y-2 md:space-y-0 md:space-x-4 mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha inicio</label>
          <input
            type="date"
            value={filtroFecha.inicio}
            onChange={(e) => setFiltroFecha({...filtroFecha, inicio: e.target.value})}
            className="p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha fin</label>
          <input
            type="date"
            value={filtroFecha.fin}
            onChange={(e) => setFiltroFecha({...filtroFecha, fin: e.target.value})}
            className="p-2 border border-gray-300 rounded-md"
          />
        </div>
        <button
          onClick={cargarDatosDiarios}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Aplicar
        </button>
      </div>

      {/* Mostrar error si existe */}
      {error && (
        <div className="bg-red-50 p-4 rounded-lg border border-red-200 mb-4">
          <div className="flex items-center">
            <AlertCircle size={20} className="text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Mostrar carga */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : resumenData.length === 0 ? (
        <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200 text-center">
          <p className="text-yellow-700">No se encontraron datos para el rango de fechas seleccionado.</p>
        </div>
      ) : (
        <>
          {/* Tarjetas de estadísticas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
              <div className="flex items-center mb-1">
                <Users size={18} className="text-blue-600 mr-2" />
                <p className="text-sm text-gray-600 font-medium">Total Trabajadores</p>
              </div>
              <p className="text-lg font-bold text-blue-800">{estadisticas.totalTrabajadores}</p>
              <p className="text-xs text-gray-500">Máximo en un día</p>
            </div>
            
            <div className="bg-green-50 p-3 rounded-lg border border-green-100">
              <div className="flex items-center mb-1">
                <ArrowUpCircle size={18} className="text-green-600 mr-2" />
                <p className="text-sm text-gray-600 font-medium">Días con Ganancia</p>
              </div>
              <p className="text-lg font-bold text-green-800">{estadisticas.diasConGanancia}</p>
              <p className="text-xs text-gray-500">De {estadisticas.totalDias} días analizados</p>
            </div>
            
            <div className="bg-red-50 p-3 rounded-lg border border-red-100">
              <div className="flex items-center mb-1">
                <ArrowDownCircle size={18} className="text-red-600 mr-2" />
                <p className="text-sm text-gray-600 font-medium">Días con Pérdida</p>
              </div>
              <p className="text-lg font-bold text-red-800">{estadisticas.diasConPerdida}</p>
              <p className="text-xs text-gray-500">De {estadisticas.totalDias} días analizados</p>
            </div>
            
            <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
              <div className="flex items-center mb-1">
                <DollarSign size={18} className="text-purple-600 mr-2" />
                <p className="text-sm text-gray-600 font-medium">Ganancia Total</p>
              </div>
              <p className={`text-lg font-bold ${estadisticas.totalGanancia >= 0 ? 'text-green-800' : 'text-red-800'}`}>
                {formatoMoneda(estadisticas.totalGanancia)}
              </p>
              <p className="text-xs text-gray-500">Promedio: {formatoMoneda(estadisticas.promedioDiario)}/día</p>
            </div>
          </div>

          {/* Gráfico de barras */}
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-2">Relación Trabajadores vs Ganancia por Día</h3>
            <div className="bg-white p-3 rounded-lg border border-gray-200">
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={resumenData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="fechaFormateada" 
                    tick={{fontSize: 12}}
                    interval={Math.min(5, Math.ceil(resumenData.length / 20))}
                    angle={-20}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    yAxisId="left"
                    tick={{fontSize: 12}}
                    tickFormatter={(value) => formatoMoneda(value)}
                    domain={['auto', 'auto']}
                  />
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    domain={[0, 'auto']}
                    allowDecimals={false}
                  />
                  <Tooltip 
                    formatter={(value, name) => {
                      if (name === 'Ganancia') return [formatoMoneda(value), name];
                      return [value, name];
                    }}
                  />
                  <Legend />
                  <Bar 
                    yAxisId="left"
                    dataKey="ganancia" 
                    name="Ganancia" 
                    radius={[4, 4, 0, 0]}
                  >
                    {resumenData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getBarColor(entry)} />
                    ))}
                  </Bar>
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="totalTrabajadores" 
                    name="Trabajadores" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={true}
                  />
                </ComposedChart>
              </ResponsiveContainer>
              <div className="mt-2 text-xs text-gray-500 text-center">
                Se muestra la ganancia (barras) y cantidad de trabajadores (línea) por día
              </div>
            </div>
          </div>

          {/* Tabla de datos */}
          <div>
            <h3 className="text-sm font-medium mb-2">Detalle por Día</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trabajadores</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reportes</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Costo MO</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ganancia</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {resumenData.map((item, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-3 py-2 text-sm text-gray-900">{item.fechaFormateada}</td>
                      <td className="px-3 py-2 text-sm text-gray-900">{item.totalTrabajadores}</td>
                      <td className="px-3 py-2 text-sm text-gray-900">{item.reportesProcesados}</td>
                      <td className="px-3 py-2 text-sm text-red-600 font-medium">{formatoMoneda(item.costoTotal)}</td>
                      <td className="px-3 py-2 text-sm text-blue-600 font-medium">{formatoMoneda(item.valorTotal)}</td>
                      <td className={`px-3 py-2 text-sm font-medium ${item.esGanancia ? 'text-green-600' : 'text-red-600'}`}>
                        {formatoMoneda(item.ganancia)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-100">
                  <tr>
                    <td className="px-3 py-2 text-sm font-medium text-gray-900">TOTALES:</td>
                    <td className="px-3 py-2 text-sm font-medium text-gray-900">{estadisticas.totalTrabajadores} (max)</td>
                    <td className="px-3 py-2 text-sm font-medium text-gray-900">
                      {resumenData.reduce((sum, item) => sum + item.reportesProcesados, 0)}
                    </td>
                    <td className="px-3 py-2 text-sm font-medium text-red-600">
                      {formatoMoneda(resumenData.reduce((sum, item) => sum + item.costoTotal, 0))}
                    </td>
                    <td className="px-3 py-2 text-sm font-medium text-blue-600">
                      {formatoMoneda(resumenData.reduce((sum, item) => sum + item.valorTotal, 0))}
                    </td>
                    <td className={`px-3 py-2 text-sm font-medium ${estadisticas.totalGanancia >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatoMoneda(estadisticas.totalGanancia)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ResumenDiario;