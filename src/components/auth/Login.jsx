import React, { useState } from 'react';
import { Eye, EyeOff, User, Lock, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Login = ({ isOpen, onClose, onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleSubmit = async () => {
    if (!formData.username.trim() || !formData.password.trim()) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      // Récupérer l'état de la checkbox "Se souvenir de moi"
      const rememberCheckbox = document.getElementById('remember');
      
      const response = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          remember: rememberCheckbox ? rememberCheckbox.checked : false
        })
      });

      const data = await response.json();

      if (data.success) {
        // Stocker le token et les infos utilisateur
        localStorage.setItem('auth_token', data.data.token);
        localStorage.setItem('user_info', JSON.stringify(data.data.user));
        
        console.log('Connexion réussie:', data.data.user);
        console.log('Token stocké:', data.data.token);
        
        // Notifier le composant parent du succès
        if (onLoginSuccess) {
          onLoginSuccess(data.data.user);
        }
        
        // Fermer le dropdown et rediriger
        onClose();
        navigate('/dashboard');
        
      } else {
        if (data.errors && data.errors.username) {
          setError(data.errors.username[0]);
        } else {
          setError(data.message || 'Erreur de connexion');
        }
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
      setError('Erreur de connexion au serveur. Vérifiez votre connexion internet.');
    } finally {
      setIsLoading(false);
    }
  };

  // Gestion de la soumission par Enter
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleClose = () => {
    onClose();
    setFormData({ username: '', password: '' });
    setError('');
    setShowPassword(false);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay de flou pour l'arrière-plan */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/10 backdrop-blur-sm z-40 transition-all duration-500 ease-in-out" />
      )}
      
      {/* Login Dropdown */}
      <div 
        className={`fixed top-20 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white/95 backdrop-blur-md shadow-2xl border border-gray-200 rounded-2xl z-50 transition-all duration-500 ease-in-out ${
          isOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
        }`}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="rounded-lg shadow-lg overflow-hidden bg-white p-1">
                <img 
                  src="/images/logoPharmacie.png" 
                  alt="Logo PharmaGestion" 
                  className="h-8 w-8 object-contain"
                />
              </div>
              <div className="ml-3">
                <h2 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Espace pour les pharmaciens
                </h2>
                <p className="text-sm text-gray-500">Connexion sécurisée</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2.5 bg-red-500 hover:bg-red-600 text-white rounded-full transition-all duration-200 transform hover:scale-110 shadow-lg"
              title="Fermer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">!</span>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
                <button
                  onClick={() => setError('')}
                  className="ml-auto text-red-400 hover:text-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Nom d'utilisateur
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                  placeholder="Votre nom d'utilisateur"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember"
                  name="remember"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={isLoading}
                />
                <label htmlFor="remember" className="ml-3 block text-sm text-gray-700">
                  Se souvenir de moi
                </label>
              </div>
              <div className="text-sm">
                <a href="#" className="text-blue-600 hover:text-blue-500 transition-colors font-medium">
                  Mot de passe oublié ?
                </a>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Connexion...
                </div>
              ) : (
                'Se connecter'
              )}
            </button>
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded-xl border border-blue-200">
            <div className="flex">
              <div className="flex-shrink-0">
                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">i</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-800">
                  <strong>Première connexion ?</strong> Contactez votre administrateur système.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;