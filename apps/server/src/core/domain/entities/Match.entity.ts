export type MatchStatus = 'pending' | 'accepted' | 'rejected' | 'expired';

export interface MatchScore {
  total: number;
  itemCompatibility: number;
  providerCompatibility: number;
  reasons: string[];
}

export interface Match {
  id: string;
  seekerId: string;
  providerId: string;
  itemId: string;
  score: MatchScore;
  status: MatchStatus;
  createdAt: Date;
  acceptedAt?: Date;
}
