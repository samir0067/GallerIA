# 🏗️ Architecture de GallerIA

> **Ce que tu vas apprendre en lisant ce document**
>
> ✅ Comment les fichiers d'une app React Native sont organisés
> ✅ Comment les données circulent de l'API vers l'écran
> ✅ Comment les écrans sont reliés entre eux (navigation)
> ✅ Le rôle de chaque fichier en une phrase

---

## 1. Arborescence complète du projet

```
GallerIA/
│
├── App.tsx                         ← Point d'entrée : fournit le Context et gère le splash screen
├── app.json                        ← Config Expo (nom, icône, permissions iOS/Android)
├── package.json                    ← Dépendances npm du projet
├── tsconfig.json                   ← Config TypeScript (strict mode activé)
│
├── assets/                         ← Images statiques (icône, splash screen)
│
└── src/                            ← Tout le code source de l'app
    │
    ├── types/
    │   └── index.ts                ← 💾 Types TypeScript centralisés (Photo, LocalPhoto, etc.)
    │
    ├── services/
    │   └── api.ts                  ← 🌐 Appels réseau : fetchPhotos(), fetchPhotoById()
    │
    ├── context/
    │   └── FavoritesContext.tsx    ← 🔁 État partagé + persistance AsyncStorage
    │
    ├── hooks/
    │   ├── useFavorites.ts         ← 🎣 Accès au contexte des favoris (thin wrapper)
    │   ├── usePhotos.ts            ← 🎣 Chargement des photos API + AbortController
    │   └── useImagePicker.ts       ← 🎣 Galerie photo + permissions runtime
    │
    ├── navigation/
    │   ├── AppNavigator.tsx        ← 🧭 Tab Navigator (Feed | Favoris | Paramètres)
    │   └── types.ts                ← 🧭 Types TypeScript pour les paramètres de navigation
    │
    ├── screens/                    ← Écrans complets de l'application
    │   ├── FeedScreen.tsx          ← 🖼️ Grille de photos + header animé (scroll)
    │   ├── PhotoDetailScreen.tsx   ← 🔍 Détail d'une photo + bouton favori
    │   ├── FavoritesScreen.tsx     ← ❤️ Liste des favoris + animation d'entrée + FAB
    │   └── SettingsScreen.tsx      ← ⚙️ Switch mode sombre + vider favoris
    │
    └── components/                 ← Composants réutilisables (briques visuelles)
        ├── PhotoCard.tsx           ← 🃏 Carte photo avec animation de pression
        ├── SectionHeader.tsx       ← 📌 Bandeau de titre de section
        ├── EmptyState.tsx          ← 📭 Écran vide avec icône et message
        ├── Badge.tsx               ← 🔴 Badge numérique circulaire
        ├── Loader.tsx              ← ⏳ Indicateur de chargement (ActivityIndicator)
        ├── ErrorMessage.tsx        ← ⚠️ Message d'erreur avec bouton "Réessayer"
        └── AddPhotoButton.tsx      ← ➕ FAB (bouton flottant) pour ajouter une photo
```

---

## 2. Flux de données — De l'API à l'écran

```
╔══════════════════════════════════════════════════════════════════════╗
║                        API JSONPlaceholder                           ║
║            https://jsonplaceholder.typicode.com/photos               ║
╚═══════════════════════════════╦══════════════════════════════════════╝
                                │  HTTP GET (fetch)
                                ▼
╔══════════════════════════════════════════════════════════════════════╗
║                       services/api.ts                                ║
║  fetchPhotos(30)  ─────────────────────────────  fetchPhotoById(id)  ║
║  Gère les erreurs HTTP / réseau                                      ║
║  Retourne : Promise<Photo[]>              Promise<Photo>             ║
╚═══════════════════════════════╦══════════════════════════════════════╝
                                │
               ┌────────────────┴────────────────┐
               │                                  │
               ▼                                  ▼
╔══════════════════════════╗       ╔════════════════════════════════╗
║    hooks/usePhotos.ts    ║       ║  screens/PhotoDetailScreen.tsx ║
║  useState: photos[]      ║       ║  useEffect local + fetchById   ║
║  useState: loading       ║       ║  (données LOCALES à l'écran)   ║
║  useState: error         ║       ╚════════════════════════════════╝
║  useEffect → load()      ║
║  AbortController cleanup ║
╚══════════════╦═══════════╝
               │  { photos, loading, error, reload }
               ▼
╔════════════════════════════════════════════════════════════════════╗
║                    screens/FeedScreen.tsx                          ║
║  const { photos, loading, error } = usePhotos();                   ║
║  const { isFavorite, toggleFavorite } = useFavorites();            ║
║  → Rendu conditionnel : Loader | ErrorMessage | Animated.FlatList  ║
╚════════════════════════════════════════════════════════════════════╝
               │  photo → PhotoCard
               ▼
╔════════════════════════════════════════════════════════════════════╗
║                  components/PhotoCard.tsx                          ║
║  Affiche l'image + titre + bouton cœur                             ║
║  Animation scale sur pression (Animated.spring)                    ║
╚════════════════════════════════════════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                  FLUX DES FAVORIS (état partagé)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

╔════════════════════════════════════════════════════════════════════╗
║                 AsyncStorage (stockage local)                      ║
║              clé : "@galleria_favorites" (JSON)                    ║
╚═══════════════════════╦════════════════════════════════════════════╝
          lecture au    │  écriture à chaque
          démarrage     │  modification
                        ▼
╔════════════════════════════════════════════════════════════════════╗
║              context/FavoritesContext.tsx                          ║
║  State : favorites[], isHydrating                                  ║
║  Fonctions : isFavorite, toggleFavorite, addLocalPhoto,            ║
║              removeLocalPhoto, clearFavorites                       ║
╚════╦════════════════════════════════════════════════════════════╦══╝
     │  useFavoritesContext()      useFavoritesContext()          │
     ▼                                                            ▼
╔══════════════╗     ╔══════════════════╗     ╔════════════════════╗
║  FeedScreen  ║     ║ FavoritesScreen  ║     ║  SettingsScreen    ║
║  isFavorite  ║     ║ favorites[]      ║     ║  clearFavorites()  ║
║ toggleFavorit║     ║ addLocalPhoto    ║     ║  favorites.length  ║
╚══════════════╝     ╚══════════════════╝     ╚════════════════════╝
```

---

## 3. Architecture de navigation

```
╔══════════════════════════════════════════════════════════════════════╗
║                    <NavigationContainer>                             ║
║                    (conteneur racine obligatoire)                    ║
╚═══════════════════════════════╦══════════════════════════════════════╝
                                │
                                ▼
╔══════════════════════════════════════════════════════════════════════╗
║                    <Tab.Navigator>                                   ║
║                    (barre d'onglets en bas)                          ║
║                                                                      ║
║     ┌──────────────┬──────────────────┬──────────────────────┐      ║
║     │   Onglet     │    Onglet        │      Onglet          │      ║
║     │   "Feed"     │   "Favoris"      │   "Paramètres"       │      ║
║     │    🖼️        │      ❤️           │       ⚙️             │      ║
║     └──────┬───────┴────────┬─────────┴──────────┬───────────┘      ║
╚════════════╪════════════════╪════════════════════╪══════════════════╝
             │                │                    │
             ▼                ▼                    ▼
   ╔══════════════════╗  ╔══════════════╗  ╔══════════════════╗
   ║ <FeedNavigator>  ║  ║FavoritesScr. ║  ║ SettingsScreen   ║
   ║ (Stack imbriqué) ║  ║(écran simple)║  ║ (écran simple)   ║
   ║                  ║  ╚══════════════╝  ╚══════════════════╝
   ║  ┌────────────┐  ║
   ║  │ FeedScreen │  ║  ← headerShown: false (bandeau custom)
   ║  │  (FeedMain)│  ║
   ║  └─────┬──────┘  ║
   ║        │ navigate('PhotoDetail', { photoId })
   ║        ▼         ║
   ║  ┌─────────────┐ ║
   ║  │PhotoDetail  │ ║  ← header natif avec bouton retour auto
   ║  │Screen       │ ║
   ║  └─────────────┘ ║
   ╚══════════════════╝

💡 Pourquoi Stack dans Tab ?
   → Avoir un bouton "Retour" vers FeedScreen depuis PhotoDetailScreen
     TOUT EN gardant la barre d'onglets visible en bas.
   → Sans Stack imbriqué, impossible de naviguer "en profondeur"
     dans un onglet.
```

---

## 4. Tableau récapitulatif — Chaque fichier et son rôle

| Fichier | Rôle (1 phrase) | Concept illustré |
|---|---|---|
| `App.tsx` | Point d'entrée : fournit le Context et affiche le splash screen pendant l'hydratation | Context Provider, pattern hydratation |
| `types/index.ts` | Définit tous les types TypeScript partagés de l'app | Union types, type guards TypeScript |
| `services/api.ts` | Fonctions de fetch vers JSONPlaceholder avec gestion d'erreurs | async/await, fetch API, erreurs HTTP |
| `context/FavoritesContext.tsx` | Gère l'état partagé des favoris et leur persistance AsyncStorage | React Context, AsyncStorage, pattern hydratation |
| `hooks/useFavorites.ts` | Donne accès au Context des favoris depuis n'importe quel composant | Custom hook, abstraction du Context |
| `hooks/usePhotos.ts` | Charge 30 photos depuis l'API avec gestion loading/error/reload | useState, useEffect, AbortController, useCallback |
| `hooks/useImagePicker.ts` | Gère l'accès à la galerie photo avec les permissions runtime | SDK Expo, permissions, async dans un hook |
| `navigation/AppNavigator.tsx` | Configure la navigation Tab + Stack imbriqué de toute l'app | createBottomTabNavigator, createNativeStackNavigator |
| `navigation/types.ts` | Définit les types TypeScript des paramètres de navigation | Generics, types navigation React Navigation |
| `screens/FeedScreen.tsx` | Grille de 30 photos avec header qui rétrécit au scroll | Animated.FlatList, interpolate(), scrollY |
| `screens/PhotoDetailScreen.tsx` | Affiche le détail d'une photo et permet de la mettre en favori | useRoute, useNavigation, params typés |
| `screens/FavoritesScreen.tsx` | Liste les favoris avec animation d'apparition et bouton FAB | Animated.parallel, Animated.timing, FAB pattern |
| `screens/SettingsScreen.tsx` | Paramètres : Switch mode sombre, vider les favoris avec confirmation | Switch, Alert avec boutons, AsyncStorage |
| `components/PhotoCard.tsx` | Carte photo avec animation de pression (scale) | Animated.View, Pressable, useRef, Animated.spring |
| `components/SectionHeader.tsx` | Bandeau de titre de section réutilisable | Composant réutilisable, props, ReactNode |
| `components/EmptyState.tsx` | Écran vide avec icône et message (ex: aucun favori) | Composant réutilisable, Flexbox centré |
| `components/Badge.tsx` | Badge numérique circulaire (ex: nombre de favoris dans l'onglet) | StyleSheet, borderRadius, logique conditionnelle |
| `components/Loader.tsx` | Indicateur de chargement centré à l'écran | ActivityIndicator, Flexbox centré |
| `components/ErrorMessage.tsx` | Message d'erreur avec bouton "Réessayer" optionnel | Props avec callback, rendu conditionnel |
| `components/AddPhotoButton.tsx` | Bouton flottant "+" (FAB) en position absolute | FAB pattern, position absolute, ActivityIndicator |
