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
  const resetForm = useCallback(() => {
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
            nom: editingMedecin.nom || '',
            prenom: editingMedecin.prenom || '',
            specialite: editingMedecin.specialite || '',
            numero_ordre: editingMedecin.numero_ordre || '',
            telephone: editingMedecin.telephone || '',
            email: editingMedecin.email || '',
            adresse: editingMedecin.adresse || '',
            actif: editingMedecin.actif !== undefined ? editingMedecin.actif : true
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
  }, [medecinForm, editingMedecin, setMedecins, resetForm, showMessage]);

  const editMedecin = useCallback((medecin) => {
    // Vérifier que le médecin existe et a un ID
    if (!medecin || !medecin.id) {
      console.error('Médecin ou ID manquant:', medecin);
      toast.error('Médecin introuvable ou ID manquant');
      return;
    }

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
      medecin.nom?.toLowerCase().includes(searchLower) ||
      medecin.prenom?.toLowerCase().includes(searchLower) ||
      medecin.specialite?.toLowerCase().includes(searchLower) ||
      medecin.numero_ordre?.toLowerCase().includes(searchLower) ||
      medecin.email?.toLowerCase().includes(searchLower)
    );
  }, [safeMedecins, searchTerm]);

  const handleFormChange = useCallback((field, value) => {
    setMedecinForm(prev => ({ ...prev, [field]: value }));
  }, []);

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
          <form onSubmit={handleMedecinSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom *
              </label>
              <input
                type="text"
                value={medecinForm.nom}
                onChange={(e) => handleFormChange('nom', e.target.value)}
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
                onChange={(e) => handleFormChange('prenom', e.target.value)}
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
                onChange={(e) => handleFormChange('specialite', e.target.value)}
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
                onChange={(e) => handleFormChange('numero_ordre', e.target.value)}
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
                onChange={(e) => handleFormChange('telephone', e.target.value)}
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
                onChange={(e) => handleFormChange('email', e.target.value)}
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
                onChange={(e) => handleFormChange('adresse', e.target.value)}
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
                  <tr 
                    key={medecin.id} 
                    className={`hover:bg-gray-50 ${medecin.isTemp ? 'opacity-70' : ''}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Dr. {medecin.nom} {medecin.prenom}
                      {medecin.isTemp && <span className="text-xs text-gray-500 ml-2">(en cours...)</span>}
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