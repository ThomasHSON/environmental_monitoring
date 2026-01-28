import { TemperatureSettingsResponse, TemperatureUnitSetting, UnitTemperatureThresholds } from '../types/settings';
import { apiCall } from '../utils/api';

/**
 * Fetches temperature alert settings for all units from the new API
 */
export const fetchTemperatureSettings = async (): Promise<TemperatureSettingsResponse> => {
  return await apiCall('/api/temperature/get_set', {
    method: 'POST',
    body: {},
  });
};

/**
 * Parses settings response into threshold values for all units
 */
export const parseTemperatureThresholds = (settings: TemperatureSettingsResponse): UnitTemperatureThresholds[] => {
  if (!settings.Data || settings.Data.length === 0) {
    return [];
  }

  return settings.Data.map(setting => ({
    GUID: setting.GUID,
    IP: setting.IP,
    name: setting.name,
    temp_max: isNaN(parseFloat(setting.temp_max)) ? 100 : parseFloat(setting.temp_max),
    temp_min: isNaN(parseFloat(setting.temp_min)) ? 0 : parseFloat(setting.temp_min),
    temp_offset: isNaN(parseFloat(setting.temp_offset)) ? 0 : parseFloat(setting.temp_offset),
    humidity_max: isNaN(parseFloat(setting.humidity_max)) ? 100 : parseFloat(setting.humidity_max),
    humidity_min: isNaN(parseFloat(setting.humidity_min)) ? 0 : parseFloat(setting.humidity_min),
    humidity_offset: isNaN(parseFloat(setting.humidity_offset)) ? 0 : parseFloat(setting.humidity_offset),
    alert: setting.alert === "True",
    mail: setting.mail === "True",
  }));
};

/**
 * Gets thresholds for a specific unit by name
 */
export const getThresholdsForUnit = (
  allThresholds: UnitTemperatureThresholds[], 
  unitName: string
): UnitTemperatureThresholds | null => {
  return allThresholds.find(threshold => threshold.name === unitName) || null;
};

/**
 * Gets default thresholds when no specific unit settings are found
 */
export const getDefaultThresholds = (): UnitTemperatureThresholds => {
  return {
    GUID: '',
    IP: '',
    name: 'Default',
    temp_max: 25,
    temp_min: 15,
    temp_offset: 2,
    humidity_max: 70,
    humidity_min: 40,
    humidity_offset: 10,
    alert: true,
    mail: true,
  };
};

/**
 * Gets global thresholds (max/min across all units) for backward compatibility
 */
export const getGlobalThresholds = (allThresholds: UnitTemperatureThresholds[]) => {
  if (allThresholds.length === 0) {
    const defaultThresholds = getDefaultThresholds();
    return {
      temp_max: defaultThresholds.temp_max,
      temp_min: defaultThresholds.temp_min,
      humi_max: defaultThresholds.humidity_max,
      humi_min: defaultThresholds.humidity_min,
    };
  }

  // Use the first unit's thresholds as global defaults
  const firstUnit = allThresholds[0];
  return {
    temp_max: firstUnit.temp_max,
    temp_min: firstUnit.temp_min,
    humi_max: firstUnit.humidity_max,
    humi_min: firstUnit.humidity_min,
  };
};

/**
 * Updates temperature settings for one or more units via the new API
 */
export const updateTemperatureSettings = async (settings: TemperatureUnitSetting[]): Promise<void> => {
  await apiCall('/api/temperature/update_set', {
    method: 'POST',
    body: {
      Data: settings,
    },
  });
};

/**
 * Deletes a temperature setting unit via the API
 */
export const deleteTemperatureSetting = async (guid: string): Promise<void> => {
  await apiCall('/api/temperature/delete_set', {
    method: 'POST',
    body: {
      ValueAry: [guid],
    },
  });
};

/**
 * Adds a new temperature setting unit via the API
 */
export const addTemperatureSetting = async (setting: Omit<TemperatureUnitSetting, 'GUID'>): Promise<void> => {
  await apiCall('/api/temperature/add_set', {
    method: 'POST',
    body: {
      Data: setting,
    },
  });
};