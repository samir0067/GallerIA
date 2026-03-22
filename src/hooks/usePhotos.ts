/**
 * hooks/usePhotos.ts
 *
 * Hook personnalisé pour charger les photos depuis l'API JSONPlaceholder.
 * Dans cette version, le setTimeout de simulation est remplacé par un vrai
 * appel réseau via fetchPhotos() depuis src/services/api.ts.
 *
 * Ce hook illustre un pattern fondamental en React :
 * gérer 3 états liés mais distincts : données / chargement / erreur.
 *
 * Notions abordées :
 *   - useState : 3 états distincts et leurs rôles respectifs
 *   - useEffect : déclencher un appel API au montage et sur reload
 *   - useCallback : mémoriser une fonction pour éviter des re-renders inutiles
 *   - AbortController : annuler proprement un appel fetch en cours
 */

import { useState, useEffect, useCallback } from 'react';
import { Photo } from '../types';
import { fetchPhotos } from '../services/api';

type UsePhotosResult = {
  photos: Photo[];
  loading: boolean;
  error: string | null;
  reload: () => void;
};

export function usePhotos(): UsePhotosResult {
  /*
   * useState #1 — photos : Photo[]
   * Stocke la liste des photos reçues de l'API.
   * Initialement [] car aucune donnée n'est encore arrivée.
   * Séparé de loading/error : c'est la DONNÉE, les deux autres
   * sont des MÉTADONNÉES décrivant l'état de la requête.
   */
  const [photos, setPhotos] = useState<Photo[]>([]);

  /*
   * useState #2 — loading : boolean
   * true dès que l'appel réseau démarre, false quand il se termine
   * (que ce soit en succès ou en erreur).
   * Initialisé à true car le chargement commence immédiatement au montage.
   * Séparé de photos : loading peut être true alors que photos est encore [].
   */
  const [loading, setLoading] = useState<boolean>(true);

  /*
   * useState #3 — error : string | null
   * null si tout va bien, string avec le message d'erreur si l'appel échoue.
   * Séparé de loading : après un échec, loading=false ET error≠null simultanément.
   * La valeur null permet de tester facilement : if (error) { ... }
   */
  const [error, setError] = useState<string | null>(null);

  /*
   * useState #4 — reloadKey : number
   * Compteur incrémenté à chaque appel de reload().
   * useEffect dépend de reloadKey → il se re-déclenche à chaque incrément.
   * C'est le pattern standard pour "rejouer" un effet sur demande.
   */
  const [reloadKey, setReloadKey] = useState<number>(0);

  /*
   * useEffect — déclenché au montage ET à chaque changement de reloadKey
   *
   * QUAND se déclenche-t-il ?
   *   - Au premier render du composant (montage) → chargement initial
   *   - À chaque incrément de reloadKey via reload() → rechargement
   *
   * POURQUOI [reloadKey] dans le tableau de dépendances ?
   *   Un tableau vide [] → s'exécute seulement au montage.
   *   [reloadKey] → s'exécute aussi quand reloadKey change.
   *
   * AbortController : permet d'annuler le fetch si le composant est démonté
   * AVANT que la réponse arrive. Sans ça, React afficherait une erreur
   * "Can't perform a React state update on an unmounted component".
   */
  useEffect(() => {
    // AbortController permet d'annuler la requête fetch en cours
    const abortController = new AbortController();

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchPhotos(30);
        // On ne met à jour l'état QUE si le composant est encore monté
        // (abortController.signal.aborted est true si cleanup a été appelé)
        if (!abortController.signal.aborted) {
          setPhotos(data);
        }
      } catch (err) {
        if (!abortController.signal.aborted) {
          // err est de type unknown en TypeScript — on extrait le message
          const message =
            err instanceof Error
              ? err.message
              : 'Une erreur inconnue est survenue.';
          setError(message);
        }
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    }

    load();

    // Fonction de cleanup : appelée quand le composant est démonté
    // OU quand reloadKey change (avant que le nouvel effet s'exécute).
    // abort() signale au fetch de s'arrêter proprement.
    return () => {
      abortController.abort();
    };
  }, [reloadKey]);

  /*
   * useCallback — reload
   * Mémorise la référence de reload pour qu'elle soit stable entre les renders.
   * Sans useCallback, chaque render créerait une nouvelle fonction → les composants
   * enfants qui reçoivent reload comme prop se re-rendraient inutilement.
   * Tableau de dépendances vide [] : la fonction ne change jamais de référence.
   */
  const reload = useCallback(() => {
    setReloadKey((k) => k + 1);
  }, []);

  return { photos, loading, error, reload };
}
