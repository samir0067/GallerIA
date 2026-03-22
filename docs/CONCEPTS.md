# 📚 Concepts React Native dans GallerIA

> **Ce que tu vas apprendre en lisant ce document**
>
> ✅ Les concepts fondamentaux de React Native illustrés dans le projet
> ✅ Où trouver chaque concept dans le code (fichier + ligne)
> ✅ Pourquoi chaque concept existe (problème résolu)
> ✅ Les pièges classiques à éviter

---

## 1. JSX et composants fonctionnels

**Définition**
JSX est une syntaxe qui ressemble à du HTML mais qui produit des composants React Native.
Un composant fonctionnel est une simple fonction JavaScript qui retourne du JSX.

**Où le trouver dans GallerIA**
→ Tous les fichiers `src/components/*.tsx` et `src/screens/*.tsx`
→ Exemple minimal : `components/Loader.tsx` (composant simple, ~25 lignes)
→ Exemple avancé : `screens/FeedScreen.tsx` (composant avec état et navigation)

**Pourquoi c'est utile**
Sans composants, on devrait écrire l'interface entière dans un seul fichier.
Dans GallerIA, `PhotoCard` est réutilisé 30 fois dans FeedScreen et N fois dans FavoritesScreen,
sans jamais dupliquer le code.

**⚠️ Piège classique**
Un composant doit toujours retourner **un seul élément racine**.
Si tu as deux éléments côte à côte, enveloppe-les dans une `<View>` ou utilise `<>...</>` (Fragment).

```tsx
// ❌ Erreur : deux éléments racine
return <Text>Bonjour</Text> <Text>Monde</Text>

// ✅ Correct : un seul élément racine
return <><Text>Bonjour</Text><Text>Monde</Text></>
```

---

## 2. Props et composants réutilisables

**Définition**
Les props (propriétés) sont les paramètres que tu passes à un composant.
Elles permettent au même composant d'afficher des données différentes selon le contexte.

**Où le trouver dans GallerIA**
→ `components/PhotoCard.tsx` (lignes 26-49) — 6 props typées
→ `components/Badge.tsx` — props `count` et `color?` (optionnelle)
→ `components/SectionHeader.tsx` — prop `rightElement: ReactNode` (accepte n'importe quel composant)

**Pourquoi c'est utile**
`PhotoCard` reçoit `imageSource: string` comme prop.
Dans FeedScreen, on lui passe `photo.thumbnailUrl` (miniature de l'API).
Dans FavoritesScreen, on lui passe `photo.uri` (chemin local du téléphone).
**Le même composant, deux sources d'images différentes.**

**⚠️ Piège classique**
Ne pas typer les props en TypeScript, c'est accepter des bugs silencieux.
Toujours définir un `type Props = { ... }` et l'utiliser.

```tsx
// ❌ Risqué : pas de type, n'importe quoi peut être passé
function Badge({ count }) { ... }

// ✅ Sûr : TypeScript vérifie les valeurs à la compilation
type Props = { count: number; color?: string };
function Badge({ count, color = '#6366f1' }: Props) { ... }
```

---

## 3. StyleSheet vs styles inline

**Définition**
`StyleSheet.create()` est la façon recommandée de définir des styles en React Native.
Les styles inline sont des objets JS définis directement dans le JSX.

**Où le trouver dans GallerIA**
→ `components/PhotoCard.tsx` (lignes 99-158) — StyleSheet.create avec tous les styles
→ `screens/FeedScreen.tsx` (ligne 134) — style inline pour `ItemSeparatorComponent`
→ `screens/FavoritesScreen.tsx` (lignes dans AnimatedFavoriteItem) — styles dans Animated.View

**Pourquoi c'est utile**
`StyleSheet.create()` optimise les performances : les styles sont validés et mis en cache
au démarrage de l'app. Avec les styles inline, un nouvel objet est créé à chaque render.

**⚠️ Piège classique**
En React Native, les propriétés CSS ont des noms légèrement différents :
`background-color` → `backgroundColor`, `border-radius` → `borderRadius`, etc.
Pas de tirets : tout est en camelCase.

```tsx
// ❌ Ne fonctionne pas (syntaxe CSS web)
<View style={{ background-color: 'red', border-radius: 8 }}>

// ✅ Syntaxe React Native
<View style={{ backgroundColor: 'red', borderRadius: 8 }}>
```

---

## 4. Flexbox — mise en page

**Définition**
Flexbox est le système de mise en page principal de React Native.
Il permet d'organiser les éléments en lignes ou en colonnes avec des règles simples.

**Où le trouver dans GallerIA**

*Basique :*
→ `components/Loader.tsx` — `flex: 1, alignItems: 'center', justifyContent: 'center'`
→ `components/Badge.tsx` — `alignItems: 'center', justifyContent: 'center'`

*Avancé :*
→ `screens/FeedScreen.tsx` — grille 2 colonnes avec `numColumns={2}` + `flex: 1` sur chaque carte
→ `screens/SettingsScreen.tsx` — `flexDirection: 'row'` pour aligner icône + texte + Switch
→ `navigation/AppNavigator.tsx` — badge positionné en `position: 'absolute'` sur l'icône d'onglet

**Pourquoi c'est utile**
En React Native (contrairement au web), **`flexDirection` est `column` par défaut**.
La grille 2 colonnes de FeedScreen utilise `flex: 1` sur chaque carte pour que
chacune occupe exactement 50% de la largeur — sans calcul manuel en pixels.

**⚠️ Piège classique**
Sur le web, `flexDirection` vaut `row` par défaut.
En React Native, c'est `column` — les éléments s'empilent verticalement par défaut.

```tsx
// Pour aligner deux éléments côte à côte en React Native :
<View style={{ flexDirection: 'row' }}>
  <Text>Gauche</Text>
  <Text>Droite</Text>
</View>
```

---

## 5. useState

**Définition**
`useState` est un hook qui ajoute un état local à un composant fonctionnel.
Quand l'état change, React re-rend le composant avec la nouvelle valeur.

**Où le trouver dans GallerIA**
→ `hooks/usePhotos.ts` (lignes 37-62) — 4 states distincts : `photos`, `loading`, `error`, `reloadKey`
→ `hooks/useImagePicker.ts` (ligne 49) — `isLoading: boolean`
→ `screens/SettingsScreen.tsx` (ligne 35) — `isDarkMode: boolean`
→ `context/FavoritesContext.tsx` (lignes 54-61) — `favorites: FavoriteItem[]`, `isHydrating: boolean`

**Pourquoi c'est utile**
Dans `usePhotos`, on a 3 states séparés (et non un seul objet) car ils évoluent indépendamment.
`loading` peut être `true` alors que `photos` est encore `[]`.
`error` peut être non-null alors que `loading` est `false`.
Chaque state a sa propre responsabilité.

**⚠️ Piège classique**
Ne jamais modifier directement la valeur — toujours appeler le setter.

```tsx
// ❌ Ne déclenche PAS de re-render
photos.push(newPhoto);

// ✅ Crée un nouveau tableau → déclenche le re-render
setPhotos([...photos, newPhoto]);
```

---

## 6. useEffect et tableau de dépendances

**Définition**
`useEffect` est un hook pour exécuter du code après le rendu : appels API, abonnements, timers.
Le tableau de dépendances contrôle QUAND l'effet se relance.

**Où le trouver dans GallerIA**
→ `hooks/usePhotos.ts` (ligne 79) — `useEffect([reloadKey])` : relancé à chaque reload
→ `context/FavoritesContext.tsx` (ligne 73) — `useEffect([])` : lit AsyncStorage au montage
→ `context/FavoritesContext.tsx` (ligne 111) — `useEffect([favorites, isHydrating])` : sauvegarde
→ `screens/SettingsScreen.tsx` (ligne 46) — `useEffect([])` : charge la préférence dark mode
→ `screens/FavoritesScreen.tsx` — `useEffect([])` dans `AnimatedFavoriteItem` : lance l'animation

**Pourquoi c'est utile**
Dans FavoritesContext, deux useEffect avec des rôles différents :
1. `[]` → lit AsyncStorage **une seule fois** au démarrage
2. `[favorites, isHydrating]` → sauvegarde **à chaque modification** des favoris

La garde `if (isHydrating) return` dans le 2e useEffect évite d'écraser les données
sauvegardées avec un tableau vide pendant le chargement initial.

**⚠️ Piège classique**
Oublier le tableau de dépendances = l'effet se relance à chaque render = boucle infinie.

```tsx
// ❌ S'exécute après CHAQUE render (boucle infinie si setData est appelé dedans)
useEffect(() => { fetchData().then(setData); });

// ✅ S'exécute une seule fois au montage
useEffect(() => { fetchData().then(setData); }, []);

// ✅ S'exécute quand userId change
useEffect(() => { fetchUser(userId); }, [userId]);
```

---

## 7. useCallback et useRef

**Définition**
`useCallback` mémorise une fonction pour qu'elle garde la même référence entre les renders.
`useRef` stocke une valeur qui persiste entre les renders sans en déclencher de nouveaux.

**Où le trouver dans GallerIA**

*useCallback :*
→ `hooks/usePhotos.ts` (ligne 127) — `reload` mémorisé pour ne pas re-rendre les enfants
→ `context/FavoritesContext.tsx` (lignes 125-169) — toutes les fonctions du Context mémorisées
→ `hooks/useImagePicker.ts` (ligne 51) — `pickImage` mémorisé

*useRef :*
→ `components/PhotoCard.tsx` (ligne 76) — `scaleAnim = useRef(new Animated.Value(1)).current`
→ `screens/FeedScreen.tsx` (ligne ~80) — `scrollY = useRef(new Animated.Value(0)).current`

**Pourquoi c'est utile**
Dans `PhotoCard`, `scaleAnim` est une `Animated.Value` qui change à chaque frame d'animation.
Si on utilisait `useState`, React re-rendrait le composant 60 fois par seconde = lag.
Avec `useRef`, la valeur est modifiée en mémoire sans déclencher de re-render.

**⚠️ Piège classique**
Confondre les deux : `useRef` est pour les valeurs qui changent mais ne doivent PAS re-rendre.
`useState` est pour les valeurs dont le changement DOIT déclencher un re-render (affichage).

```tsx
// useRef : la valeur change mais l'UI ne se met pas à jour
const counter = useRef(0);
counter.current = 42; // pas de re-render

// useState : la valeur change ET l'UI se met à jour
const [count, setCount] = useState(0);
setCount(42); // → re-render avec la nouvelle valeur
```

---

## 8. React Context

**Définition**
Le Context est un mécanisme pour partager des données entre des composants sans passer
des props à travers toute la hiérarchie (prop drilling).

**Où le trouver dans GallerIA**
→ `context/FavoritesContext.tsx` — création et fourniture du Context
→ `App.tsx` (ligne 51) — `<FavoritesProvider>` enveloppe toute l'app
→ `hooks/useFavorites.ts` — consomme le Context via `useFavoritesContext()`
→ `navigation/AppNavigator.tsx` (ligne 90) — lit `favorites.length` pour le Badge
→ `screens/FeedScreen.tsx` — lit et modifie les favoris via `useFavorites()`

**Pourquoi c'est utile**
Sans Context, pour partager les favoris entre FeedScreen et FavoritesScreen,
il faudrait passer `favorites` comme prop à travers AppNavigator → Tab.Navigator → écran.
Avec Context, `useFavorites()` suffit dans n'importe quel composant.

**⚠️ Piège classique**
Le consommateur DOIT être un descendant du Provider dans l'arbre de composants.
C'est pourquoi `AppContent` (qui lit `isHydrating`) est DANS `<FavoritesProvider>` dans `App.tsx`.

```tsx
// ❌ Crash : App() est HORS du Provider
export default function App() {
  const { isHydrating } = useFavoritesContext(); // Error !
  return <FavoritesProvider>...</FavoritesProvider>;
}

// ✅ AppContent est DANS le Provider
function AppContent() {
  const { isHydrating } = useFavoritesContext(); // ✓
}
export default function App() {
  return <FavoritesProvider><AppContent /></FavoritesProvider>;
}
```

---

## 9. React Navigation — Stack et Tab

**Définition**
React Navigation gère les transitions entre écrans.
Le Stack Navigator empile des écrans (avec bouton retour), le Tab Navigator affiche une barre d'onglets.

**Où le trouver dans GallerIA**
→ `navigation/AppNavigator.tsx` — configuration complète
→ `navigation/types.ts` — types TypeScript des paramètres de navigation
→ `screens/FeedScreen.tsx` (ligne 58) — `useNavigation<FeedStackNavigationProp<'FeedMain'>>()`
→ `screens/PhotoDetailScreen.tsx` (lignes 49-50) — `useRoute` + `useNavigation`

**Pourquoi c'est utile**
`navigation.navigate('PhotoDetail', { photoId: photo.id })` depuis FeedScreen
passe `photoId` à PhotoDetailScreen via les params.
TypeScript valide que `photoId` est bien un `number` grâce aux types dans `types.ts`.

**⚠️ Piège classique**
Le `<NavigationContainer>` doit être présent exactement **une seule fois** dans l'app,
au niveau le plus haut. Le placer plusieurs fois cause des erreurs.

---

## 10. FlatList vs ScrollView

**Définition**
`ScrollView` rend **tous** ses enfants en mémoire dès le départ.
`FlatList` est virtualisée : elle ne rend que les éléments **visibles** à l'écran.

**Où le trouver dans GallerIA**
→ `screens/FeedScreen.tsx` — `Animated.FlatList` avec `numColumns={2}` (30 photos)
→ `screens/FavoritesScreen.tsx` — `ScrollView` (liste des favoris, nombre limité)
→ `screens/PhotoDetailScreen.tsx` — `ScrollView` (un seul item, pas besoin de virtualisation)
→ `screens/SettingsScreen.tsx` — `ScrollView` (contenu statique)

**Pourquoi c'est utile**
Avec 30 photos dans FeedScreen, la différence est faible.
Mais avec 500 photos, `ScrollView` allouerait 500 composants en mémoire.
`FlatList` en allouerait ~10 (ceux visibles + quelques en réserve), le reste est recyclé.

**⚠️ Piège classique**
`FlatList` avec `numColumns` change de valeur à l'exécution → crash.
`numColumns` doit être une valeur constante ou déclencher un `key` change sur la FlatList.

```tsx
// Props importantes de FlatList
<FlatList
  data={photos}                              // tableau de données
  keyExtractor={(item) => item.id.toString()} // clé unique par item (obligatoire)
  renderItem={({ item }) => <PhotoCard ... />} // composant pour chaque item
  numColumns={2}                             // grille 2 colonnes
  ItemSeparatorComponent={() => <View style={{ height: 10 }} />} // espace entre lignes
  ListHeaderComponent={<SectionHeader ... />} // rendu avant la liste
/>
```

---

## 11. fetch et gestion d'erreur asynchrone

**Définition**
`fetch` est l'API native JavaScript pour faire des requêtes HTTP.
`async/await` simplifie l'écriture de code asynchrone (qui attend une réponse).

**Où le trouver dans GallerIA**
→ `services/api.ts` — `fetchPhotos()` et `fetchPhotoById()` avec `try/catch`
→ `hooks/usePhotos.ts` (lignes 79-118) — appel de `fetchPhotos` dans `useEffect`
→ `screens/PhotoDetailScreen.tsx` (lignes 70-99) — appel local de `fetchPhotoById`

**Pourquoi c'est utile**
`response.ok` est `false` pour les codes HTTP 4xx/5xx (ex: 404, 500) mais **ne lève pas d'exception**.
Sans ce test, une réponse "404 Not Found" serait traitée comme un succès.
Dans `api.ts`, on teste `response.ok` et on lève manuellement une `Error` si nécessaire.

**⚠️ Piège classique**
Oublier de vérifier `response.ok` et appeler `response.json()` sur une réponse d'erreur.
Si le serveur renvoie du HTML d'erreur au lieu de JSON, `response.json()` lève une exception.

```tsx
// ❌ Dangereux : pas de vérification du code HTTP
const data = await fetch(url).then(r => r.json());

// ✅ Sûr : on vérifie le statut avant de lire le corps
const response = await fetch(url);
if (!response.ok) throw new Error(`Erreur HTTP ${response.status}`);
const data = await response.json();
```

---

## 12. AsyncStorage

**Définition**
`AsyncStorage` est une base de données clé/valeur locale sur le téléphone.
Elle persiste entre les redémarrages de l'app — idéale pour les préférences et petites données.

**Où le trouver dans GallerIA**
→ `context/FavoritesContext.tsx` (lignes 34, 76-121) — clé `@galleria_favorites`, lecture + écriture
→ `screens/SettingsScreen.tsx` (lignes 46-56) — clé `@galleria_dark_mode`, Switch persisté

**Pourquoi c'est utile**
Sans AsyncStorage, fermer l'app efface tous les favoris.
Avec AsyncStorage, les favoris survivent aux redémarrages.
Le pattern "hydratation" dans FavoritesContext charge ces données avant d'afficher l'app.

**⚠️ Piège classique**
AsyncStorage **ne stocke que des chaînes de caractères**.
Pour stocker un tableau ou un objet, il faut sérialiser avec `JSON.stringify()` et
désérialiser avec `JSON.parse()`.

```tsx
// Écriture : sérialisation obligatoire
await AsyncStorage.setItem('@key', JSON.stringify({ count: 42 }));

// Lecture : désérialisation obligatoire
const raw = await AsyncStorage.getItem('@key'); // → string | null
const obj = raw !== null ? JSON.parse(raw) : null;
```

---

## 13. SDK natifs Expo et permissions

**Définition**
Les SDK Expo sont des modules qui donnent accès aux fonctionnalités natives du téléphone
(appareil photo, galerie, GPS...). Les permissions sont des autorisations que l'utilisateur doit accorder.

**Où le trouver dans GallerIA**
→ `hooks/useImagePicker.ts` — `expo-image-picker`, `requestMediaLibraryPermissionsAsync()`
→ `app.json` (lignes 14-32) — déclaration des permissions iOS et Android
→ `README-permissions.md` — guide complet sur iOS vs Android

**Pourquoi c'est utile**
Sans la permission galerie, l'OS refuse l'accès aux photos de l'utilisateur.
`requestMediaLibraryPermissionsAsync()` affiche la boîte de dialogue système.
Si l'utilisateur refuse, l'app affiche une `Alert` expliquant comment débloquer manuellement.

**⚠️ Piège classique**
Ne pas déclarer les permissions dans `app.json` fait crasher l'app sur iOS lors de la demande.
`NSPhotoLibraryUsageDescription` est **obligatoire** sur iOS — le texte doit être explicite.

---

## 14. Animated API — Les 3 animations de GallerIA

**Définition**
L'API `Animated` de React Native permet de créer des animations fluides (60 fps)
sans re-rendre le composant à chaque frame.

**Les 3 animations dans GallerIA :**

---

### Animation 1 — Scale au tap (PhotoCard)

**Fichier :** `components/PhotoCard.tsx` (lignes 76-120)

```
Doigt pose → scaleAnim : 1 ──timing(100ms)──→ 0.97 (carte rétrécit)
Doigt lève → scaleAnim : 0.97 ──spring()──→ 1 (carte rebondit)
```

```tsx
const scaleAnim = useRef(new Animated.Value(1)).current;

// Pressable onPressIn → timing rapide (retrait immédiat)
Animated.timing(scaleAnim, { toValue: 0.97, duration: 100, useNativeDriver: true }).start();

// Pressable onPressOut → spring (rebond naturel)
Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();

// Utilisation dans le style
<Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
```

**`useNativeDriver: true`** → possible car `transform: scale` ne modifie pas le layout.

---

### Animation 2 — Fade + slide à l'ajout (FavoritesScreen)

**Fichier :** `screens/FavoritesScreen.tsx` → composant `AnimatedFavoriteItem`

```
Montage du composant → opacityAnim: 0 ──parallel──→ 1
                     → translateYAnim: 20 ──parallel──→ 0
```

```tsx
Animated.parallel([
  Animated.timing(opacityAnim,   { toValue: 1, duration: 350, useNativeDriver: true }),
  Animated.timing(translateYAnim, { toValue: 0, duration: 350, useNativeDriver: true }),
]).start();

<Animated.View style={{ opacity: opacityAnim, transform: [{ translateY: translateYAnim }] }}>
```

**`Animated.parallel`** → les deux animations démarrent simultanément.

---

### Animation 3 — Header collapsible (FeedScreen)

**Fichier :** `screens/FeedScreen.tsx` (lignes ~80-160)

```
scrollY: 0 → 80 (l'utilisateur scrolle 80px vers le bas)
        ↓ interpolate()
height : 80 → 50    (header rétrécit)
fontSize: 26 → 18   (titre rapetisse)
opacity : 1 → 0     (sous-titre disparaît)
```

```tsx
const scrollY = useRef(new Animated.Value(0)).current;

const headerHeight = scrollY.interpolate({
  inputRange: [0, 80],
  outputRange: [80, 50],
  extrapolate: 'clamp', // bloque la valeur entre 50 et 80
});

<Animated.FlatList
  onScroll={Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: false } // ← obligatoire pour les animations de layout
  )}
  scrollEventThrottle={16}
/>
```

**`useNativeDriver: false`** → obligatoire car `height` et `fontSize` modifient le layout.

---

### Récapitulatif useNativeDriver

| Animation | useNativeDriver | Pourquoi |
|---|---|---|
| Scale (PhotoCard) | `true` | `transform` ne modifie pas le layout |
| Fade + slide (Favoris) | `true` | `opacity` + `translateY` ne modifient pas le layout |
| Header collapsible | `false` | `height` et `fontSize` **modifient** le layout |
