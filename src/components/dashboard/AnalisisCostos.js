// src/components/dashboard/AnalisisCostos.js
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { ArrowRight, ArrowDown, TrendingUp, DollarSign } from 'lucide-react';

const AnalisisCostos = () => {
  const [vistaActiva, setVistaActiva] = useState('rentabilidad');
  
  // Datos de ejemplo para las gráficas
  const datosRentabilidad = [
    { nombre: 'Encofrado columnas', costo: 28500, valor: 42750, ganancia: 14250 },
    { nombre: 'Vaciado concreto', costo: 35200, valor: 58800, ganancia: 23600 },
    { nombre: 'Acero estructural', costo: 42000, valor: 67200, ganancia: 25200 },
    { nombre: 'Albañilería', costo: 18700, valor: 28050, ganancia: 9350 },
    { nombre: 'Instalaciones', costo: 22300, valor: 31220, ganancia: 8920 },
    { nombre: 'Acabados', costo: 31500, valor: 44100, ganancia: 12600 },
  ];

  const datosTendencia = [
    { semana: 'S1', costo: 45200, valor: 63280, ganancia: 18080 },
    { semana: 'S2', costo: 51300, valor: 71820, ganancia: 20520 },
    { semana: 'S3', costo: 48700, valor: 72100, ganancia: 23400 },
    { semana: 'S4', costo: 50200, valor: 75300, ganancia: 25100 },
    { semana: 'S5', costo: 53600, valor: 85760, ganancia: 32160 },
    { semana: 'S6', costo: 55100, valor: 88160, ganancia: 33060 },
    { semana: 'S7', costo: 54200, valor: 90100, ganancia: 35900 },
    { semana: 'S8', costo: 57800, valor: 98300, ganancia: 40500 },
  ];
  
  const datosDistribucion = [
    { nombre: 'OPERARIO', valor: 256000, porcentaje: 48 },
    { nombre: 'OFICIAL', valor: 175000, porcentaje: 33 },
    { nombre: 'PEON', valor: 102000, porcentaje: 19 },
  ];
  
  // Colores para gráficos
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
  
  // Formato moneda
  const formatoMoneda = (valor) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 0
    }).format(valor);
  };

  // Calcular totales
  const totalCosto = datosRentabilidad.reduce((sum, item) => sum + item.costo, 0);
  const totalValor = datosRentabilidad.reduce((sum, item) => sum + item.valor, 0);
  const totalGanancia = datosRentabilidad.reduce((sum, item) => sum + item.ganancia, 0);
  const margenPromedio = (totalGanancia / totalCosto * 100).toFixed(1);

  // Renderizar vista según la selección
  const renderizarVista = () => {
    switch (vistaActiva) {
      case 'rentabilidad':
        return (
          <div>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">Costo Total MO</p>
                <p className="text-lg font-bold text-blue-700">{formatoMoneda(totalCosto)}</p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">Valor Total</p>
                <p className="text-lg font-bold text-green-700">{formatoMoneda(totalValor)}</p>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">Margen Promedio</p>
                <p className="text-lg font-bold text-purple-700">{margenPromedio}%</p>
              </div>
            </div>
            
            <div className="mb-2 mt-4">
              <h3 className="text-sm font-medium mb-2">Top Actividades por Rentabilidad</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={datosRentabilidad}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nombre" tick={{fontSize: 10}} interval={0} angle={-20} textAnchor="end" height={80} />
                  <YAxis tickFormatter={value => formatoMoneda(value)} />
                  <Tooltip formatter={(value) => formatoMoneda(value)} />
                  <Legend verticalAlign="top" height={36} />
                  <Bar dataKey="costo" name="Costo MO" fill="#8884d8" />
                  <Bar dataKey="valor" name="Valor" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
        
      case 'tendencia':
        return (
          <div>
            <h3 className="text-sm font-medium mb-2">Tendencia Costo vs Valor por Semana</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={datosTendencia}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="semana" />
                <YAxis tickFormatter={value => formatoMoneda(value)} />
                <Tooltip formatter={(value) => formatoMoneda(value)} />
                <Legend />
                <Line type="monotone" dataKey="valor" stroke="#82ca9d" activeDot={{ r: 8 }} strokeWidth={2} name="Valor" />
                <Line type="monotone" dataKey="costo" stroke="#8884d8" strokeWidth={2} name="Costo MO" />
                <Line type="monotone" dataKey="ganancia" stroke="#ffc658" strokeWidth={2} name="Ganancia" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        );
        
      case 'distribucion':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Distribución de Costos por Categoría</h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={datosDistribucion}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="valor"
                  >
                    {datosDistribucion.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatoMoneda(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Costos por Categoría</h3>
              <div className="space-y-4 mt-4">
                {datosDistribucion.map((categoria, index) => (
                  <div key={categoria.nombre} className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex justify-between mb-1">
                      <span className="font-medium">{categoria.nombre}</span>
                      <span>{formatoMoneda(categoria.valor)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="h-2.5 rounded-full" 
                        style={{ 
                          width: `${categoria.porcentaje}%`,
                          backgroundColor: COLORS[index % COLORS.length]
                        }} 
                      ></div>
                    </div>
                    <div className="text-xs text-right mt-1 text-gray-500">
                      {categoria.porcentaje}% del total
                    </div>
                  </div>
                ))}
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