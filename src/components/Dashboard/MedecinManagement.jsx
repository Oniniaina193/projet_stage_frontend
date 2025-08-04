import React, { useState, useCallback, useMemo } from 'react';
import { Plus, Edit2, Trash2, AlertCircle, CheckCircle, Search, User, X } from 'lucide-react';
import ApiService, { ValidationError } from '../../Services/ApiService';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const MedecinManagement = ({ medecins = [], setMedecins, onDataChange, loading, setLoading }) => {
  const [editingMedecin, setEditingMedecin] = useState(null);
  const [showMedecinForm, setShowMedecinForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [medecinForm, setMedecinForm] = useState({
    nom_complet: '',
    numero_ordre: '', // ONM
    telephone: '',
    adresse: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Fonction de validation du téléphone
  const validateTelephone = useCallback((value) => {
    const phoneRegex = /^[0-9]{10}$/;
    if (!value) {
      return 'Le numéro de téléphone est obligatoire';
    }
    if (!phoneRegex.test(value)) {
      return 'Le numéro doit contenir exactement 10 chiffres';
    }
    return '';
  }, []);

  // Fonction pour réinitialiser le formulaire
  const resetForm = useCallback(() => {
    setMedecinForm({
      nom_complet: '',
      numero_ordre: '',
      telephone: '',
      adresse: ''
    });
    setEditingMedecin(null);
    setShowMedecinForm(false);
    setError('');
    setSuccess('');
    setValidationErrors({});
  }, []);

  const showMessage = useCallback((message, type = 'success') => {
    if (type === 'success') {
      setSuccess(message);
      setError('');
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(message);
      setSuccess('');
      setTimeout(() => setError(''), 5000);
    }
  }, []);

  const handleMedecinSubmit = useCallback(async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    setValidationErrors({});

    try {
      // Préparer les données à envoyer
      const medecinData = {
        nom_complet: medecinForm.nom_complet.trim(),
        numero_ordre: medecinForm.numero_ordre.trim(),
        telephone: medecinForm.telephone.trim(),
        adresse: medecinForm.adresse.trim()
      };

      // Validation côté client de base
      if (!medecinData.nom_complet || !medecinData.numero_ordre || 
          !medecinData.telephone || !medecinData.adresse) {
        throw new Error('Veuillez remplir tous les champs obligatoires');
      }

      // Validation téléphone côté client
      const phoneError = validateTelephone(medecinData.telephone);
      if (phoneError) {
        throw new Error(phoneError);
      }

      console.log('📝 Données à soumettre:', medecinData);

      let result;

      if (editingMedecin) {
        // MODIFICATION - Appel API
        if (!editingMedecin.id) {
          throw new Error('ID du médecin manquant pour la modification');
        }

        console.log('🔄 Modification du médecin...', editingMedecin.id);
        result = await ApiService.updateMedecin(editingMedecin.id, medecinData);
        
        // Mettre à jour l'état local avec les données retournées par l'API
        setMedecins(prevMedecins => 
          prevMedecins.map(med => 
            med.id === editingMedecin.id 
              ? { ...med, ...result.medecin } // Utiliser les données de l'API
              : med
          )
        );
        
        showMessage('Médecin modifié avec succès!');
        
      } else {
        // CRÉATION - Appel API
        console.log('🔄 Création du médecin...');
        result = await ApiService.createMedecin(medecinData);
        
        // Ajouter le nouveau médecin avec les données retournées par l'API
        const newMedecin = result.medecin || result.data || { ...medecinData, id: Date.now() };
        setMedecins(prevMedecins => [...prevMedecins, newMedecin]);
        
        showMessage('Médecin ajouté avec succès!');
      }

      console.log('✅ Opération réussie:', result);
      resetForm();
      if (onDataChange) onDataChange();

    } catch (error) {
      console.error('❌ Erreur lors de la soumission:', error);
      
      // Gestion des erreurs de validation Laravel
      if (error instanceof ValidationError) {
        console.log('❌ Erreurs de validation:', error.errors);
        setValidationErrors(error.errors);
        showMessage('Veuillez corriger les erreurs de validation', 'error');
      } else {
        showMessage(error.message || 'Erreur lors de la sauvegarde', 'error');
      }
    } finally {
      setSubmitting(false);
    }
  }, [medecinForm, editingMedecin, setMedecins, resetForm, showMessage, validateTelephone, onDataChange]);

  const editMedecin = useCallback((medecin) => {
    // Vérifier que le médecin existe et a un ID
    if (!medecin || !medecin.id) {
      console.error('Médecin ou ID manquant:', medecin);
      showMessage('Médecin introuvable ou ID manquant', 'error');
      return;
    }

    console.log('✏️ Édition du médecin:', medecin);

    setMedecinForm({
      nom_complet: medecin.nom_complet || '',
      numero_ordre: medecin.numero_ordre || '',
      telephone: medecin.telephone || '',
      adresse: medecin.adresse || ''
    });
    setEditingMedecin(medecin);
    setShowMedecinForm(true);
    setError('');
    setSuccess('');
    setValidationErrors({});
  }, [showMessage]);

  const deleteMedecin = useCallback(async (id) => {
    if (!id) {
      showMessage('ID du médecin manquant', 'error');
      return;
    }

    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce médecin ?')) {
      return;
    }

    try {
      setLoading(true);
      console.log('🗑️ Suppression du médecin ID:', id);
      
      // SUPPRESSION - Appel API
      await ApiService.deleteMedecin(id);
      
      // Supprimer de l'état local
      setMedecins(prevMedecins => 
        prevMedecins.filter(med => med.id !== id)
      );
      
      showMessage('Médecin supprimé avec succès');
      console.log('✅ Médecin supprimé');
      
      // Notifier le composant parent du changement
      if (onDataChange) {
        onDataChange();
      }
      
    } catch (error) {
      console.error('❌ Erreur lors de la suppression:', error);
      showMessage(error.message || 'Erreur lors de la suppression', 'error');
    } finally {
      setLoading(false);
    }
  }, [setMedecins, setLoading, showMessage, onDataChange]);

  const safeMedecins = useMemo(() => 
    Array.isArray(medecins) ? medecins : [], 
    [medecins]
  );

  const filteredMedecins = useMemo(() => {
    if (!searchTerm) return safeMedecins;
    
    const searchLower = searchTerm.toLowerCase();
    return safeMedecins.filter(medecin => 
      medecin.nom_complet?.toLowerCase().includes(searchLower) ||
      medecin.numero_ordre?.toLowerCase().includes(searchLower) ||
      medecin.telephone?.toLowerCase().includes(searchLower) ||
      medecin.adresse?.toLowerCase().includes(searchLower)
    );
  }, [safeMedecins, searchTerm]);

  const handleFormChange = useCallback((field, value) => {
    setMedecinForm(prev => ({ ...prev, [field]: value }));
    
    // Effacer l'erreur de validation pour ce champ
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [validationErrors]);

  // Nouvelle fonction pour gérer spécifiquement le téléphone
  const handleTelephoneChange = useCallback((e) => {
    const value = e.target.value.replace(/\D/g, ''); 
    
    // Limiter à 10 chiffres maximum
    if (value.length <= 10) {
      setMedecinForm(prev => ({ ...prev, telephone: value }));
      
      // Validation en temps réel
      const error = validateTelephone(value);
      setValidationErrors(prev => ({
        ...prev,
        telephone: error
      }));
    }
  }, [validateTelephone]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 w-full h-full">
      {/* Messages d'erreur et succès */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex items-center justify-between">
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 mr-2" />
            {error}
          </div>
          <button onClick={() => setError('')} className="text-red-700">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded flex items-center justify-between">
          <div className="flex items-center">
            <CheckCircle className="h-4 w-4 mr-2" />
            {success}
          </div>
          <button onClick={() => setSuccess('')} className="text-green-700">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-[-20px]">
        <div className="w-full text-center">
          <h2 className="text-black text-1xl sm:text-2xl font-bold">
            Gestion des Médecins
          </h2>
        </div>

        <div className="flex items-center gap-4 justify-center sm:justify-end w-full">
          <div className="flex items-center text-sm text-gray-500">
            <User className="h-4 w-4 mr-2" />
            {safeMedecins.length} médecin(s)
          </div>
          <button
            onClick={() => setShowMedecinForm(true)}
            disabled={loading || submitting}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200 font-medium"
          >
            <Plus className="h-4 w-4" />
            Nouveau Médecin
          </button>
        </div>
      </div>

      {/* Barre de recherche */}
      <div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, numéro ONM, téléphone ou adresse..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-700 placeholder-gray-400"
          />
        </div>
      </div>

      {/* Formulaire modal */}
      {showMedecinForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600" />
                  {editingMedecin ? 'Modifier Médecin' : 'Nouveau Médecin'}
                </h3>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
            </div>

            <form onSubmit={handleMedecinSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nom Complet */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom Complet *
                  </label>
                  <input
                    type="text"
                    value={medecinForm.nom_complet}
                    onChange={(e) => handleFormChange('nom_complet', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      validationErrors.nom_complet ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    required
                    disabled={submitting}
                    placeholder="Dr. Nom et Prénom"
                  />
                  {validationErrors.nom_complet && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.nom_complet}</p>
                  )}
                </div>

                {/* Numéro d'ordre */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Numéro ONM *
                  </label>
                  <input
                    type="text"
                    value={medecinForm.numero_ordre}
                    onChange={(e) => handleFormChange('numero_ordre', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      validationErrors.numero_ordre ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    required
                    disabled={submitting}
                    placeholder="Numéro d'ordre national des médecins"
                  />
                  {validationErrors.numero_ordre && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.numero_ordre}</p>
                  )}
                </div>

                {/* Téléphone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone *
                  </label>
                  <input
                    type="tel"
                    value={medecinForm.telephone}
                    onChange={handleTelephoneChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      validationErrors.telephone ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    required
                    disabled={submitting}
                    placeholder="0123456789"
                    maxLength="10"
                  />
                  {validationErrors.telephone && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.telephone}</p>
                  )}
                  {medecinForm.telephone && !validationErrors.telephone && medecinForm.telephone.length === 10 && (
                    <p className="text-green-500 text-xs mt-1 flex items-center">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Numéro valide
                    </p>
                  )}
                </div>

                {/* Adresse */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adresse *
                  </label>
                  <textarea
                    value={medecinForm.adresse}
                    onChange={(e) => handleFormChange('adresse', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      validationErrors.adresse ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    required
                    disabled={submitting}
                    placeholder="Adresse complète du médecin"
                    rows="3"
                  />
                  {validationErrors.adresse && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.adresse}</p>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={submitting || validationErrors.telephone}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  {submitting ? 'En cours...' : (editingMedecin ? 'Mettre à jour' : 'Ajouter le médecin')}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={submitting}
                  className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tableau des médecins */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">Chargement...</p>
          </div>
        ) : filteredMedecins.length === 0 ? (
          <div className="text-center py-12">
            <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'Aucun résultat trouvé' : 'Aucun médecin'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm 
                ? `Aucun médecin trouvé pour "${searchTerm}"`
                : 'Commencez par ajouter votre premier médecin'
              }
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowMedecinForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 mx-auto transition-colors"
              >
                <Plus className="h-4 w-4" />
                Ajouter un médecin
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">Nom Complet</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">N° ONM</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">Téléphone</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">Adresse</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {filteredMedecins.map((medecin) => (
                  <tr 
                    key={medecin.id} 
                    className="hover:bg-gray-50 transition-colors border-b border-gray-200"
                  >
                    <td className="px-4 py-2 border-r border-gray-200">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">Dr. {medecin.nom_complet}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900 font-medium border-r border-gray-200">
                      {medecin.numero_ordre}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900 border-r border-gray-200">
                      {medecin.telephone}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-500 border-r border-gray-200">
                      <div className="max-w-xs truncate" title={medecin.adresse}>
                        {medecin.adresse}
                      </div>
                    </td>
                    <td className="px-4 py-2 text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => editMedecin(medecin)}
                          disabled={loading || submitting}
                          className="text-blue-600 hover:text-blue-900 disabled:text-blue-300 p-1 rounded transition-colors"
                          title="Modifier"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteMedecin(medecin.id)}
                          disabled={loading || submitting}
                          className="text-red-600 hover:text-red-900 disabled:text-red-300 p-1 rounded transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default MedecinManagement;