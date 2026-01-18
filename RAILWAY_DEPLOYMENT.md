# 🚂 Railway Deployment Guide - ZZZimeri Backend

## Zašto Railway?

✅ **Besplatan tier** - $5 kredit mesečno
✅ **Automatski deployment** - Push to GitHub = auto deploy
✅ **Public URL** - Backend dostupan sa bilo koje mreže
✅ **Environment variables** - Lako upravljanje
✅ **Logs & Monitoring** - Real-time logs

---

## 📋 Koraci za Deployment

### 1. Napravi Railway Nalog

1. Idi na: **https://railway.app**
2. Klikni **"Login with GitHub"**
3. Autorizuj Railway pristup GitHub-u

---

### 2. Push Kod na GitHub

**VAŽNO**: Prvo moramo commit-ovati i push-ovati kod:

```bash
# U root folderu projekta
git add .
git commit -m "feat: Prepare backend for Railway deployment

- Add Dockerfile for containerization
- Add railway.json config
- Add build scripts for Railway
- Configure health check endpoint

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

git push origin main
```

---

### 3. Kreiraj Novi Projekat na Railway

1. Otvori **Railway Dashboard**: https://railway.app/dashboard
2. Klikni **"New Project"**
3. Izaberi **"Deploy from GitHub repo"**
4. Izaberi tvoj **`internalHackaton`** repository
5. Railway će automatski detektovati Node.js projekat

---

### 4. Konfiguriši Root Directory

Railway treba da zna gde je backend folder:

1. U Railway projektu, klikni na **Settings** (zupčanik)
2. Scroll dole do **"Service Settings"**
3. U **"Root Directory"** polje unesi: `apps/server`
4. Klikni **"Save Changes"**

---

### 5. Dodaj Environment Variables

Idi na **Variables** tab i dodaj sledeće:

```bash
# App Config
PORT=3000
NODE_ENV=production
DOMAIN_TYPE=zzzimeri

# Neo4j Database
NEO4J_URI=neo4j+s://b6ad49bf.databases.neo4j.io
NEO4J_USER=neo4j
NEO4J_PASSWORD=6AQw9EqEi0CKc9CfYuP5MT3dYnH_XAXd_UBh_pjZqgE

# Google Gemini AI
GEMINI_API_KEY=AIzaSyDZsPYPWOl6GkZ7YqxFzTWw3SdN5YMfUps

# Cloudinary
CLOUDINARY_CLOUD_NAME=dzxhhdsc5
CLOUDINARY_API_KEY=766836624145383
CLOUDINARY_API_SECRET=gENJ2fghG1N_67WTh5zotMsLDCQ

# Clerk Auth
CLERK_PUBLISHABLE_KEY=pk_test_bGl2ZS1jb3diaXJkLTQxLmNsZXJrLmFjY291bnRzLmRldiQ
CLERK_SECRET_KEY=sk_test_Ho3JoqbqqkOmcpdrhSFz0WJFnAUDZBsCCz5RcS0ntx
```

**Kako dodati:**
- Klikni **"New Variable"**
- Copy-paste svaku liniju (format: `KEY=value`)
- Railway automatski parsira

---

### 6. Deploy!

1. Klikni **"Deploy"** dugme (ili čekaj auto-deploy nakon push-a)
2. Prati deployment logs u **"Deployments"** tab-u
3. Build će trajati 2-3 minuta

---

### 7. Dobij Public URL

1. Kada deployment završi, idi na **Settings**
2. Scroll do **"Networking"** sekcije
3. Klikni **"Generate Domain"**
4. Railway će ti dati URL kao: `https://your-app-production.up.railway.app`

---

### 8. Testiraj Backend

Otvori u browser-u:

```
https://your-app-production.up.railway.app/api/v1/health
```

Trebalo bi da vidiš:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "database": "connected",
    "timestamp": "..."
  }
}
```

---

### 9. Ažuriraj Mobile App

U `apps/mobile/.env` promeni URL:

```bash
# Stari (localhost)
# EXPO_PUBLIC_API_URL=http://172.20.10.2:3000/api/v1
# EXPO_PUBLIC_WS_URL=ws://172.20.10.2:3000

# Novi (Railway)
EXPO_PUBLIC_API_URL=https://your-app-production.up.railway.app/api/v1
EXPO_PUBLIC_WS_URL=wss://your-app-production.up.railway.app
```

**NAPOMENA**: Koristi `wss://` za WebSocket (secure), ne `ws://`

---

### 10. Restartuj Expo

```bash
cd apps/mobile
npx expo start -c
```

Sada će aplikacija raditi sa bilo koje WiFi mreže! 🎉

---

## 🔧 Railway Tips

### Monitoring
- **Logs**: Real-time logs u Railway dashboard-u
- **Metrics**: CPU, Memory, Network usage
- **Health Checks**: Automatski ping na `/api/v1/health`

### Auto-Deploy
- Svaki `git push` na `main` branch = automatski redeploy
- Deploy samo `apps/server` folder (zbog Root Directory config-a)

### Build Command
Railway automatski pokreće:
```bash
npm run railway:build  # → npm run build → tsc
```

### Start Command
Railway automatski pokreće:
```bash
npm run railway:start  # → npm run start → node dist/app.js
```

### Costs
- **Free Tier**: $5 kredit mesečno
- **Usage**: ~$0.02-0.10 po danu za ovaj projekat
- **Sleep Mode**: Railway automatski spava ako nema requesta 10 minuta (besplatno)

---

## 🐛 Troubleshooting

### Build Failed
- Proveri logs u Railway dashboard
- Proveri da li `apps/server` ima `package.json`
- Proveri da li TypeScript kompajlira: `cd apps/server && npm run build`

### Deployment Failed
- Proveri environment variables (svi moraju biti tačni)
- Proveri Neo4j connection (URI, password)
- Proveri da li health check endpoint radi

### App Crashes
- Proveri logs u Railway dashboard
- Neo4j connection timeout? Proveri firewall/whitelist
- Port mora biti `3000` (Railway automatski mapira)

### WebSocket ne radi
- URL mora biti `wss://` (secure), ne `ws://`
- Railway automatski podržava WebSocket na istom portu

---

## 📊 Šta Railway Radi Automatski?

✅ Detektuje Node.js projekat
✅ Instalira dependencies (`npm ci`)
✅ Builda TypeScript (`npm run build`)
✅ Pokreće app (`npm start`)
✅ Expose-uje port 3000
✅ Generiše HTTPS URL
✅ Health check monitoring
✅ Auto-restart on crash
✅ Zero-downtime deploys

---

## 🎯 Sledeći Koraci Nakon Deploy-a

1. **Testiraj API**: Curl/Postman request na Railway URL
2. **Testiraj Mobile App**: Scaniraj QR, testiraj onboarding
3. **Proveri Logs**: Prati Railway logs za errore
4. **Setup Cloudinary Preset**: Vidi [CLOUDINARY_SETUP.md](./CLOUDINARY_SETUP.md)

---

## 🚀 Quick Deploy Checklist

- [ ] Push code to GitHub
- [ ] Create Railway account
- [ ] New Project → Deploy from GitHub
- [ ] Set Root Directory: `apps/server`
- [ ] Add Environment Variables (copy from .env)
- [ ] Deploy & wait 2-3 min
- [ ] Generate Domain
- [ ] Test health endpoint
- [ ] Update mobile `.env` sa Railway URL
- [ ] Restart Expo with `-c` flag
- [ ] Test app end-to-end! 🎉

---

## 💡 Pro Tip

Dodaj Railway URL kao secret u GitHub Actions za CI/CD:

```yaml
# .github/workflows/deploy.yml
- name: Health Check
  run: curl https://your-app.railway.app/api/v1/health
```

---

**Railway Dashboard**: https://railway.app/dashboard
**Documentation**: https://docs.railway.app/
**Support**: https://railway.app/discord
