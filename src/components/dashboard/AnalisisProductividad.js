import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, ComposedChart, Area } from 'recharts';
import { Activity, BarChart2, TrendingUp, List } from 'lucide-react';
import { mockData } from '../../utils/mockData';

const AnalisisProductividad = () => {
  const [vistaActiva, setVistaActiva] = useState('actividades');
  
  // Datos de ejemplo para las gráficas
  const datosActividades = mockData.actividades.map(act => ({
    nombre: act.nombre,
    productividad: act.productividad,
    meta: act.meta,
    diferencia: ((act.productividad / act.meta) - 1) * 100
  }));

  const datosTendencia = mockData.tendencias.productividad;
  
  // Formatear datos para gráfico
  function formatearDiferencia(valor) {
    return valor >= 0 ? `+${valor.toFixed(1)}%` : `${valor.toFixed(1)}%`;
  }

  // Renderizar vista según la selección
  const renderizarVista = () => {
    switch (vistaActiva) {
      case 'actividades':
        return (
          <div>
            <div className="mb-4">
              <h3 className="text-sm font-medium mb-2">Productividad por Actividad (metrado/hora)</h3>
              <ResponsiveContainer width="100%" height={320}>
                <ComposedChart data={datosActividades}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nombre" tick={{fontSize: 10}} interval={0} angle={-20} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip formatter={(value) => value.toFixed(2)} />
                  <Legend />
                  <Bar dataKey="productividad" name="Productividad Actual" fill="#8884d8" />
                  <Line dataKey="meta" name="Meta" stroke="#ff7300" strokeWidth={2} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-6">
              <h3 className="text-sm font-medium mb-2">Variación vs Meta (%)</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actividad</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Productividad</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Meta</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diferencia</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {datosActividades.map((act, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-3 py-2 text-sm text-gray-900">{act.nombre}</td>
                        <td className="px-3 py-2 text-sm text-gray-900">{act.productividad.toFixed(2)}</td>
                        <td className="px-3 py-2 text-sm text-gray-900">{act.meta.toFixed(2)}</td>
                        <td className={`px-3 py-2 text-sm font-medium ${act.diferencia >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatearDiferencia(act.diferencia)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
        
      case 'tendencia':
        return (
          <div>
            <h3 className="text-sm font-medium mb-2">Tendencia de Productividad en el Tiempo</h3>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={datosTendencia}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="semana" />
                <YAxis />
                <Tooltip formatter={(value) => value.toFixed(2)} />
                <Legend />
                <Line type="monotone" dataKey="productividad" name="Productividad Semanal" stroke="#8884d8" activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="promedio" name="Promedio Acumulado" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
            
            <div className="mt-6 grid grid-cols-3 gap-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">Productividad Actual</p>
                <p className="text-lg font-bold text-blue-700">{datosTendencia[datosTendencia.length - 1].productividad.toFixed(2)}</p>
                <p className="text-xs text-gray-500 mt-1">Última semana registrada</p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">Promedio Histórico</p>
                <p className="text-lg font-bold text-green-700">{datosTendencia[datosTendencia.length - 1].promedio.toFixed(2)}</p>
                <p className="text-xs text-gray-500 mt-1">Promedio acumulado</p>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">Mejora</p>
                <p className="text-lg font-bold text-purple-700">
                  {formatearDiferencia((datosTendencia[datosTendencia.length - 1].productividad / datosTendencia[0].productividad - 1) * 100)}
                </p>
                <p className="text-xs text-gray-500 mt-1">Desde el inicio del período</p>
              </div>
            </div>
          </div>
        );
        
      case 'indicadores':
        // Calcular indicadores clave
        const ultimaProductividad = datosTendencia[datosTendencia.length - 1].productividad;
        const productiviadadPromedio = datosTendencia[datosTendencia.length - 1].promedio;
        const tendencia = datosTendencia.length > 1 ? 
          (datosTendencia[datosTendencia.length - 1].productividad - datosTendencia[datosTendencia.length - 2].productividad) / 
          datosTendencia[datosTendencia.length - 2].productividad : 0;
          
        // Comparar con metas
        const actividadesSuperanMeta = datosActividades.filter(a => a.productividad >= a.meta).length;
        const porcentajeCumplimiento = (actividadesSuperanMeta / datosActividades.length) * 100;
        
        return (
          <div>
            <h3 className="text-sm font-medium mb-3">Indicadores de Productividad</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h4 className="font-medium text-gray-700 mb-2">Productividad General</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-500">Actual</p>
                    <p className="text-lg font-bold">{ultimaProductividad.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Promedio</p>
                    <p className="text-lg font-bold">{productiviadadPromedio.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Tendencia</p>
                    <p className={`text-sm font-medium ${tendencia >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {tendencia >= 0 ? '↑' : '↓'} {Math.abs(tendencia * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Mejor Período</p>
                    <p className="text-sm font-medium">
                      {datosTendencia.reduce((best, current) => current.productividad > best.productividad ? current : best, datosTendencia[0]).semana}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h4 className="font-medium text-gray-700 mb-2">Cumplimiento de Metas</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-500">Actividades sobre Meta</p>
                    <p className="text-lg font-bold">{actividadesSuperanMeta} de {datosActividades.length}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Cumplimiento</p>
                    <p className="text-lg font-bold">{porcentajeCumplimiento.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Mejor Actividad</p>
                    <p className="text-sm font-medium">
                      {datosActividades.reduce((best, current) => 
                        (current.productividad / current.meta) > (best.productividad / best.meta) ? current : best, 
                        datosActividades[0]
                      ).nombre}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Oportunidad de Mejora</p>
                    <p className="text-sm font-medium">
                      {datosActividades.reduce((worst, current) => 
                        (current.productividad / current.meta) < (worst.productividad / worst.meta) ? current : worst, 
                        datosActividades[0]
                      ).nombre}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h4 className="font-medium text-gray-700 mb-2">Recomendaciones para Mejorar la Productividad</h4>
              <ul className="list-disc pl-5 text-sm space-y-1">
                <li>Realizar capacitaciones específicas para las actividades con menor productividad.</li>
                <li>Revisar los procedimientos de trabajo en actividades por debajo de la meta.</li>
                <li>Analizar las prácticas de los equipos con mejor rendimiento para replicarlas.</li>
                <li>Establecer incentivos para mantener y mejorar el desempeño actual.</li>
                <li>Optimizar la distribución de personal según fortalezas identificadas.</li>
              </ul>
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
        <h2 className="text-lg font-semibold">Análisis de Productividad</h2>
        
        <div className="flex space-x-2">
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
            className={`px-3 py-1 text-xs rounded-md ${vistaActiva === 'indicadores' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
            onClick={() => setVistaActiva('indicadores')}
          >
            <span className="flex items-center">
              <Activity size={14} className="mr-1" />
              Indicadores
            </span>
          </button>
        </div>
      </div>
      
      {renderizarVista()}
    </div>
  );
};

export default AnalisisProductividad;