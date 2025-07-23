import React, { useState, useCallback, useMemo } from 'react';
import { Plus, Edit2, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import ApiService from '../../Services/ApiService';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const MedicamentManagement = ({ medicaments, setMedicaments, onDataChange, loading, setLoading }) => {
  const [editingMedicament, setEditingMedicament] = useState(null);
  const [showMedicamentForm, setShowMedicamentForm] = useState(false);
  const [medicamentForm, setMedicamentForm] = useState({
    nom: '',
    prix: '',
    stock: '',
    status: 'sans'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fonction pour réinitialiser le formulaire
  const resetForm = useCallback(() => {
    setMedicamentForm({ nom: '', prix: '', stock: '', status: 'sans' });
    setEditingMedicament(null);
    setShowMedicamentForm(false);
    setError('');
    setSuccess('');
  }, []);

  const showMessage = useCallback((message, type = 'success') => {
    if (type === 'success') {
      toast.success(message);
    } else {
      toast.error(message);
    }
  }, []);

  const handleMedicamentSubmit = useCallback(async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      // Préparer les données à envoyer
      const medicamentData = {
        nom: medicamentForm.nom.trim(),
        prix: parseFloat(medicamentForm.prix),
        stock: parseInt(medicamentForm.stock),
        status: medicamentForm.status
      };

      // Validation côté client
      if (!medicamentData.nom || medicamentData.prix < 0 || medicamentData.stock < 0) {
        throw new Error('Veuillez remplir tous les champs avec des valeurs valides');
      }

      if (editingMedicament) {
        const updatedMedicament = { ...editingMedicament, ...medicamentData };
        
        // Mettre à jour l'UI immédiatement
        setMedicaments(prevMedicaments => 
          prevMedicaments.map(med => 
            med.id_medicament === editingMedicament.id_medicament 
              ? updatedMedicament
              : med
          )
        );
        
        try {
          await ApiService.updateMedicament(editingMedicament.id_medicament, medicamentData);
          showMessage('Médicament modifié avec succès!');
          resetForm();
          
        } catch (apiError) {
          setMedicaments(prevMedicaments => 
            prevMedicaments.map(med => 
              med.id_medicament === editingMedicament.id_medicament 
                ? editingMedicament 
                : med
            )
          );
          // Rethrow pour être capturé par le catch principal
          throw apiError;
        }
        
      } else {
        
        const tempId = `temp_${Date.now()}`;
        const newMedicament = { 
          ...medicamentData, 
          id_medicament: tempId,
          isTemp: true 
        };
        
        // Ajouter immédiatement à l'UI
        setMedicaments(prevMedicaments => [...prevMedicaments, newMedicament]);
        
        try {
          const response = await ApiService.createMedicament(medicamentData);
          
          // Remplacer le médicament temporaire par le vrai
          if (response && response.data) {
            setMedicaments(prevMedicaments => 
              prevMedicaments.map(med => 
                med.id_medicament === tempId 
                  ? { ...response.data, isTemp: false }
                  : med
              )
            );
          }
          
          showMessage('Médicament ajouté avec succès!');
          resetForm();
          
        } catch (apiError) {
          // En cas d'erreur, supprimer le médicament temporaire
          setMedicaments(prevMedicaments => 
            prevMedicaments.filter(med => med.id_medicament !== tempId)
          );
          // Rethrow pour être capturé par le catch principal
          throw apiError;
        }
      }

    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      showMessage(error.message || 'Erreur lors de la sauvegarde', 'error');
    }
  }, [medicamentForm, editingMedicament, setMedicaments, resetForm, showMessage]);

  const editMedicament = useCallback((medicament) => {
    if (!medicament || !medicament.id_medicament) {
      console.error('Médicament ou ID manquant:', medicament);
      toast.error('Médicament introuvable ou ID manquant');
      return;
    }

    setMedicamentForm({
      nom: medicament.nom || '',
      prix: medicament.prix?.toString() || '',
      stock: medicament.stock?.toString() || '',
      status: medicament.status || 'sans'
    });
    setEditingMedicament(medicament);
    setShowMedicamentForm(true);
    setError('');
    setSuccess('');
  }, []);

  const deleteMedicament = useCallback(async (id) => {
    if (!id) {
      toast.error('ID du médicament manquant');
      return;
    }

    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce médicament ?')) {
      return;
    }

    // Sauvegarder l'état actuel pour rollback
    const medicamentToDelete = medicaments.find(med => med.id_medicament === id);
    
    try {
      // Supprimer immédiatement de l'UI
      setMedicaments(prevMedicaments => 
        prevMedicaments.filter(med => med.id_medicament !== id)
      );
      
      await ApiService.deleteMedicament(id);
      
      toast.success('Médicament supprimé avec succès');
      
    } catch (error) {
      // En cas d'erreur, restaurer le médicament
      if (medicamentToDelete) {
        setMedicaments(prevMedicaments => [...prevMedicaments, medicamentToDelete]);
      }
      console.error('Erreur lors de la suppression:', error);
      toast.error(error.message || 'Erreur lors de la suppression');
    }
  }, [medicaments, setMedicaments]);

  const safeMedicaments = useMemo(() => 
    Array.isArray(medicaments) ? medicaments : [], 
    [medicaments]
  );

  const handleFormChange = useCallback((field, value) => {
    setMedicamentForm(prev => ({ ...prev, [field]: value }));
  }, []);

  return (
    <div className="space-y-6 w-full h-full">
      <ToastContainer position="top-right" />
      
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Gestion des Médicaments</h2>
        <button
          onClick={() => setShowMedicamentForm(true)}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Ajouter Médicament
        </button>
      </div>

      {/* Formulaire d'ajout/modification */}
      {showMedicamentForm && (
        <div className="bg-white p-6 rounded-lg shadow-lg border">
          <h3 className="text-lg font-semibold mb-4">
            {editingMedicament ? 'Modifier Médicament' : 'Ajouter Médicament'}
          </h3>
          <form onSubmit={handleMedicamentSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom du Médicament *
              </label>
              <input
                type="text"
                value={medicamentForm.nom}
                onChange={(e) => handleFormChange('nom', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={loading}
                placeholder="Nom du médicament"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prix (Ar) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={medicamentForm.prix}
                onChange={(e) => handleFormChange('prix', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={loading}
                placeholder="Prix en Ariary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock *
              </label>
              <input
                type="number"
                min="0"
                value={medicamentForm.stock}
                onChange={(e) => handleFormChange('stock', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={loading}
                placeholder="Quantité en stock"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status *
              </label>
              <select
                value={medicamentForm.status}
                onChange={(e) => handleFormChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              >
                <option value="sans">Sans Ordonnance</option>
                <option value="avec">Avec Ordonnance</option>
              </select>
            </div>
            <div className="md:col-span-2 flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <CheckCircle className="h-4 w-4" />
                {editingMedicament ? 'Modifier' : 'Ajouter'}
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
          </form>
        </div>
      )}

      {/* Tableau des médicaments */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden w-full">
        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-full table-auto">
            <colgroup>
              <col className="w-3/12" />
              <col className="w-2/12" />
              <col className="w-2/12" />
              <col className="w-3/12" />
              <col className="w-2/12" />
            </colgroup>
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nom
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prix
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {safeMedicaments.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    {loading ? 'Chargement...' : 'Aucun médicament trouvé'}
                  </td>
                </tr>
              ) : (
                safeMedicaments.map((medicament) => (
                  <tr 
                    key={medicament.id_medicament} 
                    className={`hover:bg-gray-50 ${medicament.isTemp ? 'opacity-70' : ''}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {medicament.nom}
                      {medicament.isTemp && <span className="text-xs text-gray-500 ml-2">(en cours...)</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {medicament.prix} Ar
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`${medicament.stock <= 5 ? 'text-red-600 font-semibold' : ''}`}>
                        {medicament.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        medicament.status === 'sans' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {medicament.status === 'sans' ? 'Sans Ordonnance' : 'Avec Ordonnance'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => editMedicament(medicament)}
                        disabled={loading || medicament.isTemp}
                        className="text-blue-600 hover:text-blue-900 disabled:text-blue-300 mr-3 transition-colors"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteMedicament(medicament.id_medicament)}
                        disabled={loading || medicament.isTemp}
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

export default MedicamentManagement;