import React, { useState } from 'react';
import { Search, User, Package, AlertCircle, CheckCircle, FileText, Heart, Shield, Clock } from 'lucide-react';
import { useNavigate } from "react-router-dom";

const MedicationSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  
  const [medications] = useState([]);

  const filteredMedications = medications.filter(med =>
    med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    med.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStockStatus = (stock) => {
    if (stock > 50) return { color: 'green', label: 'Stock élevé' };
    if (stock > 20) return { color: 'yellow', label: 'Stock moyen' };
    return { color: 'red', label: 'Stock faible' };
  };

  const navigate = useNavigate();               

  const handlePharmacistLogin = () => {
    navigate("/login");                          
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header avec design amélioré */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-blue-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg shadow-lg">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div className="ml-3">
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  PharmaGestion
                </h1>
                <p className="text-xs text-gray-500 hidden sm:block">Système de gestion pharmaceutique</p>
              </div>
            </div>
            <button
              onClick={handlePharmacistLogin}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <User className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Espace Pharmacien</span>
              <span className="sm:hidden">Connexion</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Hero Section */}
        <div className="text-center mb-8">
          
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
            Recherche de <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">médicaments</span>
          </h2>
          <p className="text-base text-gray-600 mb-6 max-w-xl mx-auto">
            Trouvez rapidement tous les médicaments disponibles avec leurs prix et stocks
          </p>
          
          {/* Search Bar Améliorée */}
          <div className="max-w-lg mx-auto relative mb-6">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Rechercher un médicament..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-4 py-3 text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-md hover:shadow-lg bg-white/80 backdrop-blur-sm"
            />
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20">
              <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg mb-3 mx-auto">
                <Package className="h-5 w-5 text-green-600" />
              </div>
              <div className="text-xl font-bold text-gray-900">{medications.length}</div>
              <div className="text-sm text-gray-600">Médicaments disponibles</div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg mb-3 mx-auto">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-xl font-bold text-gray-900">{medications.filter(m => !m.prescription).length}</div>
              <div className="text-sm text-gray-600">Sans ordonnance</div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20">
              <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-lg mb-3 mx-auto">
                <Clock className="h-5 w-5 text-purple-600" />
              </div>
              <div className="text-xl font-bold text-gray-900">24/7</div>
              <div className="text-sm text-gray-600">Service disponible</div>
            </div>
          </div>
        </div>

        {/* Results Section */}
        {medications.length > 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Résultats de recherche
                </h3>
                <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-white">
                  {filteredMedications.length} médicament{filteredMedications.length > 1 ? 's' : ''}
                </span>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Médicament
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Prix
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Statut
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredMedications.map((medication) => {
                    const stockStatus = getStockStatus(medication.stock);
                    return (
                      <tr key={medication.id} className="hover:bg-blue-50/50 transition-colors duration-150">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-semibold text-gray-900">
                              {medication.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {medication.category}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-bold text-gray-900">
                            {medication.price.toFixed(2)} Ar
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            stockStatus.color === 'green' 
                              ? 'bg-green-100 text-green-800' 
                              : stockStatus.color === 'yellow' 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {stockStatus.color === 'green' ? (
                              <CheckCircle className="h-3 w-3 mr-1" />
                            ) : (
                              <AlertCircle className="h-3 w-3 mr-1" />
                            )}
                            {medication.stock} unités
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {medication.prescription ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              <FileText className="h-3 w-3 mr-1" />
                              Avec ordonnance
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Sans ordonnance
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filteredMedications.length === 0 && searchTerm && (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucun résultat trouvé
                </h3>
                <p className="text-gray-500">
                  Aucun médicament trouvé pour "{searchTerm}". Essayez avec d'autres termes.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="h-12 w-12 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Aucun médicament disponible
            </h3>
            
            
          </div>
        )}

        {/* Info Section */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
          <div className="flex items-start">
            <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <h4 className="text-base font-semibold text-blue-900 mb-2">
                Informations importantes
              </h4>
              <p className="text-sm text-blue-800 leading-relaxed">
                Les médicaments marqués "Avec ordonnance" nécessitent une prescription médicale valide. 
                Consultez votre pharmacien pour plus d'informations.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-md border-t border-gray-200 mt-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <div className="flex items-center justify-center mb-3">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg">
                <Package className="h-4 w-4 text-white" />
              </div>
              <span className="ml-2 text-base font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                PharmaGestion
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-1">
              © 2025 PharmaGestion - Système de gestion pharmaceutique
            </p>
            <p className="text-xs text-gray-500">
              Votre santé, notre priorité
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MedicationSearch;