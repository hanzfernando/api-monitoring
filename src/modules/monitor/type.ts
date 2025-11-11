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