export interface TemperatureUnitSetting {
  GUID: string;
  IP: string;
  name: string;
  temp_max: string;
  temp_min: string;
  temp_offset: string;
  humidity_max: string;
  humidity_min: string;
  humidity_offset: string;
  alert: string;
  mail: string;
}

export interface TemperatureSettingsResponse {
  Data: TemperatureUnitSetting[];
  Code: number;
  Method: string; 
  Result: string;
}

export interface UnitTemperatureThresholds {
  GUID: string;
  IP: string;
  name: string;
  temp_max: number;
  temp_min: number;
  temp_offset: number | string;
  humidity_max: number;
  humidity_min: number;
  humidity_offset: number | string;
  alert: boolean;
  mail: boolean;
}