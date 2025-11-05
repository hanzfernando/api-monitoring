export interface ApiKey {
  id: string;
  key: string;
  userId: string;
  createdAt: Date;
  expiresAt?: Date | null;
}