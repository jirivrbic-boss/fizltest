# Fizl Testy

Webová aplikace pro procvičování služebních testů Policie ČR.

## Spuštění lokálně

```bash
cp .env.example .env.local
npm install
npm run dev
```

Aplikace běží na [http://localhost:3000](http://localhost:3000).

## Deploy na Vercel

1. Importuj repozitář z GitHubu
2. V **Settings → Environment Variables** přidej tyto proměnné:

| Název | Hodnota |
|-------|---------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | `AIzaSyDVC-EVzRi7fhFmKlEz22zc2ym3zEVvYzc` |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `fizl-testy.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `fizl-testy` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `fizl-testy.firebasestorage.app` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `956356899189` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | `1:956356899189:web:18d96c80a8d2438567e33c` |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | `G-NGQKLND1SC` |

3. Deploy — jiné proměnné nejsou potřeba

## Firebase nastavení

V [Firebase Console](https://console.firebase.google.com/project/fizl-testy) je potřeba:

### 1. Authentication
- Zapnout **Email/Password** provider v sekci Authentication → Sign-in method.

### 2. Firestore Database

- Vytvořit databázi (Production nebo Test mode).
- Do Firebase Console vložit pravidla ze souboru [`firestore.rules`](./firestore.rules).
- Po prvním přihlášení se původní sada otázek automaticky uloží jako první test.

## Admin

Admin panel je na `/admin`. Uživatel musí být nejdřív přihlášený běžným Firebase účtem a potom zadá admin heslo `Jirka123`.

Panel umožňuje spravovat testy a jejich otázky, prohlížet uživatele a jejich online stav, spravovat achievementy a sledovat všechny multiplayerové výzvy.

## Funkce

- Přihlášení a registrace (Firebase Auth)
- Výběr jednoho nebo více testů a náhodný mix 25 otázek
- 20minutový odpočet
- Automatické uložení výsledku do Firestore
- Historie testů s pass/fail statusem a přehledem odpovědí
- Level systém s XP, odměnami a achievementy
- Veřejné multiplayerové roomky pro 2–8 hráčů, společný odpočet a stupínek vítězů
- Admin správa testů, otázek, uživatelů, online stavu, výzev a achievementů
- Responzivní mobilní design

## Struktura

| Cesta | Popis |
|-------|-------|
| `/` | Přihlášení / registrace |
| `/dashboard` | Hlavní menu + level/XP |
| `/test/select` | Výběr jednoho nebo více testů |
| `/test` | Testovací rozhraní (25 otázek / 20 minut) |
| `/history` | Historie výsledků |
| `/achievements` | Achievementy a progress |
| `/challenges` | Veřejné výzvy a vytváření roomek |
| `/admin` | Admin panel |
