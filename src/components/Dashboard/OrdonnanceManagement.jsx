import React, { useState } from 'react';
import { Plus, Edit2, Trash2, FileText, User, Stethoscope, Calendar, Phone, MapPin, Package, X } from 'lucide-react';

const OrdonnanceManagement = ({ ordonnances = [], setOrdonnances }) => {
  const [showOrdonnanceForm, setShowOrdonnanceForm] = useState(false);
  const [editingOrdonnance, setEditingOrdonnance] = useState(null);
  const [ordonnanceForm, setOrdonnanceForm] = useState({
    numero: '',
    client: { nom: '', telephone: '', adresse: '' },
    medecin: { nom: '', specialite: '' },
    medicaments: [{ nom: '', posologie: '', duree: '', quantite: '' }]
  });

  const handleOrdonnanceSubmit = (e) => {
    e.preventDefault();
    if (editingOrdonnance) {
      setOrdonnances(ordonnances.map(o => 
        o.id === editingOrdonnance.id 
          ? { ...ordonnanceForm, id: editingOrdonnance.id, date: editingOrdonnance.date }
          : o
      ));
      setEditingOrdonnance(null);
    } else {
      const newOrdonnance = {
        ...ordonnanceForm,
        id: Date.now(),
        date: new Date().toLocaleDateString('fr-FR')
      };
      setOrdonnances([...ordonnances, newOrdonnance]);
    }
    resetForm();
  };

  const editOrdonnance = (ordonnance) => {
    setOrdonnanceForm(ordonnance);
    setEditingOrdonnance(ordonnance);
    setShowOrdonnanceForm(true);
  };

  const deleteOrdonnance = (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette ordonnance ?')) {
      setOrdonnances(ordonnances.filter(o => o.id !== id));
    }
  };

  const addMedicamentToOrdonnance = () => {
    setOrdonnanceForm({
      ...ordonnanceForm,
      medicaments: [...ordonnanceForm.medicaments, { nom: '', posologie: '', duree: '', quantite: '' }]
    });
  };

  const updateMedicamentInOrdonnance = (index, field, value) => {
    const updatedMedicaments = ordonnanceForm.medicaments.map((med, i) => 
      i === index ? { ...med, [field]: value } : med
    );
    setOrdonnanceForm({ ...ordonnanceForm, medicaments: updatedMedicaments });
  };

  const removeMedicamentFromOrdonnance = (index) => {
    if (ordonnanceForm.medicaments.length > 1) {
      const updatedMedicaments = ordonnanceForm.medicaments.filter((_, i) => i !== index);
      setOrdonnanceForm({ ...ordonnanceForm, medicaments: updatedMedicaments });
    }
  };

  const resetForm = () => {
    setShowOrdonnanceForm(false);
    setEditingOrdonnance(null);
    setOrdonnanceForm({
      numero: '',
      client: { nom: '', telephone: '', adresse: '' },
      medecin: { nom: '', specialite: '' },
      medicaments: [{ nom: '', posologie: '', duree: '', quantite: '' }]
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 w-full h-full">
      {/* En-tête avec style cohérent */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Gestion des Ordonnances
          </h2>
          <p className="text-gray-600 mt-1">Créer et gérer les ordonnances médicales</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center text-sm text-gray-500">
            <FileText className="h-4 w-4 mr-2" />
            {ordonnances.length} ordonnance(s)
          </div>
          <button
            onClick={() => setShowOrdonnanceForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200 font-medium"
          >
            <Plus className="h-4 w-4" />
            Nouvelle Ordonnance
          </button>
        </div>
      </div>

      {/* Formulaire d'ordonnance */}
      {showOrdonnanceForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  {editingOrdonnance ? 'Modifier Ordonnance' : 'Nouvelle Ordonnance'}
                </h3>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
            </div>

            <form onSubmit={handleOrdonnanceSubmit} className="p-6 space-y-6">
              {/* Numéro d'ordonnance */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">N° Ordonnance *</label>
                <input
                  type="text"
                  value={ordonnanceForm.numero}
                  onChange={(e) => setOrdonnanceForm({...ordonnanceForm, numero: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: ORD-2024-001"
                  required
                />
              </div>

              {/* Informations Client */}
              <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                <h4 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informations Patient
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nom complet *</label>
                    <input
                      type="text"
                      value={ordonnanceForm.client.nom}
                      onChange={(e) => setOrdonnanceForm({
                        ...ordonnanceForm,
                        client: {...ordonnanceForm.client, nom: e.target.value}
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nom et prénom"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      Téléphone *
                    </label>
                    <input
                      type="tel"
                      value={ordonnanceForm.client.telephone}
                      onChange={(e) => setOrdonnanceForm({
                        ...ordonnanceForm,
                        client: {...ordonnanceForm.client, telephone: e.target.value}
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: +261 34 12 345 67"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      Adresse *
                    </label>
                    <input
                      type="text"
                      value={ordonnanceForm.client.adresse}
                      onChange={(e) => setOrdonnanceForm({
                        ...ordonnanceForm,
                        client: {...ordonnanceForm.client, adresse: e.target.value}
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Adresse complète"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Informations Médecin */}
              <div className="bg-green-50 p-6 rounded-xl border border-green-200">
                <h4 className="text-lg font-semibold text-green-800 mb-4 flex items-center gap-2">
                  <Stethoscope className="h-5 w-5" />
                  Médecin Prescripteur
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nom du Médecin *</label>
                    <input
                      type="text"
                      value={ordonnanceForm.medecin.nom}
                      onChange={(e) => setOrdonnanceForm({
                        ...ordonnanceForm,
                        medecin: {...ordonnanceForm.medecin, nom: e.target.value}
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Dr. Nom Prénom"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Spécialité *</label>
                    <input
                      type="text"
                      value={ordonnanceForm.medecin.specialite}
                      onChange={(e) => setOrdonnanceForm({
                        ...ordonnanceForm,
                        medecin: {...ordonnanceForm.medecin, specialite: e.target.value}
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Ex: Médecine générale"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Médicaments */}
              <div className="bg-purple-50 p-6 rounded-xl border border-purple-200">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-semibold text-purple-800 flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Médicaments Prescrits ({ordonnanceForm.medicaments.length})
                  </h4>
                  <button
                    type="button"
                    onClick={addMedicamentToOrdonnance}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    Ajouter
                  </button>
                </div>
                
                <div className="space-y-4">
                  {ordonnanceForm.medicaments.map((med, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg border border-purple-200 shadow-sm">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-medium text-purple-700">Médicament #{index + 1}</span>
                        {ordonnanceForm.medicaments.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeMedicamentFromOrdonnance(index)}
                            className="text-red-600 hover:text-red-800 p-1"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Nom du médicament *</label>
                          <input
                            type="text"
                            value={med.nom}
                            onChange={(e) => updateMedicamentInOrdonnance(index, 'nom', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="Ex: Paracétamol"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Posologie *</label>
                          <input
                            type="text"
                            value={med.posologie}
                            onChange={(e) => updateMedicamentInOrdonnance(index, 'posologie', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="Ex: 1 cp 3x/jour"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Durée *</label>
                          <input
                            type="text"
                            value={med.duree}
                            onChange={(e) => updateMedicamentInOrdonnance(index, 'duree', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="Ex: 7 jours"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Quantité *</label>
                          <input
                            type="number"
                            value={med.quantite}
                            onChange={(e) => updateMedicamentInOrdonnance(index, 'quantite', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="Ex: 21"
                            min="1"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  {editingOrdonnance ? 'Mettre à jour' : 'Créer l\'ordonnance'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Liste des ordonnances */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        {ordonnances.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune ordonnance</h3>
            <p className="text-gray-500 mb-4">Commencez par créer votre première ordonnance</p>
            <button
              onClick={() => setShowOrdonnanceForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 mx-auto transition-colors"
            >
              <Plus className="h-4 w-4" />
              Créer une ordonnance
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">N° Ordonnance</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Médecin</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Médicaments</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {ordonnances.map((ordonnance) => (
                  <tr key={ordonnance.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 text-blue-600 mr-2" />
                        <span className="text-sm font-medium text-gray-900">{ordonnance.numero}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{ordonnance.client.nom}</div>
                      <div className="text-xs text-gray-500">{ordonnance.client.telephone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{ordonnance.medecin.nom}</div>
                      <div className="text-xs text-gray-500">{ordonnance.medecin.specialite}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-3 w-3 mr-1" />
                        {ordonnance.date}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {ordonnance.medicaments.length} médicament(s)
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => editOrdonnance(ordonnance)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
                          title="Modifier"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteOrdonnance(ordonnance.id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded transition-colors"
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

export default OrdonnanceManagement;