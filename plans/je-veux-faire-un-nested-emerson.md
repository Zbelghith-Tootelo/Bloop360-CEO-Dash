# Plan — Graphe comparatif d'équipes pour le CEO

## Context

Actuellement le graphe affiche les données personnelles du chef d'équipe quand il est sélectionné, alors que le CEO veut voir les résultats **agrégés de son équipe**. De plus, le graphe linéaire actuel (tendance mensuelle) n't est pas le meilleur affichage pour comparer 2 équipes sur l'ensemble de leurs métriques en un coup d'œil.

---

## Recommandation de visualisation

### Problème du graphe linéaire actuel
- Il montre une seule valeur "score global" par mois par personne — pas les 6 métriques distinctes
- Comparer 2 équipes sur 6 axes simultanément est illisible avec des lignes

### Meilleur affichage : **Radar Chart (graphe en toile d'araignée)**
- Les 6 métriques (Bienveillance, Apport, Positivisme, Accomplissement, Bien-être, Plaisir) forment les 6 axes
- Chaque équipe/personne = un polygone de couleur différente, superposés
- Le CEO voit immédiatement : quelle équipe est la plus forte sur quel axe, et laquelle est la plus "équilibrée"
- Parfait pour 2–4 comparaisons simultanées

### Layout final
```
[ Radar Chart — comparatif des métriques ]   (remplace le graphe linéaire en haut)
[ Tableau interactif avec checkboxes ]         (inchangé en bas)
```

> Le graphe linéaire (tendances mensuelles) peut être conservé comme onglet optionnel ou supprimé si le CEO ne l'utilise pas.

---

## Changements techniques

### 1. Données : Sélection chef d'équipe = moyenne de l'équipe

**Fichier : `src/app/App.tsx`**

Ajouter une fonction `computeTeamData(team: Employee): Employee` qui :
- Calcule la **moyenne** de toutes les métriques des membres (`metrics.bienveillance`, etc.)
- Calcule la **moyenne** des `monthlyData` mois par mois
- Retourne un objet `Employee` synthétique représentant l'équipe
- Si le chef n'a pas de membres → utilise ses propres données

```typescript
function computeTeamAverage(team: Employee): Employee {
  if (!team.members || team.members.length === 0) return team;
  const n = team.members.length;
  return {
    ...team,
    metrics: {
      bienveillance:    avg(team.members.map(m => m.metrics.bienveillance)),
      apport:           avg(team.members.map(m => m.metrics.apport)),
      positivite:       avg(team.members.map(m => m.metrics.positivite)),
      accomplissement:  avg(team.members.map(m => m.metrics.accomplissement)),
      bienEtre:         avg(team.members.map(m => m.metrics.bienEtre)),
      plaisir:          avg(team.members.map(m => m.metrics.plaisir)),
      enps: "N/A",
    },
    monthlyData: MONTHS.map((_, i) => avg(team.members!.map(m => m.monthlyData[i]))),
  };
}
```

### 2. Remplacer le graphe linéaire par un Radar Chart (recharts)

**Fichier : `src/app/App.tsx`** — section chart en haut

Utiliser `recharts` (déjà installé) : `RadarChart`, `Radar`, `PolarGrid`, `PolarAngleAxis`, `PolarRadiusAxis`, `Legend`, `Tooltip`.

**Structure des données radar :**
```typescript
const radarData = [
  { metric: "Bienveillance",    "Élodie Moreau": 9.05, "Camille Lefèvre": 8.16 },
  { metric: "Apport",           "Élodie Moreau": 8.16, "Camille Lefèvre": 7.80 },
  { metric: "Positivisme",      ... },
  { metric: "Accomplissement",  ... },
  { metric: "Bien être",        ... },
  { metric: "Plaisir au travail", ... },
];
```

Un `<Radar>` par équipe/personne sélectionnée, avec `fill` et `stroke` = couleur assignée, `fillOpacity: 0.15`.

**Tooltip custom** : au survol d'un axe, affiche les valeurs de toutes les équipes sélectionnées pour cette métrique.

### 3. Légende colorée dans le graphe

Afficher en haut du radar chart les badges colorés des équipes/membres sélectionnés (comme les pills actuels mais dynamiques).

---

## Fichiers à modifier

| Fichier | Changement |
|---|---|
| `src/app/App.tsx` | Tout : `computeTeamAverage`, `radarData` memo, composant `RadarChart` recharts, remplacement du `<AgCharts>` |

---

## Ce qui ne change pas

- La logique checkbox du tableau (selectedIds, assignedColors, colorIndex)
- Le système de couleurs par équipe
- L'expand/collapse des équipes
- Le bouton "Sélect. tout" / "Désélect. tout"
- Les tooltips du tableau

---

## Vérification

1. Sélectionner 2 chefs d'équipe → le radar affiche 2 polygones colorés, chacun représentant la **moyenne de leur équipe** (pas leurs résultats personnels)
2. Déselectionner un chef → son polygone disparaît du radar
3. Sélectionner 2 membres individuels → le radar affiche leurs métriques personnelles superposées
4. Le tooltip du radar montre les valeurs de toutes les équipes pour la métrique survolée
5. La légende du radar indique clairement les noms et couleurs
