import React, { useState } from 'react';
import { Menu, X, ChevronDown, LogOut, Settings, LayoutDashboard, DollarSign, Activity, Users, Layers } from 'lucide-react';

// Componentes de layout
import Sidebar from '../components/layout/Sidebar';

// Componentes del dashboard
import FiltroDashboard from '../components/dashboard/FiltroDashboard';
import KpisDashboard from '../components/dashboard/KpisDashboard';
import AnalisisCostos from '../components/dashboard/AnalisisCostos';
import AnalisisProductividad from '../components/dashboard/AnalisisProductividad';
import AnalisisTrabajadores from '../components/dashboard/AnalisisTrabajadores';
import ModuloReportes from '../components/dashboard/ModuloReportes';

// Importar el proveedor de contexto
import { DashboardProvider } from '../context/DashboardContext';

const Dashboard = () => {
  const [moduloActivo, setModuloActivo] = useState('resumen');
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);
  const [perfilDesplegado, setPerfilDesplegado] = useState(false);
  
  // Información del usuario simulada
  const usuarioInfo = {
    nombre: "Abel Mancilla",
    cargo: "Supervisor de Obra",
    email: "abel.mancilla@hergonsa.pe",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg"
  };
  
  // Función para renderizar el contenido según el módulo activo
  const renderizarContenido = () => {
    switch (moduloActivo) {
      case 'resumen':
        return (
          <>
            <FiltroDashboard />
            <div className="mt-4 mb-4">
              <KpisDashboard />
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-4">
              <AnalisisCostos />
              <AnalisisProductividad />
            </div>
            <div className="mt-4">
              <AnalisisTrabajadores />
            </div>
          </>
        );
      case 'costos':
        return (
          <>
            <FiltroDashboard />
            <div className="mt-4">
              <AnalisisCostos />
            </div>
          </>
        );
      case 'productividad':
        return (
          <>
            <FiltroDashboard />
            <div className="mt-4">
              <AnalisisProductividad />
            </div>
          </>
        );
      case 'trabajadores':
        return (
          <>
            <FiltroDashboard />
            <div className="mt-4">
              <AnalisisTrabajadores />
            </div>
          </>
        );
      case 'reportes':
        return (
          <>
            <FiltroDashboard />
            <div className="mt-4">
              <ModuloReportes />
            </div>
          </>
        );
      default:
        return <div>Selecciona un módulo</div>;
    }
  };

  return (
    <DashboardProvider>
      <div className="flex h-screen bg-gray-100">
        {/* Sidebar para escritorio */}
        <Sidebar 
          moduloActivo={moduloActivo} 
          setModuloActivo={setModuloActivo} 
        />
      
      {/* Contenido principal */}
      <div className="flex-1 md:ml-64 flex flex-col">
        {/* Barra superior */}
        <header className="bg-white shadow-sm z-10">
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center">
              <button 
                className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-800 hover:bg-gray-100 focus:outline-none"
                onClick={() => setMenuMovilAbierto(true)}
              >
                <Menu size={24} />
              </button>
              <h1 className="text-lg font-bold text-gray-800 ml-2 md:ml-0">
                {moduloActivo === 'resumen' && 'Resumen General'}
                {moduloActivo === 'costos' && 'Análisis de Costos'}
                {moduloActivo === 'productividad' && 'Análisis de Productividad'}
                {moduloActivo === 'trabajadores' && 'Gestión de Trabajadores'}
                {moduloActivo === 'reportes' && 'Generación de Reportes'}
              </h1>
            </div>
            
            <div className="flex items-center">
              <div className="relative">
                <button
                  className="flex items-center text-gray-600 hover:text-gray-800 focus:outline-none"
                  onClick={() => setPerfilDesplegado(!perfilDesplegado)}
                >
                  <img src={usuarioInfo.avatar} alt="Perfil" className="w-8 h-8 rounded-full mr-2" />
                  <span className="hidden md:block mr-1">{usuarioInfo.nombre}</span>
                  <ChevronDown size={16} />
                </button>
                
                {perfilDesplegado && (
                  <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100">
                    <div className="py-1">
                      <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <Settings size={16} className="mr-2" />
                        Configuración
                      </button>
                      <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <LogOut size={16} className="mr-2" />
                        Cerrar sesión
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>
        
        {/* Sidebar móvil */}
        {menuMovilAbierto && (
          <div className="md:hidden fixed inset-0 flex z-40">
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setMenuMovilAbierto(false)}></div>
            
            <div className="relative flex-1 flex flex-col max-w-xs w-full pt-5 pb-4 bg-blue-800">
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <button
                  className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                  onClick={() => setMenuMovilAbierto(false)}
                >
                  <X className="h-6 w-6 text-white" />
                </button>
              </div>
              
              <div className="flex-shrink-0 flex items-center justify-center px-4">
                <h1 className="text-xl font-bold text-white">HERGONSA DASHBOARD</h1>
              </div>
              
              <div className="mt-5 flex-1 h-0 overflow-y-auto">
                <nav className="px-2">
                  <button 
                    onClick={() => {
                      setModuloActivo('resumen');
                      setMenuMovilAbierto(false);
                    }}
                    className={`flex items-center w-full px-4 py-3 mb-2 text-white rounded-md ${moduloActivo === 'resumen' ? 'bg-blue-700' : 'hover:bg-blue-700'}`}
                  >
                    <LayoutDashboard className="mr-3" size={20} />
                    <span>Resumen General</span>
                  </button>
                  
                  {/* Agregamos los demás botones del menú móvil */}
                  <button 
                    onClick={() => {
                      setModuloActivo('costos');
                      setMenuMovilAbierto(false);
                    }}
                    className={`flex items-center w-full px-4 py-3 mb-2 text-white rounded-md ${moduloActivo === 'costos' ? 'bg-blue-700' : 'hover:bg-blue-700'}`}
                  >
                    <DollarSign className="mr-3" size={20} />
                    <span>Análisis de Costos</span>
                  </button>
                  
                  <button 
                    onClick={() => {
                      setModuloActivo('productividad');
                      setMenuMovilAbierto(false);
                    }}
                    className={`flex items-center w-full px-4 py-3 mb-2 text-white rounded-md ${moduloActivo === 'productividad' ? 'bg-blue-700' : 'hover:bg-blue-700'}`}
                  >
                    <Activity className="mr-3" size={20} />
                    <span>Productividad</span>
                  </button>
                  
                  <button 
                    onClick={() => {
                      setModuloActivo('trabajadores');
                      setMenuMovilAbierto(false);
                    }}
                    className={`flex items-center w-full px-4 py-3 mb-2 text-white rounded-md ${moduloActivo === 'trabajadores' ? 'bg-blue-700' : 'hover:bg-blue-700'}`}
                  >
                    <Users className="mr-3" size={20} />
                    <span>Trabajadores</span>
                  </button>
                  
                  <button 
                    onClick={() => {
                      setModuloActivo('reportes');
                      setMenuMovilAbierto(false);
                    }}
                    className={`flex items-center w-full px-4 py-3 mb-2 text-white rounded-md ${moduloActivo === 'reportes' ? 'bg-blue-700' : 'hover:bg-blue-700'}`}
                  >
                    <Layers className="mr-3" size={20} />
                    <span>Reportes</span>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
        
        {/* Contenido principal */}
        <main className="flex-1 overflow-y-auto bg-gray-100 p-4">
          {renderizarContenido()}
        </main>
      </div>
    </DashboardProvider>
  );
};

export default Dashboard;