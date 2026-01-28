/**
 * Formats a date string in YYYY-MM-DD format
 */
export const formatDateForInput = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Formats a time string in HH:mm:ss format
 */
export const formatTimeForInput = (date: Date): string => {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
};

/**
 * Combines date and time strings into a datetime string in format YYYY-MM-DD HH:mm:ss
 */
export const combineDateTimeString = (date: string, time: string): string => {
  return `${date} ${time}`;
};

/**
 * Gets a default date range 
 */
export const getDefaultDateRange = (): {
  startDate: Date;
  endDate: Date;
} => {
  const endDate = new Date();
  endDate.setHours(23, 59, 59, 999);
  
  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);
  
  return { startDate, endDate };
};

/**
 * Gets today's date range (00:00:00 to 23:59:59)
 */
export const getTodayDateRange = (): {
  startDate: Date;
  endDate: Date;
} => {
  const today = new Date();
  
  const startDate = new Date(today);
  startDate.setHours(0, 0, 0, 0);
  
  const endDate = new Date(today);
  endDate.setHours(23, 59, 59, 999);
  
  return { startDate, endDate };
};

/**
 * Formats a datetime string from API format to localized format
 */
export const formatDateTime = (dateTimeString: string): string => {
  // Handle empty or invalid dates
  if (!dateTimeString || dateTimeString.includes('1/01/01')) {
    return '-';
  }
  
  try {
    const date = new Date(dateTimeString.replace(/\//g, '-'));
    return date.toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  } catch (error) {
    return dateTimeString;
  }
};