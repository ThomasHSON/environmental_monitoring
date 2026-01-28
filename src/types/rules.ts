export interface Rule {
  GUID: string;
  index: string;
  group: string;
  rule: string;
  rule_detail: string;
  software: string;
  type: string;
  level: string;
  state: "True" | "False"; // Updated to match API response format
}

export interface RuleResponse {
  Data: Rule[];
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