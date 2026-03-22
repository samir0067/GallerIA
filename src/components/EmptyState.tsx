/**
 * components/EmptyState.tsx
 *
 * Composant réutilisable pour afficher un état "liste vide".
 * Ce pattern est incontournable dans les apps mobiles : quand une liste
 * n'a pas encore de contenu, on guide l'utilisateur plutôt que d'afficher
 * un écran blanc sans explication.
 *
 * Props :
 *   - icon        : emoji affiché en grand au centre (ex: "❤️", "📷")
 *   - title       : titre du message vide (obligatoire)
 *   - subtitle    : description supplémentaire (obligatoire)
 *   - actionLabel : texte du bouton d'action (optionnel)
 *   - onAction    : callback appelé au tap du bouton (optionnel)
 *
 * Note : si actionLabel est fourni sans onAction (ou vice versa),
 * le bouton n'est pas affiché — les deux props vont de pair.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

type Props = {
  icon: string;
  title: string;
  subtitle: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ icon, title, subtitle, actionLabel, onAction }: Props) {
  // Le bouton ne s'affiche que si les deux props sont fournies
  const showAction = Boolean(actionLabel && onAction);

  return (
    <View style={styles.container}>

      {/* Grande icône décorative */}
      <Text style={styles.icon}>{icon}</Text>

      {/* Titre du message */}
      <Text style={styles.title}>{title}</Text>

      {/* Description secondaire */}
      <Text style={styles.subtitle}>{subtitle}</Text>

      {/*
        Bouton d'action conditionnel.
        Pattern : {condition && <Composant />} → affiche le composant SEULEMENT si vrai.
      */}
      {showAction && (
        <TouchableOpacity style={styles.button} onPress={onAction}>
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  // Conteneur centré qui occupe tout l'espace disponible
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 40,         // compense visuellement le poids du contenu du haut
  },

  // Grosse icône emoji — illustre fontSize pour les emojis
  icon: {
    fontSize: 64,
    marginBottom: 20,
  },

  // Titre en gras, centré
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 10,
  },

  // Description secondaire, plus discrète
  subtitle: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },

  // Bouton d'action principal
  button: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 10,
    // Légère ombre pour donner du relief au bouton
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },

  // Texte du bouton
  buttonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 15,
  },
});
