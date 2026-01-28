import { getApiUrl } from '../config';
import { PrescriptionResponse, PrescriptionRecord } from '../types/prescription';

interface ApiOptions {
  method?: string;
  body?: any;
}

export const apiCall = async (endpoint: string, options: ApiOptions = {}) => {
  let url: string;
  
  try {
    url = getApiUrl(endpoint);
  } catch (error) {
    throw new Error('API configuration not loaded. Please refresh the page and try again.');
  }
  
  const method = options.method || 'GET';
  
  console.group(`🌐 API Request: ${endpoint}`);
  console.log(`URL: ${url}`);
  console.log(`Method: ${method}`);
  
  if (options.body) {
    console.log('Request Payload:', options.body);
  }

  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    const text = await response.text();
    let data;
    
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error('Failed to parse response as JSON:', e);
      throw new Error('伺服器回應格式錯誤，請稍後再試');
    }

    console.log('Response:', data);
    console.groupEnd();

    if (!response.ok) {
      throw new Error(`伺服器錯誤 (${response.status})`);
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    console.groupEnd();
    
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      throw new Error('無法連接到伺服器，請檢查網路連線或稍後再試');
    }
    
    throw error instanceof Error ? error : new Error('發生未知錯誤，請稍後再試');
  }
};

/**
 * Fetches suspicious prescription records based on a date range and time type
 */
export const fetchPrescriptionRecords = async (
  startDateTime: string,
  endDateTime: string,
  timeType: 'create' | 'prescription' = 'create'
): Promise<PrescriptionResponse> => {
  // Choose the appropriate endpoint based on time type
  const endpoint = timeType === 'prescription' 
    ? '/api/suspiciousRxLog/get_by_post_time'
    : '/api/suspiciousRxLog/get_by_op_time';
  
  const url = getApiUrl(endpoint);
  const payload = {
    ValueAry: [startDateTime, endDateTime],
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching prescription records:', error);
    throw error;
  }
};

/**
 * Fetches available error types for prescription records
 */
export const fetchErrorTypes = async (): Promise<string[]> => {
  const url = getApiUrl('/api/suspiciousRxLog/get_errorType');
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const result = await response.json();
    
    // Assuming the API returns error types in the Data field as an array
    // Adjust this based on the actual API response structure
    if (result.Code === 200 && Array.isArray(result.Data)) {
      return result.Data;
    } else {
      throw new Error('Invalid response format from error types API');
    }
  } catch (error) {
    console.error('Error fetching error types:', error);
    throw error;
  }
};

/**
 * Updates a prescription record
 */
export const updatePrescriptionRecord = async (
  record: PrescriptionRecord,
  updatedFields: Partial<PrescriptionRecord>
): Promise<void> => {
  const url = getApiUrl('/api/suspiciousRxLog/update');
  
  // Sort error types alphabetically by their letter code if ERROR_TYPE_STRING is being updated
  let sortedErrorTypeString = updatedFields.ERROR_TYPE_STRING;
  if (sortedErrorTypeString) {
    const errorTypes = sortedErrorTypeString
      .split(';')
      .map(type => type.trim())
      .filter(type => type)
      .sort((a, b) => {
        // Extract the letter code (first character) for sorting
        const aCode = a.charAt(0);
        const bCode = b.charAt(0);
        return aCode.localeCompare(bCode);
      });
    sortedErrorTypeString = errorTypes.join(';');
  }

  // Create the complete record with updated fields
  const updatedRecord = {
    ...record,
    ...updatedFields,
    ERROR_TYPE_STRING: sortedErrorTypeString || record.ERROR_TYPE_STRING,
  };

  const payload = {
    Data: [updatedRecord]
  };

  console.group('🔄 Updating Prescription Record');
  console.log('Record GUID:', record.GUID);
  console.log('Updated fields:', updatedFields);
  console.log('Full payload:', payload);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Failed to update record: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log('Update response:', result);
    console.groupEnd();
    
    if (result.Code !== 200) {
      throw new Error(result.Result || 'Failed to update record');
    }
  } catch (error) {
    console.error('Error updating prescription record:', error);
    console.groupEnd();
    throw error;
  }
};

/**
 * Confirms a prescription report by updating the status and report information
 */
export const confirmPrescriptionReport = async (record: PrescriptionRecord): Promise<void> => {
  const url = getApiUrl('/api/suspiciousRxLog/update');
  
  // Get current user from session storage
  const userSession = sessionStorage.getItem('user_session');
  let reporterName = '';
  
  if (userSession) {
    try {
      const userData = JSON.parse(userSession);
      reporterName = userData.Name || '';
    } catch (error) {
      console.error('Failed to parse user session:', error);
    }
  }

  // Create current timestamp in the required format
  const now = new Date();
  const reportTime = now.toISOString().slice(0, 19).replace('T', ' ');

  // Create the updated record with report confirmation
  const updatedRecord = {
    ...record,
    STATUS: '確認提報',
    REPORTER: reporterName,
    REPORT_TIME: reportTime,
  };

  const payload = {
    Data: [updatedRecord]
  };

  console.group('📋 Confirming Prescription Report');
  console.log('Record GUID:', record.GUID);
  console.log('Reporter:', reporterName);
  console.log('Report Time:', reportTime);
  console.log('Full payload:', payload);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Failed to confirm report: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log('Confirm report response:', result);
    console.groupEnd();
    
    if (result.Code !== 200) {
      throw new Error(result.Result || 'Failed to confirm report');
    }
  } catch (error) {
    console.error('Error confirming prescription report:', error);
    console.groupEnd();
    throw error;
  }
};

/**
 * Downloads all prescription records as Excel file
 */
export const downloadPrescriptionRecords = async (records: PrescriptionRecord[]): Promise<void> => {
  if (!records || records.length === 0) {
    throw new Error('No records available for download');
  }

  const url = getApiUrl('/api/suspiciousRxLog/download_datas_excel');
  const payload = { Data: records };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Cache-Control': 'no-cache',
      },
      credentials: 'include',
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Download API Error:', {
        status: response.status,
        statusText: response.statusText,
        errorText,
      });
      throw new Error(`Download failed: ${response.status} ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('spreadsheetml.sheet')) {
      console.error('Invalid content type received:', contentType);
      throw new Error('Server returned invalid file format');
    }

    const blob = await response.blob();
    if (blob.size === 0) {
      throw new Error('Received empty file from server');
    }

    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `prescription-records-${new Date().toISOString().split('T')[0]}.xlsx`;
    
    try {
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      window.URL.revokeObjectURL(downloadUrl);
    }
  } catch (error) {
    console.error('Error downloading records:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      url,
    });
    throw error;
  }
};

/**
 * Downloads a single prescription record as Excel file
 */
export const downloadSingleRecord = async (guid: string): Promise<void> => {
  const url = getApiUrl('/api/suspiciousRxLog/download_document');
  const payload = {
    ValueAry: [guid]
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Cache-Control': 'no-cache',
      },
      credentials: 'include',
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Download failed: ${response.status} ${response.statusText}`);
    }

    const blob = await response.blob();
    if (blob.size === 0) {
      throw new Error('Received empty file from server');
    }

    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = 'prescription-record.xlsx';
    
    try {
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      window.URL.revokeObjectURL(downloadUrl);
    }
  } catch (error) {
    console.error('Error downloading single record:', error);
    throw error;
  }
};