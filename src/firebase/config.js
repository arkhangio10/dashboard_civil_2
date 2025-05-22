// src/firebase/config.js
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Configuración principal de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDIYhOKNaW9ezL_QTgf0PBvOECgIcIFNyM",
  authDomain: "pruebas-9e15f.firebaseapp.com",
  projectId: "pruebas-9e15f",
  storageBucket: "pruebas-9e15f.firebasestorage.app",
  messagingSenderId: "296337222687",
  appId: "1:296337222687:web:769e163e258d6c3f95392a"
};

// Configuraciones para cada obra (mantenemos pruebas como la principal)
export const firebaseConfigs = {//CENEPA=REPORTE-PRODUCCION
  pruebas: firebaseConfig,
  CENEPA: {
    
    apiKey: "AIzaSyBd3pzTO0NrlSLUr8g5KzycgD46-lfav30",
    authDomain: "reporte-produccion.firebaseapp.com",
    projectId: "reporte-produccion",
    storageBucket: "reporte-produccion.firebasestorage.app",
    messagingSenderId: "383552982159",
    appId: "1:383552982159:web:c91b92b4f428c95947f4fa"
  },
  obra2: { //  MARA = REPORTE - PRODUCCION_2
    
    apiKey: "AIzaSyAr4wolo5g206cv9up-KwWf1MfaklEyVy8",
    authDomain: "reporte-produccion-2.firebaseapp.com",
    projectId: "reporte-produccion-2",
    storageBucket: "reporte-produccion-2.firebasestorage.app",
    messagingSenderId: "551144835546",
    appId: "1:551144835546:web:4c0233817c80c7c08bd8e3"
  },
  obra3: {//FONSECA = REPORTE - PRODUCCION_3
    
    apiKey: "AIzaSyAgxMCPOKYiTyg58oMcx64ZyjuZrwcmO2A",
    authDomain: "reporte-produccion-3.firebaseapp.com",
    projectId: "reporte-produccion-3",
    storageBucket: "reporte-produccion-3.firebasestorage.app",
    messagingSenderId: "29278619694",
    appId: "1:29278619694:web:0e4a826fe4c54e1d14f7bf"
  }
};

// Variables para guardar las instancias actuales
let currentApp = null;
let currentAuth = null;
let currentDb = null;
let currentProjectId = null;

// Esta función inicializa Firebase con la configuración correcta
export const initializeFirebase = (projectId) => {
  try {
    // Si ya tenemos una instancia con el mismo projectId, la devolvemos
    if (currentProjectId === projectId && currentApp && currentAuth && currentDb) {
      return { app: currentApp, auth: currentAuth, db: currentDb };
    }
    
    // Obtenemos la configuración correcta según el projectId
    const config = firebaseConfigs[projectId] || firebaseConfigs.pruebas;
    console.log(`Inicializando Firebase para proyecto: ${projectId}`);
    
    // Primero verificamos si ya hay una app inicializada
    const apps = getApps();
    
    if (apps.length) {
      // Si ya existe una app, la usamos en lugar de crear una nueva
      currentApp = getApp();
    } else {
      // Inicializamos una nueva app
      currentApp = initializeApp(config);
    }
    
    // Obtenemos las instancias de autenticación y Firestore
    currentAuth = getAuth(currentApp);
    currentDb = getFirestore(currentApp);
    currentProjectId = projectId;
    
    return { app: currentApp, auth: currentAuth, db: currentDb };
  } catch (error) {
    console.error("Error al inicializar Firebase:", error);
    throw error;
  }
};

// Función para obtener la lista de obras disponibles
export const getAvailableProjects = () => {
  return Object.keys(firebaseConfigs).map(key => ({
    id: key,
    // Convertir nombres a formato más legible
    name: formatProjectName(key)
  }));
};

// Función auxiliar para formatear nombres de proyectos
const formatProjectName = (projectId) => {
  const nameMap = {
    pruebas: "Pruebas",
    CENEPA: "CENEPA",
    obra2: "MARA", 
    obra3: "FONSECA"
  };
  
  // Si hay un nombre personalizado, usarlo; sino, capitalizar el ID
  return nameMap[projectId] || projectId.charAt(0).toUpperCase() + projectId.slice(1).replace(/_/g, ' ');
};