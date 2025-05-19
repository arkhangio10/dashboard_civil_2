// src/pages/Login.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAvailableProjects } from '../firebase/config';
import { LogIn, Building, Lock, Mail } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [project, setProject] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [projectList, setProjectList] = useState([]);
  
  const { login, selectedProject, changeProject, currentUser } = useAuth();
  const navigate = useNavigate();

  // Si ya hay un usuario autenticado, redirigir al dashboard
  useEffect(() => {
    if (currentUser) {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  // Cargar la lista de proyectos
  useEffect(() => {
    const projects = getAvailableProjects();
    setProjectList(projects);
    
    // Establecer el proyecto predeterminado
    if (!project) {
      setProject(selectedProject);
    }

    // Intentar cargar credenciales guardadas
    const savedEmail = localStorage.getItem('rememberedEmail');
    const savedProject = localStorage.getItem('rememberedProject');
    
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
    
    if (savedProject) {
      setProject(savedProject);
    }
  }, [project, selectedProject]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Por favor ingresa correo y contraseña');
      return;
    }
    
    try {
      setError('');
      setLoading(true);
      
      // Cambia el proyecto seleccionado si es diferente
      if (project !== selectedProject) {
        changeProject(project);
      }
      
      // Guarda las credenciales si "Recordarme" está activado
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
        localStorage.setItem('rememberedProject', project);
      } else {
        localStorage.removeItem('rememberedEmail');
        localStorage.removeItem('rememberedProject');
      }
      
      // Intenta iniciar sesión
      const success = await login(email, password);
      
      if (success) {
        navigate('/dashboard');
      }
    } catch (err) {
      setError('Error al iniciar sesión. Verifica tus credenciales.');
      console.error(err);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="flex items-center justify-center mb-6">
          <LogIn size={28} className="text-blue-600 mr-2" />
          <h1 className="text-2xl font-bold text-blue-800">HERGONSA Dashboard</h1>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-1 flex items-center" htmlFor="project">
              <Building size={16} className="mr-2" />
              Obra / Proyecto
            </label>
            <select
              id="project"
              value={project}
              onChange={(e) => setProject(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {projectList.map((proj) => (
                <option key={proj.id} value={proj.id}>
                  {proj.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-gray-700 mb-1 flex items-center" htmlFor="email">
              <Mail size={16} className="mr-2" />
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="tu@correo.com"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 mb-1 flex items-center" htmlFor="password">
              <Lock size={16} className="mr-2" />
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="********"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                Recordarme
              </label>
            </div>
            <div className="text-sm">
              <a href="#" className="text-blue-600 hover:text-blue-500">
                ¿Olvidaste tu contraseña?
              </a>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className={`w-full flex items-center justify-center bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition ${
              loading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Iniciando sesión...
              </>
            ) : (
              'Iniciar sesión'
            )}
          </button>
        </form>
        
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Sistema de Producción y Control de Obra</p>
          <p className="mt-1 text-xs">© 2025 HERGONSA</p>
        </div>
      </div>
    </div>
  );
};

export default Login;