// src/components/layout/ProjectSelector.js
import React, { useState } from 'react';
import { getAvailableProjects } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import { Building, Check } from 'lucide-react';

const ProjectSelector = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { selectedProject, changeProject } = useAuth();
  const projects = getAvailableProjects();
  
  const handleProjectChange = (projectId) => {
    changeProject(projectId);
    setIsOpen(false);
  };
  
  const currentProjectName = projects.find(p => p.id === selectedProject)?.name || selectedProject;
  
  return (
    <div className="relative">
      <button
        className="flex items-center text-gray-600 hover:text-gray-800 bg-white p-2 rounded-md border border-gray-200 shadow-sm"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Building size={16} className="mr-2 text-blue-600" />
        <span className="mr-2">{currentProjectName}</span>
        <svg
          className={`h-4 w-4 text-gray-500 transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 py-2 w-48 bg-white rounded-md shadow-lg z-20 border border-gray-200">
          {projects.map((project) => (
            <button
              key={project.id}
              onClick={() => handleProjectChange(project.id)}
              className={`flex items-center w-full px-4 py-2 text-sm text-left 
                ${selectedProject === project.id ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              {selectedProject === project.id ? (
                <Check size={16} className="mr-2 text-blue-600" />
              ) : (
                <div className="w-4 mr-2" />
              )}
              {project.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectSelector;