# Permissions dans GallerIA — Guide pour les étudiants

## C'est quoi une permission ?

Une **permission** est une autorisation que l'utilisateur doit accorder à l'application
pour accéder à une ressource sensible de l'appareil (galerie, caméra, localisation, etc.).
Sans cette autorisation, le système d'exploitation refuse l'accès.

## iOS vs Android : deux modèles différents

### iOS

Sur iOS, le dialogue de permission s'affiche **une seule fois**, au premier accès.
Si l'utilisateur répond **"Autoriser"**, l'app y a accès pour toujours.
Si l'utilisateur répond **"Refuser"**, l'app ne peut **plus jamais** redemander.
→ L'utilisateur doit aller dans **Réglages > GallerIA > Photos** pour changer.

La clé `NSPhotoLibraryUsageDescription` dans `app.json` est le texte qui s'affiche
dans ce dialogue. Elle est **obligatoire** — sans elle, l'app crashe au moment de la demande.

### Android

Sur Android, le comportement dépend de la **version du système** :
- **Android 13+ (API 33)** → permission `READ_MEDIA_IMAGES` requise
- **Android < 13** → permission `READ_EXTERNAL_STORAGE` requise

Expo gère cette différence automatiquement. Les deux permissions sont déclarées
dans `app.json` pour couvrir tous les appareils.

Sur Android, si l'utilisateur coche **"Ne plus demander"** avant de refuser,
l'app ne peut plus afficher le dialogue. D'où l'importance de l'Alert explicative
dans `useImagePicker.ts`.

## Dans Expo Go (tests en développement)

Expo Go inclut déjà les permissions pour `expo-image-picker`.
Le dialogue s'affichera normalement lors du premier accès.

## Configuration dans ce projet

```json
// app.json — iOS
"infoPlist": {
  "NSPhotoLibraryUsageDescription": "Message affiché à l'utilisateur"
}

// app.json — Android
"permissions": ["android.permission.READ_MEDIA_IMAGES", ...]

// app.json — Plugin Expo (recommandé)
"plugins": [["expo-image-picker", { "photosPermission": "..." }]]
```

## Résumé rapide

| Plateforme | Clé de permission | Demandée quand ? |
|---|---|---|
| iOS | `NSPhotoLibraryUsageDescription` | 1ère utilisation |
| Android 13+ | `READ_MEDIA_IMAGES` | 1ère utilisation |
| Android < 13 | `READ_EXTERNAL_STORAGE` | 1ère utilisation |
