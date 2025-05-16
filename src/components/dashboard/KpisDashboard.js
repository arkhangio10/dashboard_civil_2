// src/components/dashboard/KpisDashboard.js
import React, { useContext } from 'react';
import { DollarSign, Clock, TrendingUp, Zap, Users, FileText } from 'lucide-react';
import DashboardContext from '../../context/DashboardContext';
import { formatoMoneda, formatoNumero } from '../../utils/formatUtils';

const KpisDashboard = () => {
  const { datos } = useContext(DashboardContext);
  const {
    costoTotal,
    valorTotal,
    ganancia,
    totalHoras,
    productividadPromedio,
    totalActividades,
    totalReportes,
    totalTrabajadores
  } = datos.kpis;
  
  // Calcular porcentaje de ganancia
  const porcentajeGanancia = (ganancia / costoTotal * 100).toFixed(1);

  return (
    <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
      <h2 className="text-lg font-semibold mb-4">Indicadores Clave</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* KPI: Costo Total */}
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Costo MO</p>
              <p className="text-lg font-bold text-blue-800">{formatoMoneda(costoTotal)}</p>
            </div>
            <div className="bg-blue-100 p-2 rounded-full">
              <DollarSign size={20} className="text-blue-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Costo total de mano de obra</p>
        </div>
        
        {/* KPI: Valor Total */}
        <div className="bg-green-50 p-3 rounded-lg border border-green-100">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Valor generado</p>
              <p className="text-lg font-bold text-green-800">{formatoMoneda(valorTotal)}</p>
            </div>
            <div className="bg-green-100 p-2 rounded-full">
              <DollarSign size={20} className="text-green-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Valor total facturado</p>
        </div>
        
        {/* KPI: Ganancia/Pérdida */}
        <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Ganancia</p>
              <p className="text-lg font-bold text-purple-800">{formatoMoneda(ganancia)}</p>
            </div>
            <div className="bg-purple-100 p-2 rounded-full">
              <TrendingUp size={20} className="text-purple-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            <span className={ganancia >= 0 ? "text-green-600" : "text-red-600"}>
              {ganancia >= 0 ? "+" : "-"}{porcentajeGanancia}%
            </span> sobre costos
          </p>
        </div>
        
        {/* KPI: Productividad */}
        <div className="bg-amber-50 p-3 rounded-lg border border-amber-100">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Productividad</p>
              <p className="text-lg font-bold text-amber-800">{productividadPromedio.toFixed(2)}</p>
            </div>
            <div className="bg-amber-100 p-2 rounded-full">
              <Zap size={20} className="text-amber-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Metrado promedio por hora</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        {/* KPI: Total Horas */}
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Horas</p>
              <p className="text-base font-semibold">{formatoNumero(totalHoras)}</p>
            </div>
            <Clock size={16} className="text-gray-500" />
          </div>
        </div>
        
        {/* KPI: Total Actividades */}
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Actividades</p>
              <p className="text-base font-semibold">{formatoNumero(totalActividades)}</p>
            </div>
            <TrendingUp size={16} className="text-gray-500" />
          </div>
        </div>
        
        {/* KPI: Total Reportes */}
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Reportes</p>
              <p className="text-base font-semibold">{formatoNumero(totalReportes)}</p>
            </div>
            <FileText size={16} className="text-gray-500" />
          </div>
        </div>
        
        {/* KPI: Total Trabajadores */}
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Trabajadores</p>
              <p className="text-base font-semibold">{formatoNumero(totalTrabajadores)}</p>
            </div>
            <Users size={16} className="text-gray-500" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default KpisDashboard;