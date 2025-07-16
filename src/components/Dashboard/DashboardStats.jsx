import React from 'react';
import { Pill, Users, FileText, Clock, UserCheck } from 'lucide-react';

const DashboardStats = ({ medicaments, ordonnances, medecins }) => {
  // Statistiques calculées
  const stats = {
    totalMedicaments: medicaments.length,
    sansOrdonnance: medicaments.filter(m => m.status === 'sans').length,
    avecOrdonnance: medicaments.filter(m => m.status === 'avec').length,
    totalOrdonnances: ordonnances.length,
    totalMedecins: medecins.length 
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Tableau de Bord</h2>
      <br />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Total Médicaments</p>
              <p className="text-3xl font-bold">{stats.totalMedicaments}</p>
            </div>
            <Pill className="h-12 w-12 text-blue-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Sans Ordonnance</p>
              <p className="text-3xl font-bold">{stats.sansOrdonnance}</p>
            </div>
            <Users className="h-12 w-12 text-green-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Avec Ordonnance</p>
              <p className="text-3xl font-bold">{stats.avecOrdonnance}</p>
            </div>
            <FileText className="h-12 w-12 text-purple-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100">Total Ordonnances</p>
              <p className="text-3xl font-bold">{stats.totalOrdonnances}</p>
            </div>
            <Clock className="h-12 w-12 text-orange-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-teal-500 to-teal-600 text-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-teal-100">Total Médecins</p>
              <p className="text-3xl font-bold">{stats.totalMedecins}</p>
            </div>
            <UserCheck className="h-12 w-12 text-teal-200" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;