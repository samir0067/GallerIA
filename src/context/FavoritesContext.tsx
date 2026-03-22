/**
 * context/FavoritesContext.tsx
 *
 * Contexte React qui gère les favoris avec PERSISTANCE via AsyncStorage.
 * Dans cette version, les favoris survivent aux redémarrages de l'app.
 *
 * --- Cycle de vie de la persistance ---
 *
 *  1. App démarre → isHydrating = true
 *  2. useEffect [montage] → lit AsyncStorage → remplit favorites
 *  3. isHydrating → false  → l'app s'affiche (splash screen terminé)
 *  4. Utilisateur ajoute/retire un favori → favorites change
 *  5. useEffect [favorites] → sauvegarde dans AsyncStorage
 *  6. App redémarre → retour à l'étape 1 (les données sont là ✓)
 *
 * Notions abordées :
 *   - AsyncStorage : persistance clé/valeur locale sur l'appareil
 *   - Pattern "hydratation" : charger l'état sauvegardé au démarrage
 *   - Deux useEffect avec des rôles distincts (lecture vs écriture)
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Photo, LocalPhoto, FavoriteItem } from '../types';

/** Clé AsyncStorage — préfixe "@" par convention pour éviter les collisions */
const STORAGE_KEY = '@galleria_favorites';

// --- Type du contexte ---
type FavoritesContextType = {
  favorites: FavoriteItem[];
  /** true pendant la lecture initiale d'AsyncStorage — affiche le splash screen */
  isHydrating: boolean;
  isFavorite: (id: number | string) => boolean;
  toggleFavorite: (photo: Photo) => void;
  addLocalPhoto: (uri: string) => void;
  removeLocalPhoto: (id: string) => void;
  /** Vide tous les favoris et supprime la clé AsyncStorage */
  clearFavorites: () => void;
};

const FavoritesContext = createContext<FavoritesContextType | null>(null);

type ProviderProps = { children: ReactNode };

export function FavoritesProvider({ children }: ProviderProps) {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  /*
   * isHydrating — true uniquement pendant la toute première lecture d'AsyncStorage.
   * Ce booléen permet à App.tsx d'afficher un écran de démarrage pendant
   * que les données se chargent, plutôt qu'un écran blanc ou une liste vide.
   */
  const [isHydrating, setIsHydrating] = useState<boolean>(true);

  // ─────────────────────────────────────────────────────────────────────────
  // useEffect #1 — LECTURE : charge les favoris depuis AsyncStorage au démarrage
  //
  // QUAND : une seule fois, au montage du composant (tableau de dépendances []).
  // POURQUOI [] : on ne veut lire AsyncStorage QU'AU DÉMARRAGE, pas à chaque render.
  //   Si on oubliait [] et mettait [favorites], cet effet se déclencherait en boucle.
  //
  // PROBLÈME RÉSOLU : sans ce useEffect, l'utilisateur perd tous ses favoris
  //   à chaque fermeture de l'app. Avec lui, ils sont restaurés en ~50ms.
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    async function hydrate() {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);

        if (stored !== null) {
          // JSON.parse() reconvertit la chaîne en tableau d'objets JavaScript
          const parsed = JSON.parse(stored) as FavoriteItem[];
          setFavorites(parsed);
        }
        // Si stored === null : aucune donnée sauvegardée → on garde []
      } catch (err) {
        // En cas d'erreur (données corrompues, etc.) : on repart de zéro
        // console.warn pour ne pas faire crasher l'app
        console.warn('[FavoritesContext] Erreur de lecture AsyncStorage :', err);
      } finally {
        // finally : s'exécute TOUJOURS, que try réussisse ou que catch attrape
        // Ça garantit que isHydrating repasse à false même en cas d'erreur
        setIsHydrating(false);
      }
    }

    hydrate();
  }, []); // [] → s'exécute seulement au montage

  // ─────────────────────────────────────────────────────────────────────────
  // useEffect #2 — ÉCRITURE : sauvegarde les favoris à chaque modification
  //
  // QUAND : à chaque fois que favorites ou isHydrating change.
  // POURQUOI [favorites, isHydrating] :
  //   - [favorites] seul suffirait pour la sauvegarde, mais on a besoin
  //     de [isHydrating] pour BLOQUER la sauvegarde pendant le chargement.
  //   - Sans la garde "if (isHydrating) return", ce useEffect sauvegarderait
  //     un tableau vide [] pendant l'hydratation, EFFAÇANT les données stockées !
  //
  // PROBLÈME RÉSOLU : sans ce useEffect, ajouter un favori ne le sauvegarde pas.
  //   L'utilisateur doit retrouver ses favoris intacts après fermeture de l'app.
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    // GARDE CRITIQUE : on n'écrit PAS pendant l'hydratation initiale
    // car favorites vaut encore [] (l'ancien état) pendant que la lecture se fait
    if (isHydrating) return;

    // JSON.stringify() sérialise le tableau en chaîne pour AsyncStorage
    // AsyncStorage ne stocke que des strings — d'où la sérialisation JSON
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(favorites)).catch((err) => {
      console.warn('[FavoritesContext] Erreur de sauvegarde AsyncStorage :', err);
    });
  }, [favorites, isHydrating]);

  // ─── Fonctions exposées dans le contexte ────────────────────────────────

  const isFavorite = useCallback(
    (id: number | string): boolean => favorites.some((f) => f.id === id),
    [favorites]
  );

  const toggleFavorite = useCallback((photo: Photo): void => {
    setFavorites((prev) => {
      const exists = prev.some((f) => f.id === photo.id);
      if (exists) return prev.filter((f) => f.id !== photo.id);
      return [...prev, { ...photo, dateAdded: new Date().toISOString() }];
    });
  }, []);

  const addLocalPhoto = useCallback((uri: string): void => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    const newLocal: LocalPhoto = {
      id: Date.now().toString(),
      uri,
      title: `Ma photo — ${dateStr}`,
      isLocal: true,
      dateAdded: now.toISOString(),
    };
    setFavorites((prev) => [...prev, newLocal]);
  }, []);

  const removeLocalPhoto = useCallback((id: string): void => {
    setFavorites((prev) => prev.filter((f) => f.id !== id));
  }, []);

  /*
   * clearFavorites — vide la liste ET supprime la clé AsyncStorage.
   * Utilisé dans SettingsScreen → bouton "Vider les favoris".
   * On utilise removeItem (plutôt que setItem('[]')) pour partir d'un état vraiment vide.
   */
  const clearFavorites = useCallback((): void => {
    setFavorites([]);
    AsyncStorage.removeItem(STORAGE_KEY).catch((err) => {
      console.warn('[FavoritesContext] Erreur clearFavorites :', err);
    });
  }, []);

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        isHydrating,
        isFavorite,
        toggleFavorite,
        addLocalPhoto,
        removeLocalPhoto,
        clearFavorites,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavoritesContext(): FavoritesContextType {
  const ctx = useContext(FavoritesContext);
  if (!ctx) {
    throw new Error('useFavoritesContext doit être utilisé dans un <FavoritesProvider>');
  }
  return ctx;
}
