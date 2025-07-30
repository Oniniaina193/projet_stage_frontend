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

  const navigate = useNavigate();
  
  const [currentView, setCurrentView] = useState('dashboard');
  const [medicaments, setMedicaments] = useState([]);
  const [ordonnances, setOrdonnances] = useState([]);
  const [medecins, setMedecins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastUpdate, setLastUpdate] = useState(null);

  const [showMedecinForm, setShowMedecinForm] = useState(false);
  const [editingMedecin, setEditingMedecin] = useState(null);

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
            medicaments = []; // Assurer que c'est un tableau vide
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
    if (currentView !== 'dashboard') {
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

  const handleReturnHome = () => {
      navigate('/');
    
  };

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
      // car le localStorage a déjà été nettoyé par ApiService
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
      case 'dashboard':
        return (
          <DashboardStats 
            medicaments={medicaments}
            ordonnances={ordonnances}  
            medecins={medecins}
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
      case 'historique':
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
            medicaments={medicaments || []} 
            ordonnances={ordonnances || []} 
            medecins={medecins || []}
            loading={loading}
            onRefresh={refreshData}
            lastUpdate={lastUpdate}
          />
        );
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="bg-white shadow-sm border-b">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="rounded-lg shadow-lg overflow-hidden bg-white p-1">
                <img 
                  src="/images/logoPharmacie.png" 
                  alt="Logo PharmaGestion" 
                  className="h-10 w-10 object-contain"
                />
              </div>
              <div className="ml-3">
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  PharmaGestion
                </h1>
                <p className="text-xs text-gray-500 hidden sm:block">Système de gestion pharmaceutique</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={handleReturnHome}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Home className="h-4 w-4" />
                Retour à l'accueil
              </button>
            </div>
          </div>
        </div>
        
      </header>

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

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 bg-white shadow-sm h-full overflow-y-auto flex flex-col">
          <nav className="mt-8 flex-1">
            <div className="px-4 space-y-2">
              <button
                onClick={() => setCurrentView('dashboard')}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                  currentView === 'dashboard' 
                    ? 'bg-blue-100 text-blue-700 border-r-4 border-blue-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Activity className="h-5 w-5 mr-3" />
                <span>Tableau de Bord</span>
              </button>
              <br />
              <button
                onClick={() => setCurrentView('medicaments')}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                  currentView === 'medicaments' 
                    ? 'bg-blue-100 text-blue-700 border-r-4 border-blue-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Pill className="h-5 w-5 mr-3" />
                <span>Gestion des Médicaments</span>
              </button>
              <br />
              <button
                onClick={() => setCurrentView('medecins')}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                  currentView === 'medecins' 
                    ? 'bg-blue-100 text-blue-700 border-r-4 border-blue-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <UserCircle className="h-5 w-5 mr-3" />
                <span>Gestion des Médecins</span>
              </button>
              <br />
              <button
                onClick={() => setCurrentView('ordonnances')}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                  currentView === 'ordonnances' 
                    ? 'bg-blue-100 text-blue-700 border-r-4 border-blue-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FileText className="h-5 w-5 mr-3" />
                <span>Gestion des Ordonnances</span>
              </button>
              <br />
              <button
                onClick={() => setCurrentView('historique')}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                  currentView === 'historique' 
                    ? 'bg-blue-100 text-blue-700 border-r-4 border-blue-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Clock className="h-5 w-5 mr-3" />
                <span>Consultations</span>
              </button>
            </div>
          </nav>
          
          <div className="px-4 pb-4 border-t border-gray-200 pt-4">
            <button
              onClick={handleLogout}
              className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Déconnexion
            </button>
          </div>
        </aside>

        <main className="flex-1 min-w-0 overflow-y-auto p-6 w-full h-full">
          {loading && (
            <div className="flex flex-col justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600">Chargement des données...</p>
            </div>
          )}
          
          {!loading && renderCurrentView()}
        </main>
      </div>
    </div>
  );
};

export default PharmacyDashboard;