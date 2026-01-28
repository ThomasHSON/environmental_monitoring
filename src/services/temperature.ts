import { TemperatureResponse } from '../types/temperature';
import { apiCall } from '../utils/api';

/**
 * Processes raw temperature data with offset compensation
 */
export const processTemperatureData = (rawData: any[]): any[] => {
  return rawData.map(unit => {
    // Extract configuration values
    const tempOffset = parseFloat(unit.temp_offset || '0');
    const humidityOffset = parseFloat(unit.humidity_offset || '0');
    
    // Get the latest reading from temperatureClasses
    const latestReading = unit.temperatureClasses && unit.temperatureClasses.length > 0 
      ? unit.temperatureClasses[0] 
      : { temp: '0', humidity: '0', add_time: new Date().toISOString() };
    
    // Parse raw values
    const rawTemp = parseFloat(latestReading.temp || '0');
    const rawHumidity = parseFloat(latestReading.humidity || '0');
    
    // Apply offset compensation
    const compensatedTemp = rawTemp + tempOffset;
    const compensatedHumidity = rawHumidity + humidityOffset;
    
    console.log(`Processing ${unit.name}:`, {
      rawTemp,
      tempOffset,
      compensatedTemp,
      rawHumidity,
      humidityOffset,
      compensatedHumidity
    });
    
    return {
      GUID: unit.GUID || `temp-${Date.now()}-${Math.random()}`,
      name: unit.name,
      temp: compensatedTemp,
      humidity: compensatedHumidity,
      add_time: latestReading.add_time,
      rawTemp,
      rawHumidity,
      temp_max: parseFloat(unit.temp_max || '25'),
      temp_min: parseFloat(unit.temp_min || '15'),
      temp_offset: tempOffset,
      humidity_max: parseFloat(unit.humidity_max || '70'),
      humidity_min: parseFloat(unit.humidity_min || '40'),
      humidity_offset: humidityOffset,
      alert: unit.alert === "True",
      mail: unit.mail === "True"
    };
  });
};

/**
 * Utility function to pad single digits with leading zero
 */
const pad = (num: number): string => {
  return num.toString().padStart(2, '0');
};

/**
 * Fetches the latest temperature and humidity data for today
 */
export const fetchLatestTemperatureData = async (): Promise<TemperatureResponse> => {
  const response = await apiCall('/api/temperature/get_latest_today', {
    method: 'POST',
    body: {},
  });
  
  // Process the data with offset compensation
  if (response.Code === 200 && response.Data) {
    response.Data = processTemperatureData(response.Data);
  }
  
  return response;
};

/**
 * Fetches temperature and humidity data for a specific time range
 */
export const fetchTemperatureByTime = async (
  startDateTime: string,
  endDateTime: string
): Promise<TemperatureResponse> => {
  const response = await apiCall('/api/temperature/get_temp_by_time', {
    method: 'POST',
    body: {
      ValueAry: [startDateTime, endDateTime],
    },
  });
  
  // Process historical data with offset compensation
  if (response.Code === 200 && response.Data) {
    response.Data = processHistoricalTemperatureData(response.Data);
  }
  
  return response;
};

/**
 * Processes historical temperature data with offset compensation
 */
export const processHistoricalTemperatureData = (rawData: any[]): any[] => {
  return rawData.flatMap(unit => {
    // Extract configuration values
    const tempOffset = parseFloat(unit.temp_offset || '0');
    const humidityOffset = parseFloat(unit.humidity_offset || '0');
    
    // Process each historical entry in temperatureClasses
    if (!unit.temperatureClasses || unit.temperatureClasses.length === 0) {
      return [];
    }
    
    return unit.temperatureClasses.map((entry: any) => {
      // Parse raw values
      const rawTemp = parseFloat(entry.temp || '0');
      const rawHumidity = parseFloat(entry.humidity || '0');
      
      // Apply offset compensation
      const compensatedTemp = rawTemp + tempOffset;
      const compensatedHumidity = rawHumidity + humidityOffset;
      
      console.log(`Processing historical ${unit.name} at ${entry.add_time}:`, {
        rawTemp,
        tempOffset,
        compensatedTemp,
        rawHumidity,
        humidityOffset,
        compensatedHumidity
      });
      
      return {
        GUID: `${unit.GUID || 'hist'}-${entry.add_time}`,
        name: unit.name,
        temp: compensatedTemp, // Display compensated values
        humidity: compensatedHumidity, // Display compensated values
        add_time: entry.add_time,
      };
    });
  });
};
/**
 * Fetches temperature and humidity data from today's start (00:00:00) to current time
 */
export const fetchTodayTemperatureData = async (): Promise<TemperatureResponse> => {
  const now = new Date();
  
  // Get today's date in YYYY-MM-DD format
  const today = now.toISOString().split('T')[0];
  
  // Create start of today (00:00:00)
  const startDateTime = `${today} 00:00:00`;
  
  // Create current time in YYYY-MM-DD HH:mm:ss format
  //const endDateTime = now.toISOString().slice(0, 19).replace('T', ' ');
  const endDateTime = `${today} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  console.log('Fetching today\'s temperature data:', {
    startDateTime,
    endDateTime,
    today
  });
  
  return await fetchTemperatureByTime(startDateTime, endDateTime);
};