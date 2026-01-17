export type InteractionType = 'like' | 'dislike' | 'super_like';

export interface Interaction {
  id: string;
  userId: string;
  itemId: string;
  type: InteractionType;
  createdAt: Date;
}
