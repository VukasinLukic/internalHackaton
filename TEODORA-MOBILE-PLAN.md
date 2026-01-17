# 📱 TEODORA - Mobile Development Plan
**Role**: Mobile Frontend Developer
**Responsibilities**: React Native App, UI/UX, Swipe Animations, State Management
**Timeline**: Hackathon Sprint

---

## 🎯 Your Scope (DO NOT Touch Backend!)

✅ **YOU BUILD:**
- React Native App (Expo)
- All Screens + Navigation (Expo Router)
- Swipe Animations (React Native Reanimated)
- State Management (Zustand stores)
- API Client (fetch/axios)
- UI Components (Tamagui)
- Image Picker + Upload
- Real-time Chat UI (Socket.io client)

❌ **VUKASIN BUILDS (Don't Touch!):**
- Fastify REST API
- Neo4j Database
- Matching Algorithm
- AI Vision Integration
- Socket.io Server
- Cloudinary Backend

---

## 📦 Phase 1: Navigation + Screens Setup (2-3 hours)

### Step 1.1: App Navigation Structure
**Goal**: Set up Expo Router with all screens

**Tasks**:
1. Create navigation structure in `apps/mobile/app/`:
   ```
   app/
   ├── (auth)/
   │   ├── login.tsx
   │   └── register.tsx
   ├── (onboarding)/
   │   ├── role-selection.tsx      # Choose Provider/Seeker
   │   ├── preferences.tsx          # Seeker: budget, location, lifestyle
   │   ├── profile-setup.tsx        # Upload photos
   │   └── photo-analysis.tsx       # Show AI tags (live feedback)
   ├── (tabs)/
   │   ├── _layout.tsx              # Tab navigator
   │   ├── feed.tsx                 # Swipe feed (main screen)
   │   ├── matches.tsx              # List of matches
   │   ├── messages.tsx             # Chat list
   │   └── profile.tsx              # User profile
   ├── apartment/[id].tsx           # Apartment details modal
   ├── chat/[matchId].tsx           # Chat screen
   └── _layout.tsx                  # Root layout
   ```

**Deliverable**: Navigation structure + empty screens

---

### Step 1.2: Authentication Flow
**Goal**: Login/Register with Clerk

**Tasks**:
1. Install Clerk Expo SDK
2. Create `apps/mobile/app/(auth)/login.tsx`:
   - Clerk sign-in UI
   - Handle authentication
   - Redirect to onboarding or feed
3. Create `apps/mobile/app/(auth)/register.tsx`:
   - Clerk sign-up UI
   - Create user in backend via API

**Deliverable**: Auth working

---

## 📦 Phase 2: State Management (1-2 hours)

### Step 2.1: Zustand Stores
**Goal**: Global state management

**Tasks**:
1. Create stores in `apps/mobile/src/stores/`:

   **`authStore.ts`**:
   ```typescript
   {
     user: User | null,
     token: string | null,
     login: (token) => void,
     logout: () => void,
     updateUser: (user) => void
   }
   ```

   **`feedStore.ts`**:
   ```typescript
   {
     feedItems: FeedItem[],
     currentIndex: number,
     isLoading: boolean,
     fetchFeed: () => Promise<void>,
     swipe: (itemId, action) => Promise<void>,
     nextItem: () => void
   }
   ```

   **`matchStore.ts`**:
   ```typescript
   {
     matches: Match[],
     fetchMatches: () => Promise<void>,
     acceptMatch: (matchId) => Promise<void>,
     rejectMatch: (matchId) => Promise<void>
   }
   ```

   **`chatStore.ts`**:
   ```typescript
   {
     conversations: { [matchId]: Message[] },
     sendMessage: (matchId, content) => Promise<void>,
     fetchMessages: (matchId) => Promise<void>,
     addMessage: (matchId, message) => void  // For Socket.io
   }
   ```

**Deliverable**: State management ready

---

## 📦 Phase 3: API Client (1-2 hours)

### Step 3.1: API Service Layer
**Goal**: Communicate with Vukasin's backend

**Tasks**:
1. Create `apps/mobile/src/services/api.ts`:
   ```typescript
   const API_BASE = 'http://localhost:3000/api/v1';

   export const api = {
     // Users
     createUser: (data) => POST('/users', data),
     analyzeProfile: (userId) => POST(`/users/${userId}/analyze`),
     updatePreferences: (userId, prefs) => PATCH(`/users/${userId}/preferences`, prefs),

     // Items
     createItem: (data) => POST('/items', data),
     getItem: (id) => GET(`/items/${id}`),

     // Feed
     getFeed: (limit = 20) => GET(`/feed?limit=${limit}`),

     // Interactions
     swipe: (itemId, action) => POST('/interactions/swipe', { itemId, action }),

     // Matches
     getMatches: () => GET('/matches'),
     acceptMatch: (matchId) => POST(`/matches/${matchId}/accept`),
     rejectMatch: (matchId) => POST(`/matches/${matchId}/reject`),

     // Messages
     sendMessage: (matchId, content) => POST('/messages', { matchId, content }),
     getMessages: (matchId) => GET(`/messages/${matchId}`)
   };
   ```

2. Add auth token to requests (from `authStore`)

**Deliverable**: API client ready

---

## 📦 Phase 4: Onboarding Flow (2-3 hours)

### Step 4.1: Role Selection
**Goal**: Choose Provider or Seeker

**Tasks**:
1. Create `apps/mobile/app/(onboarding)/role-selection.tsx`:
   - Two big buttons: "I have an apartment" vs "I'm looking for a place"
   - Save role to state
   - Navigate to next step

**Deliverable**: Role selection screen

---

### Step 4.2: Profile Setup
**Goal**: Upload photos and create profile

**Tasks**:
1. Create `apps/mobile/app/(onboarding)/profile-setup.tsx`:
   - Image picker (Expo Image Picker)
   - Upload photos to Cloudinary via backend
   - Name, bio input fields
   - Submit → Create user via API

**Deliverable**: Profile creation

---

### Step 4.3: AI Analysis Feedback (WOW Factor!)
**Goal**: Show AI extracting personality traits in real-time

**Tasks**:
1. Create `apps/mobile/app/(onboarding)/photo-analysis.tsx`:
   - Call `api.analyzeProfile(userId)`
   - Show loading animation: "Analyzing your vibe..."
   - Display results:
     ```
     ✨ AI Detected:
     • Organized
     • Introvert
     • Pet-lover
     ```
   - Continue button

**Deliverable**: AI analysis feedback (judges will love this!)

---

### Step 4.4: Preferences Setup (Seeker Only)
**Goal**: Set search criteria

**Tasks**:
1. Create `apps/mobile/app/(onboarding)/preferences.tsx`:
   - Budget slider (min/max)
   - Location picker (city + radius slider)
   - Move-in date picker
   - Lifestyle toggles:
     - Smoker? Yes/No
     - Pets? Yes/No
     - Cleanliness (1-5 stars)
     - Sleep schedule: Early bird / Night owl
   - Submit → `api.updatePreferences()`

**Deliverable**: Preference setup

---

## 📦 Phase 5: Feed + Swipe (CORE FEATURE - 4-5 hours)

### Step 5.1: Swipe Card Component
**Goal**: Tinder-style swipeable cards

**Tasks**:
1. Create `apps/mobile/src/components/SwipeCard.tsx`:
   - Image carousel (apartment photos)
   - Apartment details overlay:
     - Price
     - Location
     - AI vibes (tags with icons)
   - Match score badge: "85% Match"
   - Swipe gestures (React Native Gesture Handler)
   - Animations (React Native Reanimated):
     - Rotate on drag
     - Fade out on swipe
     - Spring animation on release

**Deliverable**: Swipeable card component

---

### Step 5.2: Feed Screen
**Goal**: Main swipe interface

**Tasks**:
1. Create `apps/mobile/app/(tabs)/feed.tsx`:
   - Load feed from `feedStore.fetchFeed()`
   - Render current apartment card
   - Action buttons:
     - ❌ Dislike (rotate left, fade out)
     - ⭐ Super Like (bounce up, fade out)
     - ❤️ Like (rotate right, fade out)
   - On swipe → Call `feedStore.swipe(itemId, action)`
   - If match detected → Show "It's a Match!" modal
   - Auto-load next card

**Deliverable**: Working swipe feed

---

### Step 5.3: Match Modal
**Goal**: Celebrate new matches

**Tasks**:
1. Create `apps/mobile/src/components/MatchModal.tsx`:
   - Full-screen modal
   - Confetti animation (expo-confetti or similar)
   - Show both users' photos
   - Match score + reasons:
     ```
     🎉 It's a Match! (85%)

     Why you're compatible:
     • Matching vibes: Modern, Minimalist
     • Within your budget
     • Compatible roommate: Quiet, Organized
     ```
   - Buttons: "Send Message" / "Keep Swiping"

**Deliverable**: Match celebration modal

---

### Step 5.4: Apartment Details Modal
**Goal**: View full apartment details

**Tasks**:
1. Create `apps/mobile/app/apartment/[id].tsx`:
   - Full-screen image gallery (pinch to zoom)
   - Apartment details:
     - Price, size, bedrooms, bathrooms
     - Location map (react-native-maps)
     - Description
     - AI vibes with confidence scores
   - Provider info:
     - Name, photo
     - AI personality traits
     - "Why you're compatible" section
   - Action buttons: Like / Dislike / Super Like

**Deliverable**: Details modal

---

## 📦 Phase 6: Matches Screen (2 hours)

### Step 6.1: Matches List
**Goal**: Show all matches

**Tasks**:
1. Create `apps/mobile/app/(tabs)/matches.tsx`:
   - Two tabs:
     - **For Seekers**: Accepted matches (can chat)
     - **For Providers**: Incoming likes (pending approval)

   - Match card component:
     - Apartment photo (for seekers) or seeker photo (for providers)
     - Match score
     - Match reasons preview
     - Status badge: "Pending" / "Accepted"

   - For providers:
     - "Accept" / "Reject" buttons
     - On accept → `matchStore.acceptMatch()` → Navigate to chat

**Deliverable**: Matches list

---

## 📦 Phase 7: Chat (3-4 hours)

### Step 7.1: Socket.io Client
**Goal**: Real-time messaging

**Tasks**:
1. Create `apps/mobile/src/services/socket.ts`:
   ```typescript
   import io from 'socket.io-client';

   const socket = io('http://localhost:3000');

   export const chatSocket = {
     connect: () => socket.connect(),
     disconnect: () => socket.disconnect(),

     joinRoom: (matchId) => socket.emit('join_room', { matchId }),

     sendMessage: (matchId, message) =>
       socket.emit('send_message', { matchId, message }),

     onNewMessage: (callback) =>
       socket.on('new_message', callback)
   };
   ```

2. Integrate with `chatStore`:
   - On new message received → `chatStore.addMessage()`

**Deliverable**: Real-time socket connection

---

### Step 7.2: Chat Screen
**Goal**: Messaging interface

**Tasks**:
1. Create `apps/mobile/app/chat/[matchId].tsx`:
   - GiftedChat component (or custom implementation)
   - Features:
     - Message bubbles (sent/received styling)
     - Timestamp
     - Input field with send button
     - Auto-scroll to bottom
     - Real-time updates via Socket.io

   - Header:
     - Other user's name + photo
     - Match score badge
     - "View Apartment" button

**Deliverable**: Chat screen

---

### Step 7.3: Conversation List
**Goal**: List of all chats

**Tasks**:
1. Create `apps/mobile/app/(tabs)/messages.tsx`:
   - List of conversations
   - Each item shows:
     - Other user's photo
     - Last message preview
     - Timestamp
     - Unread badge (if any)
   - Sort by most recent
   - Tap → Navigate to chat screen

**Deliverable**: Message list

---

## 📦 Phase 8: Provider Flow (2-3 hours)

### Step 8.1: Create Apartment Screen
**Goal**: Providers can list apartments

**Tasks**:
1. Create `apps/mobile/app/create-apartment.tsx`:
   - Image picker (multiple photos)
   - Upload to Cloudinary
   - Form fields:
     - Price (number input)
     - Size (sqm)
     - Bedrooms, bathrooms
     - Location (address, city, lat/lng from map)
     - Description (textarea)
   - Submit → `api.createItem()`
   - Show loading: "AI is analyzing your apartment..."
   - Display extracted vibes:
     ```
     ✨ AI Detected Vibes:
     • Modern (95%)
     • Bright (88%)
     • Spacious (92%)
     ```

**Deliverable**: Apartment creation flow

---

### Step 8.2: My Apartments Screen
**Goal**: Providers manage their listings

**Tasks**:
1. Create `apps/mobile/app/my-apartments.tsx`:
   - List of provider's apartments
   - Each card shows:
     - Photo
     - Price, location
     - AI vibes
     - Number of likes received
   - Tap → Edit apartment
   - Delete button

**Deliverable**: Apartment management

---

## 📦 Phase 9: Profile Screen (1-2 hours)

### Step 9.1: Profile View
**Goal**: User profile + settings

**Tasks**:
1. Create `apps/mobile/app/(tabs)/profile.tsx`:
   - User photo
   - Name, bio
   - AI personality traits
   - For seekers: Current preferences
   - Edit button → Navigate to edit screen
   - Logout button

**Deliverable**: Profile screen

---

### Step 9.2: Edit Profile
**Goal**: Update profile info

**Tasks**:
1. Create `apps/mobile/app/edit-profile.tsx`:
   - Update photos
   - Edit name, bio
   - For seekers: Edit preferences
   - Re-run AI analysis button

**Deliverable**: Profile editing

---

## 📦 Phase 10: UI Polish + Animations (2-3 hours)

### Step 10.1: Design System
**Goal**: Consistent UI with Tamagui

**Tasks**:
1. Create theme in `apps/mobile/src/theme/`:
   - Colors (primary, secondary, background, text)
   - Typography (font sizes, weights)
   - Spacing scale
   - Border radius values

2. Create reusable components in `apps/mobile/src/components/`:
   - `Button.tsx` (primary, secondary, outline variants)
   - `Card.tsx`
   - `Badge.tsx` (for match scores, AI tags)
   - `Avatar.tsx`
   - `LoadingSpinner.tsx`
   - `EmptyState.tsx`

**Deliverable**: Design system

---

### Step 10.2: Animations
**Goal**: Smooth, delightful animations

**Tasks**:
1. Swipe animations (already in SwipeCard):
   - Rotate on drag
   - Fade out on swipe
   - Bounce back if released in center

2. Screen transitions:
   - Slide from right for modals
   - Fade for tab switches

3. Micro-interactions:
   - Button press scale animation
   - Badge pulse on new match
   - Skeleton loaders while fetching data

**Deliverable**: Polished animations

---

## 📦 Phase 11: Error Handling + Loading States (1 hour)

### Step 11.1: Error Handling
**Goal**: Graceful error messages

**Tasks**:
1. Create `apps/mobile/src/components/ErrorMessage.tsx`:
   - Display API errors
   - Retry button

2. Add error handling to all API calls:
   - Network errors → "Check your connection"
   - 401 → Redirect to login
   - 500 → "Something went wrong"

**Deliverable**: Error handling

---

### Step 11.2: Loading States
**Goal**: Show progress during async operations

**Tasks**:
1. Loading indicators:
   - Feed loading: Skeleton cards
   - Image upload: Progress bar
   - AI analysis: "Analyzing..." with animated spinner
   - Message sending: Optimistic UI (show immediately, update on confirm)

**Deliverable**: Loading states

---

## 📦 Phase 12: Testing + Demo Prep (1-2 hours)

### Step 12.1: End-to-End Testing
**Goal**: Verify full user flow

**Tasks**:
1. Test Seeker flow:
   - Register → Onboarding → AI analysis → Preferences
   - View feed → Swipe apartments
   - Get match → View match modal
   - Chat with provider

2. Test Provider flow:
   - Register → Create apartment → AI tags shown
   - See incoming likes
   - Accept match → Chat with seeker

**Deliverable**: App fully tested

---

### Step 12.2: Demo Preparation
**Goal**: Perfect demo for judges

**Tasks**:
1. Create demo accounts:
   - 1 seeker with good photos (high AI confidence)
   - 1 provider with nice apartment
   - Pre-create some matches

2. Practice demo flow (3 minutes):
   - Show onboarding with AI analysis
   - Swipe through feed (show match scores)
   - Get a match → Show celebration modal
   - Open chat → Send message (real-time)

**Deliverable**: Demo ready

---

## 🎯 API Integration Points (Work with Vukasin)

**Required API Endpoints**:
```
POST /api/v1/users
POST /api/v1/users/:id/analyze
PATCH /api/v1/users/:id/preferences

POST /api/v1/items
GET /api/v1/items/:id

GET /api/v1/feed?limit=20
POST /api/v1/interactions/swipe

GET /api/v1/matches
POST /api/v1/matches/:matchId/accept

POST /api/v1/messages
GET /api/v1/messages/:matchId

WebSocket: ws://localhost:3000
  Events: join_room, send_message, new_message
```

**API Response Format** (example):
```json
// GET /feed
{
  "items": [
    {
      "item": {
        "id": "apt-123",
        "type": "Apartment",
        "price": 1500,
        "images": ["url1", "url2"],
        "location": { "city": "Belgrade", "lat": 44.8, "lng": 20.4 },
        "attributes": [
          { "name": "Modern", "confidence": 0.95 },
          { "name": "Bright", "confidence": 0.88 }
        ]
      },
      "provider": {
        "id": "user-456",
        "name": "John Doe",
        "images": ["url"],
        "attributes": [
          { "name": "Organized", "confidence": 0.92 }
        ]
      },
      "score": {
        "Apartment Compatibility": 85,
        "Roommate Compatibility": 78,
        "total": 83,
        "reasons": [
          "Matching vibes: Modern, Minimalist",
          "Within your budget",
          "Compatible roommate: Quiet, Organized"
        ]
      }
    }
  ]
}
```

---

## 🚀 Hackathon Priority Order

**Must Have (Demo Blockers)**:
1. ✅ Authentication + Onboarding
2. ✅ AI analysis feedback (WOW factor!)
3. ✅ Swipe feed with animations
4. ✅ Match modal
5. ✅ Matches list
6. ✅ Chat screen (real-time)

**Should Have (Nice to Show)**:
1. ✅ Apartment details modal
2. ✅ Provider flow (create apartment)
3. ✅ Profile screen

**Could Have (If Time)**:
1. Edit profile
2. Image gallery with zoom
3. Map view for location
4. Push notifications

---

## 📝 Environment Variables

```bash
# apps/mobile/.env
EXPO_PUBLIC_API_URL=http://localhost:3000/api/v1
EXPO_PUBLIC_WS_URL=ws://localhost:3000
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
```

---

## 🎨 UI/UX Tips for Hackathon

**Visual Hierarchy**:
- Big, clear match scores (85% Match)
- AI tags with confidence badges
- Match reasons prominently displayed

**Delight Users**:
- Smooth swipe animations (Reanimated)
- Confetti on match
- Pulse animation on new messages
- "Analyzing..." with animated spinner

**Show, Don't Tell**:
- Live AI analysis with real-time feedback
- Match reasons visualization
- Social graph preview (future feature teaser)

---

**Good luck, Teodora! 🎨 Make it beautiful!**
