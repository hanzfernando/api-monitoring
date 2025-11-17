export interface ApiLog {
   id: number;
   apiKeyId?: number | null;
   apiKeyValue: string;
   endpoint: string;
   method: string;
   statusCode: number;
   userId?: string;
   responseTime?: number | null;
   createdAt: Date;
}

export interface ApiLogRequestHistory {
  id: number;
  apiKeyId: number;
  apiKeyValue: string;
  dateTime: Date;
  requestCount: number;
}

export interface ApiLogResponseTimeHistory {
  id: number;
  apiKeyId: number;
  apiKeyValue: string;
  dateTime: Date;
  averageResponseTime: number;
}

export interface ApiLogCombinedHistory {
  id: number;
  apiKeyId: number;
  apiKeyValue: string;
  dateTime: Date;
  requestCount: number;
  averageResponseTime: number;
}

export interface ApiLogUserCombinedHistory {
  dateTime: Date;
  requestCount: number;
  averageResponseTime: number | null;
}