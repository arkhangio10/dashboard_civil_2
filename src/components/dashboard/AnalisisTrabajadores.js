import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, Award, Clock, DollarSign, List, Search } from 'lucide-react';
import { mockData } from '../../utils/mockData';
import { formatoMoneda } from '../../utils/formatUtils';

const AnalisisTrabajadores = () => {
  const [vistaActiva, setVistaActiva] = useState('ranking');
  const [filtroCategoria, setFiltroCategoria] = useState('TODAS');
  const [busqueda, setBusqueda] = useState('');
  
  // Datos de trabajadores desde mock
  const trabajadores = mockData.trabajadores;
  
  // Datos de distribución por categoría
  const distribucionCategorias = mockData.distribucion.categorias;
  
  // Colores para gráficos
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
  
  // Filtrar trabajadores según categoría y búsqueda
  const trabajadoresFiltrados = trabajadores.filter(t => 
    (filtroCategoria === 'TODAS' || t.categoria === filtroCategoria) &&
    (busqueda === '' || t.nombre.toLowerCase().includes(busqueda.toLowerCase()))
  );

  // Renderizar vista según la selección
  const renderizarVista = () => {
    switch (vistaActiva) {
      case 'ranking':
        return (
          <div>
            <div className="mb-4 flex items-center justify-between">
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
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none">
                  <Search size={14} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar trabajador..."
                  className="pl-8 p-1.5 border border-gray-300 rounded-md text-sm"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>
            </div>
            
            <h3 className="text-sm font-medium mb-2">Ranking por Productividad</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trabajador</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Horas</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Productividad</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Eficiencia</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor Generado</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {trabajadoresFiltrados.map((trab, index) => (
                    <tr key={trab.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-3 py-2 text-sm text-gray-900">{trab.nombre}</td>
                      <td className="px-3 py-2 text-sm text-gray-900">{trab.categoria}</td>
                      <td className="px-3 py-2 text-sm text-gray-900">{trab.horas}</td>
                      <td className="px-3 py-2 text-sm text-gray-900">{trab.productividad.toFixed(2)}</td>
                      <td className={`px-3 py-2 text-sm font-medium ${trab.eficiencia >= 1 ? 'text-green-600' : 'text-red-600'}`}>
                        {trab.eficiencia.toFixed(2)}x
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-900">{formatoMoneda(trab.valor)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-6">
              <h3 className="text-sm font-medium mb-2">Distribución de Valor Generado por Trabajador</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={trabajadoresFiltrados}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nombre" tick={{fontSize: 10}} interval={0} angle={-20} textAnchor="end" height={80} />
                  <YAxis tickFormatter={(value) => `S/ ${value}`} />
                  <Tooltip formatter={(value) => formatoMoneda(value)} />
                  <Legend />
                  <Bar dataKey="valor" name="Valor Generado" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
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
        // Calcular estadísticas generales
        const totalTrabajadores = trabajadores.length;
        const totalHoras = trabajadores.reduce((sum, t) => sum + t.horas, 0);
        const productividadPromedio = trabajadores.reduce((sum, t) => sum + t.productividad, 0) / totalTrabajadores;
        const valorTotal = trabajadores.reduce((sum, t) => sum + t.valor, 0);
        
        // Calcular mejores desempeños
        const mejorProductividad = trabajadores.reduce((best, current) => 
          current.productividad > best.productividad ? current : best, trabajadores[0]);
          
        const mejorEficiencia = trabajadores.reduce((best, current) => 
          current.eficiencia > best.eficiencia ? current : best, trabajadores[0]);
          
        const masHoras = trabajadores.reduce((best, current) => 
          current.horas > best.horas ? current : best, trabajadores[0]);
        
        return (
          <div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center mb-1">
                  <Users size={18} className="text-blue-600 mr-2" />
                  <p className="text-sm text-gray-600 font-medium">Total Trabajadores</p>
                </div>
                <p className="text-lg font-bold text-blue-800">{totalTrabajadores}</p>
              </div>
              
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="flex items-center mb-1">
                  <Clock size={18} className="text-green-600 mr-2" />
                  <p className="text-sm text-gray-600 font-medium">Horas Totales</p>
                </div>
                <p className="text-lg font-bold text-green-800">{totalHoras}</p>
              </div>
              
              <div className="bg-purple-50 p-3 rounded-lg">
                <div className="flex items-center mb-1">
                  <Award size={18} className="text-purple-600 mr-2" />
                  <p className="text-sm text-gray-600 font-medium">Productividad Media</p>
                </div>
                <p className="text-lg font-bold text-purple-800">{productividadPromedio.toFixed(2)}</p>
              </div>
              
              <div className="bg-amber-50 p-3 rounded-lg">
                <div className="flex items-center mb-1">
                  <DollarSign size={18} className="text-amber-600 mr-2" />
                  <p className="text-sm text-gray-600 font-medium">Valor Total</p>
                </div>
                <p className="text-lg font-bold text-amber-800">{formatoMoneda(valorTotal)}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h4 className="font-medium text-gray-700 mb-2 flex items-center">
                  <Award size={16} className="text-yellow-500 mr-2" />
                  Mejor Productividad
                </h4>
                <p className="font-bold text-lg mb-1">{mejorProductividad.nombre}</p>
                <p className="text-sm text-gray-600">{mejorProductividad.categoria}</p>
                <p className="text-sm text-gray-600 mt-1">
                  Productividad: <span className="font-medium">{mejorProductividad.productividad.toFixed(2)}</span>
                </p>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h4 className="font-medium text-gray-700 mb-2 flex items-center">
                  <Award size={16} className="text-green-500 mr-2" />
                  Mejor Eficiencia
                </h4>
                <p className="font-bold text-lg mb-1">{mejorEficiencia.nombre}</p>
                <p className="text-sm text-gray-600">{mejorEficiencia.categoria}</p>
                <p className="text-sm text-gray-600 mt-1">
                  Eficiencia: <span className="font-medium">{mejorEficiencia.eficiencia.toFixed(2)}x</span>
                </p>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h4 className="font-medium text-gray-700 mb-2 flex items-center">
                  <Clock size={16} className="text-blue-500 mr-2" />
                  Más Horas Trabajadas
                </h4>
                <p className="font-bold text-lg mb-1">{masHoras.nombre}</p>
                <p className="text-sm text-gray-600">{masHoras.categoria}</p>
                <p className="text-sm text-gray-600 mt-1">
                  Horas: <span className="font-medium">{masHoras.horas}</span>
                </p>
              </div>
            </div>
            
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
        
        <div className="flex space-x-2">
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