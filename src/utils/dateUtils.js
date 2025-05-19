// Función para obtener la semana actual en formato ISO YYYY-Wnn
export const obtenerSemanaActual = () => {
  const fecha = new Date();
  const inicioAno = new Date(fecha.getFullYear(), 0, 1);
  const dias = Math.floor((fecha - inicioAno) / (24 * 60 * 60 * 1000));
  const semana = Math.ceil((fecha.getDay() + 1 + dias) / 7);
  return `${fecha.getFullYear()}-W${semana.toString().padStart(2, '0')}`;
};

// Función para obtener el mes actual en formato YYYY-MM
export const obtenerMesActual = () => {
  const fecha = new Date();
  return `${fecha.getFullYear()}-${(fecha.getMonth() + 1).toString().padStart(2, '0')}`;
};

// Función para obtener inicio de semana a partir de YYYY-Wnn
export const obtenerInicioSemana = (semanaISO) => {
  const [ano, semana] = semanaISO.split('-W');
  const inicioAno = new Date(parseInt(ano), 0, 1);
  const diasHastaLunes = inicioAno.getDay() <= 1 ? inicioAno.getDay() : inicioAno.getDay() - 1;
  const inicioSemana = new Date(inicioAno);
  inicioSemana.setDate(inicioAno.getDate() - diasHastaLunes + (parseInt(semana) - 1) * 7);
  return inicioSemana.toISOString().split('T')[0];
};

// Función para obtener fin de semana a partir de YYYY-Wnn
export const obtenerFinSemana = (semanaISO) => {
  const inicioSemana = new Date(obtenerInicioSemana(semanaISO));
  const finSemana = new Date(inicioSemana);
  finSemana.setDate(inicioSemana.getDate() + 6);
  return finSemana.toISOString().split('T')[0];
};

// Función para generar lista de semanas del año
export const generarSemanas = (ano) => {
  const semanas = [];
  const anoActual = ano || new Date().getFullYear();
  
  for (let i = 1; i <= 52; i++) {
    semanas.push(`${anoActual}-W${i.toString().padStart(2, '0')}`);
  }
  return semanas;
};

// Función para generar lista de meses del año
export const generarMeses = (ano) => {
  const meses = [];
  const anoActual = ano || new Date().getFullYear();
  
  for (let i = 1; i <= 12; i++) {
    const mes = i.toString().padStart(2, '0');
    meses.push(`${anoActual}-${mes}`);
  }
  return meses;
};

// Función para formatear fecha en formato legible (DD/MM/YYYY)
export const formatearFecha = (fecha) => {
  if (!fecha) return '';
  
  const partes = fecha.split('-');
  if (partes.length !== 3) return fecha;
  
  return `${partes[2]}/${partes[1]}/${partes[0]}`;
};

// Función para calcular la diferencia en días entre dos fechas
export const diferenciaEnDias = (fechaInicio, fechaFin) => {
  const inicio = new Date(fechaInicio);
  const fin = new Date(fechaFin);
  const diferencia = fin - inicio;
  return Math.floor(diferencia / (1000 * 60 * 60 * 24));
};

// Función para obtener el nombre del mes a partir de su número
export const obtenerNombreMes = (numeroMes) => {
  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  
  return meses[parseInt(numeroMes) - 1] || '';
};

// Función para convertir una fecha YYYY-MM-DD a formato largo (ejemplo: 15 de Noviembre de 2023)
export const fechaLarga = (fecha) => {
  if (!fecha) return '';
  
  const partes = fecha.split('-');
  if (partes.length !== 3) return fecha;
  
  const dia = parseInt(partes[2]);
  const mes = obtenerNombreMes(partes[1]);
  const ano = partes[0];
  
  return `${dia} de ${mes} de ${ano}`;
};
// Función para convertir formato de fecha YYYY-MM-DD a DD/MM/YYYY
export const formatearFechaParaMostrar = (fechaString) => {
  if (!fechaString) return '';
  
  // Verificar si la fecha ya está en formato DD/MM/YYYY
  if (fechaString.includes('/')) return fechaString;
  
  // Convertir de YYYY-MM-DD a DD/MM/YYYY
  const partes = fechaString.split('-');
  if (partes.length !== 3) return fechaString;
  
  return `${partes[2]}/${partes[1]}/${partes[0]}`;
};

// Función para convertir formato de fecha DD/MM/YYYY a YYYY-MM-DD
export const formatearFechaParaGuardar = (fechaString) => {
  if (!fechaString) return '';
  
  // Verificar si la fecha ya está en formato YYYY-MM-DD
  if (fechaString.includes('-')) return fechaString;
  
  // Convertir de DD/MM/YYYY a YYYY-MM-DD
  const partes = fechaString.split('/');
  if (partes.length !== 3) return fechaString;
  
  return `${partes[2]}-${partes[1]}-${partes[0]}`;
};

// Función para convertir entre diferentes formatos de fecha
export const normalizarFormatoFecha = (fecha, formatoSalida = 'YYYY-MM-DD') => {
  if (!fecha) return '';
  
  // Convertir a objeto Date
  let fechaObj;
  if (typeof fecha === 'string') {
    // Manejar diferentes formatos de entrada
    if (fecha.includes('/')) {
      // Formato DD/MM/YYYY
      const [dia, mes, anio] = fecha.split('/');
      fechaObj = new Date(anio, mes - 1, dia);
    } else if (fecha.includes('-')) {
      // Formato YYYY-MM-DD
      fechaObj = new Date(fecha);
    } else {
      return fecha; // No se puede determinar el formato
    }
  } else if (fecha instanceof Date) {
    fechaObj = fecha;
  } else {
    return ''; // Tipo no soportado
  }
  
  // Crear fecha en formato solicitado
  const dia = fechaObj.getDate().toString().padStart(2, '0');
  const mes = (fechaObj.getMonth() + 1).toString().padStart(2, '0');
  const anio = fechaObj.getFullYear();
  
  if (formatoSalida === 'DD/MM/YYYY') {
    return `${dia}/${mes}/${anio}`;
  } else if (formatoSalida === 'YYYY-MM-DD') {
    return `${anio}-${mes}-${dia}`;
  } else {
    return fecha; // Formato de salida no soportado
  }
};