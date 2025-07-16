import React, { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';

const OrdonnanceManagement = ({ ordonnances, setOrdonnances }) => {
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
          ? { ...ordonnanceForm, id: editingOrdonnance.id }
          : o
      ));
      setEditingOrdonnance(null);
    } else {
      const newOrdonnance = {
        ...ordonnanceForm,
        id: Date.now(),
        date: new Date().toLocaleDateString()
      };
      setOrdonnances([...ordonnances, newOrdonnance]);
    }
    setOrdonnanceForm({
      numero: '',
      client: { nom: '', telephone: '', adresse: '' },
      medecin: { nom: '', specialite: '' },
      medicaments: [{ nom: '', posologie: '', duree: '', quantite: '' }]
    });
    setShowOrdonnanceForm(false);
  };

  const editOrdonnance = (ordonnance) => {
    setOrdonnanceForm(ordonnance);
    setEditingOrdonnance(ordonnance);
    setShowOrdonnanceForm(true);
  };

  const deleteOrdonnance = (id) => {
    setOrdonnances(ordonnances.filter(o => o.id !== id));
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
    const updatedMedicaments = ordonnanceForm.medicaments.filter((_, i) => i !== index);
    setOrdonnanceForm({ ...ordonnanceForm, medicaments: updatedMedicaments });
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
    <div className="space-y-6 w-full h-full">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Gestion des Ordonnances</h2>
        <button
          onClick={() => setShowOrdonnanceForm(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Ajouter Ordonnance
        </button>
      </div>

      {showOrdonnanceForm && (
        <div className="bg-white p-6 rounded-lg shadow-lg border">
          <h3 className="text-lg font-semibold mb-4">
            {editingOrdonnance ? 'Modifier Ordonnance' : 'Ajouter Ordonnance'}
          </h3>
          <form onSubmit={handleOrdonnanceSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">N° Ordonnance</label>
                <input
                  type="text"
                  value={ordonnanceForm.numero}
                  onChange={(e) => setOrdonnanceForm({...ordonnanceForm, numero: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <h4 className="text-md font-semibold text-gray-700 mb-3">Informations Client</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                  <input
                    type="text"
                    value={ordonnanceForm.client.nom}
                    onChange={(e) => setOrdonnanceForm({
                      ...ordonnanceForm,
                      client: {...ordonnanceForm.client, nom: e.target.value}
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                  <input
                    type="tel"
                    value={ordonnanceForm.client.telephone}
                    onChange={(e) => setOrdonnanceForm({
                      ...ordonnanceForm,
                      client: {...ordonnanceForm.client, telephone: e.target.value}
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                  <input
                    type="text"
                    value={ordonnanceForm.client.adresse}
                    onChange={(e) => setOrdonnanceForm({
                      ...ordonnanceForm,
                      client: {...ordonnanceForm.client, adresse: e.target.value}
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-md font-semibold text-gray-700 mb-3">Informations Médecin</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom du Médecin</label>
                  <input
                    type="text"
                    value={ordonnanceForm.medecin.nom}
                    onChange={(e) => setOrdonnanceForm({
                      ...ordonnanceForm,
                      medecin: {...ordonnanceForm.medecin, nom: e.target.value}
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Spécialité</label>
                  <input
                    type="text"
                    value={ordonnanceForm.medecin.specialite}
                    onChange={(e) => setOrdonnanceForm({
                      ...ordonnanceForm,
                      medecin: {...ordonnanceForm.medecin, specialite: e.target.value}
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-md font-semibold text-gray-700">Médicaments Prescrits</h4>
                <button
                  type="button"
                  onClick={addMedicamentToOrdonnance}
                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                >
                  <Plus className="h-3 w-3" />
                  Ajouter
                </button>
              </div>
              {ordonnanceForm.medicaments.map((med, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-3 p-3 bg-gray-50 rounded">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Nom</label>
                    <input
                      type="text"
                      value={med.nom}
                      onChange={(e) => updateMedicamentInOrdonnance(index, 'nom', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Posologie</label>
                    <input
                      type="text"
                      value={med.posologie}
                      onChange={(e) => updateMedicamentInOrdonnance(index, 'posologie', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Durée</label>
                    <input
                      type="text"
                      value={med.duree}
                      onChange={(e) => updateMedicamentInOrdonnance(index, 'duree', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Quantité</label>
                    <input
                      type="number"
                      value={med.quantite}
                      onChange={(e) => updateMedicamentInOrdonnance(index, 'quantite', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => removeMedicamentFromOrdonnance(index)}
                      className="text-red-600 hover:text-red-900 px-2 py-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
              >
                {editingOrdonnance ? 'Modifier' : 'Ajouter'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg overflow-hidden w-full">
        <div className="overflow-x-auto w-full">
          <table className="w-min-w-full table-auto">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">N° Ordonnance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Médecin</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {ordonnances.map((ordonnance) => (
                <tr key={ordonnance.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{ordonnance.numero}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ordonnance.client.nom}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ordonnance.medecin.nom}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ordonnance.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => editOrdonnance(ordonnance)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteOrdonnance(ordonnance.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrdonnanceManagement;