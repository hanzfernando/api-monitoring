export interface ApiLog {
   id: string;
   endpoint: string;
   method: string;
   statusCode: number;
   userId?: string;
   request?: any;
   response?: any;
   createdAt: Date;
}