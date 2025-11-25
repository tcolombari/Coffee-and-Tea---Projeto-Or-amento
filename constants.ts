import { CostSettingsData } from './types';

// Updated to point to a local file. Please ensure you save your image as 'logo.png' in the public/root folder.
export const APP_LOGO_URL = "./logo.png";

export const DEFAULT_SETTINGS: CostSettingsData = {
  resinPricePerKg: 160.00,
  resinDensity: 1.15,
  printerPowerWatts: 144,
  electricityCostKwh: 0.85,
  printerCost: 4500.00,
  printerLifespanHours: 2000,
  printSpeedMmPerHour: 60,
  postProcessingCost: 20.00,
  profitMarginPercent: 30,
  manualPrintTimeHours: 0,
};