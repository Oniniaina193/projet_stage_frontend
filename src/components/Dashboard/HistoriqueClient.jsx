import React, { useState } from 'react';
import { Search } from 'lucide-react';

const HistoriqueClient = ({ ordonnances }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrage des ordonnances par nom du client
  const filteredOrdonnances = ordonnances.filter(o => 
    o.client.nom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 w-full h-full">
      <h2 className="text-2xl font-bold text-gray-800">Consultation des Ordonnances par Client</h2>
      
      <div className="bg-white p-4 rounded-lg shadow-lg">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par nom de client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredOrdonnances.map((ordonnance) => (
          <div key={ordonnance.id} className="bg-white p-6 rounded-lg shadow-lg border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Ordonnance N° {ordonnance.numero}</h3>
                <p className="text-gray-600">Date: {ordonnance.date}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Client: {ordonnance.client.nom}</p>
                <p className="text-sm text-gray-500">Médecin: {ordonnance.medecin.nom}</p>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-700 mb-2">Médicaments prescrits:</h4>
              <div className="space-y-2">
                {ordonnance.medicaments.map((med, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm">
                      <div><span className="font-medium">Nom:</span> {med.nom}</div>
                      <div><span className="font-medium">Posologie:</span> {med.posologie}</div>
                      <div><span className="font-medium">Durée:</span> {med.duree}</div>
                      <div><span className="font-medium">Quantité:</span> {med.quantite}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
        
        {filteredOrdonnances.length === 0 && searchTerm && (
          <div className="text-center py-8 text-gray-500">
            Aucune ordonnance trouvée pour "{searchTerm}"
          </div>
        )}
        
        {filteredOrdonnances.length === 0 && !searchTerm && (
          <div className="text-center py-8 text-gray-500">
            Aucune ordonnance enregistrée
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoriqueClient;