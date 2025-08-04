import React, { useState, useEffect, useCallback } from 'react';
import { Pill, LogOut, User, FileText, Users, Clock, UserCircle, Package, Activity, Home } from 'lucide-react';
import ApiService from '../../Services/ApiService';
import { useNavigate } from 'react-router-dom';

import DashboardStats from './DashboardStats';
import MedicamentManagement from './MedicamentManagement';
import MedecinManagement from './MedecinManagement';
import OrdonnanceManagement from './OrdonnanceManagement';
import HistoriqueClient from './HistoriqueClient';

const PharmacyDashboard = () => {
  const [currentView, setCurrentView] = useState('statistiques'); // Changé de 'accueil' à 'statistiques'
  const [medicaments, setMedicaments] = useState([]);
  const [ordonnances, setOrdonnances] = useState([]);
  const [medecins, setMedecins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastUpdate, setLastUpdate] = useState(null);

  // États pour la gestion des médecins 
  const [showMedecinForm, setShowMedecinForm] = useState(false);
  const [editingMedecin, setEditingMedecin] = useState(null);
  
  const navigate = useNavigate();

  // Fonction pour charger les médicaments
  const loadMedicaments = useCallback(async () => {
    try {
        console.log('🔄 Chargement des médicaments...');
        const response = await ApiService.getMedicaments();
        console.log('📦 Réponse API médicaments:', response);
        
        let medicaments = [];
        
        // Adaptation au format de votre API
        if (response && response.success && response.data && response.data.data) {
            // Format paginé: response.data.data contient le tableau
            medicaments = Array.isArray(response.data.data) ? response.data.data : [];
            console.log('✅ Données paginées extraites');
        } else if (response && response.success && Array.isArray(response.data)) {
            // Format direct: response.data est le tableau
            medicaments = response.data;
            console.log('✅ Données directes extraites');
        } else if (Array.isArray(response)) {
            // Format très direct: response est le tableau
            medicaments = response;
            console.log('✅ Tableau direct extrait');
        } else {
            console.log('❌ Format de réponse non reconnu:', response);
            medicaments = []; 
        }
        
        console.log('✅ Médicaments extraits:', medicaments);
        console.log('📊 Nombre de médicaments:', medicaments.length);
        
        setMedicaments(medicaments);
        return medicaments;
        
    } catch (error) {
        console.error('❌ Erreur lors du chargement des médicaments:', error);
        setMedicaments([]); 
        return [];
    }
  }, []);

  // Fonction pour charger les ordonnances
  const loadOrdonnances = useCallback(async () => {
    try {
      console.log('🔄 Chargement des ordonnances...');
      
      if (typeof ApiService.getOrdonnances === 'function') {
        const response = await ApiService.getOrdonnances();
        console.log('📦 Réponse API ordonnances:', response);
        
        let ordonnancesData = [];
        
        if (Array.isArray(response)) {
          ordonnancesData = response;
        } else if (response && response.data && Array.isArray(response.data)) {
          ordonnancesData = response.data;
        } else if (response && response.ordonnances && Array.isArray(response.ordonnances)) {
          ordonnancesData = response.ordonnances;
        } else if (response && response.success && response.data) {
          ordonnancesData = Array.isArray(response.data) ? response.data : [];
        }
        
        console.log('✅ Ordonnances extraites:', ordonnancesData);
        setOrdonnances(ordonnancesData);
        return ordonnancesData;
      } else {
        console.log('⚠️ Méthode getOrdonnances non disponible');
        setOrdonnances([]);
        return [];
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement des ordonnances:', error);
      setOrdonnances([]);
      return [];
    }
  }, []);

  // Fonction pour charger les médecins
  const loadMedecins = useCallback(async () => {
    try {
      console.log('🔄 Chargement des médecins...');
      
      if (typeof ApiService.getMedecins === 'function') {
        const response = await ApiService.getMedecins();
        console.log('📦 Réponse API médecins:', response);
        
        let medecinsData = [];
        
        // Gestion de la structure paginée Laravel
        if (response && response.success && response.data && response.data.data) {
          // Format paginé: response.data.data contient le tableau
          medecinsData = Array.isArray(response.data.data) ? response.data.data : [];
          console.log('✅ Données paginées extraites:', medecinsData);
        } else if (Array.isArray(response)) {
          medecinsData = response;
        } else if (response && response.data && Array.isArray(response.data)) {
          medecinsData = response.data;
        } else if (response && response.medecins && Array.isArray(response.medecins)) {
          medecinsData = response.medecins;
        } else if (response && response.success && response.data) {
          medecinsData = Array.isArray(response.data) ? response.data : [];
        } else {
          console.log('❌ Format de réponse non reconnu:', response);
          medecinsData = [];
        }
        
        console.log('✅ Médecins extraits:', medecinsData);
        console.log('📊 Nombre de médecins:', medecinsData.length);
        
        setMedecins(medecinsData);
        return medecinsData;
      } else {
        console.log('⚠️ Méthode getMedecins non disponible');
        setMedecins([]);
        return [];
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement des médecins:', error);
      setMedecins([]);
      return [];
    }
  }, []);

  // Fonction pour charger toutes les données
  const loadAllData = useCallback(async () => {
    setLoading(true);
    setError(''); 
    
    try {
      console.log('🔄 Chargement de toutes les données...');
      
      // Charger les données en parallèle
      const [medicamentsData, ordonnancesData, medecinsData] = await Promise.all([
        loadMedicaments(),
        loadOrdonnances(),
        loadMedecins()
      ]);
      
      console.log('✅ Toutes les données chargées:', {
        medicaments: medicamentsData?.length || 0,
        ordonnances: ordonnancesData?.length || 0,
        medecins: medecinsData?.length || 0
      });
      
      setLastUpdate(new Date());
      
    } catch (error) {
      console.error('❌ Erreur lors du chargement des données:', error);
      setError('Erreur lors du chargement des données: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [loadMedicaments, loadOrdonnances, loadMedecins]);

  const handleHomeNavigation = () => {
    navigate('/');
  };

  // Fonction de déconnexion
  const handleLogout = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      setLoading(true); 
      
      try {
        console.log('🔄 Début de la déconnexion...');
        
        const result = await ApiService.logout();
        
        console.log('✅ Déconnexion réussie:', result.message);
        
        // Nettoyer les données locales du dashboard
        setMedicaments([]);
        setOrdonnances([]);
        setMedecins([]);
        setError('');
        navigate('/');
        
      } catch (error) {
        console.error('❌ Erreur lors de la déconnexion:', error);
        
        // Même en cas d'erreur, on nettoie et redirige
        setMedicaments([]);
        setOrdonnances([]);
        setMedecins([]);
        setError('');
        navigate('/');
        
      } finally {
        setLoading(false);
      }
    }
  };

  const clearError = () => {
    setError('');
  };

  // Fonction pour rafraîchir les données 
  const refreshData = useCallback(() => {
    console.log('🔄 Rafraîchissement des données demandé...');
    clearError(); 
    loadAllData();
  }, [loadAllData]);

  // Charger les données au montage
  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Recharger les données quand on change de vue
  useEffect(() => {
    if (currentView !== 'statistiques') {
      // Recharger les données spécifiques à la vue
      switch (currentView) {
        case 'medicaments':
          loadMedicaments();
          break;
        case 'medecins':
          loadMedecins();
          break;
        case 'ordonnances':
          loadOrdonnances();
          break;
        default:
          break;
      }
    }
  }, [currentView, loadMedicaments, loadMedecins, loadOrdonnances]);

  // Fonction pour gérer la mise à jour des données après ajout/modification
  const handleDataUpdate = useCallback((type) => {
    console.log(`🔄 Mise à jour des données pour: ${type}`);
    
    clearError(); 

    switch (type) {
      case 'medicaments':
        loadMedicaments();
        break;
      case 'medecins':
        loadMedecins();
        break;
      case 'ordonnances':
        loadOrdonnances();
        break;
      default:
        loadAllData();
        break;
    }
  }, [loadMedicaments, loadMedecins, loadOrdonnances, loadAllData]);

  const renderCurrentView = () => {
    switch (currentView) {
      case 'statistiques':
        return (
          <DashboardStats 
            medicaments={medicaments}
            ordonnances={ordonnances}  
            medecins={medecins}
            loading={loading}
            onRefresh={refreshData}
            lastUpdate={lastUpdate}
          />
        );
      case 'medicaments':
        return (
          <MedicamentManagement 
            medicaments={medicaments || []} 
            setMedicaments={setMedicaments}
            onDataChange={() => handleDataUpdate('medicaments')}
            loading={loading}
            setLoading={setLoading}
          />
        );
      case 'medecins':
        return (
          <MedecinManagement 
            medecins={medecins || []} 
            setMedecins={setMedecins}
            editingMedecin={editingMedecin}
            setEditingMedecin={setEditingMedecin}
            showMedecinForm={showMedecinForm}
            setShowMedecinForm={setShowMedecinForm}
            onDataChange={() => handleDataUpdate('medecins')}
            loading={loading}
            setLoading={setLoading}
          />
        );
      case 'ordonnances':
        return (
          <OrdonnanceManagement 
            ordonnances={ordonnances || []}
            setOrdonnances={setOrdonnances}
            onDataChange={() => handleDataUpdate('ordonnances')}
            loading={loading}
            setLoading={setLoading}
          />
        );
      case 'consultations':
        return (
          <HistoriqueClient 
            ordonnances={ordonnances || []}
            loading={loading}
            onRefresh={() => handleDataUpdate('ordonnances')}
          />
        );
      default:
        return (
          <DashboardStats 
            medicaments={medicaments} 
            ordonnances={ordonnances} 
            medecins={medecins}
            loading={loading}
            onRefresh={refreshData}
            lastUpdate={lastUpdate}
          />
        );
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header avec style Huawei - DESIGN ORIGINAL CONSERVÉ */}
      <header className="bg-white shadow-sm border-b">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo et titre */}
            <div className="flex items-center">
              <div className="rounded-lg shadow-lg overflow-hidden bg-white p-1">
                <div className="rounded-lg shadow-lg overflow-hidden bg-white p-1">
                <img 
                  src="/images/logoPharmacie.png" 
                  alt="Logo PharmaGestion" 
                  className="h-10 w-10 object-contain"
                />
              </div>
              </div>
              <div className="ml-3">
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  PharmaGestion
                </h1>
                <p className="text-xs text-gray-500 hidden sm:block">Système de gestion pharmaceutique</p>
              </div>
            </div>
            
            {/* Navigation horizontale style Huawei AVEC ICÔNES */}
            <nav className="hidden md:flex items-center space-x-8">
              {/* Bouton Accueil - redirige vers la page d'accueil */}
              <button
                onClick={handleHomeNavigation}
                className="px-3 py-2 text-sm font-medium transition-colors text-gray-700 hover:text-red-600 flex items-center gap-2"
                title="Retour à l'accueil du site"
              >
                <Home className="h-4 w-4" />
                Accueil
              </button>
              
              <button
                onClick={() => setCurrentView('statistiques')}
                className={`px-3 py-2 text-sm font-medium transition-colors relative flex items-center gap-2 ${
                  currentView === 'statistiques' 
                    ? 'text-red-600' 
                    : 'text-gray-700 hover:text-red-600'
                }`}
              >
                <Activity className="h-4 w-4" />
                Statistiques
                {currentView === 'statistiques' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600"></div>
                )}
              </button>
              
              <button
                onClick={() => setCurrentView('medicaments')}
                className={`px-3 py-2 text-sm font-medium transition-colors relative flex items-center gap-2 ${
                  currentView === 'medicaments' 
                    ? 'text-red-600' 
                    : 'text-gray-700 hover:text-red-600'
                }`}
              >
                <Pill className="h-4 w-4" />
                Médicaments
                {currentView === 'medicaments' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600"></div>
                )}
              </button>
              
              <button
                onClick={() => setCurrentView('medecins')}
                className={`px-3 py-2 text-sm font-medium transition-colors relative flex items-center gap-2 ${
                  currentView === 'medecins' 
                    ? 'text-red-600' 
                    : 'text-gray-700 hover:text-red-600'
                }`}
              >
                <UserCircle className="h-4 w-4" />
                Médecins
                {currentView === 'medecins' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600"></div>
                )}
              </button>
              
              <button
                onClick={() => setCurrentView('ordonnances')}
                className={`px-3 py-2 text-sm font-medium transition-colors relative flex items-center gap-2 ${
                  currentView === 'ordonnances' 
                    ? 'text-red-600' 
                    : 'text-gray-700 hover:text-red-600'
                }`}
              >
                <FileText className="h-4 w-4" />
                Ordonnances
                {currentView === 'ordonnances' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600"></div>
                )}
              </button>
              
              <button
                onClick={() => setCurrentView('consultations')}
                className={`px-3 py-2 text-sm font-medium transition-colors relative flex items-center gap-2 ${
                  currentView === 'consultations' 
                    ? 'text-red-600' 
                    : 'text-gray-700 hover:text-red-600'
                }`}
              >
                <Clock className="h-4 w-4" />
                Consultations
                {currentView === 'consultations' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600"></div>
                )}
              </button>
            </nav>
            
            {/* Bouton Logout à droite */}
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm font-medium"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation mobile (dropdown) */}
      <div className="md:hidden bg-white border-b">
        <div className="px-4 py-2 flex gap-2">
          {/* Bouton Accueil mobile */}
          <button
            onClick={handleHomeNavigation}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
            title="Retour à l'accueil du site"
          >
            <Home className="h-4 w-4" />
            Accueil
          </button>
          
          {/* Select pour navigation mobile */}
          <select 
            value={currentView} 
            onChange={(e) => setCurrentView(e.target.value)}
            className="flex-1 p-2 border rounded-lg"
          >
            <option value="statistiques">📊 Statistiques</option>
            <option value="medicaments">💊 Médicaments</option>
            <option value="medecins">👨‍⚕️ Médecins</option>
            <option value="ordonnances">📋 Ordonnances</option>
            <option value="consultations">🕒 Consultations</option>
          </select>
        </div>
      </div>

      {/* Messages d'erreur */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 mx-4 mt-4 rounded relative">
          <div className="flex justify-between items-start">
            <p className="flex-1">{error}</p>
            <button 
              onClick={clearError}
              className="ml-4 text-red-500 hover:text-red-700 font-bold text-lg leading-none"
              title="Fermer"
            >
              ×
            </button>
          </div>
          <div className="mt-2 flex gap-2">
            <button 
              onClick={refreshData}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
            >
              Réessayer
            </button>
            <button 
              onClick={clearError}
              className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm"
            >
              Ignorer
            </button>
          </div>
        </div>
      )}

      {/* Contenu principal */}
      <main className="flex-1 overflow-y-auto bg-gray-50">
        {loading && (
          <div className="flex flex-col justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mb-4"></div>
            <p className="text-gray-600">Chargement des données...</p>
          </div>
        )}
        
        {!loading && renderCurrentView()}
      </main>
    </div>
  );
};

export default PharmacyDashboard;