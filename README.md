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
- Nastavit bezpečnostní pravidla:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /test_results/{resultId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
    }
  }
}
```

## Funkce

- Přihlášení a registrace (Firebase Auth)
- Náhodný výběr 25 otázek z databáze
- 20minutový odpočet
- Automatické uložení výsledku do Firestore
- Historie testů s pass/fail statusem
- Responzivní mobilní design

## Struktura

| Cesta | Popis |
|-------|-------|
| `/` | Přihlášení / registrace |
| `/dashboard` | Hlavní menu |
| `/test` | Testovací rozhraní |
| `/history` | Historie výsledků |
