export interface TemperatureRecord {
  GUID: string;
  name: string; // Unit name (e.g., Outpatient Pharmacy)
  temp: number; // Temperature in °C
  humidity: number; // Humidity in %
  add_time: string; // Last update time
  // Configuration values from API
  temp_max?: string;
  temp_min?: string;
  temp_offset?: string;
  humidity_max?: string;
  humidity_min?: string;
  humidity_offset?: string;
  alert?: string;
  mail?: string;
  temperatureClasses?: Array<{
    temp: string;
    humidity: string;
    add_time: string;
  }>;
}

export interface ProcessedTemperatureRecord {
  GUID: string;
  name: string;
  temp: number; // Compensated temperature
  humidity: number; // Compensated humidity
  add_time: string;
  rawTemp: number; // Original temperature
  rawHumidity: number; // Original humidity
  temp_max: number;
  temp_min: number;
  temp_offset: number;
  humidity_max: number;
  humidity_min: number;
  humidity_offset: number;
  alert: boolean;
  mail: boolean;
}

export interface TemperatureResponse {
  Data: TemperatureRecord[];
  Code: number;
  Method: string;
  Result: string;
  Value: string;
  ValueAry: string[];
  TimeTaken: string;
  Token: string;
  Server: string;
  DbName: string;
  TableName: string;
  Port: number;
  UserName: string;
  Password: string;
  ServerType: string;
  ServerName: string;
  ServerContent: string;
  RequestUrl: string;
}

export interface ChartDataPoint {
  time: string;
  temperature: number;
  humidity: number;
}

export interface UnitChartData {
  name: string;
  data: ChartDataPoint[];
}