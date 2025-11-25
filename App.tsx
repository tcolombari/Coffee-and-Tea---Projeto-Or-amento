import React, { useState, useMemo } from 'react';
import { Upload, Trash2, Box, Info } from 'lucide-react';
import Settings from './components/Settings';
import QuoteSummary from './components/QuoteSummary';
import Viewer3D from './components/Viewer3D';
import { StlFile, CostSettingsData, QuoteResult } from './types';
import { DEFAULT_SETTINGS, APP_LOGO_URL } from './constants';

const App: React.FC = () => {
  const [files, setFiles] = useState<StlFile[]>([]);
  const [settings, setSettings] = useState<CostSettingsData>(DEFAULT_SETTINGS);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);

  // Calculate Totals logic
  const totals = useMemo<QuoteResult>(() => {
    const totalWeightG = files.reduce((acc, f) => acc + f.weightG, 0);
    const maxZ = files.length > 0 ? Math.max(...files.map(f => f.heightMm)) : 0;
    
    // Determine hours: Manual override OR Calculated from height/speed
    let batchPrintTimeHours = 0;
    if (files.length > 0) {
      if (settings.manualPrintTimeHours > 0) {
        batchPrintTimeHours = settings.manualPrintTimeHours;
      } else {
        batchPrintTimeHours = maxZ > 0 ? (maxZ / settings.printSpeedMmPerHour) + 0.5 : 0;
      }
    }

    const resinCost = (totalWeightG / 1000) * settings.resinPricePerKg;
    const energyCost = (settings.printerPowerWatts / 1000) * batchPrintTimeHours * settings.electricityCostKwh;
    const depreciationCost = (settings.printerCost / settings.printerLifespanHours) * batchPrintTimeHours;
    const postProcessingCost = files.length > 0 ? settings.postProcessingCost : 0;

    const subtotal = resinCost + energyCost + depreciationCost + postProcessingCost;
    const profit = subtotal * (settings.profitMarginPercent / 100);
    const total = subtotal + profit;

    return { resinCost, energyCost, depreciationCost, postProcessingCost, subtotal, profit, total };
  }, [files, settings]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles: StlFile[] = Array.from(e.target.files).map((file: File) => ({
        id: crypto.randomUUID(),
        name: file.name,
        url: URL.createObjectURL(file),
        volumeCm3: 0,
        heightMm: 0,
        weightG: 0,
        printTimeHours: 0
      }));
      setFiles(prev => [...prev, ...newFiles]);
      if (!activeFileId && newFiles.length > 0) setActiveFileId(newFiles[0].id);
    }
  };

  const updateFileGeometry = (id: string, volumeCm3: number, heightMm: number) => {
    setFiles(prev => prev.map(f => {
      if (f.id === id) {
        return { ...f, volumeCm3, heightMm, weightG: volumeCm3 * settings.resinDensity };
      }
      return f;
    }));
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
    if (activeFileId === id) setActiveFileId(null);
  };

  const activeFile = files.find(f => f.id === activeFileId);

  return (
    <div className="h-full flex flex-col bg-coffee-950 text-coffee-100 overflow-hidden">
      
      {/* Header - Slim & Professional */}
      <header className="h-16 flex-none bg-[#120f0d] border-b border-coffee-800 flex items-center px-6 justify-between z-20 shadow-xl relative">
        <div className="flex items-center gap-4">
          {/* Logo container - using object-contain to ensure the sticker looks good */}
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-coffee-700 bg-coffee-900 shadow-lg">
             <img 
               src={APP_LOGO_URL} 
               alt="Coffee and Tea Studio" 
               className="w-full h-full object-cover" 
               onError={(e) => {
                 // Fallback if image not found
                 (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=CS&background=D4A373&color=2C241B';
               }}
             />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">
            Coffee and Tea <span className="text-coffee-400">Studio</span>
          </h1>
        </div>
        <div className="text-xs text-coffee-600 font-medium hidden md:block">
          Resin Quote System v1.0 • Elegoo Saturn 4 Ultra
        </div>
      </header>

      {/* Main Layout - 3 Panes */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT PANEL: Files (280px fixed) */}
        <div className="w-72 flex-none flex flex-col bg-coffee-900 border-r border-coffee-800 z-10">
          <div className="p-4 border-b border-coffee-800">
            <label className="flex flex-col items-center justify-center w-full h-24 border border-coffee-600 border-dashed rounded cursor-pointer bg-coffee-800/30 hover:bg-coffee-800 hover:border-coffee-400 transition group">
              <Upload className="w-6 h-6 mb-2 text-coffee-500 group-hover:text-coffee-300" />
              <span className="text-xs text-coffee-300 font-medium">Adicionar STL</span>
              <input type="file" className="hidden" accept=".stl" multiple onChange={handleFileUpload} />
            </label>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
            {files.length === 0 && (
               <div className="text-center mt-10 text-coffee-700 text-xs px-4">
                 <p>Nenhum arquivo.</p>
                 <p>Faça upload para começar.</p>
               </div>
            )}
            {files.map(file => (
              <div 
                key={file.id}
                onClick={() => setActiveFileId(file.id)}
                className={`group flex items-center gap-3 p-2.5 rounded border cursor-pointer transition-all ${
                  activeFileId === file.id 
                    ? 'bg-coffee-800 border-coffee-500 shadow-md' 
                    : 'bg-transparent border-transparent hover:bg-coffee-800/50'
                }`}
              >
                <div className={`p-1.5 rounded ${activeFileId === file.id ? 'bg-coffee-500 text-coffee-900' : 'bg-coffee-800 text-coffee-600'}`}>
                  <Box size={14} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-xs font-medium truncate ${activeFileId === file.id ? 'text-white' : 'text-coffee-300'}`}>{file.name}</p>
                  <p className="text-[10px] text-coffee-600">
                    {file.volumeCm3 > 0 ? `${file.volumeCm3.toFixed(1)}cm³ • ${file.weightG.toFixed(0)}g` : 'Processando...'}
                  </p>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); removeFile(file.id); }}
                  className="opacity-0 group-hover:opacity-100 text-coffee-600 hover:text-red-400 p-1 rounded hover:bg-coffee-900 transition"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
          
          <div className="p-3 border-t border-coffee-800 text-[10px] text-coffee-600 text-center">
            {files.length} arquivos carregados
          </div>
        </div>

        {/* CENTER PANEL: 3D Viewer (Flex Grow) */}
        <div className="flex-1 relative bg-black flex flex-col min-w-0">
          {activeFile ? (
             <Viewer3D 
               url={activeFile.url} 
               onGeometryLoaded={(vol, h) => updateFileGeometry(activeFile.id, vol, h)} 
               key={activeFile.id} 
             />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-coffee-800">
              <div className="w-20 h-20 border-2 border-dashed border-coffee-800 rounded-full flex items-center justify-center mb-4">
                <Box size={32} />
              </div>
              <p className="text-sm font-medium">Selecione um arquivo para visualizar</p>
            </div>
          )}
        </div>

        {/* RIGHT PANEL: Stats & Settings (320px fixed) */}
        <div className="w-80 flex-none flex flex-col bg-coffee-900 border-l border-coffee-800 z-10">
          {/* Top: Quote Summary (Fixed Height approx) */}
          <div className="flex-none h-auto min-h-[300px] border-b border-coffee-800">
            <QuoteSummary totals={totals} files={files} settings={settings} />
          </div>
          
          {/* Bottom: Settings (Scrollable) */}
          <div className="flex-1 overflow-y-auto custom-scrollbar bg-coffee-900">
             <Settings settings={settings} onChange={setSettings} />
          </div>
        </div>

      </div>
    </div>
  );
};

export default App;