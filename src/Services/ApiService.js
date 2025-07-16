// ApiService.js - Corrections

const API_BASE_URL = 'http://localhost:8000/api'; // Ajustez selon votre configuration

class ApiService {
  
  // ==================== MÉTHODES MÉDICAMENTS ====================
  
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

  // ==================== MÉTHODES MÉDECINS ====================

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

  /**
   * Créer un nouveau médecin
   */
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

  /**
   * Récupérer un médecin spécifique
   */
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

  /**
   * Mettre à jour un médecin
   */
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

  /**
   * Supprimer un médecin
   */
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

  /**
   * Restaurer un médecin
   */
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

  /**
   * Récupérer les spécialités
   */
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

  /**
   * Récupérer les statistiques des médecins
   */
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