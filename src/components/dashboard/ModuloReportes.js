// src/components/dashboard/ModuloReportes.js
import React, { useState, useEffect } from 'react';
import { Link2, Download, Share2, Calendar, Layers, FileText, ExternalLink, Code, Award, DollarSign, Activity, Edit, Trash } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';

const ModuloReportes = () => {
  const [tabActivo, setTabActivo] = useState('reportes');
  const [enlaceCompartir, setEnlaceCompartir] = useState('');
  const [mostrarEnlace, setMostrarEnlace] = useState(false);
  
  // Usar el contexto de Dashboard para obtener datos reales
  const { datos, loading } = useDashboard();
  
  // Obtener reportes del contexto (datos reales) en lugar de mockData
  const reportes = datos.reportes || [];
  
  // Verificar en la consola qué datos estamos recibiendo
  useEffect(() => {
    console.log("Datos de reportes cargados:", reportes);
    
    // Verificar específicamente los enlaces
    reportes.forEach(report => {
      console.log(`Reporte ${report.id || 'sin ID'}: Enlace = ${report.enlaceSheet || 'No tiene enlace'}`);
    });
  }, [reportes]);
  
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
            
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : reportes.length === 0 ? (
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 text-center">
                <p className="text-yellow-700">No se encontraron reportes disponibles.</p>
                <p className="text-sm text-yellow-600 mt-1">Verifica que la colección Reportes_Links tenga datos.</p>
              </div>
            ) : (
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
                      <tr key={reporte.id || index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-3 py-2 text-sm text-gray-900">{reporte.id || `REP-${index}`}</td>
                        <td className="px-3 py-2 text-sm text-gray-900 font-medium">{reporte.titulo || 'Sin título'}</td>
                        <td className="px-3 py-2 text-sm text-gray-900">{reporte.fecha || 'Sin fecha'}</td>
                        <td className="px-3 py-2 text-sm text-gray-900">{reporte.elaboradoPor || reporte.creadoPor || 'Desconocido'}</td>
                        <td className="px-3 py-2 text-sm text-gray-900">
                          <span className={`px-2 py-1 text-xs rounded-full 
                            ${reporte.tipo === 'Semanal' ? 'bg-blue-100 text-blue-800' : 
                            reporte.tipo === 'Especial' ? 'bg-purple-100 text-purple-800' : 
                            'bg-green-100 text-green-800'}`}>
                            {reporte.tipo || 'General'}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-900">
                          <div className="flex space-x-2">
                            {reporte.enlaceSheet ? (
                              <a 
                                href={reporte.enlaceSheet} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800"
                                title="Abrir hoja de cálculo"
                              >
                                <ExternalLink size={16} />
                              </a>
                            ) : reporte.enlaceDrive ? (
                              <a 
                                href={reporte.enlaceDrive} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800"
                                title="Abrir en Drive"
                              >
                                <ExternalLink size={16} />
                              </a>
                            ) : (
                              <span 
                                className="text-gray-300 cursor-not-allowed"
                                title="Enlace no disponible"
                              >
                                <ExternalLink size={16} />
                              </span>
                            )}
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
            )}
            
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
        
      // El resto del código permanece igual...
      case 'exportar':
        // código existente para la pestaña exportar
        return (
          // ... tu código actual
          <div>
            <h3 className="text-sm font-medium mb-3">Exportar Datos</h3>
            {/* ... resto del código ... */}
          </div>
        );
        
      case 'programacion':
        // código existente para la pestaña programación
        return (
          // ... tu código actual
          <div>
            <h3 className="text-sm font-medium mb-3">Programación de Reportes</h3>
            {/* ... resto del código ... */}
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