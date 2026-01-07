# NotesAI - React Native Mobile Application

Mobilna aplikacja w React Native (Expo) pozwalająca użytkownikom na robienie zdjęć książek/dokumentów, udostępnianie screenshotów i automatyczne przetwarzanie tekstu przez AI.

## 🚀 Funkcje

- 📷 Robienie zdjęć książek/dokumentów aparatem
- 🔗 Udostępnianie screenshotów z innych aplikacji (Share Extension)
- 🤖 Automatyczne przetwarzanie tekstu przez AI (OCR + LLM via Laravel API)
- 📝 Przeglądanie notatek z kategoriami i podsumowaniami
- 🔍 Infinite scroll z paginacją
- ♻️ Pull-to-refresh
- 🏷️ System kategorii z kolorami
- 🗑️ Usuwanie notatek

## 🛠 Stack technologiczny

- **Framework:** React Native z Expo SDK 51+
- **Language:** TypeScript
- **Navigation:** React Navigation 6
- **State Management:** React Query (TanStack Query) + React Context
- **Storage:** AsyncStorage
- **API Client:** Axios
- **Image Handling:** expo-image-picker, expo-image-manipulator
- **Share Extension:** react-native-receive-sharing-intent
- **Notifications:** expo-notifications (opcjonalnie)

## 📁 Struktura projektu

```
mobile/
├── src/
│   ├── screens/
│   │   ├── auth/                 # Ekrany autentykacji
│   │   │   ├── LoginScreen.tsx
│   │   │   └── RegisterScreen.tsx
│   │   └── notes/                # Ekrany notatek
│   │       ├── NotesListScreen.tsx
│   │       ├── NoteDetailScreen.tsx
│   │       ├── AddNoteScreen.tsx
│   │       └── ProcessNoteScreen.tsx
│   ├── components/               # Komponenty wielokrotnego użytku
│   │   ├── NoteCard.tsx
│   │   ├── CategoryBadge.tsx
│   │   ├── LoadingSpinner.tsx
│   │   └── EmptyState.tsx
│   ├── navigation/               # Konfiguracja nawigacji
│   │   ├── AppNavigator.tsx
│   │   ├── AuthNavigator.tsx
│   │   └── types.ts
│   ├── services/                 # API services
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   └── notes.ts
│   ├── hooks/                    # Custom React hooks
│   │   ├── useNotes.ts
│   │   ├── useNote.ts
│   │   ├── useUploadNote.ts
│   │   └── useDeleteNote.ts
│   ├── contexts/                 # React contexts
│   │   └── AuthContext.tsx
│   ├── types/                    # TypeScript types
│   │   ├── auth.ts
│   │   ├── note.ts
│   │   └── api.ts
│   ├── utils/                    # Utility functions
│   │   ├── storage.ts
│   │   ├── imageCompression.ts
│   │   └── formatters.ts
│   └── theme/                    # Theme configuration
│       ├── colors.ts
│       ├── typography.ts
│       └── spacing.ts
├── App.tsx
├── app.json
└── package.json
```

## 🚦 Instalacja

### Wymagania
- Node.js >= 18
- npm lub yarn
- Expo CLI: `npm install -g expo-cli`
- Dla iOS: Xcode i CocoaPods
- Dla Android: Android Studio

### Kroki instalacji

```bash
# Sklonuj repozytorium
git clone <repo-url>
cd notesAI-ReactNative

# Zainstaluj zależności
npm install

# Dla iOS (tylko macOS)
cd ios && pod install && cd ..

# Uruchom Expo development server
npm start
```

## 🎯 Uruchomienie

```bash
# Start development server
npm start

# Uruchom na Androidzie
npm run android

# Uruchom na iOS
npm run ios

# Uruchom w przeglądarce
npm run web
```

## 🔧 Konfiguracja

### Environment Variables

Utwórz plik `.env` w głównym katalogu:

```env
API_URL_DEV=http://10.0.2.2:8000/api
API_URL_PROD=https://api.twoja-domena.pl/api
```

### API Configuration

W pliku `src/services/api.ts` znajduje się konfiguracja axios z:
- Automatycznym dodawaniem tokenu do requestów
- Obsługą 401 (auto-logout)
- Timeout 60s dla długich requestów (upload + processing)

## 📱 Główne funkcjonalności

### Autentykacja
- **Login:** Email + hasło
- **Rejestracja:** Nazwa, email, hasło, potwierdzenie
- **Auto-login:** Sprawdzanie tokenu w AsyncStorage przy starcie

### Notatki
- **Lista notatek:** Infinite scroll z paginacją, pull-to-refresh
- **Szczegóły notatki:** Pełny tekst, podsumowanie, kategorie, źródło
- **Dodawanie:** Aparat lub galeria
- **Przetwarzanie:** Upload → Polling status → Redirect do listy
- **Usuwanie:** Confirmation dialog

### Share Extension
- Udostępnianie obrazów z innych aplikacji
- Automatyczne przekierowanie do ProcessNoteScreen
- Android: Konfiguracja w `app.json` (intentFilters)

## 🎨 Theme System

Aplikacja używa centralnego systemu theme:
- **colors.ts** - Paleta kolorów + kolory kategorii
- **typography.ts** - Font sizes, weights, line heights
- **spacing.ts** - Spacing constants i border radius

## 🔄 React Query

Używamy React Query do zarządzania stanem serwera:
- `useNotes` - Infinite query z paginacją
- `useNote` - Query dla pojedynczej notatki
- `useUploadNote` - Mutation z progress tracking
- `useDeleteNote` - Mutation z invalidation

## 📸 Image Processing Flow

1. User wybiera źródło (camera/gallery)
2. Permissions check
3. Image picker → URI
4. Navigate to ProcessNoteScreen
5. Compress image (max 2000px width, 80% quality)
6. Upload z FormData + progress tracking
7. Otrzymanie job_id
8. Polling status co 2s (max 60s)
9. Redirect do NotesListScreen po completion

## 🔐 Permissions

### Android (app.json)
- CAMERA
- READ_MEDIA_IMAGES
- WRITE_EXTERNAL_STORAGE
- INTERNET

### iOS (app.json)
- NSCameraUsageDescription
- NSPhotoLibraryUsageDescription

## 🐛 Debugging

```bash
# Type checking
npm run type-check

# Clear Expo cache
expo start -c

# Clear Metro bundler cache
npm start -- --reset-cache
```

## 📦 Build

```bash
# Development build
expo build:android
expo build:ios

# EAS Build (recommended)
eas build --platform android
eas build --platform ios
```

## 🎯 User Flows

### Scenariusz 1: Nowy użytkownik
1. Otwiera app → LoginScreen
2. Taps "Sign Up" → RegisterScreen
3. Fill form → auto-login → NotesListScreen (empty)
4. Taps "Add" → AddNoteScreen
5. "Take Photo" → Camera → ProcessNoteScreen
6. Upload + polling → NotesListScreen (1 nota)

### Scenariusz 2: Share Extension
1. User robi screenshot na LinkedIn
2. Taps "Share" → wybiera "NotesAI"
3. App opens → ProcessNoteScreen (auto-upload)
4. Polling → NotesListScreen

## 🚧 TODO / Roadmap

### MVP (Zrobione ✅)
- ✅ Autentykacja (login, register, logout)
- ✅ Camera & Gallery integration
- ✅ Upload z progress tracking
- ✅ Polling job status
- ✅ Lista notatek (infinite scroll)
- ✅ Szczegóły notatki
- ✅ Usuwanie notatek
- ✅ Share Extension setup
- ✅ Theme system
- ✅ Loading states & error handling

### Nice to have (Opcjonalnie)
- ⬜ Push notifications (daily summary)
- ⬜ Onboarding screens
- ⬜ Category filtering
- ⬜ Search functionality
- ⬜ Note editing
- ⬜ Offline support
- ⬜ Dark mode
- ⬜ Export notes (JSON, TXT, MD)

## 📄 Licencja

MIT

## 👨‍💻 Autor

Wojtek - czarnystudio
