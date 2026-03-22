/**
 * hooks/usePhotos.ts
 *
 * Hook personnalisé qui simule le chargement de photos avec un délai artificiel.
 * À l'étape suivante (Créneau 5), fetchPhotos() remplacera le setTimeout.
 *
 * Ce hook illustre un pattern fondamental en React :
 * gérer 3 états liés mais distincts : données / chargement / erreur.
 *
 * Notions abordées :
 *   - useState : 3 états distincts et leurs rôles respectifs
 *   - useEffect : déclencher du code au montage et quand une dépendance change
 *   - useRef : stocker une valeur qui persiste entre renders SANS déclencher un render
 *   - useCallback : mémoriser une fonction pour éviter des re-renders
 *   - cleanup useEffect : annuler un setTimeout si le composant est démonté
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Photo } from '../types';

// --- Données fictives centralisées ici (source de vérité) ---
// Déplacées de FeedScreen vers le hook : c'est le hook qui gère les données,
// pas l'écran. L'écran affiche, le hook fournit.
const MOCK_PHOTOS: Photo[] = [
  {
    id: 1,
    albumId: 1,
    title: 'Coucher de soleil sur la côte méditerranéenne',
    url: 'https://via.placeholder.com/600/6366f1',
    thumbnailUrl: 'https://via.placeholder.com/150/6366f1',
  },
  {
    id: 2,
    albumId: 1,
    title: 'Forêt enchantée sous la brume matinale',
    url: 'https://via.placeholder.com/600/f59e0b',
    thumbnailUrl: 'https://via.placeholder.com/150/f59e0b',
  },
  {
    id: 3,
    albumId: 1,
    title: "Reflets d'un lac de montagne en automne",
    url: 'https://via.placeholder.com/600/10b981',
    thumbnailUrl: 'https://via.placeholder.com/150/10b981',
  },
  {
    id: 4,
    albumId: 1,
    title: "Ruelle pavée d'une vieille ville italienne",
    url: 'https://via.placeholder.com/600/ef4444',
    thumbnailUrl: 'https://via.placeholder.com/150/ef4444',
  },
  {
    id: 5,
    albumId: 1,
    title: 'Dunes de sable doré au lever du soleil',
    url: 'https://via.placeholder.com/600/8b5cf6',
    thumbnailUrl: 'https://via.placeholder.com/150/8b5cf6',
  },
  {
    id: 6,
    albumId: 1,
    title: "Champ de lavande sous un ciel d'orage",
    url: 'https://via.placeholder.com/600/0ea5e9',
    thumbnailUrl: 'https://via.placeholder.com/150/0ea5e9',
  },
];

// Durée de la simulation réseau (en millisecondes)
const SIMULATED_DELAY_MS = 1500;

// Délai sous lequel deux reloads consécutifs déclenchent une erreur (en ms)
const DOUBLE_RELOAD_THRESHOLD_MS = 3000;

type UsePhotosResult = {
  photos: Photo[];
  loading: boolean;
  error: string | null;
  reload: () => void;
};

export function usePhotos(): UsePhotosResult {
  /*
   * useState #1 — photos : Photo[]
   * Stocke la liste des photos chargées.
   * Initialement vide [] car aucune photo n'est encore chargée.
   * Séparé de loading/error car c'est la DONNÉE — les deux autres
   * sont des MÉTADONNÉES sur l'état du chargement.
   */
  const [photos, setPhotos] = useState<Photo[]>([]);

  /*
   * useState #2 — loading : boolean
   * Indique si un chargement est en cours.
   * true au démarrage car le chargement commence immédiatement.
   * Séparé de photos car sa valeur change AVANT et APRÈS que photos change :
   * loading=true → (1500ms plus tard) → photos=[...], loading=false
   */
  const [loading, setLoading] = useState<boolean>(true);

  /*
   * useState #3 — error : string | null
   * Stocke le message d'erreur, ou null s'il n'y en a pas.
   * Séparé de loading : les deux peuvent être false/null simultanément
   * (état stable après chargement réussi), ou error peut être non-null
   * pendant que loading repasse à false (chargement échoué).
   */
  const [error, setError] = useState<string | null>(null);

  /*
   * useState #4 — reloadKey : number
   * Compteur qui s'incrémente à chaque appel à reload().
   * useEffect dépend de reloadKey → se re-déclenche à chaque incrément.
   * C'est le mécanisme standard pour "rejouer" un effet manuellement.
   */
  const [reloadKey, setReloadKey] = useState<number>(0);

  /*
   * useRef — lastReloadTimestamp
   * Enregistre l'horodatage du dernier reload EXPLICITE (pas le chargement initial).
   * POURQUOI useRef et pas useState ?
   * Parce qu'on ne veut PAS déclencher un render quand cette valeur change.
   * C'est juste une valeur mémorisée entre les renders, invisible pour l'UI.
   */
  const lastReloadTimestamp = useRef<number | null>(null);

  /*
   * useEffect — déclenché au montage ET à chaque changement de reloadKey
   *
   * QUAND se déclenche-t-il ?
   *   - Au premier render (montage du composant) → chargement initial
   *   - À chaque appel de reload() qui incrémente reloadKey
   *
   * POURQUOI [reloadKey] dans le tableau de dépendances ?
   *   Si le tableau était vide [], l'effet ne se déclencherait qu'au montage.
   *   En mettant [reloadKey], React le relance chaque fois que reloadKey change.
   *
   * La fonction de cleanup (return () => clearTimeout) est cruciale :
   * si l'utilisateur quitte l'écran pendant les 1500ms, le setTimeout
   * est annulé et on ne tente plus de mettre à jour un composant démonté.
   */
  useEffect(() => {
    // --- Détection du double reload ---
    // reloadKey > 0 : ce n'est pas le chargement initial (reloadKey débute à 0)
    // lastReloadTimestamp.current !== null : il y a eu au moins un reload avant
    // Date.now() - lastReloadTimestamp.current < seuil : le reload est récent
    const now = Date.now();
    const isExplicitReload = reloadKey > 0;
    const isDoubleReload =
      isExplicitReload &&
      lastReloadTimestamp.current !== null &&
      now - lastReloadTimestamp.current < DOUBLE_RELOAD_THRESHOLD_MS;

    // On enregistre le timestamp SEULEMENT pour les reloads explicites
    if (isExplicitReload) {
      lastReloadTimestamp.current = now;
    }

    // Réinitialise les états avant chaque (re)chargement
    setLoading(true);
    setError(null);

    // setTimeout simule la latence d'un vrai appel réseau
    const timer = setTimeout(() => {
      if (isDoubleReload) {
        // Simulation d'erreur réseau pour tester le composant ErrorMessage
        setError('Impossible de charger les photos. Vérifiez votre connexion.');
      } else {
        setPhotos(MOCK_PHOTOS);
      }
      setLoading(false);
    }, SIMULATED_DELAY_MS);

    // Cleanup : annule le timer si le composant est démonté ou si reloadKey change
    // avant que les 1500ms soient écoulés (évite les mises à jour sur composant démonté)
    return () => clearTimeout(timer);
  }, [reloadKey]);

  /*
   * useCallback — reload
   * Mémorise la fonction reload pour qu'elle soit stable entre les renders.
   * Sans useCallback, chaque render de FeedScreen créerait une nouvelle
   * référence à reload, ce qui casserait les optimisations de composants
   * enfants qui reçoivent reload comme prop.
   * Le tableau [] signifie : la fonction ne change jamais de référence.
   */
  const reload = useCallback(() => {
    setReloadKey((k) => k + 1);
  }, []);

  return { photos, loading, error, reload };
}
