// src/components/dashboard/DataModeToggle.js
import React from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { Database, FileText } from 'lucide-react';

const DataModeToggle = () => {
  const { useMockData, setUseMockData, recargarDatos } = useDashboard();

  const toggleDataMode = () => {
    setUseMockData(!useMockData);
    // Recargar datos al cambiar el modo
    setTimeout(() => {
      recargarDatos();
    }, 100);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
      <h2 className="text-sm font-semibold mb-3">Origen de Datos</h2>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <span className="mr-2 text-sm">Modo:</span>
          <span className={`flex items-center ${useMockData ? 'text-amber-600' : 'text-green-600'} font-medium`}>
            {useMockData ? (
              <>
                <FileText size={16} className="mr-1" />
                Datos de Prueba
              </>
            ) : (
              <>
                <Database size={16} className="mr-1" />
                Datos Reales (Firebase)
              </>
            )}
          </span>
        </div>
        
        <button
          onClick={toggleDataMode}
          className={`
            relative inline-flex flex-shrink-0 h-6 w-11 border-2 rounded-full 
            cursor-pointer transition-colors ease-in-out duration-200 
            ${useMockData ? 'bg-amber-500 border-amber-500' : 'bg-green-500 border-green-500'}
          `}
        >
          <span
            className={`
              pointer-events-none inline-block h-5 w-5 rounded-full bg-white 
              shadow transform transition ease-in-out duration-200
              ${useMockData ? 'translate-x-5' : 'translate-x-0'}
            `}
          />
        </button>
      </div>
      
      <p className="mt-2 text-xs text-gray-500">
        {useMockData
          ? 'Usando datos de prueba predefinidos. Cambiar a datos reales para ver información actualizada.'
          : 'Conectado a la base de datos Firebase. Los datos mostrados son información real.'
        }
      </p>
    </div>
  );
};

export default DataModeToggle;