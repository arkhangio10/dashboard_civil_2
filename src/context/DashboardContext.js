import React, { createContext, useState, useEffect } from 'react';
import { obtenerSemanaActual, obtenerMesActual } from '../utils/dateUtils';
import { mockData } from '../utils/mockData';

// Crear el contexto
export const DashboardContext = createContext();

// Proveedor del contexto
export const DashboardProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Estado para filtros
  const [filtros, setFiltros] = useState({
    tipoFiltro: 'semana',
    semana: obtenerSemanaActual(),
    mes: obtenerMesActual(),
    rango: { 
      inicio: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
      fin: new Date().toISOString().split('T')[0]
    },
    categoria: 'TODAS',
    ubicacion: 'TODAS'
  });
  
  // Datos iniciales (usando los datos simulados)
  const [datos, setDatos] = useState({
    kpis: mockData.kpis,
    actividades: mockData.actividades,
    trabajadores: mockData.trabajadores,
    tendencias: mockData.tendencias,
    distribucion: mockData.distribucion,
    reportes: mockData.reportes
  });
  
  // Función para "cargar" datos (simulada)
  const cargarDatos = () => {
    setLoading(true);
    
    // Simulamos un retraso para mostrar el estado de carga
    setTimeout(() => {
      setDatos({
        kpis: mockData.kpis,
        actividades: mockData.actividades,
        trabajadores: mockData.trabajadores,
        tendencias: mockData.tendencias,
        distribucion: mockData.distribucion,
        reportes: mockData.reportes
      });
      setLoading(false);
    }, 500);
  };
  
  // Cargar datos cuando cambian los filtros
  useEffect(() => {
    cargarDatos();
  }, [filtros]);
  
  // Valor a compartir en el contexto
  const value = {
    loading,
    error,
    filtros,
    setFiltros,
    datos,
    recargarDatos: cargarDatos
  };
  
  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};

export default DashboardContext;