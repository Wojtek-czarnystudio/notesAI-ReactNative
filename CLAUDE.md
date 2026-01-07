# Notes App - React Native Mobile Application (Expo)

## Opis projektu

Mobilna aplikacja w React Native (Expo) pozwalająca użytkownikom na:
1. Robienie zdjęć książek/dokumentów aparatem
2. Udostępnianie screenshotów z innych aplikacji (Share Extension)
3. Automatyczne przetwarzanie tekstu przez AI (OCR + LLM via Laravel API)
4. Przeglądanie notatek z kategoriami i podsumowaniami

## Stack technologiczny

- **Framework:** React Native z Expo SDK 51+
- **Language:** TypeScript
- **Navigation:** React Navigation 6
- **State Management:** React Query (TanStack Query) + React Context dla auth
- **Storage:** AsyncStorage dla tokenów i cache
- **API Client:** Axios
- **Image Handling:** expo-image-picker, expo-image-manipulator
- **Share Extension:** react-native-receive-sharing-intent

## Architektura - ZAIMPLEMENTOWANA

### Struktura folderów

```
src/
├── screens/
│   ├── auth/
│   │   ├── LoginScreen.tsx          # Email + password login
│   │   └── RegisterScreen.tsx       # User registration
│   └── notes/
│       ├── NotesListScreen.tsx      # Infinite scroll list
│       ├── NoteDetailScreen.tsx     # Full note view
│       ├── AddNoteScreen.tsx        # Camera/Gallery picker
│       └── ProcessNoteScreen.tsx    # Upload + polling status
├── components/
│   ├── NoteCard.tsx                 # Note preview card
│   ├── CategoryBadge.tsx            # Colored category badge
│   ├── LoadingSpinner.tsx           # Loading indicator
│   └── EmptyState.tsx               # Empty list placeholder
├── navigation/
│   ├── AppNavigator.tsx             # Main app navigation
│   ├── AuthNavigator.tsx            # Auth screens navigation
│   └── types.ts                     # Navigation types
├── services/
│   ├── api.ts                       # Axios config + interceptors
│   ├── auth.ts                      # Auth API calls
│   └── notes.ts                     # Notes API calls
├── hooks/
│   ├── useNotes.ts                  # Infinite query
│   ├── useNote.ts                   # Single note query
│   ├── useUploadNote.ts             # Upload mutation
│   └── useDeleteNote.ts             # Delete mutation
├── contexts/
│   └── AuthContext.tsx              # Auth state + methods
├── types/
│   ├── auth.ts                      # User, AuthResponse
│   ├── note.ts                      # Note, Category
│   └── api.ts                       # API errors
├── utils/
│   ├── storage.ts                   # AsyncStorage helpers
│   ├── imageCompression.ts          # Image resize/compress
│   └── formatters.ts                # Date, text formatters
└── theme/
    ├── colors.ts                    # Color palette
    ├── typography.ts                # Font styles
    └── spacing.ts                   # Spacing constants
```

## Modele danych

### User (src/types/auth.ts)
```typescript
interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
}
```

### Note (src/types/note.ts)
```typescript
interface Note {
  id: number;
  text: string;                  // Full extracted text
  summary: string;                // AI-generated summary
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
  slug: string;    // e.g., "management", "business"
  color: string;   // Hex color
}
```

## API Configuration (src/services/api.ts)

```typescript
const api = axios.create({
  baseURL: __DEV__
    ? 'http://10.0.2.2:8000/api'  // Android emulator
    : 'https://api.twoja-domena.pl/api',
  timeout: 60000,  // 60s for upload + processing
});

// Request interceptor - dodaj Bearer token
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
      // Navigate to login
    }
    return Promise.reject(error);
  }
);
```

## Endpoints

### Auth (src/services/auth.ts)
- `POST /auth/login` - Login (email, password)
- `POST /auth/register` - Registration
- `POST /auth/logout` - Logout
- `GET /auth/me` - Get authenticated user

### Notes (src/services/notes.ts)
- `GET /notes?page=1&category=business` - Lista notatek
- `GET /notes/{id}` - Szczegóły notatki
- `POST /notes/process` - Upload image (FormData)
- `GET /notes/status/{job_id}` - Job status polling
- `DELETE /notes/{id}` - Usuń notatkę

## Navigation Flow

```
App.tsx
└─ QueryClientProvider
   └─ AuthProvider
      └─ NavigationContainer
         ├─ AuthNavigator (no token)
         │  ├─ LoginScreen
         │  └─ RegisterScreen
         └─ AppNavigator (has token)
            └─ TabNavigator
               ├─ NotesListScreen (Tab)
               ├─ AddNoteScreen (Tab)
               ├─ NoteDetailScreen (Stack)
               └─ ProcessNoteScreen (Stack)
```

## Kluczowe Funkcje

### 1. AuthContext (src/contexts/AuthContext.tsx)
- **State:** user, loading
- **Methods:** login, register, logout
- **Auto-check:** Sprawdza token w AsyncStorage przy starcie
- **Auto-logout:** Usuwa token przy 401

### 2. React Query Hooks

#### useNotes (src/hooks/useNotes.ts)
```typescript
export const useNotes = (category?: string) => {
  return useInfiniteQuery({
    queryKey: ['notes', category],
    queryFn: async ({ pageParam = 1 }) => {
      return await notesService.getNotes(pageParam, category);
    },
    getNextPageParam: (lastPage) => lastPage.next_page,
    initialPageParam: 1,
    refetchInterval: 30000,  // Refresh co 30s
  });
};
```

#### useUploadNote (src/hooks/useUploadNote.ts)
```typescript
export const useUploadNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ imageUri, source, onProgress }) => {
      const compressedUri = await compressImage(imageUri);
      return await notesService.uploadImage(compressedUri, source, onProgress);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });
};
```

### 3. Image Processing Flow

**AddNoteScreen → ProcessNoteScreen → NotesListScreen**

1. User wybiera camera lub gallery
2. Permission check (expo-image-picker)
3. Image picker → URI
4. Navigate to ProcessNoteScreen({ imageUri, source })
5. **Compression:** max 2000px width, 80% quality
6. **Upload:** FormData z `onUploadProgress` callback
7. **Response:** `{ job_id: string, status: 'pending' }`
8. **Polling:** Co 2s sprawdza `/notes/status/{job_id}`
9. **Timeout:** Max 60s
10. **Success:** Navigate to NotesListScreen
11. **Error:** Alert + navigate back

### 4. Share Extension Integration

**App.tsx:**
```typescript
useEffect(() => {
  ReceiveSharingIntent.getReceivedFiles(
    (files) => {
      if (files.length > 0) {
        navigation.navigate('ProcessNote', {
          imageUri: files[0].filePath,
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

**app.json (Android):**
```json
"intentFilters": [
  {
    "action": "android.intent.action.SEND",
    "category": ["android.intent.category.DEFAULT"],
    "data": [{ "mimeType": "image/*" }]
  }
]
```

## Theme System

### Colors (src/theme/colors.ts)
```typescript
export const colors = {
  primary: '#3B82F6',        // Blue
  secondary: '#10B981',      // Green
  background: '#FFFFFF',
  surface: '#F3F4F6',
  text: '#111827',
  textSecondary: '#6B7280',
  error: '#EF4444',

  categories: {
    management: '#3B82F6',
    business: '#10B981',
    marketing: '#F59E0B',
    // ... etc
  }
};
```

### Typography (src/theme/typography.ts)
- Font sizes: xs (12) → 4xl (36)
- Font weights: normal, medium, semibold, bold
- Line heights: tight, normal, relaxed

## Screens Details

### LoginScreen & RegisterScreen
- **FormState:** email, password, (name dla register)
- **Validation:** Check empty fields, password match, min 8 chars
- **ErrorHandling:** Alert.alert z error.response.data.message
- **AutoLogin:** Po successful register/login

### NotesListScreen
- **FlatList** z infinite scroll
- **onEndReached:** fetchNextPage
- **RefreshControl:** pull-to-refresh
- **EmptyState:** Gdy brak notatek
- **NoteCard:** Tap → navigate('NoteDetail', { id })

### NoteDetailScreen
- **ScrollView** z full text, summary, categories
- **Delete button:** Alert confirmation → mutation → goBack
- **Meta:** Source, dates (formatDate)

### AddNoteScreen
- **2 buttons:** "Take Photo" (camera), "Choose from Gallery"
- **Permissions:** requestCameraPermissionsAsync, requestMediaLibraryPermissionsAsync
- **ImagePicker:** launchCameraAsync, launchImageLibraryAsync
- **Navigation:** navigate('ProcessNote', { imageUri, source })

### ProcessNoteScreen
- **Image preview:** <Image source={{ uri: imageUri }} />
- **Upload progress:** 0-100% progress bar
- **Status states:**
  - uploading (progress bar)
  - processing (polling animation)
  - completed (✅ → redirect)
  - error (❌ → alert)
- **Polling:** setInterval 2s, clearInterval po 60s lub completion
- **Auto-redirect:** setTimeout navigate('Main') po completed

## Error Handling

### Network Errors
```typescript
try {
  await login({ email, password });
} catch (error: any) {
  Alert.alert(
    'Login Failed',
    error.response?.data?.message || 'Invalid credentials'
  );
}
```

### Upload Errors
- Try-catch w uploadNoteMutation
- Alert + navigate back
- Retry mechanism: Nie implementowany (user musi retry manually)

### Processing Timeout
- clearInterval po 60s
- Alert('Timeout', 'Processing is taking too long')
- Navigate back

## Konwencje Kodowania

1. **TypeScript:** Strict typing, unikaj `any`
2. **Components:** Functional + hooks (FC<Props>)
3. **Naming:**
   - Components: PascalCase (NoteCard)
   - Functions: camelCase (handleLogin)
   - Types: PascalCase (Note)
4. **Styling:** StyleSheet.create na końcu pliku
5. **Async:** async/await + try-catch
6. **Errors:** User-friendly Alert.alert

## Testing Workflow

### 1. Setup
```bash
npm install
npm start
```

### 2. Test Auth Flow
- Open app → LoginScreen
- Tap "Sign Up" → RegisterScreen
- Fill form → Auto-login → NotesListScreen (empty)
- Logout → LoginScreen
- Login → NotesListScreen

### 3. Test Camera Flow
- Tap "Add" tab → AddNoteScreen
- Tap "Take Photo" → Permission dialog → Camera
- Take photo → ProcessNoteScreen
- Watch upload progress (0-100%)
- Watch polling status → Redirect

### 4. Test Gallery Flow
- Tap "Choose from Gallery" → Select image
- Same flow as camera

### 5. Test Share Extension
- W innej app (np. LinkedIn) zrób screenshot
- Tap "Share" → Wybierz "NotesAI"
- App opens → ProcessNoteScreen (auto-upload)

## Debugging

### Metro bundler issues
```bash
expo start -c
```

### TypeScript errors
```bash
npm run type-check
```

### Network debug
- Android emulator: `http://10.0.2.2:8000`
- iOS simulator: `http://localhost:8000` lub ngrok
- Check axios baseURL w src/services/api.ts

### AsyncStorage debug
- React Native Debugger → AsyncStorage tab
- Check token: AsyncStorage.getItem('userToken')

## Deployment

### Android APK
```bash
eas build --platform android --profile preview
```

### iOS IPA
```bash
eas build --platform ios --profile preview
```

## TODO / Future Enhancements

### Wysokiy priorytet
- [ ] Push notifications (expo-notifications)
- [ ] iOS Share Extension configuration
- [ ] Category filtering w NotesListScreen
- [ ] Search functionality

### Średni priorytet
- [ ] Note editing
- [ ] Daily summary screen
- [ ] Offline support (React Query cache persistence)

### Niski priorytet
- [ ] Dark mode
- [ ] Export notes (JSON, TXT, MD)
- [ ] Multi-language support

## Support

Dla pytań sprawdź:
- **README.md** - User documentation
- **app.json** - Expo configuration
- **src/services/api.ts** - API setup
- **src/contexts/AuthContext.tsx** - Auth logic
