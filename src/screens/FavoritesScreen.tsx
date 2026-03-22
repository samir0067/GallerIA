/**
 * screens/FavoritesScreen.tsx
 *
 * Écran des favoris : affiche toutes les photos sauvegardées,
 * qu'elles viennent de l'API ou de la galerie du téléphone.
 *
 * Nouveautés de cette étape :
 *   - Bouton FAB "+" pour ajouter une photo depuis la galerie
 *   - Les LocalPhoto s'affichent avec le badge "📱 Local"
 *   - Suppression distincte selon le type : toggleFavorite (API) ou removeLocalPhoto (local)
 *
 * Notions abordées :
 *   - useImagePicker() : accès à la galerie avec gestion des permissions
 *   - Type guard isLocalPhoto() : différencier deux types dans un union
 *   - Composant FAB en position absolute au-dessus du contenu
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
  StyleSheet,
} from 'react-native';
import { FavoriteItem, isLocalPhoto } from '../types';
import { SectionHeader } from '../components/SectionHeader';
import { EmptyState } from '../components/EmptyState';
import { Badge } from '../components/Badge';
import { PhotoCard } from '../components/PhotoCard';
import { AddPhotoButton } from '../components/AddPhotoButton';
import { useFavorites } from '../hooks/useFavorites';
import { useImagePicker } from '../hooks/useImagePicker';

export function FavoritesScreen() {
  const { favorites, isFavorite, toggleFavorite, addLocalPhoto, removeLocalPhoto } =
    useFavorites();

  const { pickImage, isLoading } = useImagePicker();

  // Retire un favori — la logique dépend du type de photo
  const handleRemoveFavorite = (item: FavoriteItem) => {
    if (isLocalPhoto(item)) {
      /*
       * LocalPhoto : on appelle removeLocalPhoto avec l'id string.
       * toggleFavorite ne fonctionne pas ici car LocalPhoto ≠ Photo API.
       */
      removeLocalPhoto(item.id);
    } else {
      /*
       * Photo API : toggleFavorite gère l'ajout ET le retrait.
       * Ici l'item est forcément en favori (on est dans FavoritesScreen),
       * donc toggleFavorite va le retirer.
       */
      toggleFavorite(item);
    }
  };

  // Tap sur le FAB "+" : ouvre la galerie et ajoute la photo sélectionnée
  const handleAddPhoto = async () => {
    const uri = await pickImage();

    if (uri) {
      // pickImage() a retourné une URI → on ajoute la photo aux favoris
      addLocalPhoto(uri);
      // Pas d'Alert : l'apparition de la carte dans la liste est le feedback
    }
    // Si uri est null : l'utilisateur a annulé ou la permission a été refusée
    // (pickImage() a déjà affiché l'Alert dans ce cas)
  };

  // Détermine la source d'image à passer à PhotoCard selon le type de photo
  const getImageSource = (item: FavoriteItem): string => {
    if (isLocalPhoto(item)) {
      return item.uri;          // chemin local sur l'appareil
    }
    return item.thumbnailUrl;   // miniature depuis l'API
  };

  // Sous-titre dynamique du SectionHeader
  const subtitle =
    favorites.length === 0
      ? "Aucun favori pour l'instant"
      : `${favorites.length} photo${favorites.length > 1 ? 's' : ''} sauvegardée${favorites.length > 1 ? 's' : ''}`;

  return (
    /*
     * position: 'relative' (valeur par défaut) est important ici :
     * le bouton AddPhotoButton utilise position:'absolute', et il se
     * positionne par rapport au premier ancêtre avec position non-static.
     * En React Native, toutes les View ont position:'relative' par défaut. ✓
     */
    <View style={styles.screen}>

      <SectionHeader
        title="Mes favoris"
        subtitle={subtitle}
        rightElement={<Badge count={favorites.length} />}
      />

      {favorites.length === 0 ? (
        <EmptyState
          icon="🖼️"
          title="Aucun favori pour l'instant"
          subtitle={"Appuie sur le 🤍 dans le feed\nou sur + pour ajouter une photo depuis ta galerie."}
        />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        >
          {favorites.map((item) => (
            <View key={item.id} style={styles.cardWrapper}>
              <PhotoCard
                photo={item}
                imageSource={getImageSource(item)}
                isLocal={isLocalPhoto(item)}
                isFavorite={isFavorite(item.id)}
                onPress={() => Alert.alert('📷 Photo', item.title)}
                onFavoritePress={() => handleRemoveFavorite(item)}
              />
              <Text style={styles.dateAdded}>
                Ajouté le{' '}
                {new Date(item.dateAdded).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </Text>
            </View>
          ))}

          {/* Espace en bas pour que le FAB ne cache pas la dernière carte */}
          <View style={styles.fabSpacer} />
        </ScrollView>
      )}

      {/*
        AddPhotoButton est rendu EN DEHORS du ScrollView mais DANS la View principale.
        Grâce à position:'absolute', il flotte par-dessus le contenu scrollable.
        C'est le pattern standard pour un FAB en React Native.
      */}
      <AddPhotoButton onPress={handleAddPhoto} isLoading={isLoading} />

    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },

  listContent: {
    padding: 16,
    paddingBottom: 16,
    gap: 12,
  },

  cardWrapper: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },

  dateAdded: {
    fontSize: 11,
    color: '#9ca3af',
    paddingHorizontal: 10,
    paddingBottom: 8,
    fontStyle: 'italic',
  },

  // Espace en bas de la liste pour éviter que le FAB cache le dernier élément
  fabSpacer: {
    height: 80,
  },
});
