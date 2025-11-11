export interface ApiKey {
  id: number;
  key: string;
  userId: string;
  isActive: boolean;
  deletedAt?: Date | null;
  createdAt: Date;
  expiresAt?: Date | null;
}

// Input used when creating an API key. expiresAt is optional and can be
// an ISO date string or null to indicate no expiration.
export interface CreateApiKeyInput {
  expiresAt?: string | null;
}