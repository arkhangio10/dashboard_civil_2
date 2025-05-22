// Modificación del src/context/DashboardContext.js

import React, { createContext, useState, useEffect, useContext } from 'react';
import { 
  obtenerSemanaActual, 
  obtenerMesActual, 
  generarRangoFechas, 
  obtenerFechaRetrocedida, 
  obtenerFechaActual 
} from '../utils/dateUtils';
import { useAuth } from './AuthContext';
import { 
  fetchKPIs, 
  fetchWorkers, 
  fetchActivities, 
  fetchReports,
  fetchDistributionByCategory,
  fetchTrends
} from '../firebase/db';

// Crear el contexto
export const DashboardContext = createContext();

// Proveedor del contexto
export const DashboardProvider = ({ children }) => {
  const { db, selectedProject } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estado para filtros
  const [filtros, setFiltros] = useState({
    tipoFiltro: 'semana',
    semana: obtenerSemanaActual(),
    mes: obtenerMesActual(),
    rango: { 
      inicio: obtenerFechaRetrocedida(30),
      fin: obtenerFechaActual()
    },
    categoria: 'TODAS',
    ubicacion: 'TODAS'
  });
  
  // Datos iniciales (utilizando valores reales de Firebase)
  const [datos, setDatos] = useState({
    kpis: {
      costoTotal: 0,
      valorTotal: 0,
      ganancia: 0,
      totalHoras: 0,
      productividadPromedio: 0,
      totalActividades: 0,
      totalReportes: 0,
      totalTrabajadores: 0
    },
    actividades: [],
    trabajadores: [],
    tendencias: {
      costos: [],
      productividad: []
    },
    distribucion: {
      categorias: []
    },
    reportes: []
  });
  
  // Cargar datos cuando cambian los filtros o el proyecto seleccionado
  useEffect(() => {
    cargarDatos();
  }, [filtros, selectedProject, db]);
  
  // Función para cargar datos reales de Firebase
  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Verificar si tenemos una instancia de Firestore
      if (!db) {
        throw new Error("No hay conexión con Firebase. Verifique su configuración.");
      }
      
      console.log("Cargando datos desde Firebase para proyecto:", selectedProject);
      console.log("Filtros aplicados:", filtros);
      
      // Preparar filtros para las consultas usando la función mejorada
      // Genera un rango de fechas consistente para todas las consultas
      const rangoFechas = generarRangoFechas(filtros.tipoFiltro, filtros);
      
      const queryFilters = {
        dateRange: rangoFechas,
        tipoFiltro: filtros.tipoFiltro,
        category: filtros.categoria !== 'TODAS' ? filtros.categoria : null,
        location: filtros.ubicacion !== 'TODAS' ? filtros.ubicacion : null
      };
      
      console.log("Filtros normalizados para Firebase:", queryFilters);
      
      // Cargar datos de Firebase en paralelo para mejorar rendimiento
      const [kpisData, workersData, activitiesData, reportsData, distribucionData, tendenciasData] = await Promise.all([
        // KPIs generales
        fetchKPIs(db, queryFilters).catch(err => {
          console.error("Error al cargar KPIs:", err);
          return datos.kpis; // Mantener datos anteriores en caso de error
        }),
        
        // Datos de trabajadores
        fetchWorkers(db, queryFilters).catch(err => {
          console.error("Error al cargar trabajadores:", err);
          return datos.trabajadores; // Mantener datos anteriores en caso de error
        }),
        
        // Actividades
        fetchActivities(db, queryFilters).catch(err => {
          console.error("Error al cargar actividades:", err);
          return datos.actividades; // Mantener datos anteriores en caso de error
        }),
        
        // Reportes
        fetchReports(db, queryFilters, 10).catch(err => {
          console.error("Error al cargar reportes:", err);
          return datos.reportes; // Mantener datos anteriores en caso de error
        }),
        
        // Distribución por categorías
        fetchDistributionByCategory(db, queryFilters).catch(err => {
          console.error("Error al cargar distribución por categorías:", err);
          return datos.distribucion.categorias; // Mantener datos anteriores en caso de error
        }),
        
        // Tendencias
        fetchTrends(db, queryFilters).catch(err => {
          console.error("Error al cargar tendencias:", err);
          return datos.tendencias; // Mantener datos anteriores en caso de error
        })
      ]);
      
      console.log("Datos cargados exitosamente");
      
      // Actualizar el estado con los datos cargados
      setDatos({
        kpis: kpisData,
        actividades: activitiesData,
        trabajadores: workersData,
        reportes: reportsData,
        tendencias: tendenciasData,
        distribucion: {
          categorias: distribucionData
        }
      });
      
    } catch (err) {
      console.error("Error al cargar datos:", err);
      setError("Ocurrió un error al cargar los datos. Por favor, intenta de nuevo.");
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
    recargarDatos: cargarDatos
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