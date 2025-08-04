import React, { useState } from 'react';
import { Search, FileText, Calendar, User, Phone, MapPin, Stethoscope } from 'lucide-react';

const HistoriqueClient = ({ ordonnances = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrdonnance, setSelectedOrdonnance] = useState(null);

  // Filtrage des ordonnances par nom du client
  const filteredOrdonnances = ordonnances.filter(o => 
    o.client.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.medecin.nom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const viewOrdonnanceDetails = (ordonnance) => {
    setSelectedOrdonnance(ordonnance);
  };

  const closeDetails = () => {
    setSelectedOrdonnance(null);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 w-full h-full">
      {/* En-tête avec style cohérent */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Consultation des Ordonnances
          </h2>
          <p className="text-gray-600 mt-1">Recherche et consultation par client</p>
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <FileText className="h-4 w-4 mr-2" />
          {filteredOrdonnances.length} ordonnance(s) trouvée(s)
        </div>
      </div>
      
      {/* Barre de recherche avec style moderne */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par nom de client, n° d'ordonnance ou médecin..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-700 placeholder-gray-400"
          />
        </div>
      </div>

      {/* Modal de détails */}
      {selectedOrdonnance && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800">
                  Détails Ordonnance N° {selectedOrdonnance.numero}
                </h3>
                <button
                  onClick={closeDetails}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Informations générales */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Informations Client
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Nom:</span> {selectedOrdonnance.client.nom}</p>
                    <p className="flex items-center">
                      <Phone className="h-3 w-3 mr-1" />
                      {selectedOrdonnance.client.telephone}
                    </p>
                    <p className="flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {selectedOrdonnance.client.adresse}
                    </p>
                  </div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-3 flex items-center">
                    <Stethoscope className="h-4 w-4 mr-2" />
                    Médecin Prescripteur
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Nom:</span> {selectedOrdonnance.medecin.nom}</p>
                    <p><span className="font-medium">Spécialité:</span> {selectedOrdonnance.medecin.specialite}</p>
                    <p className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      Date: {selectedOrdonnance.date}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Médicaments prescrits */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Médicaments Prescrits ({selectedOrdonnance.medicaments.length})
                </h4>
                <div className="space-y-3">
                  {selectedOrdonnance.medicaments.map((med, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div>
                          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Médicament</span>
                          <p className="font-medium text-gray-900">{med.nom}</p>
                        </div>
                        <div>
                          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Posologie</span>
                          <p className="text-gray-700">{med.posologie}</p>
                        </div>
                        <div>
                          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Durée</span>
                          <p className="text-gray-700">{med.duree}</p>
                        </div>
                        <div>
                          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Quantité</span>
                          <p className="font-medium text-blue-600">{med.quantite}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Liste des ordonnances */}
      <div className="space-y-4">
        {filteredOrdonnances.map((ordonnance) => (
          <div key={ordonnance.id} className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-200">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Informations principales */}
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-3">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="font-bold text-lg text-gray-800">N° {ordonnance.numero}</span>
                  </div>
                  <div className="flex items-center text-gray-500">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span className="text-sm">{ordonnance.date}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center">
                    <User className="h-4 w-4 text-blue-500 mr-2" />
                    <span className="text-gray-600">Client:</span>
                    <span className="font-medium text-gray-800 ml-1">{ordonnance.client.nom}</span>
                  </div>
                  <div className="flex items-center">
                    <Stethoscope className="h-4 w-4 text-green-500 mr-2" />
                    <span className="text-gray-600">Médecin:</span>
                    <span className="font-medium text-gray-800 ml-1">{ordonnance.medecin.nom}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 text-orange-500 mr-2" />
                    <span className="text-gray-600">Tél:</span>
                    <span className="text-gray-800 ml-1">{ordonnance.client.telephone}</span>
                  </div>
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 text-purple-500 mr-2" />
                    <span className="text-gray-600">Médicaments:</span>
                    <span className="font-medium text-purple-600 ml-1">{ordonnance.medicaments.length}</span>
                  </div>
                </div>
              </div>
              
              {/* Bouton d'action */}
              <div className="flex items-center">
                <button
                  onClick={() => viewOrdonnanceDetails(ordonnance)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200 text-sm font-medium"
                >
                  <FileText className="h-4 w-4" />
                  Voir détails
                </button>
              </div>
            </div>

            {/* Aperçu des médicaments */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex flex-wrap gap-2">
                {ordonnance.medicaments.slice(0, 3).map((med, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium"
                  >
                    {med.nom}
                  </span>
                ))}
                {ordonnance.medicaments.length > 3 && (
                  <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-medium">
                    +{ordonnance.medicaments.length - 3} autres
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {/* Messages d'état */}
        {filteredOrdonnances.length === 0 && searchTerm && (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun résultat trouvé</h3>
            <p className="text-gray-500">
              Aucune ordonnance trouvée pour "<span className="font-medium">{searchTerm}</span>"
            </p>
          </div>
        )}
        
        {filteredOrdonnances.length === 0 && !searchTerm && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune ordonnance</h3>
            <p className="text-gray-500">
              Aucune ordonnance n'a encore été enregistrée dans le système
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoriqueClient;