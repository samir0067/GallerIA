# GallerIA 🖼️

> **Pédagogique ✅** — Projet de démonstration pour l'initiation au développement mobile React Native

Application mobile construite avec **React Native + Expo + TypeScript**.
Conçue pour les étudiants de Bachelor 2 pour illustrer les concepts fondamentaux
du développement mobile, étape par étape.

---

## Documentation pédagogique

| Document | Contenu |
|---|---|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Arborescence, flux de données, schéma de navigation, rôle de chaque fichier |
| [docs/CONCEPTS.md](docs/CONCEPTS.md) | 14 concepts React Native expliqués avec exemples tirés du projet |
| [docs/GUIDE-FORMATEUR.md](docs/GUIDE-FORMATEUR.md) | Déroulé des 7 créneaux, questions à poser, points de blocage |
| [docs/GLOSSAIRE.md](docs/GLOSSAIRE.md) | Définitions des termes techniques (JSX, hook, Context, interpolation...) |

---

## Comment lire ce code (ordre recommandé pour un étudiant)

Si tu découvres le projet pour la première fois, suis cet ordre :

1. **`src/types/index.ts`** — commence par les types de données (`Photo`, `LocalPhoto`, `FavoriteItem`). Comprendre les données avant le code.
2. **`src/components/Loader.tsx`** — composant le plus simple : juste une View + ActivityIndicator. Idéal pour comprendre la structure d'un composant.
3. **`src/components/Badge.tsx`** — composant avec props typées et valeur par défaut.
4. **`src/components/PhotoCard.tsx`** — composant plus complet avec plusieurs props, image, et animation.
5. **`src/services/api.ts`** — comment faire un appel API (`fetch`, `async/await`, gestion d'erreurs).
6. **`src/hooks/usePhotos.ts`** — hook personnalisé : `useState` + `useEffect` + `useCallback`.
7. **`src/context/FavoritesContext.tsx`** — état partagé + persistance AsyncStorage. Le fichier le plus dense, lire après les hooks.
8. **`src/screens/FeedScreen.tsx`** — premier écran complet : combine hooks, navigation, FlatList et animation.
9. **`src/screens/SettingsScreen.tsx`** — écran le plus simple à lire après avoir compris les bases.
10. **`src/navigation/AppNavigator.tsx`** — architecture de navigation complète (Tab + Stack).

> 💡 Chaque fichier contient des commentaires pédagogiques détaillés.
> Lis les commentaires en parallèle du code — ils expliquent le **pourquoi**, pas seulement le **quoi**.

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

## Crédits

- **Formateur :** Samir
- **Établissement :** YNOV Campus Strasbourg
- **Formation :** Bachelor 2 Informatique — Introduction au développement mobile
- **Année :** 2025–2026
