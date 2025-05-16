export const mockData = {
  kpis: {
    costoTotal: 458970.25,
    valorTotal: 687450.80,
    ganancia: 228480.55,
    totalHoras: 24350,
    productividadPromedio: 2.15,
    totalActividades: 860,
    totalReportes: 1240,
    totalTrabajadores: 145
  },
  
  actividades: [
    { nombre: 'Encofrado columnas', costo: 28500, valor: 42750, ganancia: 14250, metrado: 340, horas: 189, productividad: 1.8, meta: 2.0 },
    { nombre: 'Vaciado concreto', costo: 35200, valor: 58800, ganancia: 23600, metrado: 576, horas: 180, productividad: 3.2, meta: 3.0 },
    { nombre: 'Acero estructural', costo: 42000, valor: 67200, ganancia: 25200, metrado: 625, horas: 250, productividad: 2.5, meta: 2.3 },
    { nombre: 'Albañilería', costo: 18700, valor: 28050, ganancia: 9350, metrado: 228, horas: 190, productividad: 1.2, meta: 1.5 },
    { nombre: 'Instalaciones', costo: 22300, valor: 31220, ganancia: 8920, metrado: 255, horas: 170, productividad: 1.5, meta: 1.4 },
    { nombre: 'Acabados', costo: 31500, valor: 44100, ganancia: 12600, metrado: 187, horas: 170, productividad: 1.1, meta: 1.2 }
  ],
  
  trabajadores: [
    { id: 1, nombre: 'Carlos Pérez', categoria: 'OPERARIO', horas: 180, productividad: 2.8, costo: 4140, valor: 6048, eficiencia: 1.4 },
    { id: 2, nombre: 'Juan Méndez', categoria: 'OPERARIO', horas: 176, productividad: 2.6, costo: 4048, valor: 5720, eficiencia: 1.3 },
    { id: 3, nombre: 'Luis Rodríguez', categoria: 'OFICIAL', horas: 168, productividad: 2.2, costo: 3039, valor: 5040, eficiencia: 1.32 },
    { id: 4, nombre: 'Miguel Sánchez', categoria: 'OPERARIO', horas: 176, productividad: 2.1, costo: 4048, valor: 4410, eficiencia: 1.05 },
    { id: 5, nombre: 'Pedro Alvarado', categoria: 'PEON', horas: 160, productividad: 1.8, costo: 2621, valor: 4320, eficiencia: 1.2 }
  ],
  
  tendencias: {
    costos: [
      { semana: 'S1', costo: 45200, valor: 63280, ganancia: 18080 },
      { semana: 'S2', costo: 51300, valor: 71820, ganancia: 20520 },
      { semana: 'S3', costo: 48700, valor: 72100, ganancia: 23400 },
      { semana: 'S4', costo: 50200, valor: 75300, ganancia: 25100 },
      { semana: 'S5', costo: 53600, valor: 85760, ganancia: 32160 },
      { semana: 'S6', costo: 55100, valor: 88160, ganancia: 33060 },
      { semana: 'S7', costo: 54200, valor: 90100, ganancia: 35900 },
      { semana: 'S8', costo: 57800, valor: 98300, ganancia: 40500 }
    ],
    
    productividad: [
      { semana: 'S1', productividad: 1.5, promedio: 1.5 },
      { semana: 'S2', productividad: 1.7, promedio: 1.6 },
      { semana: 'S3', productividad: 1.9, promedio: 1.7 },
      { semana: 'S4', productividad: 1.8, promedio: 1.725 },
      { semana: 'S5', productividad: 2.1, promedio: 1.8 },
      { semana: 'S6', productividad: 2.2, promedio: 1.867 },
      { semana: 'S7', productividad: 2.3, promedio: 1.929 },
      { semana: 'S8', productividad: 2.4, promedio: 1.988 }
    ]
  },
  
  distribucion: {
    categorias: [
      { nombre: 'OPERARIO', cantidad: 12, horas: 240, costo: 5520, valor: 256000, porcentaje: 48 },
      { nombre: 'OFICIAL', cantidad: 8, horas: 160, costo: 2894, valor: 175000, porcentaje: 33 },
      { nombre: 'PEON', cantidad: 6, horas: 50, costo: 819, valor: 102000, porcentaje: 19 }
    ]
  },
  
  reportes: [
    { id: 'REP-2023-0645', titulo: 'Bloque A - Avance Semanal', fecha: '2023-11-15', elaboradoPor: 'Juan Pérez', tipo: 'Semanal', enlaceSheet: 'https://docs.google.com/spreadsheets/d/example1' },
    { id: 'REP-2023-0644', titulo: 'Revisión de Productividad - Operarios', fecha: '2023-11-14', elaboradoPor: 'María López', tipo: 'Especial', enlaceSheet: 'https://docs.google.com/spreadsheets/d/example2' },
    { id: 'REP-2023-0643', titulo: 'Bloque B - Avance Semanal', fecha: '2023-11-08', elaboradoPor: 'Juan Pérez', tipo: 'Semanal', enlaceSheet: 'https://docs.google.com/spreadsheets/d/example3' }
  ]
};