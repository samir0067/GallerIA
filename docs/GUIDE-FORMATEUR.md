# 🎓 Guide Formateur — GallerIA

> **Ce que tu vas apprendre en lisant ce document**
>
> ✅ Le déroulé session par session pour présenter GallerIA en cours
> ✅ Les fichiers à ouvrir à chaque créneau
> ✅ Les questions à poser aux étudiants (avec les réponses attendues)
> ✅ Les points de blocage fréquents et comment les débloquer

---

> **Contexte du projet pédagogique**
> GallerIA est construit en 7 étapes incrémentales.
> Chaque étape introduit de nouveaux concepts sur une base de code qui fonctionne.
> L'idée : toujours partir d'un code qui tourne, jamais d'une page blanche.
> **Mini-projet final :** les étudiants reproduisent une app similaire (cf. Créneau 7).

---

## Créneau 1 — Expo, TypeScript, structure du projet

### Objectif
Installer l'environnement, comprendre la structure d'un projet Expo, écrire le premier composant.

### Fichiers à ouvrir
- `package.json` → montrer les dépendances et scripts npm
- `app.json` → expliquer la config Expo (nom, icône, splash)
- `tsconfig.json` → montrer `"strict": true` et expliquer pourquoi
- `App.tsx` → premier point d'entrée, composant racine
- `src/types/index.ts` → premier fichier TypeScript, types simples

### Questions à poser
1. **"Quelle est la différence entre `npm start` et `npx expo start` ?"**
   → Réponse attendue : les deux font la même chose ici (`package.json` a `"start": "expo start"`).
   Expo CLI est lancé dans les deux cas. Point d'ouverture sur le rôle du `package.json`.

2. **"Dans `app.json`, à quoi sert `"slug"` ?"**
   → Réponse attendue : c'est l'identifiant unique de l'app sur Expo's servers (pour les publications).
   Différent du `"name"` qui est l'affichage utilisateur. Ouvre la discussion sur Expo Go vs build natif.

3. **"Pourquoi centraliser les types dans `src/types/index.ts` plutôt que de les définir dans chaque fichier ?"**
   → Réponse attendue : éviter les doublons, avoir une source de vérité unique, faciliter les refactors.
   Si on change le type `Photo`, on le change en un seul endroit.

### Points de blocage fréquents
- **Expo Go ne voit pas le QR code** → vérifier que le téléphone et l'ordi sont sur le même réseau Wi-Fi
- **"Metro bundler" ne démarre pas** → `npm install` oublié, ou port 8081 déjà utilisé (`--port 8082`)
- **TypeScript inconnu** → rassurer : TypeScript = JavaScript + annotations de types. Les annotations sont optionnelles pour commencer. On peut ignorer les erreurs TS au début.

### Lien avec le mini-projet final
Les étudiants devront créer leur propre `app.json` et définir leurs types dans `types/index.ts`.
Insister sur le choix du type de données principal (ex: `Recipe`, `Movie`, `Book`).

---

## Créneau 2 — Composants visuels et StyleSheet

### Objectif
Créer des composants réutilisables, comprendre `StyleSheet`, `View`, `Text`, `Image`, `TouchableOpacity`.

### Fichiers à ouvrir
- `src/components/Loader.tsx` → composant le plus simple, bon point de départ
- `src/components/Badge.tsx` → props optionnelle avec valeur par défaut
- `src/components/PhotoCard.tsx` → composant plus complet avec plusieurs props
- `src/components/ErrorMessage.tsx` → prop `onRetry?: () => void` (fonction optionnelle)

### Questions à poser
1. **"Dans `PhotoCard`, pourquoi la prop `imageSource` est-elle de type `string` et non `{ uri: string }` ?"**
   → Réponse attendue : pour garder le composant simple. L'appelant fournit juste l'URL,
   le composant construit `{ uri: imageSource }` pour `<Image source={...} />`.
   Principe : l'interface la plus simple possible pour le consommateur.

2. **"Quelle est la différence entre `TouchableOpacity` et `Pressable` ?"**
   → Réponse attendue : `TouchableOpacity` réduit l'opacité au tap (effet visuel simple).
   `Pressable` expose `onPressIn`/`onPressOut` séparément → contrôle fin pour les animations.
   Dans `PhotoCard`, on utilise `Pressable` pour déclencher l'animation DÈS le contact.

3. **"Pourquoi `StyleSheet.create()` plutôt que des objets inline directement ?"**
   → Réponse attendue : performances (styles mis en cache), validation des propriétés (erreur au démarrage
   si une propriété est inconnue), meilleure lisibilité (séparation style/rendu).

### Points de blocage fréquents
- **Image qui ne s'affiche pas** → `source={{ uri: url }}` (objet, pas string directe), et vérifier que l'URI est valide
- **`aspectRatio: 1` incompris** → c'est le ratio largeur/hauteur. `1` = carré. `16/9` = paysage.
- **Confusion `flex: 1` vs taille fixe** → `flex: 1` = "prends tout l'espace disponible". S'il y a deux éléments `flex: 1`, chacun prend 50%.

### Lien avec le mini-projet final
Les étudiants devront créer au moins 2 composants réutilisables (ex: `MovieCard`, `RecipeCard`).
Insister sur la règle : si un composant est copié-collé, c'est qu'il doit être extrait.

---

## Créneau 3 — Flexbox avancé et layout

### Objectif
Maîtriser `flexDirection`, `justifyContent`, `alignItems`, `position: absolute`, grille 2 colonnes.

### Fichiers à ouvrir
- `src/components/SectionHeader.tsx` → barre colorée à gauche (position: absolute sur pseudo-border)
- `src/components/EmptyState.tsx` → centrage vertical et horizontal complet
- `src/navigation/AppNavigator.tsx` (lignes 146-161) → badge positionné en absolu sur l'icône
- `src/components/AddPhotoButton.tsx` → FAB en `position: absolute, bottom: 24, right: 24`
- `src/screens/FeedScreen.tsx` (styles `row` et `cardWrapper`) → grille 2 colonnes

### Questions à poser
1. **"Dans `EmptyState`, pourquoi `flex: 1` sur le conteneur principal ?"**
   → Réponse attendue : `flex: 1` permet au composant de prendre toute la hauteur disponible.
   Sans ça, `justifyContent: 'center'` ne peut pas centrer verticalement (pas de hauteur de référence).

2. **"Comment fonctionne `position: 'absolute'` en React Native ?"**
   → Réponse attendue : le composant sort du flux normal et se positionne par rapport
   à son parent le plus proche. `top`, `bottom`, `left`, `right` définissent la distance aux bords du parent.
   Exemple : le FAB dans FavoritesScreen est en `bottom: 24, right: 24` dans la View parente.

3. **"Dans la grille 2 colonnes de FeedScreen, pourquoi `flex: 1` sur `cardWrapper` plutôt qu'une largeur fixe ?"**
   → Réponse attendue : `flex: 1` s'adapte automatiquement à la taille de l'écran.
   Avec `numColumns={2}`, FlatList crée 2 colonnes → chaque `flex: 1` prend 50%.
   Une largeur fixe (ex: `width: 170`) casserait l'affichage sur les grands ou petits écrans.

### Points de blocage fréquents
- **`position: 'absolute'` qui ne fonctionne pas** → le parent doit avoir une hauteur définie (pas juste `height: 'auto'`)
- **Confusion `alignItems` vs `justifyContent`** → `justifyContent` = axe principal (direction du flex). `alignItems` = axe perpendiculaire.
- **`gap` qui ne s'affiche pas** → `gap` est supporté depuis React Native 0.71. Vérifier la version Expo.

### Lien avec le mini-projet final
Les étudiants doivent avoir au moins un écran avec une grille (2 colonnes) et un composant en position absolute.

---

## Créneau 4 — useState, useEffect, Context

### Objectif
Comprendre l'état local, les effets de bord, et le partage d'état entre composants via Context.

### Fichiers à ouvrir
- `src/hooks/usePhotos.ts` → 4 useState + 1 useEffect + useCallback
- `src/context/FavoritesContext.tsx` → Context complet avec AsyncStorage
- `src/hooks/useFavorites.ts` → thin wrapper (montrer la simplicité)
- `App.tsx` → Provider + AppContent (consommateur dans le Provider)

### Questions à poser
1. **"Dans `usePhotos`, pourquoi 4 states séparés (`photos`, `loading`, `error`, `reloadKey`) plutôt qu'un seul objet ?"**
   → Réponse attendue : chaque state a un cycle de vie différent. `loading` change indépendamment
   de `photos`. Les mettre dans un objet `{ photos, loading, error }` forcerait un re-render
   dès que l'un d'eux change, même si les autres ne changent pas. Ici, React optimise.
   Aussi plus lisible : chaque `set*` ne modifie qu'une chose.

2. **"Pourquoi `AppContent` est un composant séparé de `App` ?"**
   → Réponse attendue : `useFavoritesContext()` doit être appelé DANS un descendant du Provider.
   Si on l'appelait dans `App()` directement, on serait hors du Provider → erreur au runtime.
   `AppContent` est monté à l'intérieur du Provider, donc il peut consommer le Context. ✓

3. **"Dans FavoritesContext, pourquoi la garde `if (isHydrating) return` dans le 2e useEffect ?"**
   → Réponse attendue : au démarrage, `favorites = []` (état initial). Sans cette garde,
   le 2e useEffect s'exécuterait et sauvegarderait `[]` dans AsyncStorage, **effaçant**
   les favoris sauvegardés avant que le 1er useEffect ait eu le temps de les charger.
   La garde attend que `isHydrating` soit `false` (lecture AsyncStorage terminée) avant d'écrire.

### Points de blocage fréquents
- **"Mon useEffect se déclenche en boucle infinie"** → oublier le tableau de dépendances, ou mettre un objet/tableau créé dans le composant dans les dépendances
- **"Le Context retourne undefined"** → consommateur hors du Provider, ou Provider pas encore monté
- **"setState sur un composant démonté"** → utiliser AbortController ou vérifier dans la closure si le composant est encore monté

### Lien avec le mini-projet final
Les étudiants doivent implémenter leur propre Context (ex: `CartContext`, `WatchlistContext`).
Minimum requis : `useState`, 1 `useEffect`, 1 fonction exposée via le Context.

---

## Créneau 5 — API REST, navigation Stack + Tab

### Objectif
Faire un vrai appel réseau, naviguer entre écrans avec paramètres, comprendre le Stack et Tab imbriqués.

### Fichiers à ouvrir
- `src/services/api.ts` → fetch, async/await, gestion erreurs HTTP
- `src/navigation/AppNavigator.tsx` → architecture Tab + Stack imbriqué
- `src/navigation/types.ts` → types TypeScript de navigation
- `src/screens/FeedScreen.tsx` → `useNavigation`, `navigate('PhotoDetail', { photoId })`
- `src/screens/PhotoDetailScreen.tsx` → `useRoute`, lecture de `route.params`

### Questions à poser
1. **"Dans `api.ts`, pourquoi vérifie-t-on `response.ok` manuellement ? `fetch` ne lève pas une erreur automatiquement ?"**
   → Réponse attendue : `fetch` ne lève une exception que si la **connexion réseau échoue**.
   Si le serveur répond avec un code 404 ou 500, `response.ok` est `false` mais aucune exception n'est levée.
   Sans ce test, une réponse "404 Not Found" serait traitée comme un succès.

2. **"Pourquoi imbrique-t-on un Stack Navigator dans le Tab 'Feed' plutôt que de mettre PhotoDetailScreen directement dans le Tab Navigator ?"**
   → Réponse attendue : si on mettait PhotoDetailScreen dans le Tab, la barre d'onglets disparaîtrait
   quand on arrive sur cet écran (comportement non voulu). Avec le Stack imbriqué dans le Tab,
   la barre d'onglets reste visible même sur PhotoDetailScreen.

3. **"Comment TypeScript sait-il que `route.params.photoId` est un `number` ?"**
   → Réponse attendue : grâce au type `FeedStackParamList` dans `navigation/types.ts`.
   `PhotoDetail: { photoId: number }` dit que cet écran reçoit un `photoId` de type `number`.
   `useRoute<FeedStackRouteProp<'PhotoDetail'>>()` applique ce type au hook.
   TypeScript valide alors que `photoId` est bien utilisé comme un `number`.

### Points de blocage fréquents
- **Erreur "can't find variable: navigation"** → ne pas utiliser `navigation` dans un composant non-navigateur. Utiliser `useNavigation()` à la place.
- **Params undefined sur l'écran de détail** → vérifier que `navigate` passe bien les params : `navigate('PhotoDetail', { photoId: 42 })`
- **CORS dans Expo Go** → JSONPlaceholder est public, pas de CORS. Mais pour d'autres APIs, utiliser un proxy ou configurer les headers côté serveur.

### Lien avec le mini-projet final
Les étudiants doivent avoir au moins 2 écrans reliés par un Stack Navigator avec passage de paramètres.
L'API peut être JSONPlaceholder ou une autre API publique de leur choix.

---

## Créneau 6 — SDK natifs Expo et permissions

### Objectif
Utiliser un SDK Expo pour accéder à une ressource native (galerie), gérer les permissions runtime.

### Fichiers à ouvrir
- `src/hooks/useImagePicker.ts` → SDK expo-image-picker, permissions, async
- `src/components/AddPhotoButton.tsx` → FAB avec état `isLoading`
- `src/screens/FavoritesScreen.tsx` → intégration `useImagePicker` + `addLocalPhoto`
- `app.json` (lignes 14-43) → déclaration permissions iOS et Android
- `README-permissions.md` → différences iOS vs Android

### Questions à poser
1. **"Pourquoi `requestMediaLibraryPermissionsAsync()` n'affiche pas toujours une boîte de dialogue ?"**
   → Réponse attendue : si la permission a déjà été accordée lors d'une session précédente,
   la fonction retourne immédiatement `'granted'` sans afficher de dialogue.
   Le système iOS/Android mémorise la décision de l'utilisateur.

2. **"Que se passe-t-il si l'utilisateur refuse la permission sur iOS et que l'app la redemande ?"**
   → Réponse attendue : sur iOS, la permission ne peut être demandée **qu'une seule fois**.
   Si l'utilisateur refuse, `requestMediaLibraryPermissionsAsync()` retourne `'denied'`
   sans afficher de dialogue. L'utilisateur doit aller manuellement dans Réglages > GallerIA.
   C'est pourquoi l'`Alert` de refus explique exactement comment débloquer.

3. **"Dans `useImagePicker`, pourquoi utilise-t-on `useCallback` sur `pickImage` ?"**
   → Réponse attendue : `pickImage` est passée comme prop à `AddPhotoButton`.
   Sans `useCallback`, chaque re-render de `FavoritesScreen` crée une nouvelle référence de `pickImage`,
   ce qui force `AddPhotoButton` à se re-rendre même si rien n'a changé.
   `useCallback` stabilise la référence.

### Points de blocage fréquents
- **"expo-image-picker non trouvé"** → `npx expo install expo-image-picker` (pas `npm install`)
- **Permission refusée en boucle** → sur simulateur iOS : Réglages > Privacy > Photos > GallerIA → changer à "All Photos"
- **Image qui ne s'affiche pas après sélection** → vérifier que l'URI passée à `<Image source={{ uri }}/>` est bien la valeur retournée par `result.assets[0].uri`

### Lien avec le mini-projet final
Les étudiants intègrent au moins un SDK Expo de leur choix :
- `expo-image-picker` (galerie)
- `expo-location` (géolocalisation)
- `expo-camera` (caméra)
- `expo-notifications` (notifications locales)

---

## Créneau 7 — AsyncStorage, animations et mini-projet

### Objectif
Persister les données avec AsyncStorage, ajouter des animations React Native, lancer le mini-projet.

### Fichiers à ouvrir
- `context/FavoritesContext.tsx` → les 2 useEffect (lecture + écriture AsyncStorage)
- `App.tsx` → pattern hydratation (splash screen pendant isHydrating)
- `components/PhotoCard.tsx` → animation scale (useRef, Animated.spring, Pressable)
- `screens/FavoritesScreen.tsx` → AnimatedFavoriteItem (Animated.parallel)
- `screens/FeedScreen.tsx` → header collapsible (scrollY.interpolate, Animated.FlatList)
- `screens/SettingsScreen.tsx` → Switch + AsyncStorage pour dark mode

### Questions à poser
1. **"Pourquoi le pattern 'hydratation' est nécessaire ? Que verrait l'utilisateur sans lui ?"**
   → Réponse attendue : sans hydratation, l'app afficherait "Aucun favori" pendant ~50ms
   (le temps qu'AsyncStorage réponde) avant de remplir la liste. Ce flash visuel est désagréable.
   Avec `isHydrating`, on affiche un splash screen propre jusqu'à ce que les données soient prêtes.

2. **"Pourquoi `useNativeDriver: true` est possible pour les animations de PhotoCard mais pas pour le header collapsible ?"**
   → Réponse attendue : `useNativeDriver: true` délègue le calcul d'animation au thread natif.
   Seules les propriétés qui ne modifient pas le **layout** sont supportées : `opacity`, `transform` (`scale`, `translate`, `rotate`).
   `height` et `fontSize` modifient le layout → React Native doit recalculer les positions d'autres éléments → impossible sur le thread natif.

3. **"Quel est l'avantage de `Animated.event()` par rapport à `onScroll={(e) => setScrollY(e.nativeEvent.contentOffset.y)}` ?"**
   → Réponse attendue : avec `setState`, chaque pixel de scroll déclencherait un re-render du composant = lenteur.
   `Animated.event()` met à jour l'`Animated.Value` **directement** sans passer par le state React.
   L'animation est calculée sur le thread d'interface, le thread JS n'est pas impliqué.

### Points de blocage fréquents
- **"AsyncStorage n'est pas trouvé"** → `npx expo install @react-native-async-storage/async-storage`
- **"Animated.Value ne change pas l'UI"** → vérifier que le composant utilisé est `Animated.View` / `Animated.Text` (et non `View` / `Text`)
- **"Animation saccadée"** → `useNativeDriver: false` peut causer des saccades sur JS thread chargé. Réduire la durée ou simplifier la logique dans `renderItem`.

### Lancement du mini-projet final
À partir de ce créneau, les étudiants commencent leur mini-projet.

**Consigne suggérée :**
> Reproduis une application de type "galerie/liste" sur un thème de ton choix (films, recettes, livres, jeux...).
> Elle doit inclure :
> - Une liste/grille depuis une API publique (FlatList avec 2 colonnes)
> - Un écran de détail avec navigation Stack + passage de paramètres
> - Un système de favoris avec persistance AsyncStorage
> - Au moins un SDK Expo natif
> - Au moins 2 composants réutilisables typés avec TypeScript
> - Au moins 1 animation React Native

**APIs publiques suggérées :**
- [TMDB](https://developer.themoviedb.org) → films et séries
- [TheMealDB](https://www.themealdb.com/api.php) → recettes
- [Open Library](https://openlibrary.org/developers/api) → livres
- [PokéAPI](https://pokeapi.co) → Pokémon
- [JSONPlaceholder](https://jsonplaceholder.typicode.com) → données de test génériques
