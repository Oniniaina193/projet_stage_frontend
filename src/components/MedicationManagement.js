import React, { useState } from 'react';

const MedicationManagement = () => {
  const [medications, setMedications] = useState([]);

  const [activeSection, setActiveSection] = useState('Médicaments');

  const handleModifier = (id) => {
    console.log(`Modifier médicament ${id}`);
    // Logique de modification
  };

  const handleSupprimer = (id) => {
    setMedications(medications.filter(med => med.id !== id));
  };

  const handleAjouter = () => {
    const newId = medications.length > 0 ? Math.max(...medications.map(m => m.id)) + 1 : 1;
    const newMedication = {
      id: newId,
      nom: `Médicament ${newId}`,
      prix: 'XX,XX Ar',
      stock: 0
    };
    setMedications([...medications, newMedication]);
  };

  const handleDeconnexion = () => {
    console.log('Déconnexion');
    // Logique de déconnexion
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
          <div className="flex">
            {/* Sidebar */}
            <div className="w-80 bg-gradient-to-b from-slate-800 to-slate-900 text-white">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-white mb-8 border-b border-slate-600 pb-4">
                  Interface d'administration
                </h2>
                
                <nav className="space-y-3">
                  <button
                    onClick={() => setActiveSection('Tableau de bord')}
                    className={`w-full text-left px-4 py-3 rounded-xl text-white hover:bg-slate-700 transition-all duration-200 transform hover:scale-105 ${
                      activeSection === 'Tableau de bord' ? 'bg-slate-700 shadow-lg' : ''
                    }`}
                  >
                    📊 Tableau de bord
                  </button>
                  
                  <button
                    onClick={() => setActiveSection('Médicaments')}
                    className={`w-full text-left px-4 py-3 rounded-xl text-white hover:bg-slate-700 transition-all duration-200 transform hover:scale-105 ${
                      activeSection === 'Médicaments' ? 'bg-slate-700 shadow-lg' : ''
                    }`}
                  >
                    💊 Médicaments
                  </button>
                  
                  <button
                    onClick={() => setActiveSection('Ordonnances')}
                    className={`w-full text-left px-4 py-3 rounded-xl text-white hover:bg-slate-700 transition-all duration-200 transform hover:scale-105 ${
                      activeSection === 'Ordonnances' ? 'bg-slate-700 shadow-lg' : ''
                    }`}
                  >
                    📋 Ordonnances
                  </button>
                </nav>
              </div>
              
              <div className="absolute bottom-6 left-6">
                <button
                  onClick={handleDeconnexion}
                  className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  🚪 Déconnexion
                </button>
              </div>
            </div>

            {/* Main content */}
            <div className="flex-1 p-8 bg-gradient-to-br from-gray-50 to-white">
              <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Gestion des médicaments
                </h1>
                <button
                  onClick={handleAjouter}
                  className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105 shadow-lg font-semibold"
                >
                  ➕ Ajouter
                </button>
              </div>

              {/* Medications table */}
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-slate-700 to-slate-800 text-white">
                      <th className="text-left p-6 font-bold text-lg">💊 Nom</th>
                      <th className="text-left p-6 font-bold text-lg">💰 Prix</th>
                      <th className="text-left p-6 font-bold text-lg">📦 Stock</th>
                      <th className="text-left p-6 font-bold text-lg">⚙️ Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {medications.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="p-12 text-center text-gray-500">
                          <div className="flex flex-col items-center">
                            <div className="text-6xl mb-4">💊</div>
                            <p className="text-lg font-medium">Aucun médicament ajouté</p>
                            <p className="text-sm">Cliquez sur "Ajouter" pour commencer</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      medications.map((medication, index) => (
                        <tr key={medication.id} className={`border-b border-gray-100 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200 ${
                          index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                        }`}>
                          <td className="p-6 text-gray-800 font-medium">{medication.nom}</td>
                          <td className="p-6 text-gray-800 font-medium">{medication.prix}</td>
                          <td className="p-6">
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                              medication.stock > 10 ? 'bg-green-100 text-green-800' :
                              medication.stock > 5 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {medication.stock}
                            </span>
                          </td>
                          <td className="p-6">
                            <div className="flex gap-3">
                              <button
                                onClick={() => handleModifier(medication.id)}
                                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 shadow-md font-semibold"
                              >
                                ✏️ Modifier
                              </button>
                              <button
                                onClick={() => handleSupprimer(medication.id)}
                                className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 transform hover:scale-105 shadow-md font-semibold"
                              >
                                🗑️ Supprimer
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicationManagement;