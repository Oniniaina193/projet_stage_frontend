import React from 'react';
import { Pill, Users, FileText, Clock, UserCheck, AlertTriangle, TrendingUp, Package } from 'lucide-react';

const DashboardStats = ({ medicaments = [], ordonnances = [], medecins = [] }) => {
  
  // Calcul des statistiques par famille
  const famillesStats = medicaments.reduce((acc, med) => {
    const famille = med.famille || 'Non définie';
    acc[famille] = (acc[famille] || 0) + 1;
    return acc;
  }, {});

  const stats = {
    total_medicaments: medicaments.length,
    familles_count: Object.keys(famillesStats).length,
    stock_faible: medicaments.filter(m => m.stock < 10).length,
    total_ordonnances: ordonnances.length,
    total_medecins: medecins.length,
    valeur_stock_total: medicaments.reduce((total, med) => {
      return total + (med.prix * med.stock);
    }, 0)
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Tableau de Bord - Statistiques</h2>
        <div className="text-sm text-gray-500">
          Dernière mise à jour:  {new Date().toLocaleString()}
        </div>
      </div>

      {/* Statistiques principales - 5 cartes sur une ligne */}
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Médicaments</p>
              <p className="text-2xl font-bold">{stats.total_medicaments}</p>
            </div>
            <Pill className="h-8 w-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Familles Médicaments</p>
              <p className="text-2xl font-bold">{stats.familles_count}</p>
            </div>
            <Package className="h-8 w-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Total Médecins</p>
              <p className="text-2xl font-bold">{stats.total_medecins}</p>
            </div>
            <UserCheck className="h-8 w-8 text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Total Ordonnances</p>
              <p className="text-2xl font-bold">{stats.total_ordonnances}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-orange-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-4 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">Stock Faible</p>
              <p className="text-2xl font-bold">{stats.stock_faible}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-200" />
          </div>
        </div>
      </div>

      {/* Répartition par famille */}
      {Object.keys(famillesStats).length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Répartition par famille de médicaments</h3>
          <div className="grid grid-cols-6 gap-4">
            {Object.entries(famillesStats)
              .sort(([,a], [,b]) => b - a)
              .map(([famille, count]) => (
              <div key={famille} className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-gray-700">{famille}</p>
                <p className="text-2xl font-bold text-blue-600">{count}</p>
                <p className="text-xs text-gray-500">
                  {((count / stats.total_medicaments) * 100).toFixed(1)}%
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
      <br />
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Résumé</h3>
        <div className="grid grid-cols-5 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Médicaments actifs:</span>
            <span className="font-semibold ml-2">{stats.total_medicaments}</span>
          </div>
          <div>
            <span className="text-gray-600">Familles différentes:</span>
            <span className="font-semibold ml-2">{stats.familles_count}</span>
          </div>
          <div>
            <span className="text-gray-600">Médecins enregistrés:</span>
            <span className="font-semibold ml-2">{stats.total_medecins}</span>
          </div>
          <div>
            <span className="text-gray-600">Ordonnances traitées:</span>
            <span className="font-semibold ml-2">{stats.total_ordonnances}</span>
          </div>
          <div>
            <span className="text-red-600">Alertes stock:</span>
            <span className="font-semibold ml-2 text-red-600">{stats.stock_faible}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;