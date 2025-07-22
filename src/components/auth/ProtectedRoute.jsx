import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  // Vérifier si l'utilisateur est authentifié
  const isAuthenticated = () => {
    const token = localStorage.getItem('auth_token');
    const userInfo = localStorage.getItem('user_info');
    
    // Vérifier que le token existe et n'est pas vide
    if (!token || token === 'null' || token === 'undefined') {
      return false;
    }
    
    // Vérifier que les infos utilisateur existent
    if (!userInfo || userInfo === 'null' || userInfo === 'undefined') {
      return false;
    }
    
    try {
      // Vérifier que les infos utilisateur sont valides (JSON parsable)
      const user = JSON.parse(userInfo);
      return user && user.id; // S'assurer que l'utilisateur a un ID
    } catch (error) {
      console.error('Erreur lors du parsing des infos utilisateur:', error);
      return false;
    }
  };

  // Si l'utilisateur n'est pas authentifié, rediriger vers le login
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  // Si l'utilisateur est authentifié, afficher le contenu protégé
  return children;
};

export default ProtectedRoute;