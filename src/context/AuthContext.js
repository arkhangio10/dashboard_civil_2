// src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { 
  signInWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut 
} from 'firebase/auth';
import { initializeFirebase } from '../firebase/config';

// Crear el contexto
export const AuthContext = createContext();

// Proveedor del contexto
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProject, setSelectedProject] = useState(() => {
    // Intentar recuperar de localStorage
    return localStorage.getItem('selectedProject') || 'pruebas';
  });
  
  // Utilizar una referencia para las instancias de Firebase
  const [firebaseInstances, setFirebaseInstances] = useState(() => {
    try {
      return initializeFirebase(selectedProject);
    } catch (error) {
      console.error("Error al inicializar Firebase:", error);
      return { auth: null, db: null, app: null };
    }
  });

  // Inicializar el listener de autenticación cuando cambien las instancias
  useEffect(() => {
    if (!firebaseInstances.auth) return;
    
    const unsubscribe = onAuthStateChanged(firebaseInstances.auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, [firebaseInstances.auth]);

  // Guardar proyecto seleccionado en localStorage
  useEffect(() => {
    localStorage.setItem('selectedProject', selectedProject);
  }, [selectedProject]);

  // Función para iniciar sesión
  const login = async (email, password) => {
    try {
      setError(null);
      if (!firebaseInstances.auth) {
        throw new Error("Firebase no ha sido inicializado correctamente");
      }
      await signInWithEmailAndPassword(firebaseInstances.auth, email, password);
      return true;
    } catch (err) {
      console.error("Error al iniciar sesión:", err);
      setError(err.message);
      return false;
    }
  };

  // Función para cerrar sesión
  const logout = async () => {
    try {
      if (!firebaseInstances.auth) {
        throw new Error("Firebase no ha sido inicializado correctamente");
      }
      await signOut(firebaseInstances.auth);
      return true;
    } catch (err) {
      console.error("Error al cerrar sesión:", err);
      setError(err.message);
      return false;
    }
  };

  // Función para cambiar el proyecto seleccionado
  const changeProject = (projectId) => {
    if (selectedProject === projectId) return;
    
    try {
      setLoading(true);
      setSelectedProject(projectId);
      
      // Reinicializar Firebase con la nueva configuración
      const newInstances = initializeFirebase(projectId);
      setFirebaseInstances(newInstances);
      
    } catch (error) {
      console.error("Error al cambiar de proyecto:", error);
      setError("No se pudo cambiar al proyecto seleccionado");
      setLoading(false);
    }
  };

  // Valor a compartir en el contexto
  const value = {
    currentUser,
    loading,
    error,
    login,
    logout,
    selectedProject,
    changeProject,
    db: firebaseInstances.db,
    auth: firebaseInstances.auth
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthContext;