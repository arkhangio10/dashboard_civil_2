// src/utils/formatUtils.js
// Formatear moneda
export const formatoMoneda = (valor) => {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2
  }).format(valor);
};

// Formatear número con separador de miles
export const formatoNumero = (valor) => {
  return new Intl.NumberFormat('es-PE').format(valor);
};

// Formatear porcentaje
export const formatoPorcentaje = (valor, decimales = 1) => {
  return `${valor.toFixed(decimales)}%`;
};