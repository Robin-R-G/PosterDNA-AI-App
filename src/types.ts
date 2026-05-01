/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Page = 'home' | 'projects' | 'ai-studio' | 'memory' | 'profile' | 'analyzer' | 'fusion';

export type ProjectStatus = 'ANALYZED' | 'GENERATED' | 'DNA MAPPED' | 'DRAFT';

export interface Face {
  id: string;
  name: string;
  priority: number;
  isHero: boolean;
  box?: [number, number, number, number]; // [top, left, bottom, right]
}

export interface Layer {
  id: string;
  type: 'background' | 'text' | 'portrait' | 'shape' | 'logo' | 'footer';
  content: string;
  style: Record<string, any>;
  isHidden: boolean;
  isLocked: boolean;
}

export interface DesignCritique {
  score: number;
  suggestions: {
    id: string;
    category: 'layout' | 'typography' | 'color' | 'spacing' | 'portrait' | 'readability';
    text: string;
    impact: 'high' | 'medium' | 'low';
  }[];
  analysis: {
    layout: string;
    spacing: string;
    typography: string;
    colorHarmony: string;
    portraitBalance: string;
    brandConsistency: string;
    readability: string;
    footerClarity: string;
  };
}

export interface DNAAnalysis {
  text: {
    titles: string[];
    subtitles: string[];
    phoneNumbers: string[];
    dates: string[];
    addresses: string[];
    ocrRaw: string;
  };
  faces: Face[];
  logos: string[];
  icons: string[];
  shapes: string[];
  gradients: string[];
  colors: string[];
  hierarchy: string;
  layers: Layer[];
  score?: number;
}

export interface Project {
  id: string;
  title: string;
  editedAt: string;
  tokens?: number;
  quality?: string;
  layers?: number;
  status: ProjectStatus;
  imageUrl: string;
}

export interface BrandIdentity {
  id: string;
  name: string;
  tags: string[];
  imageUrl: string;
  colors: string[];
  userId?: string;
  createdAt?: any;
  dna?: {
    gradients: string[];
    accentColors: string[];
    typography: {
      primary: string;
      secondary: string;
      malayalamStyle: string;
    };
    composition: {
      heroPosition: string;
      portraitStyle: string;
      footerStructure: string;
      logoPosition: string;
    };
    effects: {
      glow: string;
      shadow: string;
    };
  };
}
