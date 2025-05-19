// src/components/dashboard/GraficoReportes.js
import React, { useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  Line, 
  ComposedChart,
  LabelList
} from 'recharts';
import { formatoMoneda } from '../../utils/formatUtils';

const GraficoReportes = ({ reportes, filtroFecha }) => {
  // Función para formatear fechas (YYYY-MM-DD a DD/MM/YYYY)
  // IMPORTANTE: Mover esta función aquí arriba, antes de usarla en useMemo
  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return '';
    
    const partes = fechaStr.split('-');
    if (partes.length !== 3) return fechaStr;
    
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  };

  // Procesar datos para el gráfico
  const datosGrafico = useMemo(() => {
    // Si no hay reportes, devolver array vacío
    if (!reportes || reportes.length === 0) return [];
    
    // Agrupar por fecha
    const reportesPorFecha = {};
    
    // Filtrar por fecha si es necesario
    const reportesFiltrados = filtroFecha 
      ? reportes.filter(reporte => {
          // Si es fecha específica (diario)
          if (typeof filtroFecha === 'string') {
            return reporte.fecha === filtroFecha;
          }
          // Si es rango de fechas
          if (filtroFecha.inicio && filtroFecha.fin) {
            const fechaReporte = new Date(reporte.fecha);
            const fechaInicio = new Date(filtroFecha.inicio);
            const fechaFin = new Date(filtroFecha.fin);
            return fechaReporte >= fechaInicio && fechaReporte <= fechaFin;
          }
          return true;
        })
      : reportes;
    
    // Primero agrupamos los valores por fecha
    reportesFiltrados.forEach(reporte => {
      const fecha = reporte.fecha;
      if (!reportesPorFecha[fecha]) {
        reportesPorFecha[fecha] = {
          fecha: fecha,
          totalValorizado: 0,
          cantidadReportes: 0,
          creadores: new Set()
        };
      }
      
      reportesPorFecha[fecha].totalValorizado += reporte.totalValorizado || 0;
      reportesPorFecha[fecha].cantidadReportes += 1;
      reportesPorFecha[fecha].creadores.add(reporte.creadoPor);
    });
    
    // Convertir a array y ordenar por fecha
    let datos = Object.values(reportesPorFecha);
    
    // Convertir Sets a arrays para cantidad de creadores
    datos = datos.map(item => ({
      ...item,
      cantidadCreadores: item.creadores.size,
      creadores: Array.from(item.creadores)
    }));
    
    // Ordenar por fecha (más antiguo primero)
    datos.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
    
    // Formatear fechas para mostrar en el gráfico
    datos = datos.map(item => ({
      ...item,
      fechaFormateada: formatearFecha(item.fecha)
    }));
    
    return datos;
  }, [reportes, filtroFecha]);

  // Función para formatear el tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg shadow-md border border-gray-200">
          <p className="font-medium text-gray-800">{data.fechaFormateada}</p>
          <p className="text-sm text-gray-600">
            Valorizado total: <span className="font-medium">{formatoMoneda(data.totalValorizado)}</span>
          </p>
          <p className="text-sm text-gray-600">
            Cantidad de reportes: <span className="font-medium">{data.cantidadReportes}</span>
          </p>
          <p className="text-sm text-gray-600">
            Creadores: <span className="font-medium">{data.cantidadCreadores}</span>
          </p>
          <div className="mt-1 text-xs text-gray-500">
            {data.creadores.map((creador, idx) => (
              <div key={idx}>{creador}</div>
            ))}
          </div>
        </div>
      );
    }
  
    return null;
  };

  // Si no hay datos, mostrar mensaje
  if (datosGrafico.length === 0) {
    return (
      <div className="bg-gray-50 p-4 rounded-md border border-gray-200 text-center text-gray-600">
        No hay datos disponibles para el período seleccionado
      </div>
    );
  }

  // Determinar si hay valores negativos
  const tieneValoresNegativos = datosGrafico.some(item => item.totalValorizado < 0);

  return (
    <div className="mt-6">
      <h3 className="text-sm font-medium mb-2">Valorización Total por Fecha</h3>
      <div className="bg-white p-3 rounded-lg border border-gray-200">
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={datosGrafico}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="fechaFormateada" 
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              yAxisId="left"
              tickFormatter={(value) => formatoMoneda(value)} 
              domain={tieneValoresNegativos ? ['auto', 'auto'] : [0, 'auto']}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              dataKey="cantidadReportes" 
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar 
              yAxisId="left"
              dataKey="totalValorizado" 
              name="Valorización" 
              fill="#8884d8"
              radius={[4, 4, 0, 0]}
            >
              <LabelList 
                dataKey="totalValorizado" 
                position="top" 
                formatter={(value) => formatoMoneda(value)}
                style={{ fontSize: '11px' }}
              />
            </Bar>
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="cantidadReportes" 
              name="Cantidad de Reportes" 
              stroke="#82ca9d" 
              strokeWidth={2}
              dot={{ r: 5 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
        
        <div className="mt-2 text-xs text-gray-500 text-center">
          {datosGrafico.length === 1 
            ? "Se muestra la valorización para una fecha específica"
            : `Se muestra la valorización para ${datosGrafico.length} días`
          }
        </div>
      </div>
    </div>
  );
};

export default GraficoReportes;