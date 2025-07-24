import React from 'react';
import { Pill, Users, FileText, Clock, UserCheck, AlertTriangle, TrendingUp } from 'lucide-react';

const DashboardStats = ({ medicaments = [], ordonnances = [], medecins = [] }) => {
  
  const stats = {
    total_medicaments: medicaments.length,
    sans_ordonnance: medicaments.filter(m => m.status === 'sans').length,
    avec_ordonnance: medicaments.filter(m => m.status === 'avec').length,
    stock_faible: medicaments.filter(m => m.stock < 10).length,
    total_ordonnances: ordonnances.length,
    ordonnances_jour: ordonnances.filter(o => {
      const today = new Date().toDateString();
      const ordDate = new Date(o.created_at).toDateString();
      return today === ordDate;
    }).length,
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
          Dernière mise à jour: {new Date().toLocaleTimeString()}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Total Médicaments</p>
              <p className="text-3xl font-bold">{stats.total_medicaments}</p>
            </div>
            <Pill className="h-12 w-12 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Sans Ordonnance</p>
              <p className="text-3xl font-bold">{stats.sans_ordonnance}</p>
            </div>
            <Users className="h-12 w-12 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Avec Ordonnance</p>
              <p className="text-3xl font-bold">{stats.avec_ordonnance}</p>
            </div>
            <FileText className="h-12 w-12 text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100">Total Ordonnances</p>
              <p className="text-3xl font-bold">{stats.total_ordonnances}</p>
            </div>
            <TrendingUp className="h-12 w-12 text-orange-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-teal-500 to-teal-600 text-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-teal-100">Total Médecins</p>
              <p className="text-3xl font-bold">{stats.total_medecins}</p>
            </div>
            <UserCheck className="h-12 w-12 text-teal-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100">Ordonnances Aujourd'hui</p>
              <p className="text-3xl font-bold">{stats.ordonnances_jour}</p>
            </div>
            <Clock className="h-12 w-12 text-indigo-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100">Stock Faible</p>
              <p className="text-3xl font-bold">{stats.stock_faible}</p>
            </div>
            <AlertTriangle className="h-12 w-12 text-red-200" />
          </div>
        </div>
      </div>
        <br /><br /><br />
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Résumé</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Médicaments actifs:</span>
            <span className="font-semibold ml-2">{stats.total_medicaments}</span>
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