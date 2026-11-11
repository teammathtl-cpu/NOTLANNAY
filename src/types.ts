export interface TouristLocation {
  id: string;
  label: string;
  fullName: string;
  category: string;
  description: string;
  shortIntro: string;
  imageUrl?: string;
  neighborhood: string;
  bestFor: string;
  highlights: string[];
  x: number;
  y: number;
  fullNameEn?: string;
  descriptionEn?: string;
  shortIntroEn?: string;
  neighborhoodEn?: string;
  bestForEn?: string;
  highlightsEn?: string[];
  googleMapsUrl?: string;
  images?: string[];
  lat: number;
  lng: number;
  displayOrder: number;
}

export interface Route {
  id: string;
  from: string;
  to: string;
  distanceKm: number;
  isArterial?: boolean;
}

export interface GraphData {
  locations: TouristLocation[];
  routes: Route[];
}

export interface PresetSelection {
  ids: string[];
  routeIds?: string[];
  label: string;
  desc: string;
  startId: string;
  endId?: string;
}

export type PresetSelectionMap = Record<string, PresetSelection>;

export type Language = 'vi' | 'en';

export type ModeType = 'cycle' | 'path' | 'subset';
export type StepType = 'select' | 'preview' | 'result';

export interface PathResult {
  path: string[];
  totalDistanceKm: number;
  steps: {
    from: TouristLocation;
    to: TouristLocation;
    distanceKm: number;
  }[];
}

export interface DijkstraStep {
  stepIndex: number;
  currentNode: string;
  visitedNodes: string[];
  distances: Record<string, number>;
  previous: Record<string, string | null>;
  explanationVi: string;
  explanationEn: string;
}

export interface AlternativePlan {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  path: string[];
  totalDistanceKm: number;
  rank?: number;
  diffKm?: number;
  diffPercent?: number;
  isOptimal?: boolean;
}
