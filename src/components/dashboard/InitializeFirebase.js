// src/components/dashboard/InitializeFirebase.js
import React, { useState } from 'react';
import { collection, getDocs, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { Database, AlertCircle, Check, RefreshCw } from 'lucide-react';

const InitializeFirebase = () => {
  const { db, selectedProject } = useAuth();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  
  // Lista de colecciones a inicializar
  const colecciones = [
    "Reportes_Links",
    "Spreadsheets",
    "Partidas_Avance",
    "Trabajadores",
    "Actividades_Resumen",
    "Actividades_Resumen_Diario",
    "Actividades_Resumen_Mensual",
    "Dashboard_Resumenes"
  ];

  // Función para inicializar colecciones
  const handleInitialize = async () => {
    if (!db) {
      setResult({
        success: false,
        message: "No hay conexión con Firebase. Verificar configuración."
      });
      return;
    }
    
    setLoading(true);
    setResult(null);
    
    try {
      console.log("🔧 Inicializando colecciones requeridas para el dashboard...");
      
      // Crear documentos de inicialización para cada colección
      const timestamp = serverTimestamp();
      const resultados = [];
      
      for (const nombre of colecciones) {
        try {
          // Verificar si ya existe la colección
          const coleccionRef = collection(db, nombre);
          const snapshot = await getDocs(coleccionRef);
          
          if (snapshot.empty) {
            // Si está vacía, crear documento inicial
            const docRef = doc(db, nombre, "_init");
            await setDoc(docRef, {
              _inicializacion: true,
              _descripcion: `Documento inicial para colección ${nombre}`,
              creadoEn: timestamp
            });
            
            resultados.push({ 
              nombre, 
              estado: "creada", 
              fecha: new Date().toISOString() 
            });
          } else {
            resultados.push({ 
              nombre, 
              estado: "existente", 
              documentos: snapshot.size 
            });
          }
        } catch (error) {
          console.error(`Error al inicializar ${nombre}:`, error);
          resultados.push({ 
            nombre, 
            estado: "error", 
            error: error.message 
          });
        }
      }
      
      setResult({
        success: true,
        message: "Proceso de inicialización completado",
        colecciones: resultados
      });
      
    } catch (error) {
      console.error("Error en inicialización:", error);
      setResult({
        success: false,
        message: `Error durante la inicialización: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center">
          <Database size={20} className="mr-2 text-blue-600" />
          Inicializar Colecciones Firebase
        </h2>
      </div>
      
      <p className="text-sm text-gray-600 mb-4">
        Esta herramienta inicializa las colecciones necesarias para el dashboard. 
        Se crearán las siguientes colecciones si no existen:
      </p>
      
      <div className="bg-gray-50 p-3 rounded-md border border-gray-200 mb-4">
        <ul className="text-xs space-y-1">
          {colecciones.map(coleccion => (
            <li key={coleccion} className="flex items-center">
              <span className="w-4 h-4 inline-block mr-2 bg-blue-100 rounded-full"></span>
              {coleccion}
            </li>
          ))}
        </ul>
      </div>
      
      <button
        onClick={handleInitialize}
        disabled={loading}
        className={`w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
          loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {loading ? (
          <>
            <RefreshCw size={16} className="mr-2 animate-spin" />
            Inicializando...
          </>
        ) : (
          'Inicializar Colecciones'
        )}
      </button>
      
      {result && (
        <div className={`mt-4 p-3 rounded-lg border ${
          result.success 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <div className="flex items-start">
            {result.success ? (
              <Check size={16} className="text-green-600 mr-2 mt-0.5" />
            ) : (
              <AlertCircle size={16} className="text-red-600 mr-2 mt-0.5" />
            )}
            <div>
              <p className="font-medium">{result.message}</p>
              
              {result.success && result.colecciones && (
                <div className="mt-2">
                  <p className="text-sm font-medium mb-1">Resultado por colección:</p>
                  <div className="max-h-40 overflow-y-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-green-100">
                          <th className="p-1 text-left">Colección</th>
                          <th className="p-1 text-left">Estado</th>
                          <th className="p-1 text-left">Detalles</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.colecciones.map((col, index) => (
                          <tr 
                            key={col.nombre} 
                            className={index % 2 === 0 ? 'bg-green-50' : 'bg-white'}
                          >
                            <td className="p-1">{col.nombre}</td>
                            <td className="p-1">
                              <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                                col.estado === 'creada' 
                                  ? 'bg-green-100 text-green-800' 
                                  : col.estado === 'existente'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-red-100 text-red-800'
                              }`}>
                                {col.estado}
                              </span>
                            </td>
                            <td className="p-1">
                              {col.documentos !== undefined && `${col.documentos} docs`}
                              {col.error && <span className="text-red-600">{col.error}</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      <p className="mt-4 text-xs text-gray-500">
        Nota: Esta inicialización es un paso previo que prepara la estructura necesaria para que el 
        dashboard funcione correctamente. No se borra ningún dato existente.
      </p>
    </div>
  );
};

export default InitializeFirebase;