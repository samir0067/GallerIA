/**
 * hooks/usePhotos.ts
 *
 * Hook personnalisé pour charger les photos depuis l'API.
 * Un "hook" en React permet d'encapsuler une logique réutilisable
 * (ici : chargement, état de chargement, gestion d'erreur) pour l'utiliser
 * facilement dans n'importe quel composant ou écran.
 */

import { useState, useEffect } from 'react';
import { Photo } from '../types';
import { fetchPhotos } from '../services/api';

type UsePhotosResult = {
  photos: Photo[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
};

export function usePhotos(): UsePhotosResult {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchPhotos(20);
        if (!cancelled) setPhotos(data);
      } catch (err) {
        if (!cancelled) setError('Impossible de charger les photos. Vérifie ta connexion.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [refreshKey]);

  const refresh = () => setRefreshKey((k) => k + 1);

  return { photos, loading, error, refresh };
}
