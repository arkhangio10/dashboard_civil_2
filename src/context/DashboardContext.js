// src/context/DashboardContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { obtenerSemanaActual, obtenerMesActual } from '../utils/dateUtils';
import { mockData } from '../utils/mockData';
import { useAuth } from './AuthContext';
import { 
  fetchKPIs, 
  fetchWorkers, 
  fetchActivities, 
  fetchReports,
  fetchDistributionByCategory,
  fetchTrends
} from '../firebase/db';

// Función auxiliar para normalizar fechas para Firebase
function normalizarFechaParaFirebase(fecha) {
  if (!fecha) return '';
  // Si ya está en formato YYYY-MM-DD, devolverlo tal cual
  if (/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return fecha;
  
  // Si está en formato DD/MM/YYYY, convertirlo
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(fecha)) {
    return fecha.split('/').reverse().join('-');
  }
  
  // Ante cualquier otro formato, intentar convertir
  try {
    const date = new Date(fecha);
    return date.toISOString().split('T')[0];
  } catch {
    return fecha;
  }
}

// Crear el contexto
export const DashboardContext = createContext();

// Proveedor del contexto
export const DashboardProvider = ({ children }) => {
  const { db, selectedProject } = useAuth();
  const [loading, setLoading] = useState(true);
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
  }, [filtros, selectedProject, db, useMockData]);
  
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
      
      // Verificar si tenemos una instancia de Firestore
      if (!db) {
        throw new Error("No hay conexión con Firebase. Verifique su configuración.");
      }
      
      console.log("Cargando datos desde Firebase para proyecto:", selectedProject);
      console.log("Filtros aplicados:", filtros);
      
      // Preparar filtros para las consultas
      const queryFilters = {
        dateRange: filtros.tipoFiltro === 'rango' 
          ? { 
              inicio: normalizarFechaParaFirebase(filtros.rango.inicio),
              fin: normalizarFechaParaFirebase(filtros.rango.fin)
            } 
          : filtros.tipoFiltro === 'dia' 
            ? { fin: normalizarFechaParaFirebase(filtros.rango.fin) } 
            : null,
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
          return mockData.kpis; // Fallback a datos de prueba
        }),
        
        // Datos de trabajadores
        fetchWorkers(db, queryFilters).catch(err => {
          console.error("Error al cargar trabajadores:", err);
          return mockData.trabajadores; // Fallback a datos de prueba
        }),
        
        // Actividades
        fetchActivities(db, queryFilters).catch(err => {
          console.error("Error al cargar actividades:", err);
          return mockData.actividades; // Fallback a datos de prueba
        }),
        
        // Reportes
        fetchReports(db, queryFilters, 10).catch(err => {
          console.error("Error al cargar reportes:", err);
          return mockData.reportes; // Fallback a datos de prueba
        }),
        
        // Distribución por categorías
        fetchDistributionByCategory(db, queryFilters).catch(err => {
          console.error("Error al cargar distribución por categorías:", err);
          return mockData.distribucion.categorias; // Fallback a datos de prueba
        }),
        
        // Tendencias
        fetchTrends(db, queryFilters).catch(err => {
          console.error("Error al cargar tendencias:", err);
          return mockData.tendencias; // Fallback a datos de prueba
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
          ...mockData.distribucion,
          categorias: distribucionData
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