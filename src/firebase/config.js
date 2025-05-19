// src/firebase/config.js
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Configuraciones para cada obra
export const firebaseConfigs = {
  pruebas: {
    apiKey: "AIzaSyDIYhOKNaW9ezL_QTgf0PBvOECgIcIFNyM",
    authDomain: "pruebas-9e15f.firebaseapp.com",
    projectId: "pruebas-9e15f",
    storageBucket: "pruebas-9e15f.firebasestorage.app",
    messagingSenderId: "296337222687",
    appId: "1:296337222687:web:769e163e258d6c3f95392a"
  },
  obra1: {
    apiKey: "AIzaSyCXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    authDomain: "obra1-xxxxx.firebaseapp.com",
    projectId: "obra1-xxxxx",
    storageBucket: "obra1-xxxxx.appspot.com",
    messagingSenderId: "111111111111",
    appId: "1:111111111111:web:aaaaaaaaaaaaaaaaaaaa"
  },
  obra2: {
    apiKey: "AIzaSyDYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY",
    authDomain: "obra2-yyyyy.firebaseapp.com",
    projectId: "obra2-yyyyy",
    storageBucket: "obra2-yyyyy.appspot.com",
    messagingSenderId: "222222222222",
    appId: "1:222222222222:web:bbbbbbbbbbbbbbbbbbbb"
  },
  obra3: {
    apiKey: "AIzaSyDZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ",
    authDomain: "obra3-zzzzz.firebaseapp.com",
    projectId: "obra3-zzzzz",
    storageBucket: "obra3-zzzzz.appspot.com",
    messagingSenderId: "333333333333",
    appId: "1:333333333333:web:cccccccccccccccccccc"
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
    name: key.charAt(0).toUpperCase() + key.slice(1) // Capitalize the first letter
  }));
};