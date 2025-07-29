import React, { useState, useCallback, useMemo } from 'react';
import { Plus, Edit2, Trash2, AlertCircle, CheckCircle, Search } from 'lucide-react';
import ApiService from '../../Services/ApiService';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const MedecinManagement = ({ medecins, setMedecins, onDataChange, loading, setLoading }) => {
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
      toast.success(message);
    } else {
      toast.error(message);
    }
  }, []);

  const handleMedecinSubmit = useCallback(async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      // Préparer les données à envoyer
      const medecinData = {
        nom_complet: medecinForm.nom_complet.trim(),
        numero_ordre: medecinForm.numero_ordre.trim(),
        telephone: medecinForm.telephone.trim(),
        adresse: medecinForm.adresse.trim()
      };

      // Validation côté client
      if (!medecinData.nom_complet || !medecinData.numero_ordre || 
          !medecinData.telephone || !medecinData.adresse) {
        throw new Error('Veuillez remplir tous les champs obligatoires');
      }

      // Validation téléphone côté client
      const phoneError = validateTelephone(medecinData.telephone);
      if (phoneError) {
        throw new Error(phoneError);
      }

      if (editingMedecin) {
        if (!editingMedecin.id) {
          throw new Error('ID du médecin manquant pour la modification');
        }

        const updatedMedecin = { ...editingMedecin, ...medecinData };
        
        // Mettre à jour l'UI immédiatement
        setMedecins(prevMedecins => 
          prevMedecins.map(med => 
            med.id === editingMedecin.id 
              ? updatedMedecin
              : med
          )
        );
        
        resetForm();
        
        // Appel API en arrière-plan
        try {
          await ApiService.updateMedecin(editingMedecin.id, medecinData);
          showMessage('Médecin modifié avec succès!');
        } catch (apiError) {
          setMedecins(prevMedecins => 
            prevMedecins.map(med => 
              med.id === editingMedecin.id 
                ? editingMedecin 
                : med
            )
          );
          // Pré-remplir formulaire
          setMedecinForm({
            nom_complet: editingMedecin.nom_complet || '',
            numero_ordre: editingMedecin.numero_ordre || '',
            telephone: editingMedecin.telephone || '',
            adresse: editingMedecin.adresse || ''
          });
          setEditingMedecin(editingMedecin);
          setShowMedecinForm(true);
          throw apiError;
        }
        
      } else {
        const tempId = `temp_${Date.now()}`;
        const newMedecin = { 
          ...medecinData, 
          id: tempId,
          isTemp: true 
        };
        
        // Ajouter immédiatement à l'UI
        setMedecins(prevMedecins => [...prevMedecins, newMedecin]);
        resetForm();
        
        // Appel API en arrière-plan
        try {
          const response = await ApiService.createMedecin(medecinData);
          
          // Remplacer le médecin temporaire par le vrai
          if (response && response.data) {
            setMedecins(prevMedecins => 
              prevMedecins.map(med => 
                med.id === tempId 
                  ? { ...response.data, isTemp: false }
                  : med
              )
            );
          } else if (response) {
            setMedecins(prevMedecins => 
              prevMedecins.map(med => 
                med.id === tempId 
                  ? { ...response, isTemp: false }
                  : med
              )
            );
          }
          showMessage('Médecin ajouté avec succès!');
        } catch (apiError) {
          setMedecins(prevMedecins => 
            prevMedecins.filter(med => med.id !== tempId)
          );
          setMedecinForm(medecinData);
          setShowMedecinForm(true);
          throw apiError;
        }
      }

    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      showMessage(error.message || 'Erreur lors de la sauvegarde', 'error');
    }
  }, [medecinForm, editingMedecin, setMedecins, resetForm, showMessage, validateTelephone]);

  const editMedecin = useCallback((medecin) => {
    // Vérifier que le médecin existe et a un ID
    if (!medecin || !medecin.id) {
      console.error('Médecin ou ID manquant:', medecin);
      toast.error('Médecin introuvable ou ID manquant');
      return;
    }

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
  }, []);

  const deleteMedecin = useCallback(async (id) => {
    if (!id) {
      toast.error('ID du médecin manquant');
      return;
    }

    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce médecin ?')) {
      return;
    }

    // Sauvegarder l'état actuel pour rollback
    const medecinToDelete = medecins.find(med => med.id === id);
    
    try {
      // Supprimer immédiatement de l'UI
      setMedecins(prevMedecins => 
        prevMedecins.filter(med => med.id !== id)
      );
      
      await ApiService.deleteMedecin(id);
      toast.success('Médecin supprimé avec succès');
      
    } catch (error) {
      // En cas d'erreur, restaurer le médecin
      if (medecinToDelete) {
        setMedecins(prevMedecins => [...prevMedecins, medecinToDelete]);
      }
      console.error('Erreur lors de la suppression:', error);
      toast.error(error.message || 'Erreur lors de la suppression');
    }
  }, [medecins, setMedecins]);

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

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  return (
    <div className="space-y-6 w-full h-full">
      <ToastContainer position="top-right" />
      
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Gestion des Médecins</h2>
        <button
          onClick={() => setShowMedecinForm(true)}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Ajouter Médecin
        </button>
      </div>

      {/* Formulaire d'ajout/modification */}
      {showMedecinForm && (
        <div className="bg-white p-6 rounded-lg shadow-lg border">
          <h3 className="text-lg font-semibold mb-4">
            {editingMedecin ? 'Modifier Médecin' : 'Ajouter Médecin'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nom Complet - pleine largeur */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom Complet <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={medecinForm.nom_complet}
                onChange={(e) => handleFormChange('nom_complet', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={loading}
                placeholder="Dr. Nom Prénom"
              />
            </div>

           {/* Numéro ONM */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Numéro ONM <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={medecinForm.numero_ordre}
                onChange={(e) => handleFormChange('numero_ordre', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={loading}
                placeholder="Numéro d'ordre national des médecins"
              />
            </div>

           {/* Téléphone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Téléphone <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={medecinForm.telephone}
                onChange={handleTelephoneChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  validationErrors.telephone 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 focus:ring-blue-500'
                }`}
                required
                disabled={loading}
                placeholder="0123456789"
                maxLength="10"
              />
                {validationErrors.telephone && (
                <div className="mt-1 flex items-center text-red-600 text-sm">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {validationErrors.telephone}
                </div>
                )}
                {medecinForm.telephone && !validationErrors.telephone && medecinForm.telephone.length === 10 && (
                <div className="mt-1 flex items-center text-green-600 text-sm">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Numéro valide
                </div>
              )}
            </div>

            {/* Adresse - pleine largeur */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adresse <span className="text-red-500">*</span>
              </label>
              <textarea
                value={medecinForm.adresse}
                onChange={(e) => handleFormChange('adresse', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={loading}
                placeholder="Adresse complète du médecin"
              />
            </div>

            {/* Boutons */}
            <div className="md:col-span-2 flex gap-2">
              <button
                type="button"
                onClick={handleMedecinSubmit}
                disabled={loading || validationErrors.telephone}
                className="bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <CheckCircle className="h-4 w-4" />
                {editingMedecin ? 'Modifier' : 'Ajouter'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                disabled={loading}
                className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Barre de recherche */}
      <div className="bg-white p-4 rounded-lg shadow-lg">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, numéro ONM, téléphone ou adresse..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Tableau des médecins */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden w-full">
        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-full table-auto">
            <colgroup>
              <col className="w-3/12" />
              <col className="w-2/12" />
              <col className="w-2/12" />
              <col className="w-4/12" />
              <col className="w-1/12" />
            </colgroup>
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nom Complet
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  N° ONM
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Téléphone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Adresse
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMedecins.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    {loading ? 'Chargement...' : 
                     searchTerm ? `Aucun médecin trouvé pour "${searchTerm}"` : 
                     'Aucun médecin enregistré'}
                  </td>
                </tr>
              ) : (
                filteredMedecins.map((medecin) => (
                  <tr 
                    key={medecin.id} 
                    className={`hover:bg-gray-50 ${medecin.isTemp ? 'opacity-70' : ''}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Dr {medecin.nom_complet}
                      {medecin.isTemp && <span className="text-xs text-gray-500 ml-2">(en cours...)</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {medecin.numero_ordre}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {medecin.telephone}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="max-w-xs truncate" title={medecin.adresse}>
                        {medecin.adresse}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => editMedecin(medecin)}
                        disabled={loading || medecin.isTemp}
                        className="text-blue-600 hover:text-blue-900 disabled:text-blue-300 mr-3 transition-colors"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteMedecin(medecin.id)}
                        disabled={loading || medecin.isTemp}
                        className="text-red-600 hover:text-red-900 disabled:text-red-300 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MedecinManagement;