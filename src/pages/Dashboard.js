// src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import Sidebar from '../components/layout/Sidebar';
import ProjectSelector from '../components/layout/ProjectSelector';
import KpisDashboard from '../components/dashboard/KpisDashboard';
import FiltroDashboard from '../components/dashboard/FiltroDashboard';
import AnalisisCostos from '../components/dashboard/AnalisisCostos';
import AnalisisProductividad from '../components/dashboard/AnalisisProductividad';
import AnalisisTrabajadores from '../components/dashboard/AnalisisTrabajadores';
import ModuloReportes from '../components/dashboard/ModuloReportes';
import DataModeToggle from '../components/dashboard/DataModeToggle';
import DebugFirebase from '../components/dashboard/DebugFirebase';
import InitializeFirebase from '../components/dashboard/InitializeFirebase';
import { DashboardProvider } from '../context/DashboardContext';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [moduloActivo, setModuloActivo] = useState('resumen');
  const [menuMobile, setMenuMobile] = useState(false);

  useEffect(() => {
    // Si lo necesitas, puedes implementar lógica adicional cuando el componente se monte
    console.log('Dashboard montado');
  }, []);

  // Renderizar módulo según la selección
  const renderizarModulo = () => {
    switch (moduloActivo) {
      case 'resumen':
        return (
          <>
            <div className="grid grid-cols-1 gap-4 mb-4">
              <KpisDashboard />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
              <AnalisisCostos />
              <AnalisisProductividad />
            </div>
          </>
        );
      case 'costos':
        return <AnalisisCostos />;
      case 'productividad':
        return <AnalisisProductividad />;
      case 'trabajadores':
        return <AnalisisTrabajadores />;
      case 'reportes':
        return <ModuloReportes />;
      case 'firebase':
        return (
          <div className="grid grid-cols-1 gap-4">
            <DebugFirebase />
            <InitializeFirebase />
          </div>
        );
      default:
        return <div>Selecciona un módulo del menú</div>;
    }
  };

  return (
    <DashboardProvider>
      <div className="flex h-screen bg-gray-100">
        {/* Sidebar para desktop */}
        <Sidebar moduloActivo={moduloActivo} setModuloActivo={setModuloActivo} />
        
        {/* Contenido principal */}
        <div className="flex-1 flex flex-col overflow-hidden md:ml-64">
          {/* Header */}
          <header className="bg-white shadow-sm z-10">
            <div className="px-4 py-3 flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold text-gray-800">Dashboard Producción</h1>
                <p className="text-sm text-gray-600">
                  Bienvenido, {currentUser?.displayName || currentUser?.email || "Usuario"}
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                <ProjectSelector />
                
                {/* Botón para menú móvil */}
                <button 
                  className="md:hidden bg-blue-600 text-white p-2 rounded-md"
                  onClick={() => setMenuMobile(!menuMobile)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                  </svg>
                </button>
              </div>
            </div>
          </header>
          
          {/* Contenido principal con scroll */}
          <main className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-1 gap-4 mb-4">
              <FiltroDashboard />
              <DataModeToggle />
            </div>
            
            {renderizarModulo()}
          </main>
        </div>
        
        {/* Menú móvil */}
        {menuMobile && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden">
            <div className="bg-blue-800 text-white w-64 h-full p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">HERGONSA DASHBOARD</h2>
                <button onClick={() => setMenuMobile(false)}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <nav>
                <button 
                  onClick={() => {
                    setModuloActivo('resumen');
                    setMenuMobile(false);
                  }}
                  className={`flex items-center w-full px-4 py-3 mb-2 rounded-md ${moduloActivo === 'resumen' ? 'bg-blue-700' : 'hover:bg-blue-700'}`}
                >
                  <span>Resumen General</span>
                </button>
                
                <button 
                  onClick={() => {
                    setModuloActivo('costos');
                    setMenuMobile(false);
                  }}
                  className={`flex items-center w-full px-4 py-3 mb-2 rounded-md ${moduloActivo === 'costos' ? 'bg-blue-700' : 'hover:bg-blue-700'}`}
                >
                  <span>Análisis de Costos</span>
                </button>
                
                <button 
                  onClick={() => {
                    setModuloActivo('productividad');
                    setMenuMobile(false);
                  }}
                  className={`flex items-center w-full px-4 py-3 mb-2 rounded-md ${moduloActivo === 'productividad' ? 'bg-blue-700' : 'hover:bg-blue-700'}`}
                >
                  <span>Productividad</span>
                </button>
                
                <button 
                  onClick={() => {
                    setModuloActivo('trabajadores');
                    setMenuMobile(false);
                  }}
                  className={`flex items-center w-full px-4 py-3 mb-2 rounded-md ${moduloActivo === 'trabajadores' ? 'bg-blue-700' : 'hover:bg-blue-700'}`}
                >
                  <span>Trabajadores</span>
                </button>
                
                <button 
                  onClick={() => {
                    setModuloActivo('reportes');
                    setMenuMobile(false);
                  }}
                  className={`flex items-center w-full px-4 py-3 mb-2 rounded-md ${moduloActivo === 'reportes' ? 'bg-blue-700' : 'hover:bg-blue-700'}`}
                >
                  <span>Reportes</span>
                </button>
              </nav>
            </div>
          </div>
        )}
      </div>
    </DashboardProvider>
  );
};

export default Dashboard;