import React, { useState } from 'react';
import { FolderOpen, Upload, CheckCircle, Loader2 } from 'lucide-react';

const FolderSelector = () => {
  const [selectedPath, setSelectedPath] = useState('');
  const [folderName, setFolderName] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [databases, setDatabases] = useState([]);

  const handleFolderSelect = async (event) => {
    const files = event.target.files;
    if (files.length > 0) {
      // Récupérer le chemin du premier fichier pour extraire le dossier
      const firstFile = files[0];
      const path = firstFile.webkitRelativePath;
      const folderPath = path.split('/')[0]; // Premier niveau = nom du dossier
      
      setFolderName(folderPath);
      setSelectedPath(`ApiCommerce/PdV/${folderPath}`);
      
      // Filtrer les fichiers .mdb et .accdb
      const dbFiles = Array.from(files).filter(file => 
        file.name.toLowerCase().endsWith('.mdb') || 
        file.name.toLowerCase().endsWith('.accdb')
      );
      
      setDatabases(dbFiles.map(file => file.name));
    }
  };

  const handleConnect = async () => {
    if (!selectedPath) return;
    
    setConnecting(true);
    try {
      // Appel API vers Laravel
      const response = await fetch('/api/select-folder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          folder_path: selectedPath,
          folder_name: folderName 
        })
      });
      
      if (response.ok) {
        // Redirection vers la page d'accueil
        window.location.href = '/dashboard';
      } else {
        alert('Erreur lors de la connexion au dossier');
      }
    } catch (error) {
      alert('Erreur de connexion');
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <FolderOpen className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sélection du Dossier</h2>
          <p className="text-gray-600">Parcourez et sélectionnez un dossier dans ApiCommerce/PdV</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          
          {/* Folder Browser */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sélectionner un dossier
            </label>
            
            <div className="relative">
              <input
                type="file"
                webkitdirectory=""
                directory=""
                multiple
                onChange={handleFolderSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                id="folder-input"
              />
              <label
                htmlFor="folder-input"
                className="flex items-center justify-center w-full px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
              >
                <div className="text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    Cliquez pour parcourir les dossiers
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Naviguez vers ApiCommerce/PdV/[votre-dossier]
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Selected Folder Display */}
          {selectedPath && (
            <div className="mb-6">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  <span className="font-medium text-green-800">Dossier sélectionné</span>
                </div>
                <p className="text-sm text-green-700 mb-2">
                  <span className="font-mono">{selectedPath}</span>
                </p>
                
                {databases.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-medium text-green-800 mb-1">
                      Bases de données trouvées ({databases.length}) :
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {databases.map((db, index) => (
                        <span
                          key={index}
                          className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded-md"
                        >
                          {db}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Connect Button */}
          <button
            onClick={handleConnect}
            disabled={!selectedPath || connecting}
            className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
              selectedPath && !connecting
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {connecting ? (
              <div className="flex items-center justify-center">
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Connexion en cours...
              </div>
            ) : (
              'Se connecter au dossier'
            )}
          </button>
        </div>

        {/* Instructions */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Sélectionnez un dossier contenant vos bases de données Access<br/>
            (ex: soary 2212, SOARY242, SOC02, etc.)
          </p>
        </div>
      </div>
    </div>
  );
};

export default FolderSelector;