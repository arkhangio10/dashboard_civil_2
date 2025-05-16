import React, { createContext, useState, useEffect, useCallback } from 'react';
import { db } from '../firebase';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { obtenerSemanaActual, obtenerMesActual } from '../utils/dateUtils';

export const DashboardContext = createContext();

export const DashboardProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estado de filtros
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
  
  // Estado de datos
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
    resumenes: [],
    actividades: [],
    trabajadores: [],
    reportes: []
  });
  
  // Función para cargar datos según filtros
  const cargarDatos = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Determinar parámetros de consulta según tipo de filtro
      let consultaResumenes;
      
      switch(filtros.tipoFiltro) {
        case 'dia':
          consultaResumenes = query(
            collection(db, "Dashboard_Resumenes"),
            where("periodo", "==", "diario"),
            where("fecha", "==", filtros.rango.fin),
            limit(1)
          );
          break;
        case 'semana':
          // Extraer año y número de semana
          const [año, semana] = filtros.semana.split('-W');
          consultaResumenes = query(
            collection(db, "Dashboard_Resumenes"),
            where("periodo", "==", "semanal"),
            where("fecha", ">=", `${año}-01-01`),
            where("fecha", "<=", `${año}-12-31`),
            where("semana", "==", parseInt(semana)),
            limit(1)
          );
          break;
        case 'mes':
          consultaResumenes = query(
            collection(db, "Dashboard_Resumenes"),
            where("periodo", "==", "mensual"),
            where("fecha", ">=", `${filtros.mes}-01`),
            where("fecha", "<=", `${filtros.mes}-31`),
            limit(1)
          );
          break;
        case 'rango':
          consultaResumenes = query(
            collection(db, "Dashboard_Resumenes"),
            where("periodo", "==", "diario"),
            where("fecha", ">=", filtros.rango.inicio),
            where("fecha", "<=", filtros.rango.fin),
            orderBy("fecha", "asc"),
            limit(31) // Máximo un mes
          );
          break;
        default:
          throw new Error("Tipo de filtro no válido");
      }
      
      // Ejecutar consulta principal
      const snapshotResumenes = await getDocs(consultaResumenes);
      const resumenes = snapshotResumenes.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Calcular KPIs totales si hay múltiples documentos
      let kpis = { ...datos.kpis };
      
      if (resumenes.length === 1) {
        // Para filtros de un solo período
        const resumen = resumenes[0];
        kpis = {
          costoTotal: resumen.metricas?.costoTotal || 0,
          valorTotal: resumen.metricas?.valorTotal || 0,
          ganancia: (resumen.metricas?.valorTotal || 0) - (resumen.metricas?.costoTotal || 0),
          totalHoras: resumen.metricas?.totalHoras || 0,
          productividadPromedio: resumen.metricas?.productividadPromedio || 0,
          totalActividades: resumen.metricas?.reportesProcesados || 0,
          totalReportes: resumen.metricas?.reportesProcesados || 0,
          totalTrabajadores: Object.values(resumen.porCategoria || {})
            .reduce((sum, cat) => sum + (cat.cantidad || 0), 0)
        };
      } else if (resumenes.length > 1) {
        // Para rango de fechas, acumular valores
        kpis = resumenes.reduce((acc, resumen) => {
          return {
            costoTotal: acc.costoTotal + (resumen.metricas?.costoTotal || 0),
            valorTotal: acc.valorTotal + (resumen.metricas?.valorTotal || 0),
            ganancia: acc.ganancia + ((resumen.metricas?.valorTotal || 0) - (resumen.metricas?.costoTotal || 0)),
            totalHoras: acc.totalHoras + (resumen.metricas?.totalHoras || 0),
            productividadPromedio: acc.productividadPromedio,  // Se calculará después
            totalActividades: acc.totalActividades + (resumen.metricas?.reportesProcesados || 0),
            totalReportes: acc.totalReportes + (resumen.metricas?.reportesProcesados || 0),
            totalTrabajadores: acc.totalTrabajadores  // Se calculará aparte
          };
        }, { ...kpis, ganancia: 0 });
        
        // Calcular productividad promedio ponderada
        kpis.productividadPromedio = resumenes.reduce((sumProd, resumen, _, array) => {
          const peso = (resumen.metricas?.totalHoras || 0) / 
                       array.reduce((sum, r) => sum + (r.metricas?.totalHoras || 0), 0);
          return sumProd + peso * (resumen.metricas?.productividadPromedio || 0);
        }, 0);
      }
      
      // Consultar datos adicionales según filtros
      const consultaActividades = await cargarActividadesRelevantes(filtros);
      const consultaTrabajadores = await cargarTrabajadoresRelevantes(filtros);
      const consultaReportes = await cargarReportesRelevantes(filtros);
      
      // Actualizar estado
      setDatos({
        kpis,
        resumenes,
        actividades: consultaActividades,
        trabajadores: consultaTrabajadores,
        reportes: consultaReportes
      });
      
      setLoading(false);
    } catch (error) {
      console.error("Error al cargar datos:", error);
      setError(error.message);
      setLoading(false);
    }
  }, [filtros]);
  
  // Funciones auxiliares para cargar datos específicos
  const cargarActividadesRelevantes = async (filtros) => {
    // Implementar consulta según filtros
    return [];
  };
  
  const cargarTrabajadoresRelevantes = async (filtros) => {
    // Implementar consulta según filtros
    return [];
  };
  
  const cargarReportesRelevantes = async (filtros) => {
    // Implementar consulta según filtros
    return [];
  };
  
  // Cargar datos cuando cambien los filtros
  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);
  
  // Valor del contexto
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