// src/components/dashboard/DebugFirebase.js
import React, { useState, useEffect } from 'react';
import { collection, getDocs, getDoc, doc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { AlertCircle, Database, RefreshCw, Check, X, FileText, BarChart2, Users, Layers } from 'lucide-react';

const DebugFirebase = () => {
  const { db, selectedProject } = useAuth();
  const [status, setStatus] = useState('pending'); // pending, success, error
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState('');
  const [collectionData, setCollectionData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(false);
  
  // Lista de colecciones específicas del dashboard
  const dashboardCollections = [
    { id: 'Dashboard_Resumenes', name: 'Resúmenes de Dashboard', icon: <BarChart2 size={16} className="mr-2 text-blue-600" /> },
    { id: 'Trabajadores', name: 'Trabajadores', icon: <Users size={16} className="mr-2 text-green-600" /> },
    { id: 'Actividades_Resumen', name: 'Resumen de Actividades', icon: <Layers size={16} className="mr-2 text-purple-600" /> },
    { id: 'Partidas_Avance', name: 'Partidas de Avance', icon: <BarChart2 size={16} className="mr-2 text-amber-600" /> },
    { id: 'Reportes_Links', name: 'Enlaces de Reportes', icon: <FileText size={16} className="mr-2 text-red-600" /> },
    { id: 'Spreadsheets', name: 'Hojas de Cálculo', icon: <FileText size={16} className="mr-2 text-teal-600" /> },
    { id: 'Actividades_Resumen_Diario', name: 'Actividades Diarias', icon: <BarChart2 size={16} className="mr-2 text-indigo-600" /> },
    { id: 'Actividades_Resumen_Mensual', name: 'Actividades Mensuales', icon: <BarChart2 size={16} className="mr-2 text-pink-600" /> }
  ];

  // Comprobar la conexión con Firebase al montar el componente
  useEffect(() => {
    checkConnection();
  }, [db, selectedProject]);

  // Función para comprobar la conexión con Firebase
  const checkConnection = async () => {
    setStatus('pending');
    setError(null);
    setCollections([]);
    
    if (!db) {
      setStatus('error');
      setError('No hay conexión con Firebase. Verificar configuración.');
      return;
    }
    
    try {
      // Primero verificar si existe alguna colección del dashboard
      let collectionExists = false;
      
      // Intentar verificar Dashboard_Resumenes (típicamente debería existir)
      try {
        const testDoc = await getDoc(doc(db, 'Dashboard_Resumenes', '_init'));
        if (testDoc.exists()) {
          collectionExists = true;
        }
      } catch (err) {
        console.log('Dashboard_Resumenes no inicializada');
      }
      
      // Si no existe, verificar Trabajadores
      if (!collectionExists) {
        try {
          const testDoc = await getDoc(doc(db, 'Trabajadores', '_init'));
          if (testDoc.exists()) {
            collectionExists = true;
          }
        } catch (err) {
          console.log('Trabajadores no inicializada');
        }
      }
      
      if (collectionExists) {
        setStatus('success');
        setCollections(dashboardCollections.map(c => c.id));
        
        // Seleccionar Dashboard_Resumenes por defecto
        setSelectedCollection('Dashboard_Resumenes');
        loadCollectionData('Dashboard_Resumenes');
      } else {
        // Verificar si existe alguna colección en la base de datos
        try {
          const anyCollection = await getDocs(collection(db, 'Reportes'));
          if (!anyCollection.empty) {
            setStatus('warning');
            setError('Las colecciones del dashboard no están inicializadas. Se requiere ejecutar inicializarColecciones()');
            setCollections(['Reportes']);
          } else {
            setStatus('error');
            setError('No se encontraron colecciones en la base de datos.');
          }
        } catch (err) {
          setStatus('error');
          setError(`Error de conexión: ${err.message}`);
        }
      }
    } catch (err) {
      console.error('Error al verificar conexión:', err);
      setStatus('error');
      setError(err.message);
    }
  };

  // Función para cargar datos de una colección
  const loadCollectionData = async (collectionName) => {
    if (!collectionName || !db) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const querySnapshot = await getDocs(collection(db, collectionName));
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Limitar a 5 documentos para la vista previa
      const previewData = data.slice(0, 5);
      setCollectionData(previewData);
      
      console.log(`Datos de colección ${collectionName}:`, previewData);
    } catch (err) {
      console.error(`Error al cargar datos de ${collectionName}:`, err);
      setError(`Error al cargar datos: ${err.message}`);
      setCollectionData([]);
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambio de colección
  const handleCollectionChange = (e) => {
    const collection = e.target.value;
    setSelectedCollection(collection);
    loadCollectionData(collection);
  };

  // Renderizar el estado del ícono de cada colección
  const renderCollectionStatus = (collectionId) => {
    if (collections.includes(collectionId)) {
      return <Check size={16} className="text-green-600" />;
    }
    return <X size={16} className="text-red-600" />;
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold flex items-center">
          <Database size={20} className="mr-2 text-blue-600" />
          Depuración Firebase
        </h2>
        <button 
          onClick={() => setExpanded(!expanded)}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          {expanded ? 'Ocultar detalles' : 'Mostrar detalles'}
        </button>
      </div>

      <div className="flex items-center space-x-4 mb-3">
        <div className="flex items-center">
          <span className="mr-2">Estado:</span>
          {status === 'pending' && (
            <span className="flex items-center text-yellow-600">
              <RefreshCw size={16} className="mr-1 animate-spin" />
              Verificando...
            </span>
          )}
          {status === 'success' && (
            <span className="flex items-center text-green-600">
              <Check size={16} className="mr-1" />
              Conectado
            </span>
          )}
          {status === 'warning' && (
            <span className="flex items-center text-yellow-600">
              <AlertCircle size={16} className="mr-1" />
              Parcial
            </span>
          )}
          {status === 'error' && (
            <span className="flex items-center text-red-600">
              <X size={16} className="mr-1" />
              Error de conexión
            </span>
          )}
        </div>
        
        <div>
          <span className="mr-2">Proyecto:</span>
          <span className="font-medium">{selectedProject}</span>
        </div>
        
        <button 
          onClick={checkConnection}
          className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          <RefreshCw size={14} className="inline mr-1" />
          Refrescar
        </button>
      </div>

      {error && (
        <div className="bg-red-50 p-3 rounded-md border border-red-200 mb-3">
          <div className="flex items-start">
            <AlertCircle size={16} className="text-red-600 mr-2 mt-0.5" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Dashboard Collections Status */}
      <div className="mb-4 bg-gray-50 p-3 rounded-md border border-gray-200">
        <h3 className="text-sm font-medium mb-2">Estado de Colecciones del Dashboard:</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {dashboardCollections.map(collection => (
            <div 
              key={collection.id}
              className={`flex items-center justify-between p-2 rounded-md ${
                collections.includes(collection.id) 
                  ? 'bg-green-50 border border-green-100' 
                  : 'bg-gray-100 border border-gray-200'
              }`}
            >
              <div className="flex items-center">
                {collection.icon}
                <span className="text-xs">{collection.name}</span>
              </div>
              {renderCollectionStatus(collection.id)}
            </div>
          ))}
        </div>
      </div>

      {expanded && status !== 'error' && (
        <>
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Explorar colección:
            </label>
            <select
              value={selectedCollection}
              onChange={handleCollectionChange}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="">Seleccionar colección...</option>
              {dashboardCollections.filter(c => collections.includes(c.id)).map(collection => (
                <option key={collection.id} value={collection.id}>
                  {collection.name}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="flex justify-center my-4">
              <RefreshCw size={24} className="animate-spin text-blue-600" />
            </div>
          ) : (
            selectedCollection && (
              <div>
                <h3 className="text-sm font-medium mb-2">
                  Vista previa de {selectedCollection} ({collectionData.length} documentos):
                </h3>
                <div className="bg-gray-50 p-3 rounded-md border border-gray-200 overflow-x-auto max-h-64 overflow-y-auto">
                  {collectionData.length > 0 ? (
                    <pre className="text-xs whitespace-pre-wrap">
                      {JSON.stringify(collectionData, null, 2)}
                    </pre>
                  ) : (
                    <p className="text-sm text-gray-500">No hay datos en esta colección.</p>
                  )}
                </div>
                
                <p className="mt-2 text-xs text-gray-500">
                  Mostrando los primeros 5 documentos. Para ver todos los datos, consulta la consola del navegador.
                </p>
              </div>
            )
          )}
        </>
      )}
    </div>
  );
};

export default DebugFirebase;