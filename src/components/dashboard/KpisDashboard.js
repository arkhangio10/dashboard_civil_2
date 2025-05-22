import React, { useContext } from 'react';
import DashboardContext from '../../context/DashboardContext';
import { formatoMoneda, formatoNumero } from '../../utils/formatUtils';

const KpisDashboard = () => {
  const { datos, loading } = useContext(DashboardContext);
  
  // Si se están cargando los datos, mostrar un indicador de carga
  if (loading) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
      <h2 className="text-lg font-semibold mb-4">Indicadores Clave</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* KPI: Costo Total */}
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
          <div>
            <p className="text-sm text-gray-600 font-medium">Costo MO</p>
            <p className="text-lg font-bold text-blue-800">{formatoMoneda(datos.kpis.costoTotal)}</p>
          </div>
          <p className="text-xs text-gray-500 mt-2">Costo total de mano de obra</p>
        </div>
        
        {/* KPI: Valor Total */}
        <div className="bg-green-50 p-3 rounded-lg border border-green-100">
          <div>
            <p className="text-sm text-gray-600 font-medium">Costo de expedientes</p>
            <p className="text-lg font-bold text-green-800">{formatoMoneda(datos.kpis.valorTotal)}</p>
          </div>
          <p className="text-xs text-gray-500 mt-2">Valor total facturado</p>
        </div>
        
        {/* KPI: Ganancia/Pérdida */}
        <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
          <div>
            <p className="text-sm text-gray-600 font-medium">Ganancia</p>
            <p className="text-lg font-bold text-purple-800">{formatoMoneda(datos.kpis.ganancia)}</p>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            <span className="text-green-600">
              +{(datos.kpis.ganancia / datos.kpis.costoTotal * 100).toFixed(1)}%
            </span> sobre costos
          </p>
        </div>
        
        {/* KPI: Productividad */}
        <div className="bg-amber-50 p-3 rounded-lg border border-amber-100">
          <div>
            <p className="text-sm text-gray-600 font-medium">Productividad</p>
            <p className="text-lg font-bold text-amber-800">{datos.kpis.productividadPromedio.toFixed(2)}</p>
          </div>
          <p className="text-xs text-gray-500 mt-2">Metrado promedio por hora</p>
        </div>
      </div>

      {/* Segunda fila de KPIs */}
      <div className="grid grid-cols-3 gap-4 mt-4">
        {/* KPI: Total Actividades */}
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
          <div>
            <p className="text-sm text-gray-600 font-medium">Actividades</p>
            <p className="text-lg font-bold text-gray-800">{formatoNumero(datos.kpis.totalActividades)}</p>
          </div>
          <p className="text-xs text-gray-500 mt-2">Total de actividades registradas</p>
        </div>
        
        {/* KPI: Total Reportes */}
        <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100">
          <div>
            <p className="text-sm text-gray-600 font-medium">Reportes</p>
            <p className="text-lg font-bold text-indigo-800">{formatoNumero(datos.kpis.totalReportes)}</p>
          </div>
          <p className="text-xs text-gray-500 mt-2">Total de reportes procesados</p>
        </div>
        
        {/* KPI: Total Trabajadores */}
        <div className="bg-pink-50 p-3 rounded-lg border border-pink-100">
          <div>
            <p className="text-sm text-gray-600 font-medium">Trabajadores</p>
            <p className="text-lg font-bold text-pink-800">{formatoNumero(datos.kpis.totalTrabajadores)}</p>
          </div>
          <p className="text-xs text-gray-500 mt-2">Personal activo en el período</p>
        </div>
      </div>
    </div>
  );
};

export default KpisDashboard;