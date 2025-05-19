// src/context/DashboardContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { obtenerSemanaActual, obtenerMesActual } from '../utils/dateUtils';
import { mockData } from '../utils/mockData';
import { useAuth } from './AuthContext';
import { fetchKPIs, fetchWorkers, fetchActivities, fetchReports } from '../firebase/db';

// Crear el contexto
export const DashboardContext = createContext();

// Proveedor del contexto
export const DashboardProvider = ({ children }) => {
  const { db, selectedProject } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [useMockData, setUseMockData] = useState(false); // Para desarrollo y pruebas
  
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
  
  // Datos iniciales (usando los datos simulados como fallback)
  const [datos, setDatos] = useState({
    kpis: mockData.kpis,
    actividades: mockData.actividades,
    trabajadores: mockData.trabajadores,
    tendencias: mockData.tendencias,
    distribucion: mockData.distribucion,
    reportes: mockData.reportes
  });
  
  // Cargar datos cuando cambian los filtros o el proyecto seleccionado
  useEffect(() => {
    cargarDatos();
  }, [filtros, selectedProject, db]);
  
  // Función para cargar datos reales de Firebase
  const cargarDatos = async () => {
    if (useMockData) {
      // Si estamos usando datos de prueba, simular un retraso
      setLoading(true);
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
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Preparar filtros para las consultas
      const queryFilters = {
        dateRange: filtros.tipoFiltro === 'rango' ? filtros.rango : null,
        category: filtros.categoria,
        location: filtros.ubicacion
      };
      
      // Cargar datos de Firebase en paralelo
      const [kpisData, workersData, activitiesData, reportsData] = await Promise.all([
        fetchKPIs(db, queryFilters),
        fetchWorkers(db, queryFilters),
        fetchActivities(db, queryFilters),
        fetchReports(db, 10) // Obtener los últimos 10 reportes
      ]);
      
      // Procesar datos para tendencias y distribución
      // Nota: Estos cálculos deben adaptarse a la estructura real de tus datos
      
      // Procesar distribución por categorías
      const distribucionCategorias = Object.entries(
        workersData.reduce((acc, worker) => {
          const categoria = worker.categoria || 'SIN CATEGORÍA';
          if (!acc[categoria]) {
            acc[categoria] = { 
              nombre: categoria, 
              cantidad: 0, 
              horas: 0, 
              costo: 0, 
              valor: 0, 
              porcentaje: 0 
            };
          }
          acc[categoria].cantidad += 1;
          acc[categoria].horas += worker.horas || 0;
          acc[categoria].costo += worker.costo || 0;
          return acc;
        }, {})
      ).map(([_, value]) => value);
      
      // Calcular porcentajes
      const totalCosto = distribucionCategorias.reduce((sum, cat) => sum + cat.costo, 0);
      distribucionCategorias.forEach(cat => {
        cat.porcentaje = totalCosto > 0 ? Math.round((cat.costo / totalCosto) * 100) : 0;
      });
      
      // Actualizar el estado con los datos cargados
      setDatos({
        kpis: kpisData,
        actividades: activitiesData,
        trabajadores: workersData,
        reportes: reportsData,
        // Mantener algunos datos de prueba para gráficos que aún no están implementados
        tendencias: mockData.tendencias,
        distribucion: {
          ...mockData.distribucion,
          categorias: distribucionCategorias.length > 0 ? distribucionCategorias : mockData.distribucion.categorias
        }
      });
      
    } catch (err) {
      console.error("Error al cargar datos:", err);
      setError("Ocurrió un error al cargar los datos. Por favor, intenta de nuevo.");
      
      // Usar datos de prueba como fallback
      setDatos({
        kpis: mockData.kpis,
        actividades: mockData.actividades,
        trabajadores: mockData.trabajadores,
        tendencias: mockData.tendencias,
        distribucion: mockData.distribucion,
        reportes: mockData.reportes
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Valor a compartir en el contexto
  const value = {
    loading,
    error,
    filtros,
    setFiltros,
    datos,
    recargarDatos: cargarDatos,
    useMockData,
    setUseMockData
  };
  
  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useDashboard = () => {
  return useContext(DashboardContext);
};

export default DashboardContext;