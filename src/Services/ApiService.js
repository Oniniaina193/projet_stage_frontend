const API_BASE_URL = 'http://localhost:8000/api'; 
class ApiService {

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

  //deconnexion
  static async logout() {
    try {
      console.log('🔄 Début de la déconnexion...');
      
      const token = this.getAuthToken();
      
      if (token) {
        // Appeler l'endpoint de déconnexion Laravel
        const response = await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: this.getAuthHeaders()
        });

        if (!response.ok) {
          console.warn('⚠️ Erreur lors de la déconnexion côté serveur, mais on continue...');
          // On continue même si l'appel échoue pour nettoyer le côté client
        } else {
          const data = await response.json();
          console.log('✅ Déconnexion côté serveur réussie:', data.message);
        }
      }

      // Nettoyer le localStorage (toujours faire ça, même si l'appel API échoue)
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_info');
      
      console.log('✅ Nettoyage localStorage terminé');
      
      return {
        success: true,
        message: 'Déconnexion réussie'
      };

    } catch (error) {
      console.error('❌ Erreur lors de la déconnexion:', error);
      
      // Même en cas d'erreur, on nettoie le localStorage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_info');
      
      // On retourne quand même un succès car le nettoyage local est fait
      return {
        success: true,
        message: 'Déconnexion locale réussie'
      };
    }
  }

  /**
   * Vérifier si l'utilisateur est connecté
   */
  static isAuthenticated() {
    return !!this.getAuthToken();
  }

  /**
   * Obtenir les informations utilisateur depuis localStorage
   */
  static getUserInfo() {
    const userInfo = localStorage.getItem('user_info');
    return userInfo ? JSON.parse(userInfo) : null;
  }
  
  // Méthode pour créer un médicament
  static async createMedicament(medicamentData) {
    try {
      const response = await fetch(`${API_BASE_URL}/medicaments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(medicamentData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la création');
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur ApiService.createMedicament:', error);
      throw error;
    }
  }

  // Méthode pour modifier un médicament
  static async updateMedicament(id, medicamentData) {
    try {
      console.log('ApiService.updateMedicament - ID:', id, 'Data:', medicamentData);
      
      const response = await fetch(`${API_BASE_URL}/medicaments/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(medicamentData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la modification');
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur ApiService.updateMedicament:', error);
      throw error;
    }
  }

  // Méthode pour supprimer un médicament
  static async deleteMedicament(id) {
    try {
      console.log('ApiService.deleteMedicament - ID:', id);
      
      const response = await fetch(`${API_BASE_URL}/medicaments/${id}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la suppression');
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur ApiService.deleteMedicament:', error);
      throw error;
    }
  }

  // Méthode pour récupérer tous les médicaments
  static async getMedicaments() {
    try {
      const response = await fetch(`${API_BASE_URL}/medicaments`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la récupération');
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur ApiService.getMedicaments:', error);
      throw error;
    }
  }

  /**
   * Récupérer tous les médecins avec pagination et recherche
   */
  static async getMedecins(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = `${API_BASE_URL}/medecins${queryString ? '?' + queryString : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la récupération');
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur ApiService.getMedecins:', error);
      throw error;
    }
  }

  //Créer nouveau médecin
  static async createMedecin(medecinData) {
    try {
      const response = await fetch(`${API_BASE_URL}/medecins`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(medecinData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la création du médecin');
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur ApiService.createMedecin:', error);
      throw error;
    }
  }

  
   //Récupérer un médecin spécifique
  
  static async getMedecin(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/medecins/${id}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la récupération');
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur ApiService.getMedecin:', error);
      throw error;
    }
  }

 //Mettre à jour un médecin
  static async updateMedecin(id, medecinData) {
    try {
      console.log('ApiService.updateMedecin - ID:', id, 'Data:', medecinData);
      
      const response = await fetch(`${API_BASE_URL}/medecins/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(medecinData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la mise à jour du médecin');
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur ApiService.updateMedecin:', error);
      throw error;
    }
  }

 //Supprimer un médecin
  static async deleteMedecin(id) {
    try {
      console.log('ApiService.deleteMedecin - ID:', id);
      
      const response = await fetch(`${API_BASE_URL}/medecins/${id}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la suppression du médecin');
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur ApiService.deleteMedecin:', error);
      throw error;
    }
  }

 //Restaurer un médecin
  static async restoreMedecin(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/medecins/${id}/restore`, {
        method: 'PATCH',
        headers: {
          'Accept': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la restauration du médecin');
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur ApiService.restoreMedecin:', error);
      throw error;
    }
  }

 //Récupérer les spécialités
  static async getSpecialites() {
    try {
      const response = await fetch(`${API_BASE_URL}/medecins/specialites`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la récupération');
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur ApiService.getSpecialites:', error);
      throw error;
    }
  }

 //Récupérer les statistiques des médecins
  static async getStatistiquesMedecins() {
    try {
      const response = await fetch(`${API_BASE_URL}/medecins/statistiques`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la récupération');
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur ApiService.getStatistiquesMedecins:', error);
      throw error;
    }
  }
}

// Création d'une instance par défaut pour compatibilité
const apiService = new ApiService();

export default ApiService;
export { apiService };