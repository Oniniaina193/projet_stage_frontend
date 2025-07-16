import React, { useState } from 'react';
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
  const resetForm = () => {
    setMedicamentForm({ nom: '', prix: '', stock: '', status: 'sans' });
    setEditingMedicament(null);
    setShowMedicamentForm(false);
    setError('');
    setSuccess('');
  };

  // Fonction pour afficher les messages temporaires
  const showMessage = (message, type = 'success') => {
    if (type === 'success') {
      setSuccess(message);
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(message);
      setTimeout(() => setError(''), 5000);
    }
  };

  // 3. CORRECTION dans handleMedicamentSubmit
const handleMedicamentSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
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

    let response;
    if (editingMedicament) {
      // Vérifier que l'ID existe
      if (!editingMedicament.id_medicament) {
        throw new Error('ID du médicament manquant pour la modification');
      }
      
      console.log('Modification du médicament ID:', editingMedicament.id_medicament);
      console.log('Données à envoyer:', medicamentData);
      
      // Modifier un médicament existant
      response = await ApiService.updateMedicament(editingMedicament.id_medicament, medicamentData);
      showMessage('Médicament modifié avec succès!');
      
      // CORRECTION : Utiliser id_medicament pour la mise à jour
      setMedicaments(prevMedicaments => 
        prevMedicaments.map(med => 
          med.id_medicament === editingMedicament.id_medicament 
            ? { ...med, ...medicamentData } 
            : med
        )
      );
    } else {
      // Créer un nouveau médicament
      response = await ApiService.createMedicament(medicamentData);
      console.log('Réponse création:', response);
      showMessage('Médicament ajouté avec succès!');
      
      // Ajouter le nouveau médicament à la liste locale
      if (response && response.data) {
        setMedicaments(prevMedicaments => [...prevMedicaments, response.data]);
      }
    }

    // Réinitialiser le formulaire après succès
    resetForm();

    // Optionnel : recharger les données depuis l'API si nécessaire
    if (onDataChange) {
      await onDataChange();
    }

  } catch (error) {
    console.error('Erreur lors de la soumission:', error);
    showMessage(error.message || 'Erreur lors de la sauvegarde', 'error');
  } finally {
    setLoading(false);
  }
};

  const editMedicament = (medicament) => {
  // Vérifier que le médicament existe et a un ID
  if (!medicament || !medicament.id_medicament) {
    console.error('Médicament ou ID manquant:', medicament);
    toast.error('Médicament introuvable ou ID manquant');
    return;
  }

  console.log('Édition du médicament:', medicament);

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
};

// 2. CORRECTION dans deleteMedicament
const deleteMedicament = async (id) => {
  if (!id) {
    toast.error('ID du médicament manquant');
    return;
  }

  // Confirmation avant suppression
  if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce médicament ?')) {
    return;
  }

  try {
    setLoading(true);
    
    // Appel à l'API avec l'ID correct
    await ApiService.deleteMedicament(id);
    
    // CORRECTION : Utiliser id_medicament pour filtrer
    setMedicaments(prevMedicaments => 
      prevMedicaments.filter(med => med.id_medicament !== id)
    );
    
    toast.success('Médicament supprimé avec succès');
  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
    toast.error(error.message || 'Erreur lors de la suppression');
  } finally {
    setLoading(false);
  }
};

  // Vérifier que medicaments est un tableau
  const safeMedicaments = Array.isArray(medicaments) ? medicaments : [];

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

      {/* Messages d'erreur et de succès */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          <span>{success}</span>
        </div>
      )}

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
                onChange={(e) => setMedicamentForm({...medicamentForm, nom: e.target.value})}
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
                onChange={(e) => setMedicamentForm({...medicamentForm, prix: e.target.value})}
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
                onChange={(e) => setMedicamentForm({...medicamentForm, stock: e.target.value})}
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
                onChange={(e) => setMedicamentForm({...medicamentForm, status: e.target.value})}
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
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
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
                  <tr key={medicament.id_medicament} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {medicament.nom}
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
                        disabled={loading}
                        className="text-blue-600 hover:text-blue-900 disabled:text-blue-300 mr-3 transition-colors"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteMedicament(medicament.id_medicament)}
                        disabled={loading}
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