export const DATE_FORMATS = {
  FIRESTORE: 'YYYY-MM-DD',    // Formato para almacenar en Firestore
  DISPLAY: 'DD/MM/YYYY',      // Formato para mostrar al usuario
  DISPLAY_FULL: 'D [de] MMMM [de] YYYY' // Formato largo para mostrar
};

/**
 * Normaliza una fecha a formato Firestore (YYYY-MM-DD)
 * Esta es la función principal que debe usarse para toda consulta a Firestore
 * @param {string|Date} fecha - Fecha en cualquier formato
 * @returns {string} - Fecha en formato YYYY-MM-DD
 */
export const normalizarFechaParaFirestore = (fecha) => {
  if (!fecha) return '';
  
  // Si ya es una fecha en formato YYYY-MM-DD, retornarla directamente
  if (typeof fecha === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    return fecha;
  }
  
  let fechaObj;
  
  // Convertir a objeto Date
  if (typeof fecha === 'string') {
    // Si está en formato DD/MM/YYYY
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(fecha)) {
      const [dia, mes, anio] = fecha.split('/');
      fechaObj = new Date(anio, parseInt(mes) - 1, dia);
    } else {
      // Intentar parsear directamente
      fechaObj = new Date(fecha);
    }
  } else if (fecha instanceof Date) {
    fechaObj = fecha;
  } else {
    console.error('Formato de fecha no reconocido:', fecha);
    return '';
  }
  
  // Verificar que sea una fecha válida
  if (isNaN(fechaObj.getTime())) {
    console.error('Fecha inválida:', fecha);
    return '';
  }
  
  // Formatear a YYYY-MM-DD considerando UTC para evitar problemas de zona horaria
  const anio = fechaObj.getFullYear();
  const mes = (fechaObj.getMonth() + 1).toString().padStart(2, '0');
  const dia = fechaObj.getDate().toString().padStart(2, '0');
  
  return `${anio}-${mes}-${dia}`;
};

/**
 * Convierte una fecha de formato Firestore a formato de visualización
 * @param {string} fechaFirestore - Fecha en formato YYYY-MM-DD
 * @param {string} formato - Formato deseado (uno de DATE_FORMATS)
 * @returns {string} - Fecha formateada
 */
export const formatearFechaParaMostrar = (fechaFirestore, formato = DATE_FORMATS.DISPLAY) => {
  if (!fechaFirestore) return '';
  
  // Validar que sea formato Firestore
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaFirestore)) {
    console.warn('La fecha no está en formato Firestore:', fechaFirestore);
    return fechaFirestore;
  }
  
  const [anio, mes, dia] = fechaFirestore.split('-');
  
  if (formato === DATE_FORMATS.DISPLAY) {
    return `${dia}/${mes}/${anio}`;
  }
  
  if (formato === DATE_FORMATS.DISPLAY_FULL) {
    const meses = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    
    return `${parseInt(dia)} de ${meses[parseInt(mes) - 1]} de ${anio}`;
  }
  
  return fechaFirestore; // Si no reconoce el formato, devuelve el original
};

/**
 * Obtiene la fecha actual en formato Firestore
 * @returns {string} - Fecha actual en formato YYYY-MM-DD
 */
export const obtenerFechaActual = () => {
  const fecha = new Date();
  return normalizarFechaParaFirestore(fecha);
};

/**
 * Obtiene una fecha retrocedida X días en formato Firestore
 * @param {number} dias - Número de días a retroceder
 * @returns {string} - Fecha retrocedida en formato YYYY-MM-DD
 */
export const obtenerFechaRetrocedida = (dias) => {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() - dias);
  return normalizarFechaParaFirestore(fecha);
};

/**
 * Obtiene el primer día de la semana actual en formato Firestore
 * @returns {string} - Fecha del lunes de la semana actual en formato YYYY-MM-DD
 */
export const obtenerInicioDeSemanaActual = () => {
  const fecha = new Date();
  const diaSemana = fecha.getDay(); // 0 para domingo, 1 para lunes, etc.
  const diasHastaLunes = diaSemana === 0 ? 6 : diaSemana - 1;
  
  fecha.setDate(fecha.getDate() - diasHastaLunes);
  return normalizarFechaParaFirestore(fecha);
};

/**
 * Obtiene el primer día del mes actual en formato Firestore
 * @returns {string} - Fecha del primer día del mes en formato YYYY-MM-DD
 */
export const obtenerInicioDeMesActual = () => {
  const fecha = new Date();
  fecha.setDate(1);
  return normalizarFechaParaFirestore(fecha);
};

/**
 * Genera un ID para documentos de resumen basado en periodo y fecha
 * @param {string} periodo - 'diario', 'semanal' o 'mensual'
 * @param {string} fecha - Fecha en cualquier formato
 * @returns {string} - ID en formato "periodo_YYYY-MM-DD"
 */
export const generarIdResumen = (periodo, fecha) => {
  const fechaNormalizada = normalizarFechaParaFirestore(fecha || new Date());
  return `${periodo}_${fechaNormalizada}`;
};

/**
 * Genera un rango de fechas para consultas
 * @param {string} tipoFiltro - 'dia', 'semana', 'mes' o 'rango'
 * @param {Object} filtros - Objeto con información de filtros
 * @returns {Object} - Objeto con fechas inicio y fin en formato Firestore
 */
export const generarRangoFechas = (tipoFiltro, filtros) => {
  switch (tipoFiltro) {
    case 'dia':
      const fecha = filtros.rango?.fin || obtenerFechaActual();
      const fechaFirestore = normalizarFechaParaFirestore(fecha);
      return { inicio: fechaFirestore, fin: fechaFirestore };
      
    case 'semana':
      if (filtros.semana) {
        // Formato esperado: YYYY-Wnn
        const [anio, semana] = filtros.semana.split('-W');
        const inicioAno = new Date(parseInt(anio), 0, 1);
        const diasHastaLunes = inicioAno.getDay() <= 1 ? inicioAno.getDay() : inicioAno.getDay() - 1;
        const inicioSemana = new Date(inicioAno);
        inicioSemana.setDate(inicioAno.getDate() - diasHastaLunes + (parseInt(semana) - 1) * 7);
        
        const finSemana = new Date(inicioSemana);
        finSemana.setDate(inicioSemana.getDate() + 6);
        
        return {
          inicio: normalizarFechaParaFirestore(inicioSemana),
          fin: normalizarFechaParaFirestore(finSemana)
        };
      }
      // Si no hay semana específica, usar semana actual
      const inicioSemana = obtenerInicioDeSemanaActual();
      const fechaInicioSemana = new Date(inicioSemana);
      const fechaFinSemana = new Date(fechaInicioSemana);
      fechaFinSemana.setDate(fechaInicioSemana.getDate() + 6);
      
      return {
        inicio: inicioSemana,
        fin: normalizarFechaParaFirestore(fechaFinSemana)
      };
      
    case 'mes':
      if (filtros.mes) {
        // Formato esperado: YYYY-MM
        const [anio, mes] = filtros.mes.split('-');
        const inicioMes = new Date(parseInt(anio), parseInt(mes) - 1, 1);
        const finMes = new Date(parseInt(anio), parseInt(mes), 0); // Último día del mes
        
        return {
          inicio: normalizarFechaParaFirestore(inicioMes),
          fin: normalizarFechaParaFirestore(finMes)
        };
      }
      // Si no hay mes específico, usar mes actual
      const inicioMes = obtenerInicioDeMesActual();
      const fechaInicioMes = new Date(inicioMes);
      const fechaFinMes = new Date(fechaInicioMes.getFullYear(), fechaInicioMes.getMonth() + 1, 0);
      
      return {
        inicio: inicioMes,
        fin: normalizarFechaParaFirestore(fechaFinMes)
      };
      
    case 'rango':
      // Usar directamente el rango proporcionado
      return {
        inicio: normalizarFechaParaFirestore(filtros.rango?.inicio || obtenerFechaRetrocedida(30)),
        fin: normalizarFechaParaFirestore(filtros.rango?.fin || obtenerFechaActual())
      };
      
    default:
      console.warn('Tipo de filtro no reconocido:', tipoFiltro);
      // Por defecto, retornar el día actual
      const fechaHoy = obtenerFechaActual();
      return { inicio: fechaHoy, fin: fechaHoy };
  }
};

/**
 * Compara dos fechas en formato Firestore
 * @param {string} fecha1 - Primera fecha en formato YYYY-MM-DD
 * @param {string} fecha2 - Segunda fecha en formato YYYY-MM-DD
 * @returns {number} - -1 si fecha1 < fecha2, 0 si iguales, 1 si fecha1 > fecha2
 */
export const compararFechasFirestore = (fecha1, fecha2) => {
  if (!fecha1 || !fecha2) return 0;
  
  // Convertir a formato comparable
  const f1 = fecha1.replace(/-/g, '');
  const f2 = fecha2.replace(/-/g, '');
  
  if (f1 < f2) return -1;
  if (f1 > f2) return 1;
  return 0;
};

/**
 * Calcula la diferencia en días entre dos fechas
 * @param {string} fechaInicio - Fecha inicial en formato YYYY-MM-DD
 * @param {string} fechaFin - Fecha final en formato YYYY-MM-DD
 * @returns {number} - Diferencia en días
 */
export const diferenciaEnDias = (fechaInicio, fechaFin) => {
  if (!fechaInicio || !fechaFin) return 0;
  
  const [anioInicio, mesInicio, diaInicio] = fechaInicio.split('-');
  const [anioFin, mesFin, diaFin] = fechaFin.split('-');
  
  const inicio = new Date(anioInicio, parseInt(mesInicio) - 1, diaInicio);
  const fin = new Date(anioFin, parseInt(mesFin) - 1, diaFin);
  
  // Convertir a días
  const diffTime = Math.abs(fin - inicio);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

// Funciones auxiliares para obtener la semana y mes actuales en formato específico
export const obtenerSemanaActual = () => {
  const fecha = new Date();
  const inicioAno = new Date(fecha.getFullYear(), 0, 1);
  const dias = Math.floor((fecha - inicioAno) / (24 * 60 * 60 * 1000));
  const semana = Math.ceil((fecha.getDay() + 1 + dias) / 7);
  return `${fecha.getFullYear()}-W${semana.toString().padStart(2, '0')}`;
};

export const obtenerMesActual = () => {
  const fecha = new Date();
  return `${fecha.getFullYear()}-${(fecha.getMonth() + 1).toString().padStart(2, '0')}`;
};

// Función para generar listas de semanas y meses para selectores
export const generarSemanas = (año = new Date().getFullYear()) => {
  const semanas = [];
  for (let i = 1; i <= 52; i++) {
    semanas.push(`${año}-W${i.toString().padStart(2, '0')}`);
  }
  return semanas;
};

export const generarMeses = (año = new Date().getFullYear()) => {
  const meses = [];
  for (let i = 1; i <= 12; i++) {
    const mes = i.toString().padStart(2, '0');
    meses.push(`${año}-${mes}`);
  }
  return meses;
};

// Función para obtener nombre del mes
export const obtenerNombreMes = (numeroMes) => {
  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  
  return meses[parseInt(numeroMes) - 1] || '';
};