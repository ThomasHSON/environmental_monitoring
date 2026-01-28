import { getApiUrl } from '../config';

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