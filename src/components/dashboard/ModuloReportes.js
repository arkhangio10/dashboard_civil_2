import React, { useState } from 'react';
import { Link2, Download, Share2, Calendar, Layers, FileText, ExternalLink, Code, Award, DollarSign, Activity, Edit, Trash } from 'lucide-react';
import { mockData } from '../../utils/mockData';

const ModuloReportes = () => {
  const [tabActivo, setTabActivo] = useState('reportes');
  const [enlaceCompartir, setEnlaceCompartir] = useState('');
  const [mostrarEnlace, setMostrarEnlace] = useState(false);
  
  // Datos de reportes desde mock
  const reportes = mockData.reportes;
  
  // Función para generar enlace de compartir
  const generarEnlaceCompartir = (reporteId) => {
    const baseUrl = window.location.origin;
    const enlace = `${baseUrl}/dashboard?reporte=${reporteId}`;
    setEnlaceCompartir(enlace);
    setMostrarEnlace(true);
    
    // Copiar al portapapeles
    navigator.clipboard.writeText(enlace)
      .then(() => {
        alert('Enlace copiado al portapapeles');
      })
      .catch((err) => {
        console.error('Error al copiar el enlace:', err);
      });
  };
  
  // Función para generar informe y descargar
  const generarInforme = (formato) => {
    alert(`Generando informe en formato ${formato}. Esta funcionalidad se implementará próximamente.`);
  };
  
  // Renderizar pestaña según selección
  const renderizarTab = () => {
    switch (tabActivo) {
      case 'reportes':
        return (
          <div>
            <h3 className="text-sm font-medium mb-3">Reportes Recientes</h3>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Elaborado por</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportes.map((reporte, index) => (
                    <tr key={reporte.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-3 py-2 text-sm text-gray-900">{reporte.id}</td>
                      <td className="px-3 py-2 text-sm text-gray-900 font-medium">{reporte.titulo}</td>
                      <td className="px-3 py-2 text-sm text-gray-900">{reporte.fecha}</td>
                      <td className="px-3 py-2 text-sm text-gray-900">{reporte.elaboradoPor}</td>
                      <td className="px-3 py-2 text-sm text-gray-900">
                        <span className={`px-2 py-1 text-xs rounded-full 
                          ${reporte.tipo === 'Semanal' ? 'bg-blue-100 text-blue-800' : 
                          reporte.tipo === 'Especial' ? 'bg-purple-100 text-purple-800' : 
                          'bg-green-100 text-green-800'}`}>
                          {reporte.tipo}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-900">
                        <div className="flex space-x-2">
                          <a 
                            href={reporte.enlaceSheet} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                            title="Abrir hoja de cálculo"
                          >
                            <ExternalLink size={16} />
                          </a>
                          <button 
                            className="text-green-600 hover:text-green-800"
                            onClick={() => generarEnlaceCompartir(reporte.id)}
                            title="Compartir enlace"
                          >
                            <Share2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {mostrarEnlace && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="text-sm font-medium text-blue-800 mb-2 flex items-center">
                  <Link2 size={16} className="mr-2" />
                  Enlace generado:
                </h4>
                <div className="flex items-center bg-white p-2 rounded border border-blue-200">
                  <input
                    type="text"
                    value={enlaceCompartir}
                    readOnly
                    className="flex-grow text-sm text-gray-600 outline-none"
                  />
                  <button
                    className="ml-2 text-blue-600 hover:text-blue-800"
                    onClick={() => navigator.clipboard.writeText(enlaceCompartir)}
                    title="Copiar al portapapeles"
                  >
                    <Code size={16} />
                  </button>
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  Este enlace contiene los filtros y configuraciones actuales del dashboard.
                </p>
              </div>
            )}
          </div>
        );
        
      case 'exportar':
        return (
          <div>
            <h3 className="text-sm font-medium mb-3">Exportar Datos</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h4 className="font-medium text-gray-700 mb-3 flex items-center">
                  <Calendar size={18} className="text-blue-600 mr-2" />
                  Exportar por período
                </h4>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
                    <input
                      type="date"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      defaultValue={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin</label>
                    <input
                      type="date"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      defaultValue={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  
                  <div className="pt-2">
                    <button
                      className="w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                      onClick={() => generarInforme('periodo')}
                    >
                      <Download size={16} className="mr-2" />
                      Generar Reporte
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h4 className="font-medium text-gray-700 mb-3 flex items-center">
                  <FileText size={18} className="text-green-600 mr-2" />
                  Exportar informe actual
                </h4>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Formato de exportación</label>
                    <select className="w-full p-2 border border-gray-300 rounded-md">
                      <option value="excel">Excel (.xlsx)</option>
                      <option value="pdf">PDF</option>
                      <option value="csv">CSV</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contenido a incluir</label>
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <input id="incluir-todo" type="checkbox" className="h-4 w-4 text-blue-600" defaultChecked />
                        <label htmlFor="incluir-todo" className="ml-2 text-sm text-gray-700">Todo el dashboard</label>
                      </div>
                      <div className="flex items-center">
                        <input id="incluir-kpis" type="checkbox" className="h-4 w-4 text-blue-600" defaultChecked />
                        <label htmlFor="incluir-kpis" className="ml-2 text-sm text-gray-700">KPIs y resúmenes</label>
                      </div>
                      <div className="flex items-center">
                        <input id="incluir-graficos" type="checkbox" className="h-4 w-4 text-blue-600" defaultChecked />
                        <label htmlFor="incluir-graficos" className="ml-2 text-sm text-gray-700">Gráficos y visualizaciones</label>
                      </div>
                      <div className="flex items-center">
                        <input id="incluir-datos" type="checkbox" className="h-4 w-4 text-blue-600" defaultChecked />
                        <label htmlFor="incluir-datos" className="ml-2 text-sm text-gray-700">Datos crudos</label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <button
                      className="w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                      onClick={() => generarInforme('actual')}
                    >
                      <Download size={16} className="mr-2" />
                      Exportar
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 bg-white p-4 rounded-lg border border-gray-200">
              <h4 className="font-medium text-gray-700 mb-3 flex items-center">
                <Layers size={18} className="text-purple-600 mr-2" />
                Informes Predefinidos
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                  className="flex items-center justify-between p-3 border border-gray-300 rounded-md hover:bg-gray-50"
                  onClick={() => generarInforme('rendimiento')}
                >
                  <span className="flex items-center">
                    <Award size={16} className="text-amber-600 mr-2" />
                    <span className="text-sm">Rendimiento Trabajadores</span>
                  </span>
                  <Download size={16} className="text-gray-500" />
                </button>
                
                <button
                  className="flex items-center justify-between p-3 border border-gray-300 rounded-md hover:bg-gray-50"
                  onClick={() => generarInforme('costos')}
                >
                  <span className="flex items-center">
                    <DollarSign size={16} className="text-green-600 mr-2" />
                    <span className="text-sm">Análisis de Costos</span>
                  </span>
                  <Download size={16} className="text-gray-500" />
                </button>
                
                <button
                  className="flex items-center justify-between p-3 border border-gray-300 rounded-md hover:bg-gray-50"
                  onClick={() => generarInforme('productividad')}
                >
                  <span className="flex items-center">
                    <Activity size={16} className="text-blue-600 mr-2" />
                    <span className="text-sm">Productividad por Actividad</span>
                  </span>
                  <Download size={16} className="text-gray-500" />
                </button>
              </div>
              
              <p className="text-xs text-gray-500 mt-3">
                Los informes predefinidos contienen plantillas optimizadas para diferentes áreas de análisis.
              </p>
            </div>
          </div>
        );
        
      case 'programacion':
        return (
          <div>
            <h3 className="text-sm font-medium mb-3">Programación de Reportes</h3>
            
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h4 className="font-medium text-gray-700 mb-3">Configurar Reportes Automáticos</h4>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Reporte</label>
                  <select className="w-full p-2 border border-gray-300 rounded-md">
                    <option>Resumen Semanal</option>
                    <option>Análisis de Productividad</option>
                    <option>Rendimiento de Trabajadores</option>
                    <option>Análisis de Costos vs Valor</option>
                    <option>Reporte Completo</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Frecuencia</label>
                  <select className="w-full p-2 border border-gray-300 rounded-md">
                    <option>Diario</option>
                    <option>Semanal</option>
                    <option>Mensual</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Formato</label>
                  <select className="w-full p-2 border border-gray-300 rounded-md">
                    <option>PDF</option>
                    <option>Excel</option>
                    <option>Dashboard Online</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Destinatarios</label>
                  <textarea 
                    className="w-full p-2 border border-gray-300 rounded-md" 
                    rows="2"
                    placeholder="Ingrese correos electrónicos separados por comas"
                    defaultValue="gerente@hergonsa.pe, supervisor@hergonsa.pe"
                  ></textarea>
                </div>
                
                <div className="pt-2">
                  <button className="w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                    Guardar Programación
                  </button>
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">Reportes Programados</h3>
              
              <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200 flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-medium text-yellow-800">Resumen Semanal</h4>
                  <p className="text-xs text-yellow-700">Cada lunes a las 8:00 AM</p>
                  <p className="text-xs text-yellow-700">Destinatarios: 2 correos</p>
                </div>
                <div className="flex space-x-2">
                  <button className="text-yellow-600 hover:text-yellow-800">
                    <Edit size={16} />
                  </button>
                  <button className="text-red-600 hover:text-red-800">
                    <Trash size={16} />
                  </button>
                </div>
              </div>
              
              <div className="bg-green-50 p-3 rounded-lg border border-green-200 flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-green-800">Análisis de Costos vs Valor</h4>
                  <p className="text-xs text-green-700">Mensual - Primer día del mes</p>
                  <p className="text-xs text-green-700">Destinatarios: 4 correos</p>
                </div>
                <div className="flex space-x-2">
                  <button className="text-green-600 hover:text-green-800">
                    <Edit size={16} />
                  </button>
                  <button className="text-red-600 hover:text-red-800">
                    <Trash size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Módulo de Reportes</h2>
      </div>
      
      <div className="border-b border-gray-200 mb-4">
        <nav className="-mb-px flex space-x-6">
          <button
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              tabActivo === 'reportes'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setTabActivo('reportes')}
          >
            <span className="flex items-center">
              <FileText size={16} className="mr-2" />
              Reportes
            </span>
          </button>
          
          <button
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              tabActivo === 'exportar'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setTabActivo('exportar')}
          >
            <span className="flex items-center">
              <Download size={16} className="mr-2" />
              Exportar
            </span>
          </button>
          
          <button
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              tabActivo === 'programacion'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setTabActivo('programacion')}
          >
            <span className="flex items-center">
              <Calendar size={16} className="mr-2" />
              Programación
            </span>
          </button>
        </nav>
      </div>
      
      {renderizarTab()}
    </div>
  );
};

export default ModuloReportes;