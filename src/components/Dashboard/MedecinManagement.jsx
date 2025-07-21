import React, { useState } from 'react';
import { Plus, Edit2, Trash2, AlertCircle, CheckCircle, Search } from 'lucide-react';
import ApiService from '../../Services/ApiService';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const MedecinManagement = ({ medecins, setMedecins, onDataChange, loading, setLoading }) => {
  const [editingMedecin, setEditingMedecin] = useState(null);
  const [showMedecinForm, setShowMedecinForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [medecinForm, setMedecinForm] = useState({
    nom: '',
    prenom: '',
    specialite: '',
    numero_ordre: '',
    telephone: '',
    email: '',
    adresse: '',
    actif: true
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fonction pour réinitialiser le formulaire
  const resetForm = () => {
    setMedecinForm({
      nom: '',
      prenom: '',
      specialite: '',
      numero_ordre: '',
      telephone: '',
      email: '',
      adresse: '',
      actif: true
    });
    setEditingMedecin(null);
    setShowMedecinForm(false);
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

  // Gestion de la soumission du formulaire
  const handleMedecinSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Préparer les données à envoyer
      const medecinData = {
        nom: medecinForm.nom.trim(),
        prenom: medecinForm.prenom.trim(),
        specialite: medecinForm.specialite.trim(),
        numero_ordre: medecinForm.numero_ordre.trim(),
        telephone: medecinForm.telephone.trim(),
        email: medecinForm.email.trim(),
        adresse: medecinForm.adresse.trim(),
        actif: medecinForm.actif
      };

      // Validation côté client
      if (!medecinData.nom || !medecinData.prenom || !medecinData.specialite || 
          !medecinData.numero_ordre || !medecinData.telephone || !medecinData.email || 
          !medecinData.adresse) {
        throw new Error('Veuillez remplir tous les champs obligatoires');
      }

      // Validation email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(medecinData.email)) {
        throw new Error('Veuillez entrer une adresse email valide');
      }

      let response;
      if (editingMedecin) {
        // Vérifier que l'ID existe
        if (!editingMedecin.id) {
          throw new Error('ID du médecin manquant pour la modification');
        }
        
        console.log('Modification du médecin ID:', editingMedecin.id);
        console.log('Données à envoyer:', medecinData);
        
        // Modifier un médecin existant - Utilisation de la méthode statique
        response = await ApiService.updateMedecin(editingMedecin.id, medecinData);
        showMessage('Médecin modifié avec succès!');
        toast.success('Médecin modifié avec succès!');
        
        // Mettre à jour la liste locale
        setMedecins(prevMedecins => 
          prevMedecins.map(med => 
            med.id === editingMedecin.id 
              ? { ...med, ...medecinData } 
              : med
          )
        );
      } else {
        // Créer un nouveau médecin - Utilisation de la méthode statique
        response = await ApiService.createMedecin(medecinData);
        console.log('Réponse création:', response);
        showMessage('Médecin ajouté avec succès!');
        toast.success('Médecin ajouté avec succès!');

        if (onDataChange) {
          await onDataChange(); // Ceci va recharger les médecins depuis l'API
        }
        
        // Ajouter le nouveau médecin à la liste locale
        if (response && response.data) {
          setMedecins(prevMedecins => [...prevMedecins, response.data]);
        } else if (response) {
          // Si la réponse est directement l'objet médecin
          setMedecins(prevMedecins => [...prevMedecins, response]);
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
      const errorMessage = error.message || 'Erreur lors de la sauvegarde';
      showMessage(errorMessage, 'error');
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const editMedecin = (medecin) => {
    // Vérifier que le médecin existe et a un ID
    if (!medecin || !medecin.id) {
      console.error('Médecin ou ID manquant:', medecin);
      toast.error('Médecin introuvable ou ID manquant');
      return;
    }

    console.log('Édition du médecin:', medecin);

    setMedecinForm({
      nom: medecin.nom || '',
      prenom: medecin.prenom || '',
      specialite: medecin.specialite || '',
      numero_ordre: medecin.numero_ordre || '',
      telephone: medecin.telephone || '',
      email: medecin.email || '',
      adresse: medecin.adresse || '',
      actif: medecin.actif !== undefined ? medecin.actif : true
    });
    setEditingMedecin(medecin);
    setShowMedecinForm(true);
    setError('');
    setSuccess('');
  };

  const deleteMedecin = async (id) => {
    if (!id) {
      toast.error('ID du médecin manquant');
      return;
    }

    // Confirmation avant suppression
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce médecin ?')) {
      return;
    }

    try {
      setLoading(true);
      
      // Appel à l'API avec l'ID correct - Utilisation de la méthode statique
      await ApiService.deleteMedecin(id);
      
      // Supprimer de la liste locale
      setMedecins(prevMedecins => 
        prevMedecins.filter(med => med.id !== id)
      );
      
      toast.success('Médecin supprimé avec succès');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error(error.message || 'Erreur lors de la suppression');
    } finally {
      setLoading(false);
    }
  };

  // Vérifier que medecins est un tableau
  const safeMedecins = Array.isArray(medecins) ? medecins : [];

  // Filtrage des médecins
  const filteredMedecins = safeMedecins.filter(medecin => {
    const searchLower = searchTerm.toLowerCase();
    return (
      medecin.nom?.toLowerCase().includes(searchLower) ||
      medecin.prenom?.toLowerCase().includes(searchLower) ||
      medecin.specialite?.toLowerCase().includes(searchLower) ||
      medecin.numero_ordre?.toLowerCase().includes(searchLower) ||
      medecin.email?.toLowerCase().includes(searchLower)
    );
  });

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
      {showMedecinForm && (
        <div className="bg-white p-6 rounded-lg shadow-lg border">
          <h3 className="text-lg font-semibold mb-4">
            {editingMedecin ? 'Modifier Médecin' : 'Ajouter Médecin'}
          </h3>
          <form onSubmit={handleMedecinSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom *
              </label>
              <input
                type="text"
                value={medecinForm.nom}
                onChange={(e) => setMedecinForm({...medecinForm, nom: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={loading}
                placeholder="Nom du médecin"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prénom *
              </label>
              <input
                type="text"
                value={medecinForm.prenom}
                onChange={(e) => setMedecinForm({...medecinForm, prenom: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={loading}
                placeholder="Prénom du médecin"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Spécialité *
              </label>
              <input
                type="text"
                value={medecinForm.specialite}
                onChange={(e) => setMedecinForm({...medecinForm, specialite: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={loading}
                placeholder="Spécialité médicale"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                N° Ordre *
              </label>
              <input
                type="text"
                value={medecinForm.numero_ordre}
                onChange={(e) => setMedecinForm({...medecinForm, numero_ordre: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={loading}
                placeholder="Numéro d'ordre"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Téléphone *
              </label>
              <input
                type="tel"
                value={medecinForm.telephone}
                onChange={(e) => setMedecinForm({...medecinForm, telephone: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={loading}
                placeholder="Numéro de téléphone"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                value={medecinForm.email}
                onChange={(e) => setMedecinForm({...medecinForm, email: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={loading}
                placeholder="Adresse email"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adresse *
              </label>
              <textarea
                value={medecinForm.adresse}
                onChange={(e) => setMedecinForm({...medecinForm, adresse: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={loading}
                placeholder="Adresse complète"
              />
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
          </form>
        </div>
      )}

      {/* Barre de recherche */}
      <div className="bg-white p-4 rounded-lg shadow-lg">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, prénom, spécialité, numéro d'ordre ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
              <col className="w-2/12" />
              <col className="w-2/12" />
              <col className="w-1/12" />
            </colgroup>
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nom Complet
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Spécialité
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  N° Ordre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Téléphone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMedecins.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    {loading ? 'Chargement...' : 
                     searchTerm ? `Aucun médecin trouvé pour "${searchTerm}"` : 
                     'Aucun médecin enregistré'}
                  </td>
                </tr>
              ) : (
                filteredMedecins.map((medecin) => (
                  <tr key={medecin.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Dr. {medecin.nom} {medecin.prenom}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {medecin.specialite}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {medecin.numero_ordre}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {medecin.telephone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {medecin.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => editMedecin(medecin)}
                        disabled={loading}
                        className="text-blue-600 hover:text-blue-900 disabled:text-blue-300 mr-3 transition-colors"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteMedecin(medecin.id)}
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

export default MedecinManagement;