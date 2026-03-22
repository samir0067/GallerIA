/**
 * screens/PhotoDetailScreen.tsx
 *
 * Écran de détail d'une photo, accessible depuis FeedScreen.
 *
 * --- Comment fonctionne la navigation vers cet écran ? ---
 *
 * 1. Dans FeedScreen : navigation.navigate('PhotoDetail', { photoId: 42 })
 *    → React Navigation empile PhotoDetailScreen par-dessus FeedScreen
 *    → Un bouton retour apparaît automatiquement dans le header
 *
 * 2. Ici, useRoute() récupère les paramètres passés par navigate() :
 *    const { photoId } = route.params  → photoId = 42
 *
 * 3. useEffect charge la photo correspondante depuis l'API
 *
 * Notions abordées :
 *   - useRoute() : accéder aux paramètres de navigation
 *   - useNavigation() : déclencher une navigation depuis l'écran
 *   - useEffect local pour charger UN seul élément depuis l'API
 *   - useFavorites() : synchronisation du bouton favori avec FeedScreen
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Photo } from '../types';
import { fetchPhotoById } from '../services/api';
import { useFavorites } from '../hooks/useFavorites';
import { Loader } from '../components/Loader';
import { ErrorMessage } from '../components/ErrorMessage';
import { FeedStackRouteProp, FeedStackNavigationProp } from '../navigation/types';

export function PhotoDetailScreen() {
  /*
   * useRoute() retourne l'objet route de React Navigation.
   * On le type avec FeedStackRouteProp<'PhotoDetail'> pour que TypeScript
   * sache que route.params contient { photoId: number }.
   *
   * Sans ce typage, route.params serait de type unknown → erreur TypeScript.
   */
  const route = useRoute<FeedStackRouteProp<'PhotoDetail'>>();
  const navigation = useNavigation<FeedStackNavigationProp<'PhotoDetail'>>();

  // Paramètre reçu depuis FeedScreen via navigation.navigate('PhotoDetail', { photoId })
  const { photoId } = route.params;

  // État local de cet écran — indépendant du reste de l'app
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Accès au contexte des favoris (partagé avec FeedScreen et FavoritesScreen)
  const { isFavorite, toggleFavorite } = useFavorites();

  /*
   * useEffect — charge la photo au montage de l'écran
   *
   * QUAND : une seule fois, quand PhotoDetailScreen est affiché.
   * POURQUOI [photoId] : si on naviguait vers un autre photoId (cas rare ici),
   * l'effet se relancerait automatiquement.
   */
  useEffect(() => {
    const abortController = new AbortController();

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchPhotoById(photoId);
        if (!abortController.signal.aborted) {
          setPhoto(data);
          // Met à jour le titre de la barre de navigation avec le titre de la photo
          navigation.setOptions({ title: `Photo #${data.id}` });
        }
      } catch (err) {
        if (!abortController.signal.aborted) {
          setError(
            err instanceof Error ? err.message : 'Impossible de charger la photo.'
          );
        }
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    }

    load();
    return () => abortController.abort();
  }, [photoId, navigation]);

  // --- Rendu conditionnel ---

  if (loading) {
    return <Loader />;
  }

  if (error || !photo) {
    return (
      <ErrorMessage
        message={error ?? 'Photo introuvable.'}
        onRetry={() => navigation.goBack()}
      />
    );
  }

  // La photo est chargée — on affiche le détail
  const isPhotoFavorite = isFavorite(photo.id);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Image en grand format (url = version haute résolution, pas thumbnailUrl) */}
      <Image
        source={{ uri: photo.url }}
        style={styles.image}
        resizeMode="cover"
      />

      {/* Zone de contenu textuel */}
      <View style={styles.infoBlock}>

        {/* Titre complet de la photo */}
        <Text style={styles.title}>{photo.title}</Text>

        {/* Identifiant de l'album */}
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Album</Text>
          <Text style={styles.metaValue}>#{photo.albumId}</Text>
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Photo ID</Text>
          <Text style={styles.metaValue}>#{photo.id}</Text>
        </View>

      </View>

      {/*
        Bouton favori — connecté au FavoritesContext via useFavorites().
        Appuyer ici a le même effet qu'appuyer sur le cœur dans FeedScreen :
        les deux lisent et écrivent dans le même état partagé.
      */}
      <TouchableOpacity
        style={[
          styles.favoriteButton,
          isPhotoFavorite && styles.favoriteButtonActive,
        ]}
        onPress={() => toggleFavorite(photo)}
        activeOpacity={0.8}
      >
        <Text style={styles.favoriteButtonText}>
          {isPhotoFavorite ? '💔 Retirer des favoris' : '❤️ Ajouter aux favoris'}
        </Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // Conteneur principal scrollable
  screen: {
    flex: 1,
    backgroundColor: '#ffffff',
  },

  // Contenu intérieur du ScrollView
  content: {
    paddingBottom: 40,
  },

  // Image en grand format en haut de l'écran
  image: {
    width: '100%',
    aspectRatio: 1,            // carré — même ratio que les thumbnails pour la cohérence
    backgroundColor: '#f0f0f0', // fond gris pendant le chargement de l'image
  },

  // Bloc d'informations textuelles sous l'image
  infoBlock: {
    padding: 20,
    gap: 12,
  },

  // Titre complet de la photo
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    lineHeight: 28,
    textTransform: 'capitalize', // première lettre en majuscule
  },

  // Ligne de métadonnée (label + valeur côte à côte)
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  // Label de la métadonnée (ex: "Album")
  metaLabel: {
    fontSize: 13,
    color: '#9ca3af',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Valeur de la métadonnée (ex: "#1")
  metaValue: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },

  // Bouton "Ajouter aux favoris" — état inactif
  favoriteButton: {
    marginHorizontal: 20,
    marginTop: 8,
    backgroundColor: '#6366f1',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    // Ombre pour donner du relief
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },

  // Bouton "Retirer des favoris" — état actif (déjà en favori)
  favoriteButtonActive: {
    backgroundColor: '#f43f5e', // rose-rouge pour "retirer"
    shadowColor: '#f43f5e',
  },

  // Texte du bouton favori
  favoriteButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16,
  },
});
