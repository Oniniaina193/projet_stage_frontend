import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Plus, Edit2, Trash2, Package, Search, AlertTriangle, CheckCircle, X, Pill } from 'lucide-react';
import ApiService, { ValidationError } from '../../Services/ApiService';

const MedicamentManagement = ({ medicaments = [], setMedicaments, onDataChange, loading, setLoading }) => {
  const [editingMedicament, setEditingMedicament] = useState(null);
  const [showMedicamentForm, setShowMedicamentForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [medicamentForm, setMedicamentForm] = useState({
    nom: '',
    prix: '',
    stock: '',
    famille: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [famillesSuggestions, setFamillesSuggestions] = useState([]);
  const [showFamillesSuggestions, setShowFamillesSuggestions] = useState(false);

  // Charger les médicaments et suggestions au démarrage
  useEffect(() => {
    if (medicaments.length === 0) {
      loadMedicaments();
    }
    loadFamillesSuggestions();
  }, []);

  const loadMedicaments = async () => {
    try {
      setLoading(true);
      console.log('🔄 Chargement des médicaments...');
      
      const response = await ApiService.getMedicaments();
      console.log('📦 Réponse API médicaments:', response);
      
      let medicamentsData = [];
      
      // Adaptation au format de votre API
      if (response && response.success && response.data && response.data.data) {
        // Format paginé: response.data.data contient le tableau
        medicamentsData = Array.isArray(response.data.data) ? response.data.data : [];
      } else if (response && response.success && Array.isArray(response.data)) {
        // Format direct: response.data est le tableau
        medicamentsData = response.data;
      } else if (Array.isArray(response)) {
        // Format très direct: response est le tableau
        medicamentsData = response;
      } else if (response && response.data) {
        medicamentsData = Array.isArray(response.data) ? response.data : [];
      }
      
      console.log('✅ Médicaments chargés:', medicamentsData.length);
      setMedicaments(medicamentsData);
      
    } catch (error) {
      console.error('❌ Erreur lors du chargement des médicaments:', error);
      showMessage('Erreur lors du chargement des médicaments: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Charger les suggestions de familles
  const loadFamillesSuggestions = async () => {
    try {
      console.log('🔄 Chargement des suggestions de familles...');
      const response = await ApiService.getFamillesSuggestions();
      console.log('📦 Suggestions familles:', response);
      
      let suggestions = [];
      if (response && response.success && Array.isArray(response.data)) {
        suggestions = response.data;
      } else if (Array.isArray(response)) {
        suggestions = response;
      } else if (response && response.familles && Array.isArray(response.familles)) {
        suggestions = response.familles;
      }
      
      setFamillesSuggestions(suggestions);
      console.log('✅ Suggestions de familles chargées:', suggestions.length);
      
    } catch (error) {
      console.error('❌ Erreur lors du chargement des suggestions:', error);
      // Ne pas afficher d'erreur pour les suggestions, c'est optionnel
    }
  };

  // Fonction pour réinitialiser le formulaire
  const resetForm = useCallback(() => {
    setMedicamentForm({ nom: '', prix: '', stock: '', famille: '' });
    setEditingMedicament(null);
    setShowMedicamentForm(false);
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

  const handleMedicamentSubmit = useCallback(async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setValidationErrors({});

    try {
      setLoading(true);
      
      const medicamentData = {
        nom: medicamentForm.nom.trim(),
        prix: parseFloat(medicamentForm.prix),
        stock: parseInt(medicamentForm.stock),
        famille: medicamentForm.famille.trim() || null
      };

      console.log('📝 Données à soumettre:', medicamentData);

      let result;
      
      if (editingMedicament) {
        // UPDATE - Modifier un médicament existant
        console.log('🔄 Modification du médicament ID:', editingMedicament.id_medicament);
        result = await ApiService.updateMedicament(editingMedicament.id_medicament, medicamentData);
        
        // Mettre à jour dans la liste locale
        setMedicaments(prevMedicaments => 
          prevMedicaments.map(med => 
            med.id_medicament === editingMedicament.id_medicament 
              ? { ...med, ...medicamentData }
              : med
          )
        );
        
        showMessage('Médicament modifié avec succès!');
        
      } else {
        // CREATE - Ajouter un nouveau médicament
        console.log('🔄 Création d\'un nouveau médicament');
        result = await ApiService.createMedicament(medicamentData);
        
        // Ajouter à la liste locale
        const newMedicament = result.data || result.medicament || { ...medicamentData, id_medicament: Date.now() };
        setMedicaments(prevMedicaments => [...prevMedicaments, newMedicament]);
        
        showMessage('Médicament ajouté avec succès!');
      }

      console.log('✅ Opération réussie:', result);
      resetForm();
      if (onDataChange) onDataChange();

    } catch (error) {
      console.error('❌ Erreur lors de la soumission:', error);
      
      if (error instanceof ValidationError) {
        // Erreurs de validation du serveur
        console.log('❌ Erreurs de validation:', error.errors);
        setValidationErrors(error.errors);
        showMessage('Veuillez corriger les erreurs de validation', 'error');
      } else {
        // Autres erreurs
        showMessage(error.message || 'Erreur lors de la sauvegarde', 'error');
      }
    } finally {
      setLoading(false);
    }
  }, [medicamentForm, editingMedicament, setMedicaments, resetForm, showMessage, onDataChange, setLoading]);

  const editMedicament = useCallback((medicament) => {
    if (!medicament || !medicament.id_medicament) {
      console.error('Médicament ou ID manquant:', medicament);
      showMessage('Médicament introuvable ou ID manquant', 'error');
      return;
    }

    console.log('✏️ Édition du médicament:', medicament);
    
    setMedicamentForm({
      nom: medicament.nom || '',
      prix: medicament.prix?.toString() || '',
      stock: medicament.stock?.toString() || '',
      famille: medicament.famille || ''
    });
    setEditingMedicament(medicament);
    setShowMedicamentForm(true);
    setError('');
    setSuccess('');
    setValidationErrors({});
  }, [showMessage]);

  const deleteMedicament = useCallback(async (id) => {
    if (!id) {
      showMessage('ID du médicament manquant', 'error');
      return;
    }

    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce médicament ?')) {
      return;
    }

    try {
      setLoading(true);
      console.log('🗑️ Suppression du médicament ID:', id);
      
      // DELETE - Supprimer le médicament via l'API
      await ApiService.deleteMedicament(id);
      
      // Supprimer de la liste locale
      setMedicaments(prevMedicaments => 
        prevMedicaments.filter(med => med.id_medicament !== id)
      );
      
      showMessage('Médicament supprimé avec succès');
      console.log('✅ Médicament supprimé');
      
      if (onDataChange) onDataChange();
      
    } catch (error) {
      console.error('❌ Erreur lors de la suppression:', error);
      showMessage(error.message || 'Erreur lors de la suppression', 'error');
    } finally {
      setLoading(false);
    }
  }, [setMedicaments, onDataChange, showMessage, setLoading]);

  const safeMedicaments = useMemo(() => 
    Array.isArray(medicaments) ? medicaments : [], 
    [medicaments]
  );

  const filteredMedicaments = useMemo(() => {
    if (!searchTerm) return safeMedicaments;
    
    const searchLower = searchTerm.toLowerCase();
    return safeMedicaments.filter(medicament => 
      medicament.nom?.toLowerCase().includes(searchLower) ||
      medicament.famille?.toLowerCase().includes(searchLower)
    );
  }, [safeMedicaments, searchTerm]);

  const handleFormChange = useCallback((field, value) => {
    setMedicamentForm(prev => ({ ...prev, [field]: value }));
    
    // Gérer l'affichage des suggestions pour le champ famille
    if (field === 'famille') {
      setShowFamillesSuggestions(value.length > 0 && famillesSuggestions.length > 0);
    }
    
    // Nettoyer l'erreur de validation pour ce champ
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [validationErrors, famillesSuggestions]);

  // Sélectionner une suggestion de famille
  const selectFamilleSuggestion = useCallback((famille) => {
    setMedicamentForm(prev => ({ ...prev, famille: famille }));
    setShowFamillesSuggestions(false);
  }, []);

  // Filtrer les suggestions en fonction de la saisie
  const filteredFamillesSuggestions = useMemo(() => {
    if (!medicamentForm.famille || !famillesSuggestions.length) return [];
    
    const searchTerm = medicamentForm.famille.toLowerCase();
    return famillesSuggestions.filter(famille => 
      famille.toLowerCase().includes(searchTerm) && 
      famille.toLowerCase() !== searchTerm
    ).slice(0, 5); // Limiter à 5 suggestions
  }, [medicamentForm.famille, famillesSuggestions]);

  // Statistiques des familles
  const famillesStats = useMemo(() => {
    const famillesCount = {};
    safeMedicaments.forEach(med => {
      if (med.famille) {
        famillesCount[med.famille] = (famillesCount[med.famille] || 0) + 1;
      } else {
        famillesCount['Non définie'] = (famillesCount['Non définie'] || 0) + 1;
      }
    });
    return famillesCount;
  }, [safeMedicaments]);

  // Médicaments en rupture de stock
  const stockFaible = useMemo(() => 
    safeMedicaments.filter(med => med.stock <= 5).length,
    [safeMedicaments]
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 w-full h-full">
      {/* Messages d'erreur et succès */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex items-center justify-between">
          <div className="flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2" />
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

      {/* Header*/}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-[-20px]">
        <div className="w-full text-center">
          <h2 className="text-black text-1xl sm:text-2xl font-bold">
            Gestion des Médicaments avec ordonnance
          </h2>
        </div>

        <div className="flex items-center gap-4 justify-center sm:justify-end w-full">
          <div className="flex items-center text-sm text-gray-500">
            <Pill className="h-4 w-4 mr-2" />
            {safeMedicaments.length} médicament(s)
          </div>
          {stockFaible > 0 && (
            <div className="flex items-center text-sm text-red-600">
              <AlertTriangle className="h-4 w-4 mr-2" />
              {stockFaible} en rupture
            </div>
          )}
          <button
            onClick={() => setShowMedicamentForm(true)}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200 font-medium"
          >
            <Plus className="h-4 w-4" />
            Nouveau Médicament
          </button>
        </div>
      </div>

      {/* Statistiques des familles 
      {Object.keys(famillesStats).length > 0 && (
        <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Répartition par famille</h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(famillesStats).map(([famille, count]) => (
              <span
                key={famille}
                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
              >
                {famille}: {count}
              </span>
            ))}
          </div>
        </div>
      )}*/}

      {/* Barre de recherche */}
      <div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par nom ou famille de médicament..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-700 placeholder-gray-400"
          />
        </div>
      </div>

      {/* Formulaire modal */}
      {showMedicamentForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Package className="h-5 w-5 text-blue-600" />
                  {editingMedicament ? 'Modifier Médicament' : 'Nouveau Médicament'}
                </h3>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
            </div>

            <form onSubmit={handleMedicamentSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom du Médicament *
                  </label>
                  <input
                    type="text"
                    value={medicamentForm.nom}
                    onChange={(e) => handleFormChange('nom', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      validationErrors.nom ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    required
                    disabled={loading}
                    placeholder="Ex: Paracétamol 500mg"
                  />
                  {validationErrors.nom && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.nom}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prix (Ar) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={medicamentForm.prix}
                    onChange={(e) => handleFormChange('prix', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      validationErrors.prix ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    required
                    disabled={loading}
                    placeholder="Prix en Ariary"
                  />
                  {validationErrors.prix && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.prix}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={medicamentForm.stock}
                    onChange={(e) => handleFormChange('stock', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      validationErrors.stock ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    required
                    disabled={loading}
                    placeholder="Quantité en stock"
                  />
                  {validationErrors.stock && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.stock}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Famille
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={medicamentForm.famille}
                      onChange={(e) => handleFormChange('famille', e.target.value)}
                      onFocus={() => setShowFamillesSuggestions(filteredFamillesSuggestions.length > 0)}
                      onBlur={() => setTimeout(() => setShowFamillesSuggestions(false), 200)}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        validationErrors.famille ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      disabled={loading}
                      placeholder="Ex: Comprimés, Sirop, Piqûre..."
                    />
                    
                    {/* Suggestions dropdown */}
                    {showFamillesSuggestions && filteredFamillesSuggestions.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {filteredFamillesSuggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => selectFamilleSuggestion(suggestion)}
                            className="w-full px-4 py-2 text-left hover:bg-blue-50 hover:text-blue-600 transition-colors border-b border-gray-100 last:border-b-0"
                          >
                            <span className="text-sm font-medium">{suggestion}</span>
                          </button>
                        ))}
                      </div>
                    )}
                    
                    {/* Suggestions populaires */}
                    {!medicamentForm.famille && famillesSuggestions.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                        <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
                          <span className="text-xs font-medium text-gray-600">Familles populaires:</span>
                        </div>
                        <div className="p-2 flex flex-wrap gap-1">
                          {famillesSuggestions.slice(0, 8).map((suggestion, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => selectFamilleSuggestion(suggestion)}
                              className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  {validationErrors.famille && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.famille}</p>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  {loading ? 'En cours...' : (editingMedicament ? 'Mettre à jour' : 'Ajouter le médicament')}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={loading}
                  className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tableau des médicaments */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">Chargement...</p>
          </div>
        ) : filteredMedicaments.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'Aucun résultat trouvé' : 'Aucun médicament'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm 
                ? `Aucun médicament trouvé pour "${searchTerm}"`
                : 'Commencez par ajouter votre premier médicament'
              }
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowMedicamentForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 mx-auto transition-colors"
              >
                <Plus className="h-4 w-4" />
                Ajouter un médicament
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">Médicament</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">Prix</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">Stock</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">Famille</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {filteredMedicaments.map((medicament) => (
                  <tr 
                    key={medicament.id_medicament} 
                    className="hover:bg-gray-50 transition-colors border-b border-gray-200"
                  >
                    <td className="ppx-4 py-2 border-r border-gray-200">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{medicament.nom}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 font-medium border-r border-gray-200">
                      {Number(medicament.prix).toLocaleString()} Ar
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${
                        medicament.stock <= 5 
                          ? 'text-red-600 bg-red-100 px-2 py-1 rounded-full' 
                          : medicament.stock <= 10
                          ? 'text-orange-600 bg-orange-100 px-2 py-1 rounded-full'
                          : 'text-green-600'
                      }`}>
                        {medicament.stock}
                        {medicament.stock <= 5 && (
                          <AlertTriangle className="h-3 w-3 inline ml-1" />
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap border-r border-gray-200">
                      {medicament.famille ? (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {medicament.famille}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs italic">Non définie</span>
                      )}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium border-r border-gray-200">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => editMedicament(medicament)}
                          disabled={loading}
                          className="text-blue-600 hover:text-blue-900 disabled:text-blue-300 p-1 rounded transition-colors"
                          title="Modifier"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteMedicament(medicament.id_medicament)}
                          disabled={loading}
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
    </div>
  );
};

export default MedicamentManagement;