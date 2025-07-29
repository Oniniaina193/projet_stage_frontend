const API_BASE_URL = 'http://localhost:8000/api'; 

class ApiService {
  static authCheckCache = {
    isValid: null,
    timestamp: null,
    duration: 5 * 60 * 1000 
  };

  // Cache pour les données avec TTL (Time To Live)
  static dataCache = {
    medicaments: { data: null, timestamp: null, ttl: 5 * 60 * 1000 }, 
    medecins: { data: null, timestamp: null, ttl: 10 * 60 * 1000 },   
    ordonnances: { data: null, timestamp: null, ttl: 2 * 60 * 1000 }, 
    specialites: { data: null, timestamp: null, ttl: 30 * 60 * 1000 } 
  };

  static getAuthToken() {
    return localStorage.getItem('auth_token');
  }

  static getAuthHeaders(includeContentType = true) {
    const headers = {
      'Accept': 'application/json',
    };

    if (includeContentType) {
      headers['Content-Type'] = 'application/json';
    }

    const token = this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  // NOUVELLES MÉTHODES DE VALIDATION
  /**
   * Valide le format du numéro de téléphone côté client
   * @param {string} telephone 
   * @returns {object} 
   */
  static validateTelephone(telephone) {
    if (!telephone) {
      return { isValid: false, message: 'Le numéro de téléphone est obligatoire' };
    }

    // Nettoyer le numéro (enlever espaces, tirets, etc.)
    const cleanTelephone = telephone.replace(/[^\d]/g, '');
    
    if (cleanTelephone.length !== 10) {
      return { isValid: false, message: 'Le numéro de téléphone doit contenir exactement 10 chiffres' };
    }

    if (!/^[0-9]{10}$/.test(cleanTelephone)) {
      return { isValid: false, message: 'Le numéro de téléphone ne doit contenir que des chiffres' };
    }

    return { isValid: true, cleanValue: cleanTelephone };
  }

  /**
   * Valide les données du médecin côté client (version simplifiée)
   * @param {object} medecinData - Les données du médecin
   * @param {boolean} isUpdate - Si c'est une mise à jour
   * @returns {object} - { isValid: boolean, errors: object, cleanData: object }
   */
  static validateMedecinData(medecinData, isUpdate = false) {
    const errors = {};
    const cleanData = { ...medecinData };

    // Validation du nom complet
    if (!medecinData.nom_complet?.trim()) {
      errors.nom_complet = 'Le nom complet est obligatoire';
    } else if (medecinData.nom_complet.length > 200) {
      errors.nom_complet = 'Le nom complet ne doit pas dépasser 200 caractères';
    }

    // Validation du numéro d'ordre
    if (!medecinData.numero_ordre?.trim()) {
      errors.numero_ordre = 'Le numéro d\'ordre est obligatoire';
    } else if (medecinData.numero_ordre.length > 50) {
      errors.numero_ordre = 'Le numéro d\'ordre ne doit pas dépasser 50 caractères';
    }

    // Validation du téléphone
    const telephoneValidation = this.validateTelephone(medecinData.telephone);
    if (!telephoneValidation.isValid) {
      errors.telephone = telephoneValidation.message;
    } else {
      cleanData.telephone = telephoneValidation.cleanValue;
    }

    // Validation de l'adresse
    if (!medecinData.adresse?.trim()) {
      errors.adresse = 'L\'adresse est obligatoire';
    } else if (medecinData.adresse.length > 500) {
      errors.adresse = 'L\'adresse ne doit pas dépasser 500 caractères';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      cleanData
    };
  }

  /**
   * Formate les erreurs de validation retournées par Laravel
   * @param {object} laravelErrors - Les erreurs retournées par Laravel
   * @returns {object} - Erreurs formatées pour l'affichage
   */
  static formatValidationErrors(laravelErrors) {
    const formattedErrors = {};
    
    if (laravelErrors && typeof laravelErrors === 'object') {
      Object.keys(laravelErrors).forEach(field => {
        // Prendre le premier message d'erreur pour chaque champ
        formattedErrors[field] = Array.isArray(laravelErrors[field]) 
          ? laravelErrors[field][0] 
          : laravelErrors[field];
      });
    }
    
    return formattedErrors;
  }

  // Méthode utilitaire pour vérifier le cache
  static isCacheValid(cacheKey) {
    const cache = this.dataCache[cacheKey];
    if (!cache || !cache.data || !cache.timestamp) {
      return false;
    }
    
    const now = Date.now();
    return (now - cache.timestamp) < cache.ttl;
  }

  // Méthode utilitaire pour mettre en cache
  static setCache(cacheKey, data) {
    this.dataCache[cacheKey] = {
      data: data,
      timestamp: Date.now(),
      ttl: this.dataCache[cacheKey].ttl
    };
  }

  // Méthode utilitaire pour vider le cache
  static clearCache(cacheKey = null) {
    if (cacheKey) {
      this.dataCache[cacheKey] = { data: null, timestamp: null, ttl: this.dataCache[cacheKey].ttl };
    } else {
      // Vider tout le cache
      Object.keys(this.dataCache).forEach(key => {
        this.dataCache[key].data = null;
        this.dataCache[key].timestamp = null;
      });
    }
  }

  // Méthode générique pour les requêtes avec retry et timeout
  static async makeRequest(url, options = {}, useCache = false, cacheKey = null) {
    const maxRetries = 3;
    const timeout = 10000; // 10 secondes
    
    // Vérifier le cache si demandé
    if (useCache && cacheKey && this.isCacheValid(cacheKey)) {
      console.log(`📋 Cache hit pour ${cacheKey}`);
      return this.dataCache[cacheKey].data;
    }

    const defaultOptions = {
      method: 'GET',
      headers: this.getAuthHeaders(!options.formData),
      ...options
    };

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 Tentative ${attempt}/${maxRetries} pour ${url}`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        const response = await fetch(url, {
          ...defaultOptions,
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          
          // Gestion spéciale des erreurs de validation (422)
          if (response.status === 422) {
            const formattedErrors = this.formatValidationErrors(errorData.errors);
            throw new ValidationError(errorData.message || 'Erreurs de validation', formattedErrors, errorData);
          }
          
          throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        
        // Mettre en cache si demandé
        if (useCache && cacheKey) {
          this.setCache(cacheKey, data);
        }
        
        console.log(`✅ Succès pour ${url}`);
        return data;

      } catch (error) {
        console.warn(`⚠️ Tentative ${attempt} échouée:`, error.message);
        
        if (attempt === maxRetries || error instanceof ValidationError) {
          if (error instanceof ValidationError) {
            console.error(`❌ Erreur de validation:`, error.errors);
          } else {
            console.error(`❌ Échec définitif après ${maxRetries} tentatives:`, error);
          }
          throw error;
        }
        
        // Attendre avant de réessayer (backoff exponentiel)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }

  // AUTHENTIFICATION
  static async logout() {
    try {
      console.log('🔄 Début de la déconnexion...');
      
      const token = this.getAuthToken();
      
      if (token) {
        try {
          await this.makeRequest(`${API_BASE_URL}/auth/logout`, { method: 'POST' });
        } catch (error) {
          console.warn('⚠️ Erreur lors de la déconnexion côté serveur, mais on continue...');
        }
      }

      // Nettoyer le localStorage et le cache
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_info');
      this.clearCache(); // Vider tout le cache
      
      return { success: true, message: 'Déconnexion réussie' };

    } catch (error) {
      console.error('❌ Erreur lors de la déconnexion:', error);
      
      // Même en cas d'erreur, on nettoie
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_info');
      this.clearCache();
      
      return { success: true, message: 'Déconnexion locale réussie' };
    }
  }

  static isAuthenticated() {
    return !!this.getAuthToken();
  }

  static getUserInfo() {
    const userInfo = localStorage.getItem('user_info');
    return userInfo ? JSON.parse(userInfo) : null;
  }

  // MÉDICAMENTS
  static async getMedicaments(useCache = true) {
    return this.makeRequest(
      `${API_BASE_URL}/medicaments`,
      { method: 'GET' },
      useCache,
      'medicaments'
    );
  }

  static async createMedicament(medicamentData) {
    const result = await this.makeRequest(`${API_BASE_URL}/medicaments`, {
      method: 'POST',
      body: JSON.stringify(medicamentData)
    });
    
    // Vider le cache des médicaments après création
    this.clearCache('medicaments');
    return result;
  }

  static async updateMedicament(id, medicamentData) {
    const result = await this.makeRequest(`${API_BASE_URL}/medicaments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(medicamentData)
    });
    
    // Vider le cache des médicaments après modification
    this.clearCache('medicaments');
    return result;
  }

  static async deleteMedicament(id) {
    const result = await this.makeRequest(`${API_BASE_URL}/medicaments/${id}`, {
      method: 'DELETE'
    });
    
    // Vider le cache des médicaments après suppression
    this.clearCache('medicaments');
    return result;
  }

  // MÉDECINS - MÉTHODES MISES À JOUR POUR LA NOUVELLE STRUCTURE
  static async getMedecins(params = {}, useCache = true) {
    const queryString = new URLSearchParams(params).toString();
    const url = `${API_BASE_URL}/medecins${queryString ? '?' + queryString : ''}`;
    
    // Si on a des paramètres de recherche, ne pas utiliser le cache
    const shouldUseCache = useCache && Object.keys(params).length === 0;
    
    return this.makeRequest(
      url,
      { method: 'GET' },
      shouldUseCache,
      'medecins'
    );
  }

  static async getMedecin(id) {
    return this.makeRequest(`${API_BASE_URL}/medecins/${id}`, {
      method: 'GET'
    });
  }

  /**
   * Crée un nouveau médecin avec validation côté client (version simplifiée)
   * @param {object} medecinData - Les données du médecin
   * @param {boolean} skipClientValidation - Ignorer la validation côté client
   * @returns {Promise} - Résultat de la création
   */
  static async createMedecin(medecinData, skipClientValidation = false) {
    try {
      // Validation côté client
      if (!skipClientValidation) {
        const validation = this.validateMedecinData(medecinData, false);
        if (!validation.isValid) {
          throw new ValidationError('Erreurs de validation côté client', validation.errors);
        }
        medecinData = validation.cleanData;
      }

      console.log('🔄 Création du médecin...', { 
        nom_complet: medecinData.nom_complet,
        telephone: medecinData.telephone 
      });

      const result = await this.makeRequest(`${API_BASE_URL}/medecins`, {
        method: 'POST',
        body: JSON.stringify(medecinData)
      });
      
      this.clearCache('medecins');
      console.log('✅ Médecin créé avec succès');
      return result;

    } catch (error) {
      if (error instanceof ValidationError) {
        console.error('❌ Erreur de validation lors de la création:', error.errors);
      }
      throw error;
    }
  }

  /**
   * Met à jour un médecin avec validation côté client (version simplifiée)
   * @param {number} id - L'ID du médecin
   * @param {object} medecinData - Les données du médecin
   * @param {boolean} skipClientValidation - Ignorer la validation côté client
   * @returns {Promise} - Résultat de la mise à jour
   */
  static async updateMedecin(id, medecinData, skipClientValidation = false) {
    // S'assurer que l'ID est un nombre
    const medecinId = parseInt(id);
    if (isNaN(medecinId)) {
      throw new Error('ID du médecin invalide');
    }

    try {
      // Validation côté client
      if (!skipClientValidation) {
        const validation = this.validateMedecinData(medecinData, true);
        if (!validation.isValid) {
          throw new ValidationError('Erreurs de validation côté client', validation.errors);
        }
        medecinData = validation.cleanData;
      }

      console.log('🔄 Mise à jour du médecin...', { 
        id: medecinId, 
        nom_complet: medecinData.nom_complet,
        telephone: medecinData.telephone
      });

      // Utiliser PUT pour la mise à jour
      const result = await this.makeRequest(`${API_BASE_URL}/medecins/${medecinId}`, {
        method: 'PUT',
        body: JSON.stringify(medecinData)
      });
      
      this.clearCache('medecins');
      console.log('✅ Médecin mis à jour avec succès');
      return result;

    } catch (error) {
      if (error instanceof ValidationError) {
        console.error('❌ Erreur de validation lors de la mise à jour:', error.errors);
      } else {
        console.error('❌ Erreur lors de la mise à jour du médecin:', {
          id: medecinId,
          error: error.message,
          data: medecinData
        });
      }
      throw error;
    }
  }

  static async deleteMedecin(id) {
    const result = await this.makeRequest(`${API_BASE_URL}/medecins/${id}`, {
      method: 'DELETE'
    });
    
    this.clearCache('medecins');
    return result;
  }

  static async restoreMedecin(id) {
    const result = await this.makeRequest(`${API_BASE_URL}/medecins/${id}/restore`, {
      method: 'PATCH'
    });
    
    this.clearCache('medecins');
    return result;
  }

  static async getSpecialites(useCache = true) {
    return this.makeRequest(
      `${API_BASE_URL}/medecins/specialites`,
      { method: 'GET' },
      useCache,
      'specialites'
    );
  }

  static async getStatistiquesMedecins() {
    return this.makeRequest(`${API_BASE_URL}/medecins/statistiques`, {
      method: 'GET'
    });
  }

  /**
   * Vérifie si un numéro de téléphone existe déjà
   * @param {string} telephone - Le numéro de téléphone
   * @param {number} excludeId - ID à exclure (pour les mises à jour)
   * @returns {Promise<boolean>} - true si le téléphone existe
   */
  static async checkTelephoneExists(telephone, excludeId = null) {
    try {
      const cleanTelephone = telephone.replace(/[^\d]/g, '');
      const params = { telephone: cleanTelephone };
      if (excludeId) {
        params.exclude_id = excludeId;
      }
      
      const result = await this.makeRequest(`${API_BASE_URL}/medecins/check-telephone`, {
        method: 'POST',
        body: JSON.stringify(params)
      });
      
      return result.exists || false;
    } catch (error) {
      console.warn('⚠️ Erreur lors de la vérification du téléphone:', error);
      return false;
    }
  }

  // ORDONNANCES
  static async getOrdonnances(params = {}, useCache = true) {
    const queryString = new URLSearchParams(params).toString();
    const url = `${API_BASE_URL}/ordonnances${queryString ? '?' + queryString : ''}`;
    
    const shouldUseCache = useCache && Object.keys(params).length === 0;
    
    return this.makeRequest(
      url,
      { method: 'GET' },
      shouldUseCache,
      'ordonnances'
    );
  }

  static async getOrdonnance(id) {
    return this.makeRequest(`${API_BASE_URL}/ordonnances/${id}`, {
      method: 'GET'
    });
  }

  static async createOrdonnance(ordonnanceData) {
    const result = await this.makeRequest(`${API_BASE_URL}/ordonnances`, {
      method: 'POST',
      body: JSON.stringify(ordonnanceData)
    });
    
    this.clearCache('ordonnances');
    return result;
  }

  static async updateOrdonnance(id, ordonnanceData) {
    const result = await this.makeRequest(`${API_BASE_URL}/ordonnances/${id}`, {
      method: 'PUT',
      body: JSON.stringify(ordonnanceData)
    });
    
    this.clearCache('ordonnances');
    return result;
  }

  static async deleteOrdonnance(id) {
    const result = await this.makeRequest(`${API_BASE_URL}/ordonnances/${id}`, {
      method: 'DELETE'
    });
    
    this.clearCache('ordonnances');
    return result;
  }

  // MÉTHODES BULK OPTIMISÉES pour le dashboard
  static async getDashboardData(forceRefresh = false) {
    console.log('🔄 Chargement des données dashboard...');
    
    try {
      // Charger en parallèle avec cache
      const [medicaments, medecins, ordonnances] = await Promise.allSettled([
        this.getMedicaments(!forceRefresh),
        this.getMedecins({}, !forceRefresh),
        this.getOrdonnances({}, !forceRefresh)
      ]);

      const result = {
        medicaments: medicaments.status === 'fulfilled' ? medicaments.value : { data: [] },
        medecins: medecins.status === 'fulfilled' ? medecins.value : { data: [] },
        ordonnances: ordonnances.status === 'fulfilled' ? ordonnances.value : { data: [] }
      };

      console.log('✅ Données dashboard chargées:', {
        medicaments: result.medicaments?.data?.length || 0,
        medecins: result.medecins?.data?.length || 0,
        ordonnances: result.ordonnances?.data?.length || 0
      });

      return result;

    } catch (error) {
      console.error('❌ Erreur chargement dashboard:', error);
      throw error;
    }
  }

  // Méthode pour précharger les données critiques
  static async preloadCriticalData() {
    console.log('🚀 Préchargement des données critiques...');
    
    // Précharger en arrière-plan sans bloquer l'UI
    setTimeout(async () => {
      try {
        await Promise.all([
          this.getSpecialites(),
          this.getMedicaments(),
          this.getMedecins()
        ]);
        console.log('✅ Préchargement terminé');
      } catch (error) {
        console.warn('⚠️ Erreur lors du préchargement:', error);
      }
    }, 100);
  }

  // Diagnostics
  static getCacheStatus() {
    const status = {};
    Object.keys(this.dataCache).forEach(key => {
      const cache = this.dataCache[key];
      status[key] = {
        hasData: !!cache.data,
        isValid: this.isCacheValid(key),
        timestamp: cache.timestamp,
        age: cache.timestamp ? Date.now() - cache.timestamp : null
      };
    });
    return status;
  }
}

// Classe d'erreur personnalisée pour les erreurs de validation
class ValidationError extends Error {
  constructor(message, errors, originalResponse = null) {
    super(message);
    this.name = 'ValidationError';
    this.errors = errors || {};
    this.originalResponse = originalResponse;
  }
}

export default ApiService;
export { ValidationError };