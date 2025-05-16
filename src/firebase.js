// Configuración temporal de Firebase (mock)
// Reemplaza esto con tu configuración real cuando tengas el proyecto de Firebase listo
const db = {
  collection: (name) => ({
    doc: (id) => ({
      get: () => Promise.resolve({
        exists: true,
        data: () => mockData[name]?.[id] || {},
        id
      }),
      set: (data) => Promise.resolve(data),
      update: (data) => Promise.resolve(data),
    }),
    where: () => ({
      where: () => ({
        orderBy: () => ({
          limit: () => ({
            get: () => Promise.resolve({
              docs: Object.entries(mockData[name] || {}).map(([id, data]) => ({
                id,
                data: () => data,
                exists: true
              }))
            })
          })
        })
      })
    })
  })
};

// Datos de prueba
const mockData = {
  "Dashboard_Resumenes": {
    "diario_2023-11-15": {
      fecha: "2023-11-15",
      periodo: "diario",
      metricas: {
        reportesProcesados: 12,
        totalMetrados: 850,
        totalHoras: 450,
        costoTotal: 9870,
        valorTotal: 14500,
        productividadPromedio: 1.9
      },
      porCategoria: {
        "OPERARIO": { cantidad: 12, horas: 240, costo: 5520 },
        "OFICIAL": { cantidad: 8, horas: 160, costo: 2894 },
        "PEON": { cantidad: 6, horas: 50, costo: 819 }
      }
    }
  },
  // Agrega más datos de prueba aquí
};

export { db };