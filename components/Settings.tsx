import React from 'react';
import { CostSettingsData } from '../types';
import { Settings as SettingsIcon, Zap, Droplet, PenTool, DollarSign, Clock } from 'lucide-react';

interface SettingsProps {
  settings: CostSettingsData;
  onChange: (newSettings: CostSettingsData) => void;
}

const Settings: React.FC<SettingsProps> = ({ settings, onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onChange({
      ...settings,
      [name]: parseFloat(value) || 0,
    });
  };

  return (
    <div className="flex flex-col bg-coffee-900 border-t border-coffee-800">
      <div className="p-3 bg-coffee-800/50 border-b border-coffee-800 flex items-center justify-between sticky top-0 z-10">
        <h2 className="text-xs font-bold uppercase tracking-wider text-coffee-400 flex items-center gap-2">
          <SettingsIcon size={14} /> Configurações
        </h2>
      </div>

      <div className="p-4 space-y-6 pb-20"> {/* Extra padding bottom for scroll */}
        
        {/* Resin */}
        <Section title="Resina" icon={<Droplet size={14} />}>
          <Input label="Preço (R$/Kg)" name="resinPricePerKg" value={settings.resinPricePerKg} onChange={handleChange} />
          <Input label="Densidade (g/cm³)" name="resinDensity" value={settings.resinDensity} step="0.01" onChange={handleChange} />
        </Section>

        {/* Machine */}
        <Section title="Máquina & Tempo" icon={<Zap size={14} />}>
          <div className="mb-2 p-2 bg-coffee-800/30 border border-coffee-700/50 rounded">
             <Input 
               label="Tempo Manual (Horas)" 
               name="manualPrintTimeHours" 
               value={settings.manualPrintTimeHours} 
               onChange={handleChange} 
               icon={<Clock size={12} />}
               step="0.1"
             />
             <p className="text-[9px] text-coffee-500 mt-1 italic leading-tight">
               *Se definido maior que 0, substitui o cálculo automático de altura/velocidade para energia e depreciação.
             </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Input label="Potência (W)" name="printerPowerWatts" value={settings.printerPowerWatts} onChange={handleChange} />
            <Input label="R$/kWh" name="electricityCostKwh" value={settings.electricityCostKwh} step="0.01" onChange={handleChange} />
          </div>
          <Input label="Preço Equip. (R$)" name="printerCost" value={settings.printerCost} onChange={handleChange} />
          <div className="grid grid-cols-2 gap-2">
             <Input label="Vida Útil (h)" name="printerLifespanHours" value={settings.printerLifespanHours} onChange={handleChange} />
             <Input label="Vel. Z (mm/h)" name="printSpeedMmPerHour" value={settings.printSpeedMmPerHour} onChange={handleChange} />
          </div>
        </Section>

        {/* Other */}
        <Section title="Custos & Lucro" icon={<DollarSign size={14} />}>
           <Input label="Pós-Process. (R$)" name="postProcessingCost" value={settings.postProcessingCost} icon={<PenTool size={12}/>} onChange={handleChange} />
           <Input label="Margem Lucro (%)" name="profitMarginPercent" value={settings.profitMarginPercent} onChange={handleChange} />
        </Section>

      </div>
    </div>
  );
};

const Section: React.FC<{ title: string, icon: React.ReactNode, children: React.ReactNode }> = ({ title, icon, children }) => (
  <div className="space-y-2">
    <h3 className="text-xs font-semibold text-coffee-500 flex items-center gap-1.5 uppercase">
      {icon} {title}
    </h3>
    <div className="space-y-2">
      {children}
    </div>
  </div>
);

const Input: React.FC<{ label: string, name: string, value: number, step?: string, icon?: React.ReactNode, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }> = ({ label, name, value, step, onChange }) => (
  <div>
    <label className="block text-[10px] uppercase text-coffee-600 font-bold mb-1 tracking-wide">{label}</label>
    <input
      type="number"
      step={step}
      name={name}
      value={value}
      onChange={onChange}
      className="w-full bg-coffee-950 border border-coffee-800 rounded px-2 py-1.5 text-xs text-coffee-100 focus:outline-none focus:border-coffee-400 transition focus:ring-1 focus:ring-coffee-400/20"
    />
  </div>
);

export default Settings;