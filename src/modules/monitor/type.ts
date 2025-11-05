export interface ApiLog {
   id: string;
   endpoint: string;
   method: string;
   statusCode: number;
   userId?: string;
   responseTime?: any;
   createdAt: Date;
}