# CLAUDE.md - Dokumentacja dla Claude Code

## Przegląd projektu

NotesAI to aplikacja mobilna React Native do zarządzania notatkami z planowanymi funkcjami AI. Projekt jest zbudowany w TypeScript i wykorzystuje React Navigation oraz AsyncStorage.

## Architektura

### Struktura folderów

- **src/screens/** - Główne ekrany aplikacji (NotesList, NoteDetail)
- **src/utils/** - Funkcje pomocnicze:
  - `storage.ts` - Zarządzanie persistence notatek w AsyncStorage
  - `aiHelper.ts` - Placeholder dla przyszłych funkcji AI
- **src/types/** - Definicje TypeScript dla Note, NoteCreate, NoteUpdate
- **src/components/** - Komponenty wielokrotnego użytku
- **src/hooks/** - Custom React hooks

### Kluczowe pliki

1. **App.tsx** - Główny komponent z konfiguracją nawigacji
2. **src/types/index.ts** - Typy TypeScript dla całej aplikacji
3. **src/utils/storage.ts** - CRUD operations dla notatek

## Model danych

```typescript
interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  aiSuggestions?: string[];
}
```

## Funkcje do implementacji

### Priorytet wysoki
- [ ] Komponenty UI dla listy notatek
- [ ] Komponenty UI dla szczegółów/edycji notatki
- [ ] Walidacja formularzy

### Priorytet średni
- [ ] Integracja z API AI (OpenAI/Claude)
- [ ] Automatyczne tagowanie
- [ ] Wyszukiwanie full-text
- [ ] Eksport notatek (JSON, TXT, MD)

### Priorytet niski
- [ ] Synchronizacja cloud
- [ ] Współdzielenie notatek
- [ ] Dark mode
- [ ] Kategoryzacja notatek

## Konwencje kodowania

1. **TypeScript** - Zawsze używaj typowania
2. **Functional Components** - Używaj hooks zamiast class components
3. **Naming**:
   - Komponenty: PascalCase (np. `NotesListScreen`)
   - Funkcje/zmienne: camelCase (np. `loadNotes`)
   - Typy: PascalCase (np. `Note`)
4. **Async/Await** - Preferowane nad promises dla asynchronicznego kodu

## Testowanie

```bash
# Unit testy
npm test

# Type checking
npm run type-check
```

## Debugowanie

- Użyj React Native Debugger
- Console.log w Metro bundler
- React DevTools dla komponentów

## Wskazówki dla Claude

1. **Dodawanie nowych funkcji**:
   - Najpierw dodaj typy w `src/types/`
   - Stwórz utility functions w odpowiednim pliku w `src/utils/`
   - Zaimplementuj UI w `src/screens/` lub `src/components/`

2. **Modyfikacja storage**:
   - Wszystkie zmiany persistence powinny przejść przez `src/utils/storage.ts`
   - Pamiętaj o obsłudze błędów

3. **Integracja AI**:
   - Placeholder znajduje się w `src/utils/aiHelper.ts`
   - API calls powinny być asynchroniczne
   - Dodaj error handling dla API failures

## Przykłady użycia

### Tworzenie nowej notatki
```typescript
import {createNote} from './src/utils/storage';

const note = await createNote({
  title: 'Moja notatka',
  content: 'Treść notatki',
  tags: ['praca', 'important']
});
```

### Wyszukiwanie notatek
```typescript
import {searchNotes} from './src/utils/storage';

const results = await searchNotes('typescript');
```

## Zależności kluczowe

- `react-native`: Framework podstawowy
- `@react-navigation/*`: System nawigacji
- `@react-native-async-storage/async-storage`: Lokalne przechowywanie
- `typescript`: Typowanie statyczne

## Rozwiązywanie problemów

### Metro bundler issues
```bash
npm start -- --reset-cache
```

### iOS build issues
```bash
cd ios && pod install && cd ..
```

### Android build issues
```bash
cd android && ./gradlew clean && cd ..
```
