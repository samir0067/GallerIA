/**
 * screens/SettingsScreen.tsx
 *
 * Écran de paramètres de GallerIA.
 * Organisé en sections : Apparence | Données | À propos.
 *
 * --- Ce qu'on apprend dans cet écran ---
 *
 * 1. Switch — composant React Native pour les bascules on/off.
 *    Différent d'un bouton : son état (value) doit être contrôlé
 *    par un state React, et onValueChange met à jour ce state.
 *
 * 2. AsyncStorage (deuxième usage) — on persiste la préférence
 *    de mode sombre exactement comme les favoris, avec la même
 *    clé-valeur simple.
 *
 * 3. Confirmation avant action destructive — Alert.alert() avec
 *    deux boutons ("Annuler" + "Vider") est le pattern standard
 *    avant toute suppression de données.
 *
 * 4. Sections avec séparateurs — pattern courant dans les apps
 *    iOS/Android : titre de section en gris + cartes blanches.
 *
 * Notions abordées :
 *   - Switch : composant de bascule natif
 *   - Alert.alert() avec boutons personnalisés et style "destructive"
 *   - AsyncStorage pour des préférences simples (clé string)
 *   - ScrollView pour les contenus qui peuvent déborder l'écran
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Switch,
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFavorites } from '../hooks/useFavorites';

/** Clé AsyncStorage pour la préférence de mode sombre */
const DARK_MODE_KEY = '@galleria_dark_mode';

export function SettingsScreen() {
  const { favorites, clearFavorites } = useFavorites();

  /*
   * isDarkMode — préférence de l'utilisateur persistée dans AsyncStorage.
   * On la charge au montage (useEffect []) et on la sauvegarde à chaque toggle.
   *
   * Note pédagogique : dans une vraie app, on connecterait cette valeur à un
   * ThemeContext pour que l'UI change réellement. Ici, on se concentre sur
   * la mécanique de persistance et le composant Switch.
   */
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Chargement de la préférence au montage — même pattern qu'en FavoritesContext
  useEffect(() => {
    AsyncStorage.getItem(DARK_MODE_KEY).then((value) => {
      if (value !== null) {
        // La valeur stockée est "true" ou "false" (string)
        setIsDarkMode(value === 'true');
      }
    });
  }, []);

  // Sauvegarde à chaque toggle
  const handleDarkModeToggle = (value: boolean) => {
    setIsDarkMode(value);
    // AsyncStorage ne stocke que des strings — on convertit le booléen
    AsyncStorage.setItem(DARK_MODE_KEY, value.toString()).catch((err) => {
      console.warn('[SettingsScreen] Erreur sauvegarde dark mode :', err);
    });
  };

  // Confirmation avant vidage des favoris
  const handleClearFavorites = () => {
    /*
     * Alert.alert(titre, message, boutons[])
     *
     * Le style "destructive" colore le bouton en rouge sur iOS —
     * signal visuel clair pour une action irréversible.
     * Sur Android, il n'a pas d'effet visuel mais reste sémantiquement correct.
     */
    Alert.alert(
      'Vider les favoris',
      `Tu vas supprimer ${favorites.length} photo${favorites.length > 1 ? 's' : ''}. Cette action est irréversible.`,
      [
        {
          text: 'Annuler',
          style: 'cancel', // bouton annulation — mis en avant sur iOS
        },
        {
          text: 'Vider',
          style: 'destructive', // rouge sur iOS
          onPress: () => {
            clearFavorites();
            // Feedback minimaliste : pas d'Alert après suppression,
            // la section "Données" se met à jour automatiquement (favorites.length → 0)
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >

      {/* ── Section Apparence ── */}
      <Text style={styles.sectionTitle}>Apparence</Text>
      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <Text style={styles.rowIcon}>🌙</Text>
            <View>
              <Text style={styles.rowLabel}>Mode sombre</Text>
              <Text style={styles.rowSublabel}>Fonctionnalité à venir</Text>
            </View>
          </View>
          {/*
           * Switch — composant de bascule natif.
           * Props essentielles :
           *   value         → état actuel (contrôlé par React)
           *   onValueChange → appelée avec le NOUVEAU booléen quand l'utilisateur toggle
           *   trackColor    → couleur de la piste (off et on séparément)
           *   thumbColor    → couleur du rond (Android uniquement — iOS l'ignore)
           */}
          <Switch
            value={isDarkMode}
            onValueChange={handleDarkModeToggle}
            trackColor={{ false: '#d1d5db', true: '#818cf8' }}
            thumbColor={
              Platform.OS === 'android'
                ? isDarkMode ? '#6366f1' : '#f3f4f6'
                : undefined // iOS gère sa propre couleur
            }
          />
        </View>
      </View>

      {/* ── Section Données ── */}
      <Text style={styles.sectionTitle}>Données</Text>
      <View style={styles.card}>

        {/* Affichage du nombre de favoris — se met à jour en temps réel */}
        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <Text style={styles.rowIcon}>❤️</Text>
            <Text style={styles.rowLabel}>Favoris sauvegardés</Text>
          </View>
          <Text style={styles.rowValue}>
            {favorites.length}
          </Text>
        </View>

        <View style={styles.separator} />

        {/*
         * Bouton "Vider les favoris" — désactivé (grisé) si aucun favori.
         * disabled={favorites.length === 0} : React Native gère l'état visuellement
         * en réduisant l'opacité sur iOS. Sur Android, on le gère manuellement
         * dans le style avec opacity.
         */}
        <TouchableOpacity
          style={[
            styles.row,
            styles.dangerRow,
            favorites.length === 0 && styles.rowDisabled,
          ]}
          onPress={handleClearFavorites}
          disabled={favorites.length === 0}
        >
          <View style={styles.rowLeft}>
            <Text style={styles.rowIcon}>🗑️</Text>
            <View>
              <Text style={[
                styles.rowLabel,
                styles.dangerLabel,
                favorites.length === 0 && styles.rowLabelDisabled,
              ]}>
                Vider les favoris
              </Text>
              {favorites.length === 0 && (
                <Text style={styles.rowSublabel}>Aucun favori à supprimer</Text>
              )}
            </View>
          </View>
        </TouchableOpacity>

      </View>

      {/* ── Section À propos ── */}
      <Text style={styles.sectionTitle}>À propos</Text>
      <View style={styles.card}>

        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <Text style={styles.rowIcon}>📱</Text>
            <Text style={styles.rowLabel}>Application</Text>
          </View>
          <Text style={styles.rowValue}>GallerIA</Text>
        </View>

        <View style={styles.separator} />

        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <Text style={styles.rowIcon}>🔖</Text>
            <Text style={styles.rowLabel}>Version</Text>
          </View>
          <Text style={styles.rowValue}>1.0.0</Text>
        </View>

        <View style={styles.separator} />

        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <Text style={styles.rowIcon}>🌐</Text>
            <Text style={styles.rowLabel}>API</Text>
          </View>
          <Text style={styles.rowValue}>JSONPlaceholder</Text>
        </View>

        <View style={styles.separator} />

        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <Text style={styles.rowIcon}>💾</Text>
            <Text style={styles.rowLabel}>Persistance</Text>
          </View>
          <Text style={styles.rowValue}>AsyncStorage</Text>
        </View>

      </View>

      {/* Petit texte de bas de page */}
      <Text style={styles.footer}>
        Projet pédagogique — Bachelor 2 React Native
      </Text>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },

  content: {
    padding: 16,
    paddingBottom: 40,
    gap: 8,
  },

  // Titre de section (ex: "Apparence", "Données")
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 8,
    marginBottom: 4,
    marginLeft: 4,
  },

  // Carte blanche qui regroupe les lignes d'une section
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },

  // Ligne individuelle dans une carte
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 52,
  },

  // Partie gauche d'une ligne (icône + texte)
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },

  rowIcon: {
    fontSize: 18,
    width: 24,
    textAlign: 'center',
  },

  rowLabel: {
    fontSize: 15,
    color: '#111827',
    fontWeight: '500',
  },

  rowSublabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },

  // Valeur affichée à droite (nombre, texte info)
  rowValue: {
    fontSize: 15,
    color: '#6b7280',
    fontWeight: '400',
  },

  // Séparateur entre les lignes d'une carte
  separator: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginLeft: 52, // aligné avec le texte (après l'icône)
  },

  // Style spécifique pour la ligne "Vider les favoris"
  dangerRow: {
    // pas de style supplémentaire nécessaire — le label porte la couleur danger
  },

  dangerLabel: {
    color: '#ef4444', // rouge
  },

  // État désactivé (aucun favori)
  rowDisabled: {
    opacity: 0.4,
  },

  rowLabelDisabled: {
    color: '#9ca3af', // gris au lieu de rouge
  },

  footer: {
    textAlign: 'center',
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 16,
    fontStyle: 'italic',
  },
});
