// src/firebase/db.js
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  getDoc,
  orderBy,
  limit,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';

// Función para obtener datos de trabajadores
export const fetchWorkers = async (db, filters = {}) => {
  try {
    const { category, location, dateRange } = filters;
    
    let workersQuery = collection(db, 'trabajadores');
    
    // Aplicar filtros si están presentes
    if (category && category !== 'TODAS') {
      workersQuery = query(workersQuery, where('categoria', '==', category));
    }
    
    if (location && location !== 'TODAS') {
      workersQuery = query(workersQuery, where('ubicacion', '==', location));
    }
    
    // Obtener los documentos
    const snapshot = await getDocs(workersQuery);
    
    // Convertir los documentos a un array de objetos
    const workers = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Filtrar por fecha si está presente
    if (dateRange && dateRange.inicio && dateRange.fin) {
      const startDate = new Date(dateRange.inicio).getTime();
      const endDate = new Date(dateRange.fin).getTime();
      
      return workers.filter(worker => {
        const workerDate = new Date(worker.fecha).getTime();
        return workerDate >= startDate && workerDate <= endDate;
      });
    }
    
    return workers;
  } catch (error) {
    console.error('Error fetching workers:', error);
    throw error;
  }
};

// Función para obtener datos de actividades
export const fetchActivities = async (db, filters = {}) => {
  try {
    const { location, dateRange } = filters;
    
    let activitiesQuery = collection(db, 'actividades');
    
    // Aplicar filtros si están presentes
    if (location && location !== 'TODAS') {
      activitiesQuery = query(activitiesQuery, where('ubicacion', '==', location));
    }
    
    // Ordenar por fecha
    activitiesQuery = query(activitiesQuery, orderBy('fecha', 'desc'));
    
    // Obtener los documentos
    const snapshot = await getDocs(activitiesQuery);
    
    // Convertir los documentos a un array de objetos
    const activities = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Filtrar por fecha si está presente
    if (dateRange && dateRange.inicio && dateRange.fin) {
      const startDate = new Date(dateRange.inicio).getTime();
      const endDate = new Date(dateRange.fin).getTime();
      
      return activities.filter(activity => {
        const activityDate = new Date(activity.fecha).getTime();
        return activityDate >= startDate && activityDate <= endDate;
      });
    }
    
    return activities;
  } catch (error) {
    console.error('Error fetching activities:', error);
    throw error;
  }
};

// Función para obtener indicadores KPI
export const fetchKPIs = async (db, filters = {}) => {
  try {
    const { dateRange, category, location } = filters;
    
    // Esta función podría calcular KPIs basados en datos de otras colecciones
    // o consultar directamente una colección de KPIs si existe
    
    // Ejemplo: calcular KPIs basados en actividades y trabajadores
    const activities = await fetchActivities(db, filters);
    const workers = await fetchWorkers(db, filters);
    
    // Calcular KPIs
    const costoTotal = workers.reduce((sum, worker) => sum + (worker.costo || 0), 0);
    const valorTotal = activities.reduce((sum, activity) => sum + (activity.valor || 0), 0);
    const ganancia = valorTotal - costoTotal;
    const totalHoras = workers.reduce((sum, worker) => sum + (worker.horas || 0), 0);
    const totalActividades = activities.length;
    const totalTrabajadores = new Set(workers.map(w => w.id)).size;
    
    // Calcular productividad promedio
    let productividadPromedio = 0;
    if (totalHoras > 0) {
      const totalMetrados = activities.reduce((sum, activity) => sum + (activity.metrado || 0), 0);
      productividadPromedio = totalMetrados / totalHoras;
    }
    
    return {
      costoTotal,
      valorTotal,
      ganancia,
      totalHoras,
      productividadPromedio,
      totalActividades,
      totalReportes: 0, // Esto podría venir de otra colección
      totalTrabajadores
    };
  } catch (error) {
    console.error('Error fetching KPIs:', error);
    throw error;
  }
};

// Función para generar un reporte
export const createReport = async (db, reportData) => {
  try {
    // Añadir timestamp
    const reportWithTimestamp = {
      ...reportData,
      createdAt: serverTimestamp(),
      fecha: Timestamp.fromDate(new Date())
    };
    
    const reportRef = await addDoc(collection(db, 'reportes'), reportWithTimestamp);
    return { id: reportRef.id, ...reportWithTimestamp };
  } catch (error) {
    console.error('Error creating report:', error);
    throw error;
  }
};

// Función para obtener datos de reportes
export const fetchReports = async (db, limit = 10) => {
  try {
    const reportsQuery = query(
      collection(db, 'reportes'),
      orderBy('createdAt', 'desc'),
      limit(limit)
    );
    
    const snapshot = await getDocs(reportsQuery);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching reports:', error);
    throw error;
  }
};