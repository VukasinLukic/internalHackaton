# 🔧 PROBLEMI SA FUNKCIONALNOSTIMA - ZZZimeri App

**Datum analize:** 18. Januar 2026
**Aplikacija:** ZZZimeri - Mobilna aplikacija
**Status:** DELIMIČNO FUNKCIONALNA

---

## 📊 GLAVNI PROBLEMI ZAŠTO NE RADI KAKO TREBA

### ❌ **AUTENTIFIKACIJA NIJE IMPLEMENTIRANA**

**Lokacija:** [apps/mobile/app/(auth)/login.tsx](apps/mobile/app/(auth)/login.tsx), [apps/mobile/app/(auth)/register.tsx](apps/mobile/app/(auth)/register.tsx)

**Problem:**
Login/Register forme samo preskaču na sledeći ekran bez validacije.

```typescript
// apps/mobile/app/(auth)/login.tsx:10
const handleLogin = () => {
  // TODO: Implement Clerk authentication
  router.replace('/(tabs)/feed');  // ❌ NE ŠALJE NIŠTA NA BACKEND!
};
```

**Kako popraviti:**
1. Integriši Clerk SDK ili napravi custom auth
2. Poveži sa backend `/auth/login` endpointom
3. Sačuvaj token i user podatke

---

### ❌ **SOCKET METODE NE POSTOJE - CHAT NE RADI**

**Lokacija:** [apps/mobile/src/stores/chatStore.ts:79](apps/mobile/src/stores/chatStore.ts#L79)

**Problem:**
ChatStore poziva `joinRoom()` ali socket servis ima `joinMatch()`.

```typescript
// U chatStore.ts se poziva:
chatSocket.joinRoom(matchId);  // ❌ NE POSTOJI!

// Ali u socket.ts postoji:
joinMatch(matchId: string)     // ✓ Ovo postoji
```

**Kako popraviti:**
Promeni sve `joinRoom` u `joinMatch` i `leaveRoom` u `leaveMatch`.

---

### ⚠️ **FAKE EMAIL ADRESE**

**Lokacija:** [apps/mobile/app/(onboarding)/photo-analysis.tsx:39](apps/mobile/app/(onboarding)/photo-analysis.tsx#L39)

**Problem:**
Aplikacija kreira korisnike sa lažnim email adresama.

```typescript
email: `${Date.now()}@temp.com`,  // ❌ FAKE EMAIL!
```

**Kako popraviti:**
- Ako koristiš Clerk - uzmi pravi email iz Clerk usera
- Ako ne - traži email u registraciji i validuj ga

---

### ⚠️ **LOCALHOST URLs - NE RADI NA MOBILNOM**

**Lokacija:** [apps/mobile/src/services/api.ts:16](apps/mobile/src/services/api.ts#L16)

**Problem:**
API url je `localhost` što ne radi na pravim uređajima.

```typescript
const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
```

**Kako popraviti:**
1. Dodaj u `.env` fajl:
   ```env
   EXPO_PUBLIC_API_URL=http://192.168.1.X:3000/api/v1  # Tvoja lokalna IP adresa
   ```
2. Ili koristi ngrok/tunneling service za testiranje
3. Za production - stavi pravu domain adresu

---

### ⚠️ **API CONTRACT MISMATCH**

**Problem:**
Frontend očekuje polja koja backend možda šalje drugačije.
 
**Primeri:**
```typescript
// Frontend očekuje:
interface Message {
  timestamp: string;
  isRead: boolean;
}

// Backend možda šalje:
{
  createdAt: Date,
  read: true
}
```

**Kako popraviti:**
1. Otvori backend kod i uporedi TypeScript interfejse
2. Napravi mapping funkcije ako se polja razlikuju
3. Testiraj sa Postman/Insomnia da vidiš šta backend vraća

---

### ⚠️ **HARDCODED CLOUDINARY CREDENTIALS**

**Lokacija:** [apps/mobile/src/services/cloudinary.ts:6](apps/mobile/src/services/cloudinary.ts#L6)

**Problem:**
Cloud name je hardcoded umesto iz environment variables.

```typescript
const CLOUDINARY_CLOUD_NAME = 'dzxhhdsc5';  // ❌ HARDCODED!
const CLOUDINARY_UPLOAD_PRESET = 'zzzimeri_unsigned';
```

**Kako popraviti:**
```typescript
const CLOUDINARY_CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dzxhhdsc5';
const CLOUDINARY_UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_PRESET || 'zzzimeri_unsigned';
```

Dodaj u `.env`:
```env
EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME=dzxhhdsc5
EXPO_PUBLIC_CLOUDINARY_PRESET=zzzimeri_unsigned
```

---

### ⚠️ **MOCK DATA U PRODUCTION KODU**

**Lokacija:** [apps/mobile/app/(tabs)/feed.tsx:13-128](apps/mobile/app/(tabs)/feed.tsx#L13-L128)

**Problem:**
100+ linija mock podataka koje ne treba.

```typescript
const MOCK_FEED_ITEMS: FeedItem[] = [
  // 115 linija mock podataka...
];
```

**Kako popraviti:**
- Obriši mock data ili ga premesti u poseban `__mocks__` folder
- Koristi samo real data sa backenda

---

### ⚠️ **CONSOLE.LOG EVERYWHERE**

**Lokacija:** 20+ mesta u kodu

**Problem:**
Previše debug logova.

```typescript
console.log('Socket connected, authenticating...');
console.log('New message received:', message);
```

**Kako popraviti:**
- Koristi development-only logging:
```typescript
if (__DEV__) {
  console.log('Debug info');
}
```
- Ili koristi logger library (winston, loglevel)

---

### ⚠️ **CIRCULAR DEPENDENCY**

**Lokacija:** [apps/mobile/src/services/socket.ts:8](apps/mobile/src/services/socket.ts#L8)

**Problem:**
"Lazy import" hack za circular dependency.

```typescript
const getChatStore = () => require('../stores/chatStore').useChatStore;
```

**Kako popraviti:**
- Reorganizuj fajlove da nema circular dependencies
- Možda socket ne treba direktno da poziva store
- Koristi event emitter pattern umesto direktnih poziva

---

## 🔗 PROBLEMI SA BACKEND-FRONTEND POVEZIVANJEM

### 1. **API Autentifikacija**

**Status:** ❌ NE RADI

Frontend šalje custom headere koje backend možda ne proverava:
```typescript
headers: {
  'X-User-Id': user.id,
  'X-User-Role': user.role,
}
```

**Rešenje:**
- Implementiraj pravu JWT autentifikaciju
- Backend mora validirati token
- Frontend mora čuvati i slati token u `Authorization: Bearer <token>` headeru

---

### 2. **Socket.io Events**

**Status:** ⚠️ DELIMIČNO RADI

Frontend sluša događaje koje backend možda ne emituje:
```typescript
socket.on('user_typing')      // ⚠️ Proveri da li backend ovo emituje
socket.on('message_read')     // ⚠️ Proveri da li postoji
socket.on('new_match')        // ⚠️ Proveri format
```

**Rešenje:**
1. Otvori backend socket.io kod
2. Uporedi koje događaje backend emituje
3. Promeni frontend da sluša iste događaje
4. Proveri format podataka (payload structure)

---

### 3. **Response Format**

**Status:** ⚠️ MOŽE BITI PROBLEM

Frontend očekuje određeni format odgovora:
```typescript
interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
}
```

**Rešenje:**
- Testiraj sa curl/Postman da vidiš šta backend vraća
- Ako backend vraća drugačiji format - napravi adapter funkciju

---

## ✅ ŠTA RADI DOBRO

1. ✅ **UI/UX** - Ekrani izgledaju lepo
2. ✅ **Navigacija** - Expo Router radi kako treba
3. ✅ **State management** - Zustand store setup je dobar
4. ✅ **TypeScript** - Dobro istipizirano
5. ✅ **Cloudinary upload** - Upload logika je OK (samo treba .env)
6. ✅ **Swipe mechanika** - Izgleda kompletan

---

## 🛠️ BRZE POPRAVKE (DO 1 SAT)

### 1. Popravi Socket Method Names
```typescript
// U chatStore.ts zameni:
chatSocket.joinRoom(matchId);   →  chatSocket.joinMatch(matchId);
chatSocket.leaveRoom(matchId);  →  chatSocket.leaveMatch(matchId);
```

### 2. Dodaj API URL u .env
```env
# apps/mobile/.env
EXPO_PUBLIC_API_URL=http://192.168.1.100:3000/api/v1
EXPO_PUBLIC_WS_URL=http://192.168.1.100:3000
```

### 3. Testiraj Backend Connection
```bash
# U terminalu:
curl http://localhost:3000/api/v1/health
# Ili:
curl http://localhost:3000/api/v1/feed?limit=5
```

---

## 🎯 AKCIONI PLAN - PRIORITETI

### PRIORITET 1 - Osnovne funkcionalnosti (1-2 dana):

1. **Implementiraj Login/Register**
   - Integriši Clerk ili custom auth
   - Poveži sa backendom
   - Čuvaj token

2. **Popravi Socket metode**
   - `joinRoom` → `joinMatch`
   - `leaveRoom` → `leaveMatch`
   - Testiraj chat

3. **Podesi API URLs**
   - Dodaj .env varijable
   - Testiraj sa pravim deviceom

### PRIORITET 2 - Poboljšanja (2-3 dana):

4. **API Contract Testing**
   - Testiraj sve endpointe
   - Proveri response format
   - Napravi adapter funkcije ako treba

5. **Error Handling**
   - Bolji error messages
   - Retry logika
   - Loading states

6. **Code Cleanup**
   - Obriši mock data
   - Ukloni console.logs
   - Fix circular dependencies

---

## 📝 TESTIRANJE CHECKLIST

Pre nego što kažeš da sve radi, testiraj:

- [ ] Login radi i šalje request na backend
- [ ] Register kreira korisnika u bazi
- [ ] Feed učitava prave stanove sa backenda
- [ ] Swipe šalje akciju na backend
- [ ] Match modal se pojavljuje nakon match-a
- [ ] Chat se otvara i učitava poruke
- [ ] Slanje poruke radi preko API i Socket.io
- [ ] Real-time poruke stižu preko socketa
- [ ] Upload slika radi na Cloudinary
- [ ] Profile se čuva i učitava

---

## 🔍 KAKO PROVERITI DA LI RADI SA BACKENDOM

### 1. Proveri da li backend radi:
```bash
cd apps/server
npm run dev
# Trebalo bi: Server started on port 3000
```

### 2. Testiraj API endpointe:
```bash
curl http://localhost:3000/api/v1/health
# Trebalo bi: {"status": "ok"}
```

### 3. Pokreni mobilnu app:
```bash
cd apps/mobile
npm run dev
# Skenuj QR kod u Expo Go app
```

### 4. Gledaj network requests:
- Otvori React Native Debugger
- Proveri Network tab
- Vidi da li requestovi stižu do backenda

### 5. Gledaj backend logove:
- Terminal gde radi server
- Trebalo bi da vidiš incoming requests
- Ako ne vidiš - znači mobilna app ne šalje requestove

---

## 🎯 ZAKLJUČAK

### Status: **SKORO PA RADI** 🟡

**Šta radi:**
- ✅ UI/UX kompletiran
- ✅ State management setup
- ✅ API pozivi definisani
- ✅ Socket.io inicijalizovan

**Šta NE radi:**
- ❌ Autentifikacija (TODO)
- ❌ Socket method names (joinRoom vs joinMatch)
- ❌ Localhost URLs na mobilnom
- ❌ Fake email addresses

**Procena vremena za popravke:**
- **Minimum viable:** 1-2 dana (auth + socket fix + URLs)
- **Production ready:** 1-2 nedelje (+ testing + error handling + cleanup)

**Da li je povezano sa backendom?**
- **95% povezano** - API pozivi postoje, Socket.io setup gotov
- **5% nedostaje** - Auth token handling, method names, testing

---

**Kraj izveštaja**
