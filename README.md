# NotesAI - React Native

Aplikacja mobilna do zarządzania notatkami z funkcjami AI, zbudowana w React Native.

## Funkcje

- ✨ Tworzenie, edycja i usuwanie notatek
- 🔍 Wyszukiwanie notatek po tytule, treści i tagach
- 🏷️ System tagów dla lepszej organizacji
- 💾 Lokalne przechowywanie danych
- 🤖 Placeholder dla przyszłych funkcji AI
- 📱 Cross-platform (iOS i Android)

## Wymagania

- Node.js >= 18
- React Native CLI
- Dla iOS: Xcode i CocoaPods
- Dla Android: Android Studio i Android SDK

## Instalacja

```bash
# Zainstaluj zależności
npm install

# Dla iOS, zainstaluj pods
cd ios && pod install && cd ..
```

## Uruchomienie

```bash
# Uruchom Metro bundler
npm start

# Uruchom na Androidzie
npm run android

# Uruchom na iOS
npm run ios
```

## Struktura projektu

```
notesAI-ReactNative/
├── src/
│   ├── screens/          # Ekrany aplikacji
│   ├── components/       # Komponenty wielokrotnego użytku
│   ├── utils/           # Narzędzia (storage, AI helpers)
│   ├── types/           # Definicje TypeScript
│   └── hooks/           # Custom React hooks
├── App.tsx              # Główny komponent aplikacji
├── index.js             # Punkt wejścia
└── package.json         # Zależności projektu
```

## Technologie

- **React Native** - Framework mobilny
- **TypeScript** - Typowanie statyczne
- **React Navigation** - Nawigacja między ekranami
- **AsyncStorage** - Lokalne przechowywanie danych
- **React Hooks** - Zarządzanie stanem

## Planowane funkcje AI

- 🤖 Automatyczne sugerowanie tagów
- 📝 Podsumowywanie długich notatek
- 🔗 Wykrywanie powiązanych notatek
- 💡 Inteligentne podpowiedzi podczas pisania
- 🌐 Tłumaczenie notatek

## Rozwój

```bash
# Sprawdzanie typów TypeScript
npm run type-check

# Linting
npm run lint

# Testy
npm test
```

## Licencja

MIT
