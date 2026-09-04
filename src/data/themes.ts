import { ThemeOption } from '../types';

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'herbarium',
    name: 'Editorial Herbarium',
    subtitle: 'Warm Paper & Wine Rose',
    category: 'Light',
    description: 'Exact reference design palette: warm paper canvas, wine rose accents, maritime sage, and delicate organic borders.',
    previewColors: {
      surface: '#fff8f5',
      container: '#ffeada',
      primary: '#7c2538',
      secondary: '#566153',
      border: '#dbc0c2'
    }
  },
  {
    id: 'oceanic',
    name: 'Oceanic Hydrographic',
    subtitle: 'Coastal Mist & Deep Navy',
    category: 'Light',
    description: 'Nautical hydrographic chart theme with deep maritime navy, seafoam cyan, and ocean azure accents.',
    previewColors: {
      surface: '#f0f7fa',
      container: '#e0eff7',
      primary: '#0a4b78',
      secondary: '#0d9488',
      border: '#b2d4e8'
    }
  },
  {
    id: 'tactical',
    name: 'Coast Guard Tactical',
    subtitle: 'Chart Sand & Bronze Amber',
    category: 'Light',
    description: 'Military coastal patrol aesthetic inspired by navigational charts, brass bronze amber, and olive green highlights.',
    previewColors: {
      surface: '#faf8f2',
      container: '#f0ece0',
      primary: '#92400e',
      secondary: '#4d7c0f',
      border: '#d6ccbd'
    }
  },
  {
    id: 'slate',
    name: 'International Maritime',
    subtitle: 'Crisp Slate & Cobalt Blue',
    category: 'Light',
    description: 'Clean modern international port authority theme with cool slate, cobalt blue, and crisp minimalist geometry.',
    previewColors: {
      surface: '#f8fafc',
      container: '#f1f5f9',
      primary: '#1e3a8a',
      secondary: '#059669',
      border: '#cbd5e1'
    }
  },
  {
    id: 'radar_dark',
    name: 'Surveillance Night Ops',
    subtitle: 'Obsidian & Radar Cyan',
    category: 'Dark',
    description: 'Deep midnight operations console with phosphor radar cyan, warning rose, and high-contrast telemetry readings.',
    previewColors: {
      surface: '#12161c',
      container: '#1b2129',
      primary: '#38bdf8',
      secondary: '#34d399',
      border: '#343e4d'
    }
  }
];
