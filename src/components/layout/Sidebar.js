// src/components/layout/Sidebar.js
import React from 'react';
import { LayoutDashboard, DollarSign, Activity, Users, Layers, Calendar, FileText, Settings } from 'lucide-react';

const Sidebar = ({ moduloActivo, setModuloActivo }) => {
  return (
    <div className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 bg-blue-800 text-white">
      <div className="flex items-center justify-center h-16 border-b border-blue-700">
        <h1 className="text-xl font-bold">HERGONSA DASHBOARD</h1>
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
          
          <button className="flex items-center w-full px-4 py-3 mb-2 rounded-md hover:bg-blue-700">
            <Calendar className="mr-3" size={20} />
            <span>Programación</span>
          </button>
          
          <button className="flex items-center w-full px-4 py-3 mb-2 rounded-md hover:bg-blue-700">
            <FileText className="mr-3" size={20} />
            <span>Documentación</span>
          </button>
          
          <button className="flex items-center w-full px-4 py-3 mb-2 rounded-md hover:bg-blue-700">
            <Settings className="mr-3" size={20} />
            <span>Configuración</span>
          </button>
        </nav>
      </div>
      
      <div className="p-4 border-t border-blue-700">
        <div className="flex items-center">
          <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Perfil" className="w-10 h-10 rounded-full mr-3" />
          <div>
            <p className="font-medium">Abel Mancilla</p>
            <p className="text-sm text-blue-300">Supervisor de Obra</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;