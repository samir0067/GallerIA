/**
 * components/SectionHeader.tsx
 *
 * Composant réutilisable qui affiche un titre de section avec une barre colorée à gauche.
 * Ce pattern "section header" est très courant dans les apps mobiles pour
 * séparer visuellement des blocs de contenu.
 *
 * Props :
 *   - title       : le texte principal du titre (obligatoire)
 *   - subtitle    : texte secondaire affiché en dessous (optionnel)
 *   - rightElement: n'importe quel composant React affiché à droite du titre (optionnel)
 *                   → permet de passer un Badge, un bouton, un lien, etc.
 *
 * Notion clé : la prop "rightElement" est de type ReactNode, ce qui signifie
 * qu'elle peut accueillir n'importe quel élément JSX — c'est la composition en React.
 */

import React, { ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';

type Props = {
  title: string;
  subtitle?: string;
  rightElement?: ReactNode;
};

export function SectionHeader({ title, subtitle, rightElement }: Props) {
  return (
    <View style={styles.container}>

      {/* Partie gauche : barre décorative + textes */}
      <View style={styles.left}>

        {/* Barre colorée verticale — illustre l'utilisation de width + borderRadius */}
        <View style={styles.bar} />

        {/* Bloc texte : titre et sous-titre empilés verticalement */}
        <View style={styles.textBlock}>
          <Text style={styles.title}>{title}</Text>
          {/* Rendu conditionnel : le sous-titre n'apparaît que si la prop est fournie */}
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>

      </View>

      {/*
        Partie droite : rightElement est affiché ici seulement s'il est fourni.
        Exemples d'utilisation :
          <SectionHeader title="Mes favoris" rightElement={<Badge count={3} />} />
          <SectionHeader title="Photos" rightElement={<TouchableOpacity>...</TouchableOpacity>} />
      */}
      {rightElement ? <View style={styles.right}>{rightElement}</View> : null}

    </View>
  );
}

const styles = StyleSheet.create({
  // Ligne horizontale : barre + textes à gauche, élément optionnel à droite
  container: {
    flexDirection: 'row',       // enfants côte à côte (→)
    alignItems: 'center',       // centrage vertical des enfants
    justifyContent: 'space-between', // pousse rightElement à l'extrémité droite
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  // Groupe gauche : barre colorée + bloc de textes
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,                    // prend tout l'espace disponible (sauf rightElement)
  },

  // Barre décorative verticale à gauche du titre
  bar: {
    width: 4,
    height: 24,
    backgroundColor: '#6366f1',
    borderRadius: 2,
  },

  // Conteneur des textes (colonne : titre au-dessus, sous-titre en dessous)
  textBlock: {
    flexDirection: 'column',
    flexShrink: 1,              // empêche le texte de dépasser sur rightElement
  },

  // Titre principal en gras
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: 0.2,
  },

  // Sous-titre secondaire, plus petit et discret
  subtitle: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },

  // Conteneur de l'élément à droite (Badge, bouton, etc.)
  right: {
    marginLeft: 8,
  },
});
