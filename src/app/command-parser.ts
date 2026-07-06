export interface GridCommand {
  type: 'row' | 'column' | 'cell' | 'all' | 'clear' | 'unknown';
  row?: number;
  col?: number;
  color?: string;
}

const FRENCH_COLORS: Record<string, string> = {
  'rouge': 'red',
  'bleu': 'blue',
  'bleue': 'blue',
  'vert': 'green',
  'verte': 'green',
  'jaune': 'yellow',
  'orange': 'orange',
  'violet': 'purple',
  'violette': 'purple',
  'rose': 'pink',
  'noir': 'black',
  'noire': 'black',
  'blanc': 'white',
  'blanche': 'white',
  'gris': 'grey',
  'grise': 'grey',
  'marron': 'brown',
  'turquoise': 'turquoise',
  'cyan': 'cyan'
};

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // strip accents (é -> e, etc.)
}

function resolveColor(word: string): string {
  const normalized = normalize(word);
  return FRENCH_COLORS[normalized] || word; // fallback: use as-is (works for "red", "#ff0000", etc.)
}

export function parseGridCommand(input: string): GridCommand {
  const text = normalize(input.trim());

  // "efface tout" / "efface la grille" / "vide la grille"
  if (/^(efface|vide|reinitialise|nettoie)/.test(text)) {
    return { type: 'clear' };
  }

  // "remplis la case ligne X colonne Y en COULEUR"
  let match = text.match(/case\s+ligne\s+(\d+)\s+colonne\s+(\d+)\s+en\s+(\w+)/);
  if (match) {
    return {
      type: 'cell',
      row: parseInt(match[1], 10) - 1, // convert to 0-indexed
      col: parseInt(match[2], 10) - 1,
      color: resolveColor(match[3])
    };
  }

  // "remplis toute la grille en COULEUR"
  match = text.match(/toute?\s+la\s+grille\s+en\s+(\w+)/);
  if (match) {
    return { type: 'all', color: resolveColor(match[1]) };
  }

  // "remplis la ligne X en COULEUR"
  match = text.match(/ligne\s+(\d+)\s+en\s+(\w+)/);
  if (match) {
    return {
      type: 'row',
      row: parseInt(match[1], 10) - 1,
      color: resolveColor(match[2])
    };
  }

  // "remplis la colonne X en COULEUR"
  match = text.match(/colonne\s+(\d+)\s+en\s+(\w+)/);
  if (match) {
    return {
      type: 'column',
      col: parseInt(match[1], 10) - 1,
      color: resolveColor(match[2])
    };
  }

  return { type: 'unknown' };
}