/**
 * screens/FavoritesScreen.tsx
 *
 * Écran des favoris : affiche la liste des photos sauvegardées par l'utilisateur.
 * Utilise useFavorites() qui lit depuis le même FavoritesContext que FeedScreen.
 * Les deux écrans sont ainsi SYNCHRONISÉS : un favori ajouté dans Feed
 * apparaît instantanément ici, sans aucune communication directe entre eux.
 *
 * Notions abordées :
 *   - Rendu conditionnel : liste ou état vide
 *   - Même hook, même Context → état partagé en temps réel
 *   - ScrollView pour une liste verticale
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
  StyleSheet,
} from 'react-native';
import { FavoriteItem } from '../types';
import { SectionHeader } from '../components/SectionHeader';
import { EmptyState } from '../components/EmptyState';
import { Badge } from '../components/Badge';
import { PhotoCard } from '../components/PhotoCard';
import { useFavorites } from '../hooks/useFavorites';

export function FavoritesScreen() {
  /*
   * useFavorites() lit depuis le MÊME contexte que FeedScreen.
   * Quand l'utilisateur ajoute un favori dans Feed, favorites se met
   * à jour ici automatiquement — c'est la magie du Context partagé.
   */
  const { favorites, isFavorite, toggleFavorite } = useFavorites();

  // Retrait d'un favori depuis cet écran
  const handleRemoveFavorite = (item: FavoriteItem) => {
    toggleFavorite(item);
    // Pas d'Alert ici : la disparition de la carte est le feedback visuel
  };

  // Sous-titre dynamique du SectionHeader
  const subtitle =
    favorites.length === 0
      ? 'Aucun favori pour l\'instant'
      : `${favorites.length} photo${favorites.length > 1 ? 's' : ''} sauvegardée${favorites.length > 1 ? 's' : ''}`;

  return (
    <View style={styles.screen}>

      {/*
        SectionHeader avec Badge comme rightElement.
        favorites.length se met à jour en temps réel grâce au Context.
      */}
      <SectionHeader
        title="Mes favoris"
        subtitle={subtitle}
        rightElement={<Badge count={favorites.length} />}
      />

      {/*
        Rendu conditionnel :
        - Si la liste est vide → EmptyState guide l'utilisateur
        - Sinon → liste scrollable des photos favorites
      */}
      {favorites.length === 0 ? (
        // État vide : aucun favori sauvegardé
        <EmptyState
          icon="❤️"
          title="Aucun favori pour l'instant"
          subtitle={"Appuie sur le 🤍 d'une photo dans le feed\npour la sauvegarder ici."}
        />
      ) : (
        // Liste des favoris : une carte par ligne (layout vertical)
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        >
          {/*
            Note : on affiche une carte par ligne (pas de grille 2 colonnes).
            Cela contraste avec FeedScreen et montre qu'un même composant
            PhotoCard peut s'utiliser dans des layouts différents.
          */}
          {favorites.map((item) => (
            <View key={item.id} style={styles.cardWrapper}>
              <PhotoCard
                photo={item}
                isFavorite={isFavorite(item.id)}  // toujours true ici, mais on reste cohérent
                onPress={() => Alert.alert('📷 Photo', item.title)}
                onFavoritePress={() => handleRemoveFavorite(item)}
              />
              {/* Affiche la date d'ajout en bas de chaque carte */}
              <Text style={styles.dateAdded}>
                Ajouté le {new Date(item.dateAdded).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </Text>
            </View>
          ))}
        </ScrollView>
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

  // Conteneur scrollable de la liste — colonne simple (pas de grille)
  listContent: {
    padding: 16,
    paddingBottom: 32,
    gap: 12,
  },

  // Chaque élément favori : carte + date
  cardWrapper: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
    // Légère ombre pour délimiter les cartes
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },

  // Date d'ajout affichée sous l'image
  dateAdded: {
    fontSize: 11,
    color: '#9ca3af',
    paddingHorizontal: 10,
    paddingBottom: 8,
    fontStyle: 'italic',
  },
});
