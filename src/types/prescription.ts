export interface DiseaseClass {
  ICD: string;
  CHT: string;
}

export interface PrescriptionRecord {
  GUID: string;
  Barcode: string;
  PATCODE: string; // 病歷號
  SECTNO: string; // 科別
  DOCTOR: string; // 醫師姓名
  ICD_CODE: string;
  ICD_DESC: string;
  ORDER_TIME: string; // 開方時間
  CREATE_TIME: string; // 建立時間
  BRYPE: string;
  ERROR_TYPE_STRING: string; // 錯誤類別
  EVENT_DESC: string; // 事件描述
  STATUS: string; // 狀態
  OPERATOR: string; // 操作者
  OPERATE_TIME: string;
  REPORTER: string;
  REPORT_LEVEL: string;
  REPORT_TIME: string; // 提報時間
  HANDLE_TIME: string; // 處理時間
  TPR_NOTIFY: string; // 通報
  REMARK: string; // 備註
  HANDLER: string;
  diseaseClasses?: DiseaseClass[]; // 診斷內容
}

export interface PrescriptionResponse {
  Data: PrescriptionRecord[];
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

export interface SortConfig {
  key: keyof PrescriptionRecord | '';
  direction: 'ascending' | 'descending';
}

export type SearchField = 'patientCode' | 'department' | 'operator' | 'reporter';

export interface FilterConfig {
  searchField: SearchField;
  searchValue: string;
}