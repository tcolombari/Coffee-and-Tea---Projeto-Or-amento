export interface StlFile {
  id: string;
  name: string;
  url: string;
  volumeCm3: number;
  heightMm: number;
  weightG: number;
  printTimeHours: number;
}

export interface CostSettingsData {
  resinPricePerKg: number; // BRL
  resinDensity: number; // g/cm3 (usually 1.1 - 1.2)
  printerPowerWatts: number; // Watts
  electricityCostKwh: number; // BRL per kWh
  printerCost: number; // BRL (Purchase price)
  printerLifespanHours: number; // Estimated screen/machine life hours
  printSpeedMmPerHour: number; // Estimated Z-axis speed
  postProcessingCost: number; // BRL (Labor/Materials per batch)
  profitMarginPercent: number; // %
  manualPrintTimeHours: number; // Manual override for print time
}

export interface QuoteResult {
  resinCost: number;
  energyCost: number;
  depreciationCost: number;
  postProcessingCost: number;
  subtotal: number;
  profit: number;
  total: number;
}