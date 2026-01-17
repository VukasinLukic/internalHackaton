export type ItemStatus = 'active' | 'rented' | 'removed';

export interface ItemLocation {
  address: string;
  city: string;
  lat: number;
  lng: number;
}

export interface Item {
  id: string;
  providerId: string;
  title: string;
  description?: string;
  price: number;
  size?: number;           // m2
  location: ItemLocation;
  images: string[];
  attributes: string[];    // AI-extracted: ["modern", "bright"]
  vibes: string[];         // AI-extracted: ["chill", "quiet"]
  status: ItemStatus;
  createdAt: Date;
  updatedAt: Date;
}
