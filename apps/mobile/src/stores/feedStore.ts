import { create } from 'zustand';
import type { FeedItem, SwipeAction } from '../types';

interface FeedState {
  feedItems: FeedItem[];
  currentIndex: number;
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;

  // Match modal state
  showMatchModal: boolean;
  currentMatch: FeedItem | null;

  // Actions
  fetchFeed: (limit?: number) => Promise<void>;
  swipe: (itemId: string, action: SwipeAction) => Promise<boolean>;
  nextItem: () => void;
  resetFeed: () => void;

  // Match modal actions
  showMatch: (item: FeedItem) => void;
  hideMatchModal: () => void;
}

export const useFeedStore = create<FeedState>((set, get) => ({
  feedItems: [],
  currentIndex: 0,
  isLoading: false,
  error: null,
  hasMore: true,

  showMatchModal: false,
  currentMatch: null,

  fetchFeed: async (limit = 20) => {
    console.log('[FEED] 🎭 DEMO MODE - Using hardcoded feed data');
    set({ isLoading: true, error: null });

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 600));

    // HARDCODED DEMO APARTMENTS - CORRECT FORMAT!
    const mockFeedItems: FeedItem[] = [
      {
        item: {
          id: 'apt1',
          price: 450,
          size: 65,
          bedrooms: 2,
          bathrooms: 1,
          images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'],
          location: { city: 'Vračar, Beograd', address: 'Bulevar kralja Aleksandra 45' },
          description: 'Moderan dvosoban stan u centru grada.',
          attributes: [
            { name: 'Modern', confidence: 0.92 },
            { name: 'Svetao', confidence: 0.88 },
          ],
          providerId: 'p1',
          createdAt: new Date().toISOString(),
        },
        provider: {
          id: 'p1',
          name: 'Marko Petrović',
          images: ['https://i.pravatar.cc/150?img=12'],
          attributes: [
            { name: 'Druželjubiv', confidence: 0.90 },
            { name: 'Pouzdan', confidence: 0.87 },
          ],
        },
        score: {
          apartmentCompatibility: 92,
          roommateCompatibility: 88,
          total: 90,
          reasons: ['Sličan raspored spavanja', 'Obe strane preferiraju čistoću'],
        },
      },
      {
        item: {
          id: 'apt2',
          price: 350,
          size: 50,
          bedrooms: 1,
          bathrooms: 1,
          images: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'],
          location: { city: 'Novi Beograd', address: 'Jurija Gagarina 123' },
          description: 'Jednosoban stan blizu NBG pijace.',
          attributes: [
            { name: 'Minimalist', confidence: 0.85 },
            { name: 'Funkcionalan', confidence: 0.80 },
          ],
          providerId: 'p2',
          createdAt: new Date().toISOString(),
        },
        provider: {
          id: 'p2',
          name: 'Ana Jovanović',
          images: ['https://i.pravatar.cc/150?img=5'],
          attributes: [
            { name: 'Organizovan', confidence: 0.85 },
            { name: 'Tih', confidence: 0.88 },
          ],
        },
        score: {
          apartmentCompatibility: 85,
          roommateCompatibility: 82,
          total: 83,
          reasons: ['Slični životni stilovi', 'Oba ne puše'],
        },
      },
      {
        item: {
          id: 'apt3',
          price: 550,
          size: 80,
          bedrooms: 3,
          bathrooms: 2,
          images: ['https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800'],
          location: { city: 'Savski Venac, Beograd', address: 'Kneza Miloša 28' },
          description: 'Trosoban luksuzan stan sa pogledom na Save.',
          attributes: [
            { name: 'Luksuz', confidence: 0.91 },
            { name: 'Prostran', confidence: 0.94 },
          ],
          providerId: 'p3',
          createdAt: new Date().toISOString(),
        },
        provider: {
          id: 'p3',
          name: 'Stefan Nikolić',
          images: ['https://i.pravatar.cc/150?img=8'],
          attributes: [
            { name: 'Komunikativan', confidence: 0.92 },
            { name: 'Fleksibilan', confidence: 0.86 },
          ],
        },
        score: {
          apartmentCompatibility: 88,
          roommateCompatibility: 84,
          total: 86,
          reasons: ['Kompatibilni budžeti', 'Slični standardi čistoće'],
        },
      },
      {
        item: {
          id: 'apt4',
          price: 400,
          size: 60,
          bedrooms: 2,
          bathrooms: 1,
          images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'],
          location: { city: 'Zvezdara, Beograd', address: 'Mileševska 54' },
          description: 'Udoban dvosoban stan u mirnom kraju.',
          attributes: [
            { name: 'Udoban', confidence: 0.87 },
            { name: 'Miran', confidence: 0.90 },
          ],
          providerId: 'p4',
          createdAt: new Date().toISOString(),
        },
        provider: {
          id: 'p4',
          name: 'Jelena Đorđević',
          images: ['https://i.pravatar.cc/150?img=9'],
          attributes: [
            { name: 'Pouzdan', confidence: 0.89 },
            { name: 'Čist', confidence: 0.91 },
          ],
        },
        score: {
          apartmentCompatibility: 90,
          roommateCompatibility: 88,
          total: 89,
          reasons: ['Sličan način života', 'Obe strane vole kućne ljubimce'],
        },
      },
      {
        item: {
          id: 'apt5',
          price: 280,
          size: 38,
          bedrooms: 1,
          bathrooms: 1,
          images: ['https://images.unsplash.com/photo-1556020685-ae41abfc9365?w=800'],
          location: { city: 'Palilula, Beograd', address: 'Višnjička 87' },
          description: 'Garsonjera u stambenom naselju.',
          attributes: [
            { name: 'Kompaktan', confidence: 0.82 },
            { name: 'Povoljno', confidence: 0.88 },
          ],
          providerId: 'p5',
          createdAt: new Date().toISOString(),
        },
        provider: {
          id: 'p5',
          name: 'Nikola Stanković',
          images: ['https://i.pravatar.cc/150?img=13'],
          attributes: [
            { name: 'Tih', confidence: 0.83 },
            { name: 'Uredan', confidence: 0.78 },
          ],
        },
        score: {
          apartmentCompatibility: 76,
          roommateCompatibility: 74,
          total: 75,
          reasons: ['Prihvatljiv budžet', 'Ne puši'],
        },
      },
      {
        item: {
          id: 'apt6',
          price: 320,
          size: 42,
          bedrooms: 1,
          bathrooms: 1,
          images: ['https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800'],
          location: { city: 'Voždovac, Beograd', address: 'Kumodraška 212' },
          description: 'Jednosoban stan na spratu.',
          attributes: [
            { name: 'Funkcionalan', confidence: 0.80 },
            { name: 'Svetao', confidence: 0.82 },
          ],
          providerId: 'p6',
          createdAt: new Date().toISOString(),
        },
        provider: {
          id: 'p6',
          name: 'Milica Todorović',
          images: ['https://i.pravatar.cc/150?img=10'],
          attributes: [
            { name: 'Komunikativan', confidence: 0.81 },
            { name: 'Fleksibilan', confidence: 0.79 },
          ],
        },
        score: {
          apartmentCompatibility: 82,
          roommateCompatibility: 80,
          total: 81,
          reasons: ['Dobra lokacija', 'Slični standardi higijene'],
        },
      },
      {
        item: {
          id: 'apt7',
          price: 380,
          size: 55,
          bedrooms: 2,
          bathrooms: 1,
          images: ['https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=800'],
          location: { city: 'Čukarica, Beograd', address: 'Požeška 118' },
          description: 'Dvosoban stan u bloku.',
          attributes: [
            { name: 'Prostran', confidence: 0.84 },
            { name: 'Udoban', confidence: 0.82 },
          ],
          providerId: 'p7',
          createdAt: new Date().toISOString(),
        },
        provider: {
          id: 'p7',
          name: 'Dejan Mihajlović',
          images: ['https://i.pravatar.cc/150?img=15'],
          attributes: [
            { name: 'Organizovan', confidence: 0.84 },
            { name: 'Pouzdan', confidence: 0.86 },
          ],
        },
        score: {
          apartmentCompatibility: 87,
          roommateCompatibility: 85,
          total: 86,
          reasons: ['Dobar odnos cene i kvaliteta', 'Slični raspored rada'],
        },
      },
      {
        item: {
          id: 'apt8',
          price: 260,
          size: 35,
          bedrooms: 1,
          bathrooms: 1,
          images: ['https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800'],
          location: { city: 'Zemun', address: 'Cara Dušana 201' },
          description: 'Mala garsonjera u Zemunu.',
          attributes: [
            { name: 'Kompaktan', confidence: 0.85 },
            { name: 'Povoljno', confidence: 0.90 },
          ],
          providerId: 'p8',
          createdAt: new Date().toISOString(),
        },
        provider: {
          id: 'p8',
          name: 'Ivana Kostić',
          images: ['https://i.pravatar.cc/150?img=16'],
          attributes: [
            { name: 'Druželjubiv', confidence: 0.88 },
            { name: 'Komunikativan', confidence: 0.82 },
          ],
        },
        score: {
          apartmentCompatibility: 79,
          roommateCompatibility: 77,
          total: 78,
          reasons: ['Povoljno', 'Obe strane vole kućne ljubimce'],
        },
      },
      {
        item: {
          id: 'apt9',
          price: 420,
          size: 58,
          bedrooms: 2,
          bathrooms: 1,
          images: ['https://images.unsplash.com/photo-1556912173-46c336c7fd55?w=800'],
          location: { city: 'Dorćol, Beograd', address: 'Dubrovačka 31' },
          description: 'Dvosoban u centru Dorćola.',
          attributes: [
            { name: 'Centralan', confidence: 0.92 },
            { name: 'Modern', confidence: 0.87 },
          ],
          providerId: 'p9',
          createdAt: new Date().toISOString(),
        },
        provider: {
          id: 'p9',
          name: 'Nemanja Đukić',
          images: ['https://i.pravatar.cc/150?img=14'],
          attributes: [
            { name: 'Čist', confidence: 0.89 },
            { name: 'Tih', confidence: 0.84 },
          ],
        },
        score: {
          apartmentCompatibility: 86,
          roommateCompatibility: 84,
          total: 85,
          reasons: ['Dobra lokacija', 'Obe strane ne puše'],
        },
      },
      {
        item: {
          id: 'apt10',
          price: 310,
          size: 45,
          bedrooms: 1,
          bathrooms: 1,
          images: ['https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800'],
          location: { city: 'Rakovica, Beograd', address: 'Borska 45' },
          description: 'Jednosoban stan u mirnom delu Rakovice.',
          attributes: [
            { name: 'Miran', confidence: 0.86 },
            { name: 'Udoban', confidence: 0.80 },
          ],
          providerId: 'p10',
          createdAt: new Date().toISOString(),
        },
        provider: {
          id: 'p10',
          name: 'Tijana Simić',
          images: ['https://i.pravatar.cc/150?img=20'],
          attributes: [
            { name: 'Uredan', confidence: 0.80 },
            { name: 'Fleksibilan', confidence: 0.77 },
          ],
        },
        score: {
          apartmentCompatibility: 81,
          roommateCompatibility: 79,
          total: 80,
          reasons: ['Cena odgovara budžetu', 'Slični životni stilovi'],
        },
      },
      {
        item: {
          id: 'apt11',
          price: 370,
          size: 52,
          bedrooms: 2,
          bathrooms: 1,
          images: ['https://images.unsplash.com/photo-1574643156929-51fa098b0394?w=800'],
          location: { city: 'Karaburma, Beograd', address: 'Mite Ružića 18' },
          description: 'Dvosoban stan u Karaburmi.',
          attributes: [
            { name: 'Prostran', confidence: 0.83 },
            { name: 'Funkcionalan', confidence: 0.80 },
          ],
          providerId: 'p11',
          createdAt: new Date().toISOString(),
        },
        provider: {
          id: 'p11',
          name: 'Vladimir Kovač',
          images: ['https://i.pravatar.cc/150?img=18'],
          attributes: [
            { name: 'Pouzdan', confidence: 0.85 },
            { name: 'Organizovan', confidence: 0.82 },
          ],
        },
        score: {
          apartmentCompatibility: 84,
          roommateCompatibility: 82,
          total: 83,
          reasons: ['Dobra povezanost gradskim prevozom', 'Ne puši'],
        },
      },
      {
        item: {
          id: 'apt12',
          price: 340,
          size: 48,
          bedrooms: 1,
          bathrooms: 1,
          images: ['https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800'],
          location: { city: 'Banovo Brdo, Beograd', address: 'Požeška 76' },
          description: 'Jednokrevetna soba u stanu.',
          attributes: [
            { name: 'Deljeno', confidence: 0.88 },
            { name: 'Povoljno', confidence: 0.84 },
          ],
          providerId: 'p12',
          createdAt: new Date().toISOString(),
        },
        provider: {
          id: 'p12',
          name: 'Jovana Nikolić',
          images: ['https://i.pravatar.cc/150?img=24'],
          attributes: [
            { name: 'Komunikativan', confidence: 0.86 },
            { name: 'Druželjubiv', confidence: 0.83 },
          ],
        },
        score: {
          apartmentCompatibility: 80,
          roommateCompatibility: 78,
          total: 79,
          reasons: ['Prihvatljiva cena', 'Slični interesovanja'],
        },
      },
    ];

    set({
      feedItems: mockFeedItems,
      currentIndex: 0,
      hasMore: false, // No pagination in demo mode
      isLoading: false,
      error: null,
    });

    console.log(`[FEED] ✅ Loaded ${mockFeedItems.length} demo apartments (normal Belgrade listings)`);
  },

  swipe: async (itemId: string, action: SwipeAction) => {
    console.log('[FEED] 🎭 DEMO MODE - Hardcoded swipe:', action);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 400));

    // Randomly create matches on "like" actions (30% chance)
    const isMatch = action === 'like' && Math.random() > 0.7;

    if (isMatch) {
      const currentItem = get().feedItems[get().currentIndex];
      if (currentItem) {
        console.log('[FEED] ✅ Demo match created!');
        get().showMatch(currentItem);
      }
    }

    // Move to next item
    get().nextItem();

    return isMatch;
  },

  nextItem: () => {
    const { currentIndex, feedItems, hasMore } = get();

    if (currentIndex < feedItems.length - 1) {
      set({ currentIndex: currentIndex + 1 });
    } else if (hasMore) {
      // Fetch more items when reaching the end
      get().fetchFeed();
    }
  },

  resetFeed: () => {
    set({
      feedItems: [],
      currentIndex: 0,
      isLoading: false,
      error: null,
      hasMore: true,
    });
  },

  showMatch: (item: FeedItem) => {
    set({
      showMatchModal: true,
      currentMatch: item,
    });
  },

  hideMatchModal: () => {
    set({
      showMatchModal: false,
      currentMatch: null,
    });
  },
}));
