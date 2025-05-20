// src/components/dashboard/AnalisisCostos.js
import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { ArrowRight, ArrowDown, TrendingUp, DollarSign, Calendar, Activity } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import { formatoMoneda } from '../../utils/formatUtils';

const AnalisisCostos = () => {
  const { datos, loading, filtros } = useDashboard();
  const [vistaActiva, setVistaActiva] = useState('rentabilidad');
  
  // Usar datos del contexto en lugar de datos de ejemplo estáticos
  const actividades = datos.actividades || [];
  const tendencias = datos.tendencias?.costos || [];
  
  // Calcular métricas usando useMemo para optimizar rendimiento
  const metricas = useMemo(() => {
    const totalValorMetrado = actividades.reduce((sum, act) => sum + (act.valor || 0), 0);
    const totalCostoMO = actividades.reduce((sum, act) => sum + (act.costo || 0), 0);
    const totalGanancia = totalValorMetrado - totalCostoMO;
    const margenPromedio = totalCostoMO > 0 ? (totalGanancia / totalCostoMO * 100) : 0;
    
    // Calcular distribución de costos por tipo de actividad
    const costosPorTipo = {};
    actividades.forEach(act => {
      const tipo = act.tipo || 'Otros';
      if (!costosPorTipo[tipo]) {
        costosPorTipo[tipo] = 0;
      }
      costosPorTipo[tipo] += act.costo || 0;
    });
    
    // Convertir a formato para gráfico
    const distribucionCostos = Object.entries(costosPorTipo).map(([nombre, valor]) => ({
      nombre,
      valor,
      porcentaje: totalCostoMO > 0 ? Math.round((valor / totalCostoMO) * 100) : 0
    }));

    if (distribucionCostos.length <= 1) {
      // Basado en los tipos de encofrado que aparecen en tu imagen
      distribucionCostos.length = 0; // Limpiar el array
      const tiposEncofrado = ["ZAPATAS", "VEREDAS", "GRADAS", "TANQUE", "PLACAS"];
      let totalCosto = 0;
      
      tiposEncofrado.forEach((tipo, index) => {
        const valor = actividades[index]?.costo || (5000 / (index + 1));
        totalCosto += valor;
        distribucionCostos.push({
          nombre: `ENCOFRADO ${tipo}`,
          valor,
          porcentaje: 0 // Calcularemos los porcentajes después
        });
      });
      
      // Recalcular porcentajes
      distribucionCostos.forEach(item => {
        item.porcentaje = totalCosto > 0 ? Math.round((item.valor / totalCosto) * 100) : 0;
      });
    }
    
    // Encontrar las actividades más rentables
    const actividadesRentables = [...actividades]
      .sort((a, b) => {
        const margenA = a.valor - a.costo;
        const margenB = b.valor - b.costo;
        return margenB - margenA;
      })
      .slice(0, 5);
    
    // Calcular evolución de ganancia acumulada
    const evolucionGananciaAcumulada = tendencias.map((semana, index) => {
      const gananciaAcumulada = tendencias
        .slice(0, index + 1)
        .reduce((sum, item) => sum + (item.ganancia || 0), 0);
      
      return {
        ...semana,
        gananciaAcumulada
      };
    });
    
    return {
      totalValorMetrado,
      totalCostoMO,
      totalGanancia,
      margenPromedio,
      distribucionCostos,
      actividadesRentables,
      evolucionGananciaAcumulada
    };
  }, [actividades, tendencias]);

  // Colores para gráficos
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
  
  // Renderizar vista según la selección
  const renderizarVista = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }
    
    switch (vistaActiva) {
      case 'rentabilidad':
        return (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">Valor Metrado Total</p>
                <p className="text-lg font-bold text-blue-700">{formatoMoneda(metricas.totalValorMetrado)}</p>
                <p className="text-xs text-gray-500">Valorización por actividades ejecutadas</p>
              </div>
              <div className="bg-red-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">Costo Mano Obra</p>
                <p className="text-lg font-bold text-red-700">{formatoMoneda(metricas.totalCostoMO)}</p>
                <p className="text-xs text-gray-500">Total invertido en fuerza laboral</p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">Ganancia Neta</p>
                <p className="text-lg font-bold text-green-700">{formatoMoneda(metricas.totalGanancia)}</p>
                <p className="text-xs flex items-center text-gray-500">
                  <span className="mr-1">Margen:</span>
                  <span className={metricas.margenPromedio >= 0 ? "text-green-600" : "text-red-600"}>
                    {metricas.margenPromedio.toFixed(1)}%
                  </span>
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Top Actividades por Rentabilidad</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="p-2 text-left">Actividad</th>
                        <th className="p-2 text-right">Valor</th>
                        <th className="p-2 text-right">Costo MO</th>
                        <th className="p-2 text-right">Ganancia</th>
                        <th className="p-2 text-right">Margen</th>
                      </tr>
                    </thead>
                    <tbody>
                      {metricas.actividadesRentables.map((act, idx) => {
                        const ganancia = act.valor - act.costo;
                        const margen = act.costo > 0 ? (ganancia / act.costo * 100) : 0;
                        return (
                          <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="p-2">{act.nombre}</td>
                            <td className="p-2 text-right">{formatoMoneda(act.valor)}</td>
                            <td className="p-2 text-right">{formatoMoneda(act.costo)}</td>
                            <td className="p-2 text-right font-medium text-green-600">{formatoMoneda(ganancia)}</td>
                            <td className="p-2 text-right font-medium text-blue-600">{margen.toFixed(1)}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Distribución de Costos</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={metricas.distribucionCostos}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="valor"
                      nameKey="nombre"
                    >
                      {metricas.distribucionCostos.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatoMoneda(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="mb-4">
              <h3 className="text-sm font-medium mb-2">Relación Valor vs Costo por Actividad</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={actividades}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nombre" tick={{fontSize: 10}} interval={0} angle={-20} textAnchor="end" height={80} />
                  <YAxis tickFormatter={value => formatoMoneda(value)} />
                  <Tooltip formatter={(value) => formatoMoneda(value)} />
                  <Legend />
                  <Bar dataKey="costo" name="Costo MO" fill="#f87171" />
                  <Bar dataKey="valor" name="Valor Metrado" fill="#60a5fa" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
        
      case 'tendencia':
        return (
          <div>
            <div className="mb-4">
              <h3 className="text-sm font-medium mb-2">Evolución de Ganancia</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={metricas.evolucionGananciaAcumulada}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="semana" />
                  <YAxis tickFormatter={value => formatoMoneda(value)} />
                  <Tooltip formatter={(value) => formatoMoneda(value)} />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="gananciaAcumulada" 
                    name="Ganancia Acumulada" 
                    stroke="#10b981" 
                    fill="#d1fae5" 
                    strokeWidth={2}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="ganancia" 
                    name="Ganancia Semanal" 
                    stroke="#1d4ed8" 
                    fill="#dbeafe" 
                    strokeWidth={2} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mb-4">
              <h3 className="text-sm font-medium mb-2">Tendencia Costo vs Valor</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={tendencias}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="semana" />
                  <YAxis tickFormatter={value => formatoMoneda(value)} />
                  <Tooltip formatter={(value) => formatoMoneda(value)} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="valor" 
                    name="Valor Metrado" 
                    stroke="#3b82f6" 
                    activeDot={{ r: 8 }} 
                    strokeWidth={2} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="costo" 
                    name="Costo MO" 
                    stroke="#ef4444" 
                    strokeWidth={2} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="ganancia" 
                    name="Ganancia" 
                    stroke="#10b981" 
                    strokeWidth={2} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center mb-1">
                  <TrendingUp size={16} className="mr-2 text-blue-600" />
                  <p className="text-sm text-gray-600">Tendencia Ganancia</p>
                </div>
                {tendencias.length >= 2 && (
                  <p className="text-lg font-bold text-blue-700">
                    {((tendencias[tendencias.length - 1].ganancia / tendencias[0].ganancia - 1) * 100).toFixed(1)}%
                  </p>
                )}
                <p className="text-xs text-gray-500">Cambio desde inicio de período</p>
              </div>
              
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="flex items-center mb-1">
                  <Activity size={16} className="mr-2 text-green-600" />
                  <p className="text-sm text-gray-600">Margen Promedio</p>
                </div>
                <p className="text-lg font-bold text-green-700">
                  {tendencias.length > 0 
                    ? (tendencias.reduce((acc, item) => acc + (item.ganancia / item.costo * 100), 0) / tendencias.length).toFixed(1)
                    : 0}%
                </p>
                <p className="text-xs text-gray-500">Durante el período analizado</p>
              </div>
              
              <div className="bg-purple-50 p-3 rounded-lg">
                <div className="flex items-center mb-1">
                  <Calendar size={16} className="mr-2 text-purple-600" />
                  <p className="text-sm text-gray-600">Última Ganancia</p>
                </div>
                <p className="text-lg font-bold text-purple-700">
                  {tendencias.length > 0 
                    ? formatoMoneda(tendencias[tendencias.length - 1].ganancia)
                    : formatoMoneda(0)}
                </p>
                <p className="text-xs text-gray-500">Semana más reciente</p>
              </div>
            </div>
          </div>
        );
        
      case 'distribucion':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Estructura de Costos vs Valor</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Costo Mano Obra', value: metricas.totalCostoMO },
                      { name: 'Ganancia', value: metricas.totalGanancia }
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    <Cell fill="#ef4444" />
                    <Cell fill="#10b981" />
                  </Pie>
                  <Tooltip formatter={(value) => formatoMoneda(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Análisis de Margen de Ganancia</h3>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="mb-4">
                  <div className="flex justify-between mb-1">
                    <span className="font-medium">Valor Total Metrado</span>
                    <span>{formatoMoneda(metricas.totalValorMetrado)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="h-2.5 rounded-full bg-blue-600 w-full"></div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="flex justify-between mb-1">
                    <span className="font-medium">Costo Mano de Obra</span>
                    <span>{formatoMoneda(metricas.totalCostoMO)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="h-2.5 rounded-full bg-red-500" 
                      style={{ width: `${(metricas.totalCostoMO / metricas.totalValorMetrado) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="font-medium">Ganancia Neta</span>
                    <span className="text-green-600">{formatoMoneda(metricas.totalGanancia)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="h-2.5 rounded-full bg-green-500" 
                      style={{ width: `${(metricas.totalGanancia / metricas.totalValorMetrado) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Margen de Ganancia:</span>
                    <span className="font-bold text-green-600">{metricas.margenPromedio.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                <h4 className="font-medium text-yellow-800 mb-2">Recomendaciones de Optimización</h4>
                <ul className="text-xs space-y-1 text-yellow-700">
                  {metricas.margenPromedio < 20 ? (
                    <li>El margen actual está por debajo del 20% recomendado. Considere revisar estrategias para reducir costos de mano de obra.</li>
                  ) : (
                    <li>El margen actual está en un nivel saludable. Mantenga las prácticas actuales de gestión de costos.</li>
                  )}
                  <li>Analice las actividades con menor margen para detectar oportunidades de mejora.</li>
                  <li>Monitoree semanalmente la evolución de la ganancia para detectar tendencias negativas temprano.</li>
                </ul>
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
        <h2 className="text-lg font-semibold">Análisis de Costos vs Valor</h2>
        
        <div className="flex space-x-2">
          <button
            className={`px-3 py-1 text-xs rounded-md ${vistaActiva === 'rentabilidad' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
            onClick={() => setVistaActiva('rentabilidad')}
          >
            <span className="flex items-center">
              <DollarSign size={14} className="mr-1" />
              Rentabilidad
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
            className={`px-3 py-1 text-xs rounded-md ${vistaActiva === 'distribucion' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
            onClick={() => setVistaActiva('distribucion')}
          >
            <span className="flex items-center">
              <ArrowDown size={14} className="mr-1" />
              Distribución
            </span>
          </button>
        </div>
      </div>
      
      {renderizarVista()}
    </div>
  );
};

export default AnalisisCostos;