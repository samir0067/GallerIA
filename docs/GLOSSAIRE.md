# 📖 Glossaire — GallerIA

> **Ce que tu vas apprendre en lisant ce document**
>
> ✅ La définition précise des termes techniques utilisés dans le projet
> ✅ Un exemple concret tiré du code de GallerIA pour chaque terme
> ✅ Un vocabulaire commun pour communiquer avec le formateur et tes camarades

---

> 💡 **Comment utiliser ce glossaire ?**
> Si tu rencontres un terme inconnu dans le code ou dans CONCEPTS.md,
> cherche-le ici. Chaque terme est expliqué en 1-2 phrases simples,
> sans jargon — ou avec le jargon expliqué dans le même paragraphe.

---

## A

### AbortController
Objet JavaScript natif qui permet d'annuler une opération asynchrone en cours (comme un `fetch`).
Dans GallerIA, chaque `useEffect` qui fait un appel API crée un `AbortController` et l'annule dans la fonction de cleanup pour éviter de mettre à jour l'état d'un composant déjà démonté.

→ *Exemple GallerIA :* `hooks/usePhotos.ts` (ligne 81) — `const abortController = new AbortController(); ... return () => abortController.abort();`

---

### Animated.Value
Objet spécial de l'API Animated de React Native qui contient une valeur numérique pouvant changer au fil du temps (pour les animations). Contrairement à un `useState`, modifier une `Animated.Value` ne déclenche pas de re-render — l'UI est mise à jour directement par le moteur d'animation.

→ *Exemple GallerIA :* `components/PhotoCard.tsx` — `const scaleAnim = useRef(new Animated.Value(1)).current`

---

### API REST
Interface de communication entre une application et un serveur distant, basée sur le protocole HTTP. Les données sont échangées via des URLs (ex: `GET /photos/42`) et le format JSON. "REST" est une convention architecturale, pas une technologie.

→ *Exemple GallerIA :* `services/api.ts` — `fetch('https://jsonplaceholder.typicode.com/photos?_limit=30')`

---

### async/await
Syntaxe JavaScript qui permet d'écrire du code asynchrone (qui attend une réponse) comme s'il était synchrone. `await` suspend l'exécution de la fonction jusqu'à ce que la promesse soit résolue, sans bloquer le reste du programme.

→ *Exemple GallerIA :* `hooks/useImagePicker.ts` — `const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();`

---

## C

### callback
Fonction passée en paramètre à une autre fonction pour être appelée plus tard. Dans React Native, les callbacks sont utilisés pour gérer les interactions utilisateur (ex: `onPress={() => handlePress(item)}`).

→ *Exemple GallerIA :* `components/PhotoCard.tsx` — prop `onFavoritePress: () => void` (callback appelé quand l'utilisateur tape le cœur)

---

### composant
Brique d'interface réutilisable en React Native. Une fonction TypeScript qui retourne du JSX. Un composant peut recevoir des `props`, maintenir un `state`, et s'imbriquer dans d'autres composants.

→ *Exemple GallerIA :* `components/Badge.tsx` — `export function Badge({ count, color }: Props) { return <View>...</View> }`

---

### Context
Mécanisme React pour partager des données entre composants sans les passer manuellement comme props à chaque niveau de l'arbre. Un `Provider` fournit les données, les `consommateurs` y accèdent via `useContext()`.

→ *Exemple GallerIA :* `context/FavoritesContext.tsx` — `FavoritesProvider` fournit les favoris à toute l'app, `useFavorites()` les consomme dans FeedScreen et FavoritesScreen

---

## E

### effet de bord
Opération qui modifie quelque chose en dehors du composant : appel réseau, lecture/écriture dans AsyncStorage, abonnement à un événement. En React, les effets de bord sont gérés avec `useEffect`.

→ *Exemple GallerIA :* `context/FavoritesContext.tsx` (ligne 73) — lecture d'AsyncStorage au montage = effet de bord

---

## F

### fetch
Fonction JavaScript native pour effectuer des requêtes HTTP. Retourne une `Promise` qui se résout avec la réponse HTTP. Attention : `fetch` ne lève **pas** d'exception pour les erreurs HTTP (404, 500) — il faut vérifier `response.ok` manuellement.

→ *Exemple GallerIA :* `services/api.ts` — `const response = await fetch('https://jsonplaceholder.typicode.com/photos?_limit=30')`

---

## H

### hook
Fonction React dont le nom commence par `use`, qui permet d'utiliser les fonctionnalités de React (état, effets, contexte) dans un composant fonctionnel. Les hooks standard sont `useState`, `useEffect`, `useContext`. On peut aussi créer ses propres hooks (`useFavorites`, `usePhotos`).

→ *Exemple GallerIA :* `hooks/usePhotos.ts` — hook personnalisé qui encapsule la logique de fetch et retourne `{ photos, loading, error, reload }`

---

## I

### interpolation
Transformation d'une valeur vers une autre dans une animation. `scrollY.interpolate({ inputRange: [0, 80], outputRange: [80, 50] })` signifie : "quand `scrollY` passe de 0 à 80, la valeur interpolée passe de 80 à 50". Utilisé pour créer des animations fluides basées sur des événements (scroll, geste).

→ *Exemple GallerIA :* `screens/FeedScreen.tsx` — `headerHeight = scrollY.interpolate(...)` pour le header collapsible

---

## J

### JSX
Syntaxe d'extension de JavaScript qui ressemble à du XML/HTML et permet d'écrire des interfaces React. Le JSX est transformé en appels JavaScript par le compilateur (`<View>` devient `React.createElement(View, ...)`). Les balises commençant par une majuscule sont des composants React (`<PhotoCard />`), les minuscules sont des éléments natifs (`<View />`).

→ *Exemple GallerIA :* n'importe quel fichier `.tsx` — le contenu du `return (...)` est du JSX

---

## M

### memoization
Technique d'optimisation qui consiste à mémoriser le résultat d'un calcul ou d'une création de fonction pour éviter de le répéter inutilement. En React, `useCallback` mémorise une fonction, `useMemo` mémorise une valeur calculée.

→ *Exemple GallerIA :* `hooks/usePhotos.ts` (ligne 127) — `reload = useCallback(() => setReloadKey(k => k+1), [])` : la même référence de `reload` entre les renders

---

## N

### navigation stack
Mode de navigation où les écrans s'empilent les uns sur les autres, comme des feuilles de papier. Naviguer "en avant" empile un nouvel écran, le bouton "Retour" dépile pour revenir au précédent.

→ *Exemple GallerIA :* `navigation/AppNavigator.tsx` — `FeedNavigator` : Stack avec `FeedScreen` (bas de pile) → `PhotoDetailScreen` (dessus)

---

### navigation tab
Mode de navigation avec une barre d'onglets fixe en bas (iOS) ou en haut (Android) de l'écran. Chaque onglet maintient son propre état de navigation (y compris la position de scroll et les écrans empilés dans un Stack imbriqué).

→ *Exemple GallerIA :* `navigation/AppNavigator.tsx` — Tab avec 3 onglets : Feed 🖼️ | Favoris ❤️ | Paramètres ⚙️

---

## P

### permission
Autorisation que l'utilisateur doit accorder à une app pour accéder à une ressource sensible du téléphone (galerie, caméra, GPS, microphone). Sur iOS, la demande est affichée une seule fois. Sur Android, le comportement dépend de la version du système.

→ *Exemple GallerIA :* `hooks/useImagePicker.ts` — `ImagePicker.requestMediaLibraryPermissionsAsync()` demande l'accès à la galerie

---

### persistance
Fait de sauvegarder des données sur le téléphone pour qu'elles survivent à la fermeture de l'app. En React Native, on utilise `AsyncStorage` (clé/valeur simple), SQLite (base de données), ou les fichiers système.

→ *Exemple GallerIA :* `context/FavoritesContext.tsx` — les favoris sont sauvegardés dans AsyncStorage à chaque modification et rechargés au démarrage

---

### props
Abréviation de "properties". Paramètres passés à un composant React depuis son parent, similaires aux arguments d'une fonction. Les props sont immuables (le composant enfant ne peut pas les modifier).

→ *Exemple GallerIA :* `components/PhotoCard.tsx` — props `photo`, `imageSource`, `isFavorite`, `onPress`, `onFavoritePress`

---

## R

### re-render
Processus par lequel React recalcule le JSX d'un composant suite à un changement de `state` ou de `props`. Un re-render ne signifie pas que le DOM/UI est entièrement redessiné — React diff l'ancien et le nouveau rendu et ne met à jour que ce qui a changé.

→ *Exemple GallerIA :* `hooks/usePhotos.ts` — `setPhotos(data)` déclenche un re-render de FeedScreen, qui affiche les photos chargées

---

## S

### SDK natif
"Software Development Kit" — ensemble de fonctions pré-packagées pour accéder aux fonctionnalités natives d'un appareil mobile. Expo fournit des SDK natifs pour des fonctions courantes : galerie photo (`expo-image-picker`), localisation (`expo-location`), caméra (`expo-camera`), etc.

→ *Exemple GallerIA :* `hooks/useImagePicker.ts` — `import * as ImagePicker from 'expo-image-picker'`

---

### state
État local d'un composant React : une donnée qui peut changer au cours du temps et dont le changement déclenche un re-render. Géré avec `useState` pour l'état local, ou via un Context pour l'état partagé.

→ *Exemple GallerIA :* `hooks/usePhotos.ts` — `const [loading, setLoading] = useState(true)` : `loading` est le state, `setLoading` le setter

---

## T

### type guard
Fonction TypeScript qui retourne `true/false` et permet à TypeScript de "savoir" quel type exact est une variable dans un bloc conditionnel. La signature `item is MonType` est ce qui fait la magie.

→ *Exemple GallerIA :* `types/index.ts` — `function isLocalPhoto(item: FavoriteItem): item is LocalPhoto`. Après `if (isLocalPhoto(item)) { ... }`, TypeScript sait que `item.uri` existe.

---

## U

### union type
Type TypeScript qui accepte plusieurs types différents, séparés par `|`. Une variable de type union peut contenir l'un **ou** l'autre des types listés. On utilise des type guards pour distinguer lequel est présent à l'exécution.

→ *Exemple GallerIA :* `types/index.ts` — `type FavoriteItem = (Photo & { dateAdded: string }) | LocalPhoto` : un favori est soit une photo API avec date, soit une photo locale

---

## V

### virtualisation
Technique d'optimisation qui consiste à ne rendre dans l'UI que les éléments actuellement visibles à l'écran (et quelques-uns juste en dehors), et à recycler les autres. Évite d'allouer de la mémoire pour des milliers d'éléments qui ne sont pas affichés.

→ *Exemple GallerIA :* `screens/FeedScreen.tsx` — `Animated.FlatList` (basé sur `FlatList`) est une liste virtualisée : sur 30 photos, seules ~8-10 sont rendues à la fois
