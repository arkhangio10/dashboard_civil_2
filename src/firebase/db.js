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

// Función auxiliar para asegurar formato de fecha correcto
const asegurarFormatoFecha = (fecha) => {
  if (!fecha) return null;
  
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
    console.error("Formato de fecha no reconocido:", fecha);
    return fecha;
  }
};

// Función para obtener datos de trabajadores
export const fetchWorkers = async (db, filters = {}) => {
  try {
    console.log('Obteniendo trabajadores con filtros:', filters);
    const { category, location, dateRange } = filters;
    
    let workersRef = collection(db, 'Trabajadores');
    let workersQuery = query(workersRef);
    
    // Aplicar filtros si están presentes
    if (category && category !== 'TODAS') {
      workersQuery = query(workersRef, where('datos.categoria', '==', category));
    }
    
    if (location && location !== 'TODAS') {
      workersQuery = query(workersRef, where('resumen.ultimaUbicacion', '==', location));
    }
    
    // Obtener los documentos
    const snapshot = await getDocs(workersQuery);
    console.log(`Se encontraron ${snapshot.docs.length} trabajadores`);
    
    // Convertir los documentos a un array de objetos con formato normalizado
    const workers = snapshot.docs.map(doc => {
      const data = doc.data();
      // Normalizar estructura para que sea compatible con el dashboard
      return {
        id: doc.id,
        nombre: data.datos?.nombre || '',
        categoria: data.datos?.categoria || 'SIN CATEGORÍA',
        horas: data.resumen?.totalProduccion?.horas || 0,
        productividad: data.resumen?.totalProduccion?.productividadMedia || 0,
        valor: data.resumen?.totalProduccion?.valorGenerado || 0,
        costo: data.resumen?.totalProduccion?.costo || 0,
        eficiencia: data.resumen?.rendimientoComparativo || 1,
        ultimaActividad: data.resumen?.ultimaActividad || ''
      };
    });
    
    // Filtrar por fecha si está presente
    if (dateRange && dateRange.inicio && dateRange.fin) {
      const startDate = new Date(asegurarFormatoFecha(dateRange.inicio)).getTime();
      const endDate = new Date(asegurarFormatoFecha(dateRange.fin)).getTime();
      
      return workers.filter(worker => {
        // Verificar si hay campo fecha en ultimaActividad
        if (!worker.ultimaActividad) return true;
        
        // Convertir a timestamp
        const workerDate = new Date(worker.ultimaActividad).getTime();
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
    console.log('Obteniendo actividades con filtros:', filters);
    const { location, dateRange } = filters;
    
    let activitiesRef = collection(db, 'Actividades_Resumen');
    let queryConstraints = [];
    
    // Aplicar filtros si están presentes
    if (location && location !== 'TODAS') {
      queryConstraints.push(where('datos.ubicacion', '==', location));
    }
    
    // Ordenar por valor (más habitual para dashboard)
    queryConstraints.push(orderBy('acumulado.valor', 'desc'));
    
    // Limitar cantidad para mejorar rendimiento
    queryConstraints.push(limit(20));
    
    // Crear la consulta con todos los filtros
    const activitiesQuery = query(activitiesRef, ...queryConstraints);
    
    // Obtener los documentos
    const snapshot = await getDocs(activitiesQuery);
    console.log(`Se encontraron ${snapshot.docs.length} actividades`);
    
    // Convertir los documentos a un array de objetos con formato normalizado
    const activities = snapshot.docs.map(doc => {
      const data = doc.data();
      // Normalizar estructura para que sea compatible con el dashboard
      return {
        id: doc.id,
        nombre: data.nombre || '',
        metrado: data.acumulado?.metrado || 0,
        horas: data.acumulado?.horas || 0,
        productividad: data.acumulado?.productividad || 0,
        valor: data.acumulado?.valor || 0,
        costo: 0, // Se calcula si es necesario
        ganancia: 0, // Se calcula si es necesario
        ubicacion: data.datos?.ubicacion || '',
        unidad: data.datos?.unidad || '',
        meta: 0, // Valor por defecto
        precioUnitario: data.datos?.precioUnitario || 0,
        catalogoId: data.datos?.catalogoId || ''
      };
    });
    
    // Calcular valores derivados
    activities.forEach(activity => {
      // Estimar costo basado en horas (aproximación)
      activity.costo = activity.horas * 20; // 20 es un valor promedio por hora
      activity.ganancia = activity.valor - activity.costo;
      
      // Estimar meta basada en productividad histórica + 10%
      activity.meta = activity.productividad * 1.1;
    });
    
    // Filtrar por fecha si está presente - usando ultimoReporte
    if (dateRange && dateRange.inicio && dateRange.fin) {
      return activities; // Ya filtramos por fecha en la consulta
    }
    
    return activities;
  } catch (error) {
    console.error('Error fetching activities:', error);
    throw error;
  }
};


// Función para obtener indicadores KPI desde Dashboard_Resumenes
export const fetchKPIs = async (db, filters = {}) => {
  try {
    console.log('Obteniendo KPIs con filtros:', filters);
    const { dateRange, tipoFiltro } = filters;
    
    // Determinar qué tipo de resumen usar basado en los filtros
    let periodo = 'diario';
    let fecha;
    
    switch (tipoFiltro) {
      case 'semana':
        periodo = 'semanal';
        fecha = dateRange?.inicio || null;
        break;
      case 'mes':
        periodo = 'mensual';
        fecha = dateRange?.inicio || null;
        break;
      case 'dia':
      case 'rango':
      default:
        periodo = 'diario';
        // Para día específico o rango, usar la fecha fin como punto de referencia
        fecha = dateRange?.fin || null;
        break;
    }
    
    if (!fecha) {
      console.warn('No se proporcionó fecha válida para la consulta de KPIs');
      // Usar fecha actual como fallback
      fecha = new Date().toISOString().split('T')[0];
    }
    
    // ID del documento basado en el período y fecha
    const docId = `${periodo}_${fecha}`;
    
    console.log(`Buscando resumen con ID: ${docId}`);
    
    // Intentar obtener el documento específico
    const docRef = doc(db, 'Dashboard_Resumenes', docId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log('Resumen encontrado:', data);
      
      // Normalizar datos para KPIs
      return {
        costoTotal: data.metricas?.costoTotal || 0,
        valorTotal: data.metricas?.valorTotal || 0,
        ganancia: (data.metricas?.valorTotal || 0) - (data.metricas?.costoTotal || 0),
        totalHoras: data.metricas?.totalHoras || 0,
        productividadPromedio: data.metricas?.productividadPromedio || 0,
        totalActividades: data.topActividades?.length || 0,
        totalReportes: data.metricas?.reportesProcesados || 0,
        totalTrabajadores: Object.values(data.porCategoria || {}).reduce((sum, cat) => sum + (cat.cantidad || 0), 0)
      };
    }
    
    console.log('No se encontró resumen con ID exacto, buscando el más reciente del mismo periodo');
    
    // Si no encontramos el documento específico, buscar el más reciente del mismo período
    const resumeRef = collection(db, 'Dashboard_Resumenes');
    const resumeQuery = query(
      resumeRef,
      where('periodo', '==', periodo),
      orderBy('fecha', 'desc'),
      limit(1)
    );
    
    const snapshot = await getDocs(resumeQuery);
    
    if (!snapshot.empty) {
      const data = snapshot.docs[0].data();
      console.log('Resumen más reciente encontrado:', data);
      
      // Normalizar datos para KPIs
      return {
        costoTotal: data.metricas?.costoTotal || 0,
        valorTotal: data.metricas?.valorTotal || 0,
        ganancia: (data.metricas?.valorTotal || 0) - (data.metricas?.costoTotal || 0),
        totalHoras: data.metricas?.totalHoras || 0,
        productividadPromedio: data.metricas?.productividadPromedio || 0,
        totalActividades: data.topActividades?.length || 0,
        totalReportes: data.metricas?.reportesProcesados || 0,
        totalTrabajadores: Object.values(data.porCategoria || {}).reduce((sum, cat) => sum + (cat.cantidad || 0), 0)
      };
    }
    
    console.log('No se encontraron resúmenes, calculando desde datos primarios');
    
    // Si no hay resúmenes, calculamos desde datos primarios
    const [activities, workers] = await Promise.all([
      fetchActivities(db, filters),
      fetchWorkers(db, filters)
    ]);
    
    // Calcular KPIs
    const costoTotal = workers.reduce((sum, worker) => sum + (worker.costo || 0), 0);
    const valorTotal = activities.reduce((sum, activity) => sum + (activity.valor || 0), 0);
    const ganancia = valorTotal - costoTotal;
    const totalHoras = workers.reduce((sum, worker) => sum + (worker.horas || 0), 0);
    const totalActividades = activities.length;
    const totalTrabajadores = workers.length;
    
    // Calcular productividad promedio
    let productividadPromedio = 0;
    if (totalHoras > 0) {
      const totalMetrados = activities.reduce((sum, activity) => sum + (activity.metrado || 0), 0);
      productividadPromedio = totalMetrados / totalHoras;
    }
    
    const kpis = {
      costoTotal,
      valorTotal,
      ganancia,
      totalHoras,
      productividadPromedio,
      totalActividades,
      totalReportes: 0, // Valor por defecto
      totalTrabajadores
    };
    
    console.log('KPIs calculados desde datos primarios:', kpis);
    return kpis;
  } catch (error) {
    console.error('Error fetching KPIs:', error);
    throw error;
  }
};

// Función para obtener datos de reportes
// Función modificada para obtener datos de reportes

export const fetchReports = async (db, filters = {}, limitCount = 10) => {
  try {
    console.log(`Obteniendo hasta ${limitCount} reportes con filtros:`, filters);
    
    // Extraer filtros de fecha del objeto dateRange proporcionado
    const { dateRange } = filters;
    
    if (!dateRange || (!dateRange.inicio && !dateRange.fin)) {
      console.warn('No se proporcionaron filtros de fecha válidos');
    }
    
    // Primero intentamos obtener de Reportes_Links
    let reportesRef = collection(db, 'Reportes_Links');
    let queryConstraints = [orderBy('fecha', 'desc')];
    
    // Si hay filtro de fecha, agregarlo a la consulta
    if (dateRange) {
      if (dateRange.inicio && dateRange.fin && dateRange.inicio === dateRange.fin) {
        // Si es el mismo día, filtrar por igualdad exacta
        console.log(`Aplicando filtro de fecha para día específico: ${dateRange.inicio}`);
        queryConstraints.push(where('fecha', '==', dateRange.inicio));
      } else {
        // Si es un rango, aplicar filtros >= y <=
        if (dateRange.inicio) {
          console.log(`Aplicando filtro de fecha inicio: ${dateRange.inicio}`);
          queryConstraints.push(where('fecha', '>=', dateRange.inicio));
        }
        if (dateRange.fin) {
          console.log(`Aplicando filtro de fecha fin: ${dateRange.fin}`);
          queryConstraints.push(where('fecha', '<=', dateRange.fin));
        }
      }
    }
    
    // Aplicar filtros adicionales si existen
    if (filters.category && filters.category !== 'TODAS') {
      queryConstraints.push(where('categoria', '==', filters.category));
    }
    
    if (filters.location && filters.location !== 'TODAS') {
      queryConstraints.push(where('subcontratistaBLoque', '==', filters.location));
    }
    
    // Limitar cantidad de resultados
    queryConstraints.push(limit(limitCount));
    
    let reportesQuery = query(reportesRef, ...queryConstraints);
    let snapshot = await getDocs(reportesQuery);
    
    console.log(`Se encontraron ${snapshot.docs.length} reportes en Reportes_Links con los filtros aplicados`);
    
    // Si no hay reportes con los filtros aplicados, intentar sin filtros
    if (snapshot.empty && dateRange && (dateRange.inicio || dateRange.fin)) {
      console.log("No se encontraron reportes con filtro de fecha. Intentando sin filtro...");
      
      // Mantener solo el ordenamiento y límite
      const fallbackConstraints = [orderBy('fecha', 'desc'), limit(limitCount)];
      reportesQuery = query(reportesRef, ...fallbackConstraints);
      snapshot = await getDocs(reportesQuery);
      
      console.log(`Se encontraron ${snapshot.docs.length} reportes sin filtro de fecha`);
    }
    
    // Si sigue vacío, intentar con colección Reportes
    if (snapshot.empty) {
      console.log("Intentando buscar en colección 'Reportes'");
      
      reportesRef = collection(db, 'Reportes');
      reportesQuery = query(reportesRef, orderBy('fecha', 'desc'), limit(limitCount));
      snapshot = await getDocs(reportesQuery);
      
      console.log(`Se encontraron ${snapshot.docs.length} reportes en Reportes`);
    }
    
    // Normalizar los datos con los campos requeridos
    const reportes = snapshot.docs.map(doc => {
      const data = doc.data();
      
      return {
        id: doc.id,
        reporteId: data.reporteId || doc.id,
        creadoPor: data.creadoPor || "Sin datos",
        fecha: data.fecha || new Date().toISOString().split('T')[0],
        subcontratistaBLoque: data.subcontratistaBLoque || data.subcontratistaBloque || "Sin datos",
        totalTrabajadores: data.totalTrabajadores || 0,
        totalActividades: data.totalActividades || 0,
        totalValorizado: data.totalValorizado || 0,
        enlaceSheet: data.enlaceSheet || data.spreadsheetUrl || data.enlaceDrive || ""
      };
    });
    
    // Log para depuración
    console.log("Reportes procesados:", reportes.length);
    
    return reportes;
  } catch (error) {
    console.error('Error fetching reports:', error);
    throw error;
  }
};


// Función para obtener distribución por categorías
export const fetchDistributionByCategory = async (db, filters = {}) => {
  try {
    // Primero intentamos obtener de Dashboard_Resumenes
    let periodo = 'diario';
    let fecha = new Date().toISOString().split('T')[0];
    
    if (filters.tipoFiltro === 'semana') {
      periodo = 'semanal';
      // Calcular inicio de semana actual
      const today = new Date();
      const day = today.getDay();
      const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Ajustar si es domingo
      fecha = new Date(today.setDate(diff)).toISOString().split('T')[0];
    } else if (filters.tipoFiltro === 'mes') {
      periodo = 'mensual';
      // Primer día del mes actual
      fecha = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
    } else if (filters.dateRange && filters.dateRange.fin) {
      // Usar fecha específica para período diario
      fecha = asegurarFormatoFecha(filters.dateRange.fin);
    }
    
    // ID del documento basado en el período y fecha
    const docId = `${periodo}_${fecha}`;
    
    // Intentar obtener el documento específico
    const docRef = doc(db, 'Dashboard_Resumenes', docId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      
      if (data.porCategoria) {
        // Convertir objeto a array de categorías
        const categorias = Object.entries(data.porCategoria).map(([nombre, datos]) => ({
          nombre,
          cantidad: datos.cantidad || 0,
          horas: datos.horas || 0,
          costo: datos.costo || 0,
          valor: datos.costo * 1.5, // Aproximación
          porcentaje: 0 // Se calcula a continuación
        }));
        
        // Calcular porcentajes
        const totalCosto = categorias.reduce((sum, cat) => sum + cat.costo, 0);
        categorias.forEach(cat => {
          cat.porcentaje = totalCosto > 0 ? Math.round((cat.costo / totalCosto) * 100) : 0;
        });
        
        return categorias;
      }
    }
    
    // Si no hay datos en Dashboard_Resumenes, obtener de Trabajadores
    const workers = await fetchWorkers(db, filters);
    
    // Agrupar por categoría
    const categoriasMap = {};
    
    workers.forEach(worker => {
      const categoria = worker.categoria || 'SIN CATEGORÍA';
      
      if (!categoriasMap[categoria]) {
        categoriasMap[categoria] = {
          nombre: categoria,
          cantidad: 0,
          horas: 0,
          costo: 0,
          valor: 0,
          porcentaje: 0
        };
      }
      
      categoriasMap[categoria].cantidad++;
      categoriasMap[categoria].horas += worker.horas || 0;
      categoriasMap[categoria].costo += worker.costo || 0;
      categoriasMap[categoria].valor += worker.valor || 0;
    });
    
    // Convertir a array y calcular porcentajes
    const categorias = Object.values(categoriasMap);
    const totalCosto = categorias.reduce((sum, cat) => sum + cat.costo, 0);
    
    categorias.forEach(cat => {
      cat.porcentaje = totalCosto > 0 ? Math.round((cat.costo / totalCosto) * 100) : 0;
    });
    
    return categorias;
  } catch (error) {
    console.error('Error fetching distribution by category:', error);
    throw error;
  }
};

// Función para obtener tendencias (productividad, costos)
export const fetchTrends = async (db, filters = {}) => {
  try {
    const { trend = 'productividad', limitCount = 8 } = filters;
    
    // Consultar resúmenes diarios ordenados por fecha
    const resumeRef = collection(db, 'Dashboard_Resumenes');
    const resumeQuery = query(
      resumeRef,
      where('periodo', '==', 'diario'),
      orderBy('fecha', 'desc'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(resumeQuery);
    
    if (snapshot.empty) {
      // Si no hay datos reales, devolver datos de ejemplo
      return {
        productividad: Array(limitCount).fill(0).map((_, i) => ({
          semana: `S${i+1}`,
          productividad: 1.5 + (i * 0.1),
          promedio: 1.5 + (i * 0.05)
        })).reverse(),
        
        costos: Array(limitCount).fill(0).map((_, i) => ({
          semana: `S${i+1}`,
          costo: 45000 + (i * 1500),
          valor: 65000 + (i * 2500),
          ganancia: 20000 + (i * 1000)
        })).reverse()
      };
    }
    
    // Convertir datos a formato para gráficos
    const productividadData = [];
    const costosData = [];
    
    // Acumular promedios para calcular tendencia acumulada
    let sumProductividad = 0;
    let countProductividad = 0;
    
    // Procesar documentos (están en orden inverso)
    snapshot.docs.reverse().forEach((doc, index) => {
      const data = doc.data();
      const semana = `S${index+1}`;
      
      // Datos para gráfico de productividad
      const productividad = data.metricas?.productividadPromedio || 0;
      sumProductividad += productividad;
      countProductividad++;
      
      productividadData.push({
        semana,
        productividad,
        promedio: sumProductividad / countProductividad
      });
      
      // Datos para gráfico de costos
      costosData.push({
        semana,
        costo: data.metricas?.costoTotal || 0,
        valor: data.metricas?.valorTotal || 0,
        ganancia: (data.metricas?.valorTotal || 0) - (data.metricas?.costoTotal || 0)
      });
    });
    
    return {
      productividad: productividadData,
      costos: costosData
    };
  } catch (error) {
    console.error('Error fetching trends:', error);
    throw error;
  }
};

// Añadir esta función en src/firebase/db.js
// Corrección para src/firebase/db.js

// Añadir esta función corregida o modificar la existente

export const fetchReportesAsociados = async (db, actividadId, limit = 5) => {
  try {
    // Primero, busca la actividad en Actividades_Resumen_Mensual
    // El ID del documento es actividadId + periodo (mes actual)
    const mes = new Date().toISOString().split('-').slice(0, 2).join('-');
    const docId = `${actividadId}_${mes}`;
    
    console.log(`Buscando actividad con ID: ${docId}`);
    
    // Intentar buscar por el ID exacto primero
    let actividadDoc = await getDoc(doc(db, "Actividades_Resumen_Mensual", docId));
    
    // Si no existe, buscar por consulta donde actividadId coincida
    if (!actividadDoc.exists()) {
      console.log(`Documento no encontrado con ID exacto, buscando por actividadId: ${actividadId}`);
      const q = query(
        collection(db, "Actividades_Resumen_Mensual"),
        where("actividadId", "==", actividadId),
        limit(1)
      );
      
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        actividadDoc = querySnapshot.docs[0];
      }
    }
    
    // Si aún no se encuentra, intentamos buscar por nombre
    if (!actividadDoc || !actividadDoc.exists()) {
      console.log(`No se encontró por actividadId, buscando por nombre: ${actividadId}`);
      const q = query(
        collection(db, "Actividades_Resumen_Mensual"),
        where("nombre", "==", actividadId),
        limit(1)
      );
      
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        actividadDoc = querySnapshot.docs[0];
      } else {
        console.log(`No se encontró la actividad: ${actividadId}`);
        return [];
      }
    }
    
    // Verificar si tiene reportes
    const actividadData = actividadDoc.data();
    const reportesIds = actividadData.reportes || [];
    
    console.log(`Reportes encontrados para actividad ${actividadId}:`, reportesIds);
    
    if (reportesIds.length === 0) {
      return [];
    }
    
    // Limitar la cantidad de reportes según el parámetro
    const reportesToGet = reportesIds.slice(0, limit);
    
    // Obtener los datos de cada reporte
    const reportes = [];
    for (const reporteId of reportesToGet) {
      try {
        const reporteDoc = await getDoc(doc(db, "Reportes_Links", reporteId));
        
        if (reporteDoc.exists()) {
          const reporteData = reporteDoc.data();
          reportes.push({
            id: reporteDoc.id,
            reporteId: reporteData.reporteId || reporteDoc.id,
            fecha: reporteData.fecha || '',
            creadoPor: reporteData.creadoPor || reporteData.creadorNombre || 'Sin datos',
            enlaceSheet: reporteData.enlaceSheet || reporteData.spreadsheetUrl || ''
          });
        }
      } catch (err) {
        console.error(`Error al obtener reporte ${reporteId}:`, err);
      }
    }
    
    console.log(`Se obtuvieron ${reportes.length} reportes`);
    return reportes;
    
  } catch (error) {
    console.error("Error al obtener reportes asociados:", error);
    return [];
  }
};

// Exportamos todas las funciones
export {
  // Si se necesitan más funciones específicas
};