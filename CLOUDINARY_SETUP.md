# Cloudinary Setup Instructions

## Create Unsigned Upload Preset

Za direktan upload slika sa mobilne aplikacije na Cloudinary, potrebno je kreirati "unsigned upload preset":

### Koraci:

1. **Prijavi se na Cloudinary Dashboard**
   - Idi na: https://cloudinary.com/console
   - Koristi credentials iz `.env` fajla:
     - Cloud name: `dzxhhdsc5`

2. **Kreiraj Upload Preset**
   - U dashboard-u, klikni na **Settings** (zupčanik gore desno)
   - Izaberi tab **Upload**
   - Skroluj dole do sekcije **Upload presets**
   - Klikni **Add upload preset**

3. **Konfiguriši Preset**
   - **Preset name**: `zzzimeri_unsigned`
   - **Signing Mode**: **Unsigned** ⚠️ VAŽNO!
   - **Folder**: `zzzimeri` (opciono, za organizaciju)
   - **Allowed formats**: `jpg, jpeg, png, webp`
   - **Max file size**: `10 MB` (opciono)
   - **Transformation**:
     - Width: `1200`
     - Height: `1200`
     - Crop: `limit` (ne seče sliku, samo smanjuje ako je veća)
     - Quality: `auto:good`
     - Format: `auto` (automatski bira najbolji format)

4. **Sačuvaj**
   - Klikni **Save**

5. **Verifikuj**
   - Preset name `zzzimeri_unsigned` će biti korišćen u aplikaciji
   - Proveri da je **Signing Mode** postavljen na **Unsigned**

## Trenutni Cloudinary Credentials

```
CLOUDINARY_CLOUD_NAME=dzxhhdsc5
CLOUDINARY_API_KEY=766836624145383
CLOUDINARY_API_SECRET=gENJ2fghG1N_67WTh5zotMsLDCQ
```

## Test Upload

Nakon što napraviš preset, možeš testirati upload direktno iz browser-a:

```javascript
// Test u browser console-u
fetch('https://api.cloudinary.com/v1_1/dzxhhdsc5/image/upload', {
  method: 'POST',
  body: new FormData(document.querySelector('input[type=file]')).append('upload_preset', 'zzzimeri_unsigned')
})
```

## Kako Radi u Aplikaciji

Mobile app koristi `uploadToCloudinary()` funkciju iz `src/services/cloudinary.ts`:

```typescript
import { uploadMultipleToCloudinary } from '../services';

const result = await uploadMultipleToCloudinary(imageUris);
// result.urls = ["https://res.cloudinary.com/dzxhhdsc5/image/upload/v1234567890/zzzimeri/abc123.jpg"]
```

## Security Note

Unsigned presets dozvoljavaju upload bez autentifikacije, što je OK za user-generated content kao što su profilne slike. Cloudinary automatski limitira broj upload-a po IP adresi da spreči zloupotrebe.
