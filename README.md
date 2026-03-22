# GallerIA 🖼️

Application mobile pédagogique construite avec **React Native + Expo + TypeScript**.
Conçue pour les étudiants de Bachelor 2 pour illustrer les concepts fondamentaux
du développement mobile.

---

## Fonctionnalités

- [x] Grille de photos chargées depuis une API REST (JSONPlaceholder)
- [x] Navigation Stack (Feed → Détail) + Tab (Feed | Favoris | Paramètres)
- [x] Système de favoris avec persistance locale (AsyncStorage)
- [x] Ajout de photos depuis la galerie du téléphone (expo-image-picker)
- [x] Écran de démarrage pendant le chargement des données sauvegardées
- [x] Animations : scale au tap, fade+slide à l'ajout, header collapsible
- [x] Paramètres : mode sombre (Switch), vidage des favoris avec confirmation

---

## Technologies

| Catégorie | Outil |
|---|---|
| Framework | React Native + Expo (managed workflow) |
| Langage | TypeScript (strict) |
| Navigation | React Navigation v6 (Stack + Bottom Tab) |
| État partagé | React Context API + custom hooks |
| Persistance | @react-native-async-storage/async-storage |
| Galerie | expo-image-picker |
| API | JSONPlaceholder (`/photos`) |
| Animations | React Native Animated API |

---

## Installation

```bash
# 1. Installer les dépendances
npm install

# 2. Démarrer Expo
npx expo start

# 3. Scanner le QR code avec Expo Go (iOS / Android)
```

---

## Architecture `src/`

```
src/
├── components/          # Composants réutilisables
│   ├── PhotoCard.tsx    # Carte photo avec animation de pression (scale)
│   ├── SectionHeader.tsx
│   ├── EmptyState.tsx
│   ├── Badge.tsx
│   ├── Loader.tsx
│   ├── ErrorMessage.tsx
│   └── AddPhotoButton.tsx  # FAB "+" flottant
│
├── context/
│   └── FavoritesContext.tsx  # État global + persistance AsyncStorage
│
├── hooks/
│   ├── useFavorites.ts      # Accès au Context des favoris
│   ├── usePhotos.ts         # Fetch API avec AbortController
│   └── useImagePicker.ts    # Galerie + permissions runtime
│
├── navigation/
│   ├── AppNavigator.tsx     # Tab Navigator (Feed | Favoris | Paramètres)
│   └── types.ts             # Types TypeScript pour la navigation
│
├── screens/
│   ├── FeedScreen.tsx         # Grille FlatList + header animé
│   ├── PhotoDetailScreen.tsx  # Détail d'une photo
│   ├── FavoritesScreen.tsx    # Liste favoris + animation d'entrée
│   └── SettingsScreen.tsx     # Préférences (Switch, clearFavorites)
│
├── services/
│   └── api.ts               # fetchPhotos() + fetchPhotoById()
│
└── types/
    └── index.ts             # Photo, LocalPhoto, FavoriteItem, isLocalPhoto()
```

---

## Concepts React Native abordés

**Composants de base**
- `View`, `Text`, `Image`, `ScrollView`
- `FlatList` (virtualisation, `numColumns`, `keyExtractor`)
- `TouchableOpacity`, `Pressable`, `Switch`
- `Alert.alert()` avec boutons et style destructive

**État et cycle de vie**
- `useState`, `useEffect`, `useCallback`, `useRef`
- React Context API (`createContext`, `useContext`, Provider pattern)
- Pattern "hydratation" : chargement d'état sauvegardé au démarrage

**Navigation**
- `createNativeStackNavigator` : navigation en pile (push/pop)
- `createBottomTabNavigator` : onglets en bas
- Imbrication de navigateurs (Stack dans Tab)
- `useNavigation()`, `useRoute()`, params typés TypeScript

**TypeScript**
- Union types : `FavoriteItem = (Photo & { dateAdded }) | LocalPhoto`
- Type guards : `isLocalPhoto(item): item is LocalPhoto`
- Generics de navigation : `NativeStackNavigationProp<ParamList, Route>`

**Animations (Animated API)**
- `Animated.Value`, `useRef` (sans re-render)
- `Animated.timing` : animation à durée fixe
- `Animated.spring` : animation avec physique (rebond)
- `Animated.parallel` : animations simultanées
- `interpolate()` : mapping de plages (scroll → height/fontSize)
- `useNativeDriver: true/false` et quand utiliser chacun

**Persistance**
- `AsyncStorage.getItem` / `setItem` / `removeItem`
- Sérialisation JSON (`JSON.stringify` / `JSON.parse`)
- Clés préfixées par convention (`@galleria_*`)

**Permissions**
- `expo-image-picker` : `requestMediaLibraryPermissionsAsync()`
- Différences iOS vs Android (voir `README-permissions.md`)
- `AbortController` pour annuler les fetch au démontage

---

## Auteur

Projet pédagogique — Bachelor 2 React Native
