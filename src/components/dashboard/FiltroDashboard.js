// src/components/dashboard/FiltroDashboard.js
import React, { useState } from 'react';
import { CalendarRange, Filter, ChevronDown } from 'lucide-react';

const FiltroDashboard = () => {
  const [filtroTemporal, setFiltroTemporal] = useState('semana');
  const [rangoFechas, setRangoFechas] = useState({
    inicio: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    fin: new Date().toISOString().split('T')[0]
  });
  const [semanaSeleccionada, setSemanaSeleccionada] = useState(obtenerSemanaActual());
  const [mesSeleccionado, setMesSeleccionado] = useState(new Date().toISOString().split('T')[0].substring(0, 7));
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('TODAS');
  const [ubicacionSeleccionada, setUbicacionSeleccionada] = useState('TODAS');
  const [mostrarAvanzados, setMostrarAvanzados] = useState(false);

  // Función para obtener la semana actual en formato ISO YYYY-Wnn
  function obtenerSemanaActual() {
    const fecha = new Date();
    const inicioAno = new Date(fecha.getFullYear(), 0, 1);
    const dias = Math.floor((fecha - inicioAno) / (24 * 60 * 60 * 1000));
    const semana = Math.ceil((fecha.getDay() + 1 + dias) / 7);
    return `${fecha.getFullYear()}-W${semana.toString().padStart(2, '0')}`;
  }

  // Generar lista de semanas para el selector
  const generarSemanas = () => {
    const semanas = [];
    const fechaActual = new Date();
    const año = fechaActual.getFullYear();
    
    for (let i = 1; i <= 52; i++) {
      semanas.push(`${año}-W${i.toString().padStart(2, '0')}`);
    }
    return semanas;
  };

  // Generar lista de meses para el selector
  const generarMeses = () => {
    const meses = [];
    const fechaActual = new Date();
    const año = fechaActual.getFullYear();
    
    for (let i = 0; i < 12; i++) {
      const mes = (i + 1).toString().padStart(2, '0');
      meses.push(`${año}-${mes}`);
    }
    return meses;
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
      <div className="flex items-center mb-4">
        <CalendarRange className="text-blue-600 mr-2" size={20} />
        <h2 className="text-lg font-semibold">Filtros de Dashboard</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Selector de tipo de filtro temporal */}
        <div className="col-span-3 md:col-span-1">
          <label className="block mb-1 text-sm font-medium text-gray-700">Tipo de vista</label>
          <div className="flex space-x-2">
            <button 
              className={`px-3 py-2 text-sm flex-1 rounded-md ${filtroTemporal === 'dia' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
              onClick={() => setFiltroTemporal('dia')}>
              Diario
            </button>
            <button 
              className={`px-3 py-2 text-sm flex-1 rounded-md ${filtroTemporal === 'semana' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
              onClick={() => setFiltroTemporal('semana')}>
              Semanal
            </button>
            <button 
              className={`px-3 py-2 text-sm flex-1 rounded-md ${filtroTemporal === 'mes' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
              onClick={() => setFiltroTemporal('mes')}>
              Mensual
            </button>
            <button 
              className={`px-3 py-2 text-sm flex-1 rounded-md ${filtroTemporal === 'rango' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
              onClick={() => setFiltroTemporal('rango')}>
              Rango
            </button>
          </div>
        </div>
        
        {/* Filtros específicos según el tipo de filtro temporal */}
        <div className="col-span-3 md:col-span-2">
          {filtroTemporal === 'dia' && (
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">Fecha</label>
              <input 
                type="date" 
                className="w-full p-2 border border-gray-300 rounded-md"
                value={rangoFechas.fin} 
                onChange={(e) => setRangoFechas({...rangoFechas, fin: e.target.value})}
              />
            </div>
          )}
          
          {filtroTemporal === 'semana' && (
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">Semana</label>
              <select 
                className="w-full p-2 border border-gray-300 rounded-md"
                value={semanaSeleccionada}
                onChange={(e) => setSemanaSeleccionada(e.target.value)}
              >
                {generarSemanas().map(semana => (
                  <option key={semana} value={semana}>{semana}</option>
                ))}
              </select>
            </div>
          )}
          
          {filtroTemporal === 'mes' && (
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">Mes</label>
              <select 
                className="w-full p-2 border border-gray-300 rounded-md"
                value={mesSeleccionado}
                onChange={(e) => setMesSeleccionado(e.target.value)}
              >
                {generarMeses().map(mes => (
                  <option key={mes} value={mes}>{mes}</option>
                ))}
              </select>
            </div>
          )}
          
          {filtroTemporal === 'rango' && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Fecha Inicio</label>
                <input 
                  type="date" 
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={rangoFechas.inicio} 
                  onChange={(e) => setRangoFechas({...rangoFechas, inicio: e.target.value})}
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Fecha Fin</label>
                <input 
                  type="date" 
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={rangoFechas.fin} 
                  onChange={(e) => setRangoFechas({...rangoFechas, fin: e.target.value})}
                />
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Botón para mostrar/ocultar filtros avanzados */}
      <div className="mb-4">
        <button 
          className="flex items-center text-blue-600 text-sm font-medium"
          onClick={() => setMostrarAvanzados(!mostrarAvanzados)}
        >
          <Filter size={16} className="mr-1" />
          Filtros avanzados
          <ChevronDown size={16} className={`ml-1 transform transition-transform ${mostrarAvanzados ? 'rotate-180' : ''}`} />
        </button>
      </div>
      
      {/* Filtros avanzados */}
      {mostrarAvanzados && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2 pt-2 border-t border-gray-200">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Categoría de trabajador</label>
            <select 
              className="w-full p-2 border border-gray-300 rounded-md"
              value={categoriaSeleccionada}
              onChange={(e) => setCategoriaSeleccionada(e.target.value)}
            >
              <option value="TODAS">Todas las categorías</option>
              <option value="OPERARIO">OPERARIO</option>
              <option value="OFICIAL">OFICIAL</option>
              <option value="PEON">PEON</option>
            </select>
          </div>
          
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Ubicación / Bloque</label>
            <select 
              className="w-full p-2 border border-gray-300 rounded-md"
              value={ubicacionSeleccionada}
              onChange={(e) => setUbicacionSeleccionada(e.target.value)}
            >
              <option value="TODAS">Todas las ubicaciones</option>
              <option value="BLOQUE A">BLOQUE A</option>
              <option value="BLOQUE B">BLOQUE B</option>
              <option value="BLOQUE C">BLOQUE C</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium p-2 rounded-md transition">
              Aplicar filtros
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FiltroDashboard;