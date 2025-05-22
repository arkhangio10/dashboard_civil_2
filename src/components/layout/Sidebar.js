// src/components/layout/Sidebar.js
import React from 'react';
import { LayoutDashboard, DollarSign, Activity, Users, Layers, Calendar, FileText, Settings, LogOut, Database, BarChart2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ moduloActivo, setModuloActivo }) => {
  const { currentUser, logout, selectedProject } = useAuth();
  const navigate = useNavigate();
  
  // Método para cerrar sesión
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };
  
  return (
    <div className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 bg-blue-800 text-white">
      <div className="flex items-center justify-center h-16 border-b border-blue-700">
        <h1 className="text-xl font-bold">HERGONSA DASHBOARD</h1>
      </div>
      
      <div className="py-2 px-4 border-b border-blue-700">
        <div className="flex items-center py-1">
          <span className="text-sm text-blue-300">Proyecto actual:</span>
        </div>
        <div className="font-medium truncate text-white">{selectedProject.toUpperCase()}</div>
      </div>
      
      <div className="flex-grow overflow-y-auto">
        <nav className="px-2 py-4">
          <button 
            onClick={() => setModuloActivo('resumen')}
            className={`flex items-center w-full px-4 py-3 mb-2 rounded-md ${moduloActivo === 'resumen' ? 'bg-blue-700' : 'hover:bg-blue-700'}`}
          >
            <LayoutDashboard className="mr-3" size={20} />
            <span>Resumen General</span>
          </button>
          
          {/* Nuevo botón para Resumen Diario */}
          <button 
            onClick={() => setModuloActivo('resumenDiario')}
            className={`flex items-center w-full px-4 py-3 mb-2 rounded-md ${moduloActivo === 'resumenDiario' ? 'bg-blue-700' : 'hover:bg-blue-700'}`}
          >
            <BarChart2 className="mr-3" size={20} />
            <span>Resumen Diario</span>
          </button>
          
          <button 
            onClick={() => setModuloActivo('costos')}
            className={`flex items-center w-full px-4 py-3 mb-2 rounded-md ${moduloActivo === 'costos' ? 'bg-blue-700' : 'hover:bg-blue-700'}`}
          >
            <DollarSign className="mr-3" size={20} />
            <span>Análisis de Costos</span>
          </button>
          
          <button 
            onClick={() => setModuloActivo('productividad')}
            className={`flex items-center w-full px-4 py-3 mb-2 rounded-md ${moduloActivo === 'productividad' ? 'bg-blue-700' : 'hover:bg-blue-700'}`}
          >
            <Activity className="mr-3" size={20} />
            <span>Productividad</span>
          </button>
          
          <button 
            onClick={() => setModuloActivo('trabajadores')}
            className={`flex items-center w-full px-4 py-3 mb-2 rounded-md ${moduloActivo === 'trabajadores' ? 'bg-blue-700' : 'hover:bg-blue-700'}`}
          >
            <Users className="mr-3" size={20} />
            <span>Trabajadores</span>
          </button>
          
          <button 
            onClick={() => setModuloActivo('reportes')}
            className={`flex items-center w-full px-4 py-3 mb-2 rounded-md ${moduloActivo === 'reportes' ? 'bg-blue-700' : 'hover:bg-blue-700'}`}
          >
            <Layers className="mr-3" size={20} />
            <span>Reportes</span>
          </button>
          
          <hr className="my-4 border-blue-700" />
        
          <button 
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 mb-2 rounded-md text-red-300 hover:bg-red-700 hover:text-white"
          >
            <LogOut className="mr-3" size={20} />
            <span>Cerrar sesión</span>
          </button>
        </nav>
      </div>
      
      <div className="p-4 border-t border-blue-700">
        <div className="flex items-center">
          <img 
            src={currentUser?.photoURL || "https://randomuser.me/api/portraits/men/32.jpg"} 
            alt="Perfil" 
            className="w-10 h-10 rounded-full mr-3" 
          />
          <div>
            <p className="font-medium">{currentUser?.displayName || currentUser?.email || "Usuario"}</p>
            <p className="text-sm text-blue-300">Supervisor de Obra</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;