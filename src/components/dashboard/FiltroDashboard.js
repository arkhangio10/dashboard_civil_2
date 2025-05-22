// src/components/dashboard/FiltroDashboard.js
import React, { useState, useContext } from 'react';
import { CalendarRange, Filter, ChevronDown } from 'lucide-react';
import { 
  obtenerSemanaActual,
  obtenerMesActual,
  generarSemanas,
  generarMeses,
  formatearFechaParaMostrar,
  obtenerFechaActual,
  obtenerFechaRetrocedida
} from '../../utils/dateUtils';
import DashboardContext from '../../context/DashboardContext';

const FiltroDashboard = () => {
  const { filtros, setFiltros } = useContext(DashboardContext);
  const [mostrarAvanzados, setMostrarAvanzados] = useState(false);
  const [fechasModificadas, setFechasModificadas] = useState(false);

  // Manejadores de eventos
  const cambiarTipoFiltro = (tipo) => {
    // Al cambiar el tipo de filtro, restablecer fechas por defecto según el tipo
    let nuevosFiltros = { ...filtros, tipoFiltro: tipo };
    
    switch (tipo) {
      case 'dia':
        nuevosFiltros.rango = { 
          ...nuevosFiltros.rango, 
          fin: obtenerFechaActual() 
        };
        break;
      case 'semana':
        nuevosFiltros.semana = obtenerSemanaActual();
        break;
      case 'mes':
        nuevosFiltros.mes = obtenerMesActual();
        break;
      case 'rango':
        if (!fechasModificadas) {
          nuevosFiltros.rango = { 
            inicio: obtenerFechaRetrocedida(30), 
            fin: obtenerFechaActual() 
          };
        }
        break;
    }
    
    setFiltros(nuevosFiltros);
  };

  const cambiarFechaRango = (campo, valor) => {
    console.log(`Cambiando fecha ${campo} a: ${valor}`);
    
    setFechasModificadas(true);
    setFiltros(prev => ({
      ...prev,
      rango: { ...prev.rango, [campo]: valor }
    }));
  };

  const cambiarSemana = (semana) => {
    setFiltros(prev => ({ ...prev, semana }));
  };

  const cambiarMes = (mes) => {
    setFiltros(prev => ({ ...prev, mes }));
  };

  const cambiarCategoria = (categoria) => {
    setFiltros(prev => ({ ...prev, categoria }));
  };

  const cambiarUbicacion = (ubicacion) => {
    setFiltros(prev => ({ ...prev, ubicacion }));
  };

  const aplicarFiltros = () => {
    // Esta función ya actualiza el estado a través de los cambios anteriores
    console.log("Filtros aplicados:", filtros);
  };

  // Mostrar mensaje de ayuda sobre el rango de fechas actual
  const mostrarMensajeRangoActual = () => {
    switch (filtros.tipoFiltro) {
      case 'dia':
        return `Mostrando datos para el día ${formatearFechaParaMostrar(filtros.rango.fin)}`;
      case 'semana': {
        // Extraer año y número de semana
        const [año, numSemana] = filtros.semana.split('-W');
        return `Mostrando datos para la semana ${numSemana} del año ${año}`;
      }
      case 'mes': {
        // Extraer año y mes
        const [año, mes] = filtros.mes.split('-');
        const nombresMeses = [
          'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
          'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        return `Mostrando datos para ${nombresMeses[parseInt(mes) - 1]} de ${año}`;
      }
      case 'rango':
        return `Mostrando datos desde ${formatearFechaParaMostrar(filtros.rango.inicio)} hasta ${formatearFechaParaMostrar(filtros.rango.fin)}`;
      default:
        return '';
    }
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
              className={`px-3 py-2 text-sm flex-1 rounded-md ${filtros.tipoFiltro === 'dia' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
              onClick={() => cambiarTipoFiltro('dia')}>
              Diario
            </button>
            <button 
              className={`px-3 py-2 text-sm flex-1 rounded-md ${filtros.tipoFiltro === 'semana' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
              onClick={() => cambiarTipoFiltro('semana')}>
              Semanal
            </button>
            <button 
              className={`px-3 py-2 text-sm flex-1 rounded-md ${filtros.tipoFiltro === 'mes' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
              onClick={() => cambiarTipoFiltro('mes')}>
              Mensual
            </button>
            <button 
              className={`px-3 py-2 text-sm flex-1 rounded-md ${filtros.tipoFiltro === 'rango' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
              onClick={() => cambiarTipoFiltro('rango')}>
              Rango
            </button>
          </div>
        </div>
        
        {/* Filtros específicos según el tipo de filtro temporal */}
        <div className="col-span-3 md:col-span-2">
          {filtros.tipoFiltro === 'dia' && (
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">Fecha</label>
              <input 
                type="date" 
                className="w-full p-2 border border-gray-300 rounded-md"
                value={filtros.rango.fin} 
                onChange={(e) => cambiarFechaRango('fin', e.target.value)}
                max={obtenerFechaActual()} // Limitar a la fecha actual
              />
            </div>
          )}
          
          {filtros.tipoFiltro === 'semana' && (
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">Semana</label>
              <select 
                className="w-full p-2 border border-gray-300 rounded-md"
                value={filtros.semana}
                onChange={(e) => cambiarSemana(e.target.value)}
              >
                {generarSemanas().map(semana => (
                  <option key={semana} value={semana}>{semana}</option>
                ))}
              </select>
            </div>
          )}
          
          {filtros.tipoFiltro === 'mes' && (
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">Mes</label>
              <select 
                className="w-full p-2 border border-gray-300 rounded-md"
                value={filtros.mes}
                onChange={(e) => cambiarMes(e.target.value)}
              >
                {generarMeses().map(mes => (
                  <option key={mes} value={mes}>{mes}</option>
                ))}
              </select>
            </div>
          )}
          
          {filtros.tipoFiltro === 'rango' && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Fecha Inicio</label>
                <input 
                  type="date" 
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={filtros.rango.inicio} 
                  onChange={(e) => cambiarFechaRango('inicio', e.target.value)}
                  max={filtros.rango.fin} // No permitir fechas posteriores a la fecha fin
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Fecha Fin</label>
                <input 
                  type="date" 
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={filtros.rango.fin} 
                  onChange={(e) => cambiarFechaRango('fin', e.target.value)}
                  min={filtros.rango.inicio} // No permitir fechas anteriores a la fecha inicio
                  max={obtenerFechaActual()} // Limitar a la fecha actual
                />
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Mensaje informativo sobre el rango actual */}
      <div className="mb-4 text-sm text-blue-600 italic">
        {mostrarMensajeRangoActual()}
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
              value={filtros.categoria}
              onChange={(e) => cambiarCategoria(e.target.value)}
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
              value={filtros.ubicacion}
              onChange={(e) => cambiarUbicacion(e.target.value)}
            >
              <option value="TODAS">Todas las ubicaciones</option>
              <option value="BLOQUE A">BLOQUE A</option>
              <option value="BLOQUE B">BLOQUE B</option>
              <option value="BLOQUE C">BLOQUE C</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium p-2 rounded-md transition"
              onClick={aplicarFiltros}
            >
              Aplicar filtros
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FiltroDashboard;