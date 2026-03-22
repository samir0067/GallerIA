/**
 * screens/FeedScreen.tsx
 *
 * Écran principal : affiche la grille de 30 photos chargées depuis l'API.
 * Tap sur une carte → navigation vers PhotoDetailScreen (Stack Navigator).
 *
 * --- FlatList vs ScrollView : pourquoi ce changement ? ---
 *
 * ScrollView charge TOUS les éléments en mémoire dès le départ.
 * Avec 30 photos c'est acceptable, mais avec 500 ou 5000, les performances
 * s'effondrent : tout est rendu, tout occupe de la mémoire, même hors écran.
 *
 * FlatList est "virtualisée" : elle ne rend QUE les éléments visibles à l'écran
 * (+ quelques au-dessus/en-dessous en réserve). Les éléments qui sortent
 * de l'écran sont détruits et recréés à la volée. Résultat : mémoire constante
 * quelle que soit la taille de la liste. C'est le composant recommandé
 * pour toutes les listes de contenu dynamique en React Native.
 *
 * Notions abordées :
 *   - FlatList avec numColumns={2} pour une grille 2 colonnes
 *   - useNavigation() pour naviguer depuis un écran
 *   - Composition de hooks : usePhotos + useFavorites
 */

import React from 'react';
import {
  View,
  Text,
  FlatList,
  Alert,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Photo } from '../types';
import { PhotoCard } from '../components/PhotoCard';
import { SectionHeader } from '../components/SectionHeader';
import { Loader } from '../components/Loader';
import { ErrorMessage } from '../components/ErrorMessage';
import { usePhotos } from '../hooks/usePhotos';
import { useFavorites } from '../hooks/useFavorites';
import { FeedStackNavigationProp } from '../navigation/types';

// --- Calcul de la largeur des cartes ---
const SCREEN_WIDTH = Dimensions.get('window').width;
const HORIZONTAL_PADDING = 12;
const CARD_GAP = 10;
// Chaque carte prend flex:1 dans sa colonne — CARD_WIDTH est utilisé comme référence
// pour les styles, mais avec FlatList numColumns la largeur est gérée par flex:1
const CARD_WIDTH = (SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - CARD_GAP) / 2;

export function FeedScreen() {
  /*
   * useNavigation() retourne l'objet navigation de React Navigation.
   * On le type avec FeedStackNavigationProp<'FeedMain'> pour que TypeScript
   * valide les appels à navigation.navigate() : noms d'écrans et params vérifiés.
   */
  const navigation = useNavigation<FeedStackNavigationProp<'FeedMain'>>();

  const { photos, loading, error, reload } = usePhotos();
  const { favorites, isFavorite, toggleFavorite } = useFavorites();

  // Tap sur le cœur : toggle favori + Alert si ajout
  const handleFavoritePress = (photo: Photo) => {
    const wasAlreadyFavorite = isFavorite(photo.id);
    toggleFavorite(photo);
    if (!wasAlreadyFavorite) {
      Alert.alert('Favori ajouté !', `"${photo.title}" sauvegardé ❤️`);
    }
  };

  // Tap sur une carte : navigation vers le détail
  const handleCardPress = (photo: Photo) => {
    /*
     * navigation.navigate() empile PhotoDetailScreen sur FeedScreen.
     * Le deuxième argument est l'objet params — TypeScript vérifie
     * que { photoId: number } correspond à FeedStackParamList['PhotoDetail'].
     */
    navigation.navigate('PhotoDetail', { photoId: photo.id });
  };

  return (
    <View style={styles.screen}>

      {/* Bandeau indigo — toujours visible, même pendant loading/error */}
      <View style={styles.headerBand}>
        <Text style={styles.headerTitle}>🖼️ GallerIA</Text>
        <Text style={styles.headerSubtitle}>
          {photos.length} photo{photos.length !== 1 ? 's' : ''} · {favorites.length} favori{favorites.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Rendu conditionnel : loading → error → données */}
      {loading ? (
        <Loader />
      ) : error ? (
        <ErrorMessage message={error} onRetry={reload} />
      ) : (
        /*
         * FlatList remplace ScrollView + flexWrap.
         *
         * Props clés :
         *   data          → tableau de données (les photos)
         *   numColumns    → nombre de colonnes (2 pour notre grille)
         *   keyExtractor  → clé unique par item (indispensable pour les performances)
         *   renderItem    → composant rendu pour chaque item
         *   columnWrapperStyle → style appliqué à chaque LIGNE (gap + padding horizontal)
         *   ItemSeparatorComponent → rendu entre chaque LIGNE (espace vertical)
         *   ListHeaderComponent   → rendu UNE FOIS avant la liste (SectionHeader)
         */
        <FlatList
          data={photos}
          numColumns={2}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            /*
             * Chaque item a flex:1 → prend 50% de la ligne automatiquement.
             * Pas besoin de CARD_WIDTH ici : FlatList gère la répartition
             * entre les colonnes via flexbox.
             */
            <View style={styles.cardWrapper}>
              <PhotoCard
                photo={item}
                imageSource={item.thumbnailUrl}  // Photo API → miniature 150×150
                isLocal={false}
                isFavorite={isFavorite(item.id)}
                onPress={() => handleCardPress(item)}
                onFavoritePress={() => handleFavoritePress(item)}
              />
            </View>
          )}
          columnWrapperStyle={styles.row}
          ItemSeparatorComponent={() => <View style={{ height: CARD_GAP }} />}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <SectionHeader
              title="Découvrir"
              subtitle={`${photos.length} photos depuis l'API`}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  // Conteneur principal
  screen: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },

  // Bandeau coloré en haut
  headerBand: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },

  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.5,
  },

  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.75)',
    marginTop: 4,
  },

  // Contenu scrollable de la FlatList
  listContent: {
    paddingBottom: 32,
  },

  // Style de chaque LIGNE de la grille (2 cartes côte à côte)
  row: {
    paddingHorizontal: HORIZONTAL_PADDING,
    gap: CARD_GAP,
  },

  // Chaque item prend 50% de la ligne (flex:1 sur 2 colonnes = 50%)
  cardWrapper: {
    flex: 1,
  },
});
