import { useState, useEffect, useCallback, useRef } from 'react';
import ApiService from '../../src/Services/ApiService';

/**
 * Hook personnalisé pour gérer les données du dashboard de manière optimisée
 * Compatible avec le nouveau ApiService et les composants de gestion
 */
export const useDashboardData = () => {
  const [data, setData] = useState({
    medicaments: [],
    ordonnances: [],
    medecins: [],
    stats: null
  });
  
  const [loading, setLoading] = useState({
    initial: true,
    medicaments: false,
    ordonnances: false,
    medecins: false,
    stats: false
  });
  
  const [error, setError] = useState('');
  const [lastUpdate, setLastUpdate] = useState(null);
  
  // Cache des appels API pour éviter les requêtes multiples
  const loadingPromises = useRef({});
  
  /**
   * Fonction utilitaire pour normaliser les IDs selon le type d'entité
   */
  const normalizeId = useCallback((item, type) => {
    switch (type) {
      case 'medicaments':
        return item.id_medicament || item.id;
      case 'medecins':
        return item.id || item.id_medecin;
      case 'ordonnances':
        return item.id_ordonnance || item.id;
      default:
        return item.id;
    }
  }, []);

  /**
   * Fonction utilitaire pour extraire les données de façon cohérente
   */
  const extractData = useCallback((response) => {
    // Si c'est déjà un tableau
    if (Array.isArray(response)) {
      return response;
    }
    
    // Structure standard de votre ApiService
    if (response?.data) {
      if (Array.isArray(response.data)) {
        return response.data;
      }
      // Cas où data contient un autre niveau
      if (response.data.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
    }
    
    // Fallback
    return [];
  }, []);
  
  /**
   * Calcul des statistiques à partir des données - VERSION STABLE
   */
  const calculateStats = useCallback((medicaments, medecins, ordonnances) => {
    const medicamentsCount = medicaments.length;
    const medecinsCount = medecins.length;
    const ordonnancesCount = ordonnances.length;
    
    const stockFaible = medicaments.filter(m => m.stock <= 5).length;
    const famillesUniques = new Set(
      medicaments
        .map(m => m.famille)
        .filter(Boolean)
    ).size;
    
    return {
      total_medicaments: medicamentsCount,
      total_medecins: medecinsCount,
      total_ordonnances: ordonnancesCount,
      stock_faible: stockFaible,
      familles_count: famillesUniques
    };
  }, []);
  
  /**
   * Fonction générique pour charger des données avec cache et déduplication
   */
  const loadData = useCallback(async (type, forceRefresh = false) => {
    // Éviter les appels multiples simultanés
    if (loadingPromises.current[type] && !forceRefresh) {
      return loadingPromises.current[type];
    }
    
    setLoading(prev => ({ ...prev, [type]: true }));
    
    const promise = (async () => {
      try {
        let response;
        
        switch (type) {
          case 'medicaments':
            response = await ApiService.getMedicaments(!forceRefresh);
            break;
          case 'ordonnances':
            response = await ApiService.getOrdonnances({}, !forceRefresh);
            break;
          case 'medecins':
            response = await ApiService.getMedecins({}, !forceRefresh);
            break;
          case 'stats':
            // Calculer les stats à partir des données existantes ou charger depuis l'API
            if (typeof ApiService.getQuickDashboardStats === 'function') {
              response = await ApiService.getQuickDashboardStats();
              return response.data || null;
            } else {
              // On ne calcule plus les stats ici, elles seront calculées par l'effect
              return null;
            }
        }
        
        const extractedData = extractData(response);
        console.log(`✅ ${type} chargé: ${extractedData.length} éléments`);
        return extractedData;
        
      } catch (error) {
        console.error(`❌ Erreur chargement ${type}:`, error);
        throw error;
      }
    })();
    
    loadingPromises.current[type] = promise;
    
    try {
      const result = await promise;
      
      setData(prev => ({
        ...prev,
        [type]: result
      }));
      
      return result;
      
    } catch (error) {
      console.error(`Erreur lors du chargement ${type}:`, error);
      setError(`Erreur lors du chargement ${type}: ${error.message}`);
      return [];
    } finally {
      setLoading(prev => ({ ...prev, [type]: false }));
      delete loadingPromises.current[type];
    }
  }, [extractData]);

  /**
   * Chargement initial optimisé avec données essentielles d'abord
   */
  const loadInitialData = useCallback(async () => {
    setLoading(prev => ({ ...prev, initial: true }));
    setError('');
    
    try {
      console.log('🚀 Chargement initial des données dashboard...');
      
      // Charger les médicaments en priorité (généralement les plus consultés)
      await loadData('medicaments', true);
      
      // Charger les autres données en arrière-plan avec un petit délai
      setTimeout(async () => {
        try {
          await Promise.allSettled([
            loadData('medecins'),
            loadData('ordonnances')
          ]);
          console.log('✅ Chargement initial terminé');
        } catch (error) {
          console.warn('⚠️ Erreur lors du chargement en arrière-plan:', error);
        }
      }, 200);
      
      setLastUpdate(new Date());
      
    } catch (error) {
      console.error('❌ Erreur chargement initial:', error);
      setError('Erreur lors du chargement initial des données');
    } finally {
      setLoading(prev => ({ ...prev, initial: false }));
    }
  }, []); // ← DÉPENDANCES VIDES pour éviter la redéfinition
  
  /**
   * Rafraîchissement intelligent des données
   */
  const refreshData = useCallback((types = ['medicaments', 'medecins', 'ordonnances']) => {
    setError('');
    console.log('🔄 Rafraîchissement des données:', types);
    
    // Charger les types demandés en parallèle
    const refreshPromises = types.map(type => loadData(type, true));
    
    Promise.allSettled(refreshPromises).then(() => {
      setLastUpdate(new Date());
      console.log('✅ Rafraîchissement terminé');
    });
  }, []); // ← DÉPENDANCES VIDES, on utilisera une ref pour loadData si nécessaire
  
  /**
   * Chargement conditionnel par vue
   */
  const loadDataForView = useCallback((viewName) => {
    console.log(`📱 Chargement pour la vue: ${viewName}`);
    
    // On utilise une approche différente pour éviter la dépendance sur data
    setData(currentData => {
      switch (viewName) {
        case 'dashboard':
          if (currentData.medicaments.length === 0) {
            loadData('medicaments');
          }
          break;
        case 'medicaments':
          if (currentData.medicaments.length === 0) {
            loadData('medicaments');
          }
          break;
        case 'medecins':
          if (currentData.medecins.length === 0) {
            loadData('medecins');
          }
          break;
        case 'ordonnances':
          if (currentData.ordonnances.length === 0) {
            loadData('ordonnances');
          }
          break;
      }
      return currentData; // Pas de changement d'état ici
    });
  }, []); // ← DÉPENDANCES VIDES
  
  /**
   * Mise à jour après modification - Version améliorée et cohérente
   */
  const updateDataAfterChange = useCallback((type, updatedItem, action = 'update') => {
    console.log(`🔄 Mise à jour ${type}:`, { action, item: updatedItem });
    
    setData(prev => {
      const newData = { ...prev };
      const currentItems = prev[type] || [];
      
      switch (action) {
        case 'create':
        case 'add':
          // Éviter les doublons
          const newId = normalizeId(updatedItem, type);
          const exists = currentItems.some(item => normalizeId(item, type) === newId);
          
          if (!exists) {
            newData[type] = [...currentItems, updatedItem];
          } else {
            // Si l'item existe déjà, le mettre à jour
            newData[type] = currentItems.map(item => 
              normalizeId(item, type) === newId ? updatedItem : item
            );
          }
          break;
          
        case 'update':
        case 'edit':
          const updateId = normalizeId(updatedItem, type);
          newData[type] = currentItems.map(item => 
            normalizeId(item, type) === updateId ? updatedItem : item
          );
          break;
          
        case 'delete':
        case 'remove':
          const deleteId = normalizeId(updatedItem, type);
          newData[type] = currentItems.filter(item => 
            normalizeId(item, type) !== deleteId
          );
          break;
          
        case 'bulk_update':
          // Pour les mises à jour en lot
          if (Array.isArray(updatedItem)) {
            newData[type] = updatedItem;
          }
          break;
      }
      
      return newData;
    });
    
    setLastUpdate(new Date());
  }, [normalizeId]);

  /**
   * Synchronisation avec les setters des composants
   */
  const getDataSetter = useCallback((type) => {
    return (newData) => {
      if (typeof newData === 'function') {
        // Si c'est une fonction (comme dans setState), l'appliquer
        setData(prev => ({
          ...prev,
          [type]: newData(prev[type])
        }));
      } else {
        // Si c'est des données directes
        setData(prev => ({
          ...prev,
          [type]: newData
        }));
      }
      setLastUpdate(new Date());
    };
  }, []);

  /**
   * Gestionnaire de changement pour les composants de gestion
   */
  const handleDataChange = useCallback((type) => {
    console.log(`🔄 Rechargement demandé pour: ${type}`);
    
    // Recharger les données depuis l'API
    loadData(type, true);
  }, []); // ← DÉPENDANCES VIDES
  
  /**
   * Nettoyage des erreurs
   */
  const clearError = useCallback(() => {
    setError('');
  }, []);

  // SOLUTION : Effect séparé et stable pour recalculer les stats
  useEffect(() => {
    // Seulement si on a des données et pas de stats existantes, ou si les données ont changé
    if (data.medicaments.length > 0 || data.medecins.length > 0 || data.ordonnances.length > 0) {
      const newStats = calculateStats(data.medicaments, data.medecins, data.ordonnances);
      
      // Éviter les mises à jour inutiles en comparant les stats
      setData(prev => {
        const currentStats = prev.stats;
        
        // Comparaison simple pour éviter les updates inutiles
        if (!currentStats || 
            currentStats.total_medicaments !== newStats.total_medicaments ||
            currentStats.total_medecins !== newStats.total_medecins ||
            currentStats.total_ordonnances !== newStats.total_ordonnances ||
            currentStats.stock_faible !== newStats.stock_faible ||
            currentStats.familles_count !== newStats.familles_count) {
          
          return { ...prev, stats: newStats };
        }
        
        return prev; // Pas de changement
      });
    }
  }, [data.medicaments.length, data.medecins.length, data.ordonnances.length, calculateStats]);
  // ← Dépendances STABLES : longueurs des arrays et fonction stable
  
  // Chargement initial au montage - EFFECT STABLE
  useEffect(() => {
    let mounted = true;
    
    const initData = async () => {
      if (!mounted) return;
      
      setLoading(prev => ({ ...prev, initial: true }));
      setError('');
      
      try {
        console.log('🚀 Chargement initial des données dashboard...');
        
        // Charger les médicaments en priorité
        const medicamentsResponse = await ApiService.getMedicaments(false);
        console.log('🔍 Réponse API medicaments:', medicamentsResponse);
        
        let medicamentsData = [];
        if (Array.isArray(medicamentsResponse)) {
          medicamentsData = medicamentsResponse;
        } else if (medicamentsResponse?.data) {
          if (Array.isArray(medicamentsResponse.data)) {
            medicamentsData = medicamentsResponse.data;
          } else if (medicamentsResponse.data?.data && Array.isArray(medicamentsResponse.data.data)) {
            medicamentsData = medicamentsResponse.data.data;
          }
        }
        
        if (mounted) {
          setData(prev => ({ ...prev, medicaments: medicamentsData }));
          console.log(`✅ medicaments chargé: ${medicamentsData.length} éléments`);
        }
        
        // Charger les autres données
        setTimeout(async () => {
          if (!mounted) return;
          
          try {
            const [medecinsResponse, ordonnancesResponse] = await Promise.allSettled([
              ApiService.getMedecins({}, false),
              ApiService.getOrdonnances({}, false)
            ]);
            
            if (mounted) {
              if (medecinsResponse.status === 'fulfilled') {
                console.log('🔍 Réponse API medecins:', medecinsResponse.value);
                let medecinsData = [];
                if (Array.isArray(medecinsResponse.value)) {
                  medecinsData = medecinsResponse.value;
                } else if (medecinsResponse.value?.data) {
                  if (Array.isArray(medecinsResponse.value.data)) {
                    medecinsData = medecinsResponse.value.data;
                  } else if (medecinsResponse.value.data?.data && Array.isArray(medecinsResponse.value.data.data)) {
                    medecinsData = medecinsResponse.value.data.data;
                  }
                }
                setData(prev => ({ ...prev, medecins: medecinsData }));
                console.log(`✅ medecins chargé: ${medecinsData.length} éléments`);
              }
              
              if (ordonnancesResponse.status === 'fulfilled') {
                console.log('🔍 Réponse API ordonnances:', ordonnancesResponse.value);
                let ordonnancesData = [];
                if (Array.isArray(ordonnancesResponse.value)) {
                  ordonnancesData = ordonnancesResponse.value;
                } else if (ordonnancesResponse.value?.data) {
                  if (Array.isArray(ordonnancesResponse.value.data)) {
                    ordonnancesData = ordonnancesResponse.value.data;
                  } else if (ordonnancesResponse.value.data?.data && Array.isArray(ordonnancesResponse.value.data.data)) {
                    ordonnancesData = ordonnancesResponse.value.data.data;
                  }
                }
                setData(prev => ({ ...prev, ordonnances: ordonnancesData }));
                console.log(`✅ ordonnances chargé: ${ordonnancesData.length} éléments`);
              } else {
                console.warn('⚠️ Échec chargement ordonnances:', ordonnancesResponse.reason);
              }
              
              console.log('✅ Chargement initial terminé');
              setLastUpdate(new Date());
            }
          } catch (error) {
            if (mounted) {
              console.warn('⚠️ Erreur lors du chargement en arrière-plan:', error);
            }
          }
        }, 200);
        
      } catch (error) {
        if (mounted) {
          console.error('❌ Erreur chargement initial:', error);
          setError('Erreur lors du chargement initial des données');
        }
      } finally {
        if (mounted) {
          setLoading(prev => ({ ...prev, initial: false }));
        }
      }
    };
    
    initData();
    
    return () => {
      mounted = false;
    };
  }, []); // ← DÉPENDANCES VIDES - ne s'exécute qu'au montage
  
  return {
    // Données
    medicaments: data.medicaments,
    ordonnances: data.ordonnances,
    medecins: data.medecins,
    stats: data.stats,
    
    // États de chargement
    loading,
    isLoading: Object.values(loading).some(Boolean),
    
    // Erreurs
    error,
    clearError,
    
    // Actions principales
    refreshData,
    loadDataForView,
    updateDataAfterChange,
    handleDataChange,
    
    // Setters pour les composants
    setMedicaments: getDataSetter('medicaments'),
    setMedecins: getDataSetter('medecins'),
    setOrdonnances: getDataSetter('ordonnances'),
    
    // Métadonnées
    lastUpdate
  };
};