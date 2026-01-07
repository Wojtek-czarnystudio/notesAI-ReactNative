# Notes App - React Native Mobile Application

## Opis projektu

Mobilna aplikacja w React Native (Expo) pozwalająca użytkownikom na:
1. Robienie zdjęć książek/dokumentów aparatem
2. Udostępnianie screenshotów z innych aplikacji (Share Extension)
3. Automatyczne przetwarzanie tekstu przez AI (OCR + LLM via Laravel API)
4. Przeglądanie notatek z kategoriami i podsumowaniami
5. Otrzymywanie daily summary w formie push notification

## Stack technologiczny

- **Framework:** React Native z Expo SDK 51+
- **Language:** TypeScript (zalecane) lub JavaScript
- **Navigation:** React Navigation 6
- **State Management:** React Query (TanStack Query) + React Context dla auth
- **Storage:** AsyncStorage dla tokenów i cache
- **API Client:** Axios
- **UI Components:** React Native core + custom components
- **Image Picker:** expo-image-picker
- **Share Extension:** react-native-receive-sharing-intent
- **Notifications:** expo-notifications

## Struktura projektu
```
mobile/
├── src/
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── LoginScreen.tsx
│   │   │   └── RegisterScreen.tsx
│   │   ├── notes/
│   │   │   ├── NotesListScreen.tsx
│   │   │   ├── NoteDetailScreen.tsx
│   │   │   ├── AddNoteScreen.tsx
│   │   │   └── ProcessNoteScreen.tsx
│   │   └── onboarding/
│   │       └── WelcomeScreen.tsx
│   ├── components/
│   │   ├── NoteCard.tsx
│   │   ├── CategoryBadge.tsx
│   │   ├── LoadingSpinner.tsx
│   │   └── EmptyState.tsx
│   ├── navigation/
│   │   ├── AppNavigator.tsx
│   │   ├── AuthNavigator.tsx
│   │   └── types.ts
│   ├── services/
│   │   ├── api.ts (axios config)
│   │   ├── auth.ts
│   │   └── notes.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useNotes.ts
│   │   ├── useNote.ts
│   │   └── useUploadNote.ts
│   ├── contexts/
│   │   └── AuthContext.tsx
│   ├── types/
│   │   ├── auth.ts
│   │   ├── note.ts
│   │   └── api.ts
│   ├── utils/
│   │   ├── storage.ts
│   │   ├── imageCompression.ts
│   │   └── formatters.ts
│   └── theme/
│       ├── colors.ts
│       ├── typography.ts
│       └── spacing.ts
├── App.tsx
├── app.json
└── package.json
```

## Modele danych (TypeScript types)

### User
```typescript
interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
}
```

### Note
```typescript
interface Note {
  id: number;
  text: string;
  summary: string;
  source: 'camera' | 'share' | 'gallery' | 'url';
  categories: Category[];
  created_at: string;
  updated_at: string;
}
```

### Category
```typescript
interface Category {
  id: number;
  name: string;
  slug: string;
  color: string;
}
```

### Auth Response
```typescript
interface AuthResponse {
  user: User;
  token: string;
}
```

## API Service - axios configuration

### Base config (src/services/api.ts)
```typescript
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
  baseURL: __DEV__ 
    ? 'http://10.0.2.2:8000/api'  // Android emulator
    : 'https://api.twoja-domena.pl/api',
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - dodaj token
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('userToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handle 401
api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('userToken');
      // Navigate to login (przez navigation ref)
    }
    return Promise.reject(error);
  }
);

export default api;
```

## Screens flow diagram
```
┌─────────────┐
│   Splash    │ (check token w AsyncStorage)
└──────┬──────┘
       │
       ├─ No token ─→ AuthNavigator
       │                ├─ LoginScreen
       │                └─ RegisterScreen
       │
       └─ Has token ─→ AppNavigator (TabNavigator)
                         ├─ NotesListScreen (Home)
                         ├─ AddNoteScreen (Center FAB)
                         └─ ProfileScreen
```

## Share Extension flow

### Android Setup
W `android/app/src/main/AndroidManifest.xml`:
```xml
<activity
  android:name=".ShareActivity"
  android:theme="@style/Theme.Transparent"
  android:exported="true">
  
  <intent-filter>
    <action android:name="android.intent.action.SEND" />
    <category android:name="android.intent.category.DEFAULT" />
    <data android:mimeType="image/*" />
  </intent-filter>
</activity>
```

### App.tsx integration
```typescript
useEffect(() => {
  ReceiveSharingIntent.getReceivedFiles(
    (files) => {
      if (files.length > 0) {
        const imageUri = files[0].filePath;
        navigation.navigate('ProcessNote', { 
          imageUri,
          source: 'share' 
        });
      }
    },
    (error) => console.log('Share error:', error)
  );
  
  return () => {
    ReceiveSharingIntent.clearReceivedFiles();
  };
}, []);
```

## Upload flow z progress
```typescript
const uploadImage = async (imageUri: string, source: string) => {
  const formData = new FormData();
  formData.append('image', {
    uri: imageUri,
    type: 'image/jpeg',
    name: 'note.jpg',
  } as any);
  formData.append('source', source);
  
  const response = await api.post('/notes/process', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      const percentCompleted = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total!
      );
      setUploadProgress(percentCompleted);
    },
  });
  
  return response.data; // {job_id, status}
};
```

## Polling job status
```typescript
const pollJobStatus = async (jobId: string) => {
  const interval = setInterval(async () => {
    try {
      const { data } = await api.get(`/notes/status/${jobId}`);
      
      if (data.status === 'completed') {
        clearInterval(interval);
        setProcessingStatus('completed');
        queryClient.invalidateQueries(['notes']); // Refresh lista
        navigation.navigate('Notes');
      } else if (data.status === 'failed') {
        clearInterval(interval);
        setProcessingStatus('error');
      }
    } catch (error) {
      clearInterval(interval);
      setProcessingStatus('error');
    }
  }, 2000); // Co 2 sekundy
};
```

## React Query hooks

### useNotes (lista notatek)
```typescript
import { useInfiniteQuery } from '@tanstack/react-query';

export const useNotes = (category?: string) => {
  return useInfiniteQuery({
    queryKey: ['notes', category],
    queryFn: async ({ pageParam = 1 }) => {
      const { data } = await api.get('/notes', {
        params: { page: pageParam, category }
      });
      return data;
    },
    getNextPageParam: (lastPage) => lastPage.next_page,
    refetchInterval: 30000, // Refresh co 30s
  });
};
```

### useUploadNote (mutation)
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useUploadNote = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ imageUri, source }: UploadNoteParams) => {
      // Upload logic
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['notes']);
    },
  });
};
```

## Push Notifications setup
```typescript
import * as Notifications from 'expo-notifications';

// Request permissions
const registerForPushNotifications = async () => {
  const { status } = await Notifications.requestPermissionsAsync();
  
  if (status === 'granted') {
    const token = (await Notifications.getExpoPushTokenAsync()).data;
    
    // Wyślij token do Laravel API
    await api.post('/device-token', {
      token,
      platform: Platform.OS,
    });
  }
};

// Listen for notifications
Notifications.addNotificationReceivedListener(notification => {
  // Gdy app w foreground
  console.log('Notification received:', notification);
  queryClient.invalidateQueries(['notes']);
});

Notifications.addNotificationResponseReceivedListener(response => {
  // Gdy user kliknie notification
  const noteId = response.notification.request.content.data.note_id;
  navigation.navigate('NoteDetail', { id: noteId });
});
```

## Image compression przed uploadem
```typescript
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

const compressImage = async (uri: string) => {
  const manipResult = await manipulateAsync(
    uri,
    [{ resize: { width: 2000 } }], // Max width 2000px
    { compress: 0.8, format: SaveFormat.JPEG }
  );
  
  return manipResult.uri;
};
```

## Theme configuration

### colors.ts
```typescript
export const colors = {
  primary: '#3B82F6',
  secondary: '#10B981',
  background: '#FFFFFF',
  surface: '#F3F4F6',
  text: '#111827',
  textSecondary: '#6B7280',
  error: '#EF4444',
  border: '#E5E7EB',
  
  // Category colors
  categories: {
    management: '#3B82F6',
    business: '#10B981',
    marketing: '#F59E0B',
    football: '#EF4444',
    technology: '#8B5CF6',
    'personal-development': '#EC4899',
    finance: '#14B8A6',
  }
};
```

## Lista tasków

### Setup projektu (4 taski)
- [ ] Inicjalizacja Expo projektu z TypeScript template
- [ ] Instalacja dependencies (navigation, react-query, axios, image-picker, etc.)
- [ ] Konfiguracja app.json (name, slug, version, permissions)
- [ ] Setup struktury folderów (screens, components, services, hooks, etc.)

### Theme & Design System (3 taski)
- [ ] theme/colors.ts - kolory aplikacji
- [ ] theme/typography.ts - font sizes, weights
- [ ] theme/spacing.ts - spacing constants

### API & Services (4 taski)
- [ ] services/api.ts - axios configuration z interceptorami
- [ ] services/auth.ts - login, register, logout functions
- [ ] services/notes.ts - CRUD operations dla notatek
- [ ] utils/storage.ts - AsyncStorage helpers (token management)

### Context & State (2 taski)
- [ ] AuthContext - provider dla auth state, login/logout/register methods
- [ ] React Query setup - QueryClientProvider w App.tsx

### Hooks (5 tasków)
- [ ] useAuth - dostęp do AuthContext
- [ ] useNotes - useInfiniteQuery dla listy notatek z pagination
- [ ] useNote - useQuery dla pojedynczej notatki
- [ ] useUploadNote - useMutation dla uploadu obrazka
- [ ] useDeleteNote - useMutation dla usuwania notatki

### Navigation (3 taski)
- [ ] navigation/AuthNavigator - Stack dla Login/Register screens
- [ ] navigation/AppNavigator - Tab/Stack navigator dla głównej app
- [ ] App.tsx - conditional rendering (AuthNav vs AppNav based on token)

### Screens - Auth (2 taski)
- [ ] LoginScreen - formularz email/password, error handling, navigate to Register
- [ ] RegisterScreen - formularz name/email/password/confirm, validation, auto-login

### Screens - Notes (5 tasków)
- [ ] NotesListScreen - FlatList z infinite scroll, pull-to-refresh, filters
- [ ] NoteDetailScreen - display full note text, summary, categories, delete button
- [ ] AddNoteScreen - buttons "Take Photo" i "Choose from Gallery", permissions handling
- [ ] ProcessNoteScreen - preview image, upload progress, polling status, loading states
- [ ] DailySummaryScreen (opcjonalny) - display daily summary

### Components (4 taski)
- [ ] NoteCard - card component dla listy, pokazuje summary, categories badges, date
- [ ] CategoryBadge - colored badge z nazwą kategorii
- [ ] LoadingSpinner - reusable loading indicator z overlay option
- [ ] EmptyState - ilustracja + tekst dla pustych stanów (brak notatek)

### Share Extension (3 taski)
- [ ] Android: Konfiguracja AndroidManifest.xml dla Share Intent
- [ ] iOS: Setup Share Extension (bardziej złożone, dokumentacja z biblioteki)
- [ ] App.tsx: Integration z react-native-receive-sharing-intent, handle shared files

### Image Handling (3 taski)
- [ ] expo-image-picker setup - camera i gallery permissions
- [ ] utils/imageCompression.ts - resize/compress przed uploadem
- [ ] Upload z FormData i progress tracking

### Push Notifications (3 taski - opcjonalne)
- [ ] expo-notifications setup, request permissions
- [ ] Register FCM token w Laravel API
- [ ] Listeners dla notifications (received, response)

### Onboarding (1 task - opcjonalny)
- [ ] WelcomeScreen - tutorial jak używać app (screenshots, share)

### Error Handling (2 taski)
- [ ] Network error handling - offline indicator, retry mechanism
- [ ] Form validation - email, password strength, error messages

### Testing (2 taski - opcjonalne)
- [ ] Setup Jest + React Native Testing Library
- [ ] Component tests dla NoteCard, LoginScreen

### Build & Deployment (3 taski)
- [ ] Android: Konfiguracja build (keystore, app.json)
- [ ] Expo EAS Build setup
- [ ] Test build (APK) i dystrybucja internal

**TOTAL: 50 tasków**

## Permissions wymagane

### Android (app.json)
```json
{
  "expo": {
    "android": {
      "permissions": [
        "CAMERA",
        "READ_MEDIA_IMAGES",
        "WRITE_EXTERNAL_STORAGE",
        "INTERNET"
      ]
    }
  }
}
```

### iOS (app.json)
```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "NSCameraUsageDescription": "Potrzebujemy dostępu do aparatu aby robić zdjęcia notatek",
        "NSPhotoLibraryUsageDescription": "Potrzebujemy dostępu do galerii aby wybierać zdjęcia"
      }
    }
  }
}
```

## Environment variables

Create `.env` file:
```
API_URL_DEV=http://10.0.2.2:8000/api
API_URL_PROD=https://api.twoja-domena.pl/api
```

## User flow scenariusze

### Scenariusz 1: Nowy użytkownik
1. Otwiera app → WelcomeScreen (tutorial)
2. Taps "Zarejestruj się" → RegisterScreen
3. Fill form → auto-login → NotesListScreen (empty state)
4. Taps FAB → AddNoteScreen
5. "Zrób zdjęcie" → Camera → ProcessNoteScreen
6. Upload + polling → Success → NotesListScreen (1 notatka)

### Scenariusz 2: Share Extension
1. User czyta artykuł na LinkedIn
2. Robi screenshot (Power + Vol Down)
3. Taps "Share" na screenshocie
4. Wybiera "Notes App" z listy
5. App otwiera się → ProcessNoteScreen (auto-upload)
6. Polling → Success → NotesListScreen

### Scenariusz 3: Daily Summary
1. User otrzymuje push notification o 20:00
2. Taps notification → App opens → DailySummaryScreen
3. Widzi: "Dziś przeczytałeś o: marketing (3), biznes (2)"
4. Może tap na kategorię → filtered list

## Konwencje kodowania

- **TypeScript:** Używaj types/interfaces, unikaj `any`
- **Naming:** PascalCase dla komponentów, camelCase dla funkcji/zmiennych
- **Components:** Functional components z hooks (nie class components)
- **Styling:** StyleSheet.create na końcu pliku
- **Async:** async/await zamiast .then()
- **Error handling:** try-catch, pokaż user-friendly messages
- **Comments:** JSDoc dla exported functions/components

## Priorytety dla MVP

1. **Must have:** Auth, camera, upload, notes list, share extension
2. **Should have:** Note detail, delete, daily summary
3. **Nice to have:** Push notifications, onboarding, stats

## Uwagi dla Claude

- Expo SDK 51+ (użyj aktualnych API)
- TypeScript preferowane (ale JS też OK jeśli user woli)
- React Navigation 6 z TypeScript types
- React Query v5 (TanStack Query)
- Axios interceptory dla auth token
- Share Extension to kluczowa feature - priorytet
- Image compression przed uploadem (data savings)
- Polling status co 2s, max 60s (timeout)
- Handle offline gracefully (show message, retry)
- AsyncStorage dla tokens (nie SecureStore dla prostoty MVP)
- FCM dla push notifications (opcjonalne, ale bardzo fajne)
