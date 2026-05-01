/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Type } from "@google/genai";
import { DNAAnalysis, BrandIdentity, Layer, DesignCritique } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export const geminiService = {
  analyzePoster: async (base64Image: string, mimeType: string): Promise<DNAAnalysis> => {
    const prompt = `Analyze this poster image and extract its visual DNA for reconstruction.
    Support both English and Malayalam OCR.
    
    1. Extract Text Data: Titles, Subtitles, Phone numbers, Dates, Addresses, and a raw OCR dump.
    2. Detect Faces: For each person, provide a name (default 'Person N'), priority (1-10), and note if they are the primary subject (Hero).
    3. Identify Graphics: Logos, icons, shapes.
    4. Design Style: Gradients, color palette (hex), and layout hierarchy.
    5. Layer Reconstruction: Propose a set of layers (Background, Text, Portrait, Shape, Logo, Footer) to rebuild this design.
    
    Return the result as a raw JSON object matching the DNAAnalysis interface.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          parts: [
            { inlineData: { data: base64Image, mimeType } },
            { text: prompt }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            text: {
              type: Type.OBJECT,
              properties: {
                titles: { type: Type.ARRAY, items: { type: Type.STRING } },
                subtitles: { type: Type.ARRAY, items: { type: Type.STRING } },
                phoneNumbers: { type: Type.ARRAY, items: { type: Type.STRING } },
                dates: { type: Type.ARRAY, items: { type: Type.STRING } },
                addresses: { type: Type.ARRAY, items: { type: Type.STRING } },
                ocrRaw: { type: Type.STRING }
              },
              required: ["titles", "subtitles", "phoneNumbers", "dates", "addresses", "ocrRaw"]
            },
            faces: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  priority: { type: Type.NUMBER },
                  isHero: { type: Type.BOOLEAN }
                },
                required: ["id", "name", "priority", "isHero"]
              }
            },
            logos: { type: Type.ARRAY, items: { type: Type.STRING } },
            icons: { type: Type.ARRAY, items: { type: Type.STRING } },
            shapes: { type: Type.ARRAY, items: { type: Type.STRING } },
            gradients: { type: Type.ARRAY, items: { type: Type.STRING } },
            colors: { type: Type.ARRAY, items: { type: Type.STRING } },
            hierarchy: { type: Type.STRING },
            layers: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  type: { type: Type.STRING, enum: ["background", "text", "portrait", "shape", "logo", "footer"] },
                  content: { type: Type.STRING },
                  style: { type: Type.OBJECT },
                  isHidden: { type: Type.BOOLEAN },
                  isLocked: { type: Type.BOOLEAN }
                },
                required: ["id", "type", "content", "isHidden", "isLocked"]
              }
            }
          },
          required: ["text", "faces", "logos", "icons", "shapes", "gradients", "colors", "hierarchy", "layers"]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("No response from AI");
    }

    return JSON.parse(resultText.trim());
  },

  trainBrandDNA: async (images: { data: string, mimeType: string }[]): Promise<NonNullable<BrandIdentity['dna']>> => {
    const prompt = `You are a Brand Intelligence Engine. Analyze these ${images.length} reference posters to extract a unified "Brand DNA".
    Look for consistent patterns across all images:
    1. Gradients and Accent Colors.
    2. Typography: Identify the primary font style (modern, serif, etc.) and specific Malayalam stylistic traits.
    3. Composition: Where are heroes usually placed? What is the standard portrait style? How is the footer structured?
    4. Logo Position: Is there a consistent spot?
    5. Effects: Are there consistent use of glows or specific shadow styles?
    
    Return a unified Brand DNA object in JSON format.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          parts: [
            ...images.map(img => ({ inlineData: { data: img.data, mimeType: img.mimeType } })),
            { text: prompt }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            gradients: { type: Type.ARRAY, items: { type: Type.STRING } },
            accentColors: { type: Type.ARRAY, items: { type: Type.STRING } },
            typography: {
              type: Type.OBJECT,
              properties: {
                primary: { type: Type.STRING },
                secondary: { type: Type.STRING },
                malayalamStyle: { type: Type.STRING }
              },
              required: ["primary", "secondary", "malayalamStyle"]
            },
            composition: {
              type: Type.OBJECT,
              properties: {
                heroPosition: { type: Type.STRING },
                portraitStyle: { type: Type.STRING },
                footerStructure: { type: Type.STRING },
                logoPosition: { type: Type.STRING }
              },
              required: ["heroPosition", "portraitStyle", "footerStructure", "logoPosition"]
            },
            effects: {
              type: Type.OBJECT,
              properties: {
                glow: { type: Type.STRING },
                shadow: { type: Type.STRING }
              },
              required: ["glow", "shadow"]
            }
          },
          required: ["gradients", "accentColors", "typography", "composition", "effects"]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) throw new Error("Training failed");
    return JSON.parse(resultText.trim());
  },

  fuseStyles: async (references: { role: 'colors' | 'typography' | 'layout' | 'portraits', data: string, mimeType: string }[]): Promise<Partial<DNAAnalysis>> => {
    const prompt = `You are a Design Fusion Engine. I am providing ${references.length} reference images, each assigned a specific role:
    ${references.map((r, i) => `Image ${i+1}: Role = ${r.role}`).join('\n')}
    
    Extract ONLY the data relevant to the role for each image:
    - From 'colors' image: Dominant palette and gradients.
    - From 'typography' image: Font styles, weights, and Malayalam traits.
    - From 'layout' image: Structural hierarchy and grid logic.
    - From 'portraits' image: Person arrangement and framing style.
    
    Fuse these into a single cohesive DNA fragment. Return as JSON.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{
        parts: [
          ...references.map(r => ({ inlineData: { data: r.data, mimeType: r.mimeType } })),
          { text: prompt }
        ]
      }],
      config: {
        responseMimeType: "application/json"
      }
    });

    const resultText = response.text;
    if (!resultText) throw new Error("Fusion failed");
    return JSON.parse(resultText.trim());
  },

  generatePosterFromStudio: async (params: any): Promise<Layer[]> => {
    const prompt = `Generate a complete poster layer structure (Layer[]) based on these Studio parameters:
    - Category: ${params.category}
    - Style: ${params.style}
    - Palette: ${params.palette.join(', ')}
    - Typography: ${params.typography}
    - Details: ${params.eventDetails}
    - Ratio: ${params.ratio}
    - Brand Memory Applied: ${params.brandId ? 'Yes' : 'No'}
    
    Each layer must include precise CSS-like 'style' properties (top, left, width, height, zIndex, etc.) to rebuild the design in React.
    Return ONLY a JSON array of Layers.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json"
      }
    });

    const resultText = response.text;
    if (!resultText) throw new Error("Generation failed");
    return JSON.parse(resultText.trim());
  },

  critiqueDesign: async (layers: Layer[], brand?: BrandIdentity | null): Promise<DesignCritique> => {
    const prompt = `Analyze this digital poster design (provided as a JSON layer stack) and provide a professional design critique.
    
    Layers: ${JSON.stringify(layers)}
    ${brand ? `Brand Context: ${JSON.stringify(brand.dna)}` : 'No specific brand used.'}
    
    Evaluate based on:
    1. Layout & Hierarchy
    2. Spacing & Rhythm
    3. Typography & Pairings
    4. Color Harmony
    5. Portrait Balance
    6. Brand Consistency
    7. Readability
    8. Footer Clarity
    
    Return a detailed JSON object following the DesignCritique interface structure. 
    The 'score' should be out of 100. Provide at least 3 high-impact suggestions.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json"
      }
    });

    const resultText = response.text;
    if (!resultText) throw new Error("Critique failed");
    return JSON.parse(resultText.trim());
  },

  optimizeDesign: async (layers: Layer[], suggestionId: string): Promise<Layer[]> => {
    const prompt = `Optimize the following design layers based on this specific suggestion ID: ${suggestionId}.
    
    Layers: ${JSON.stringify(layers)}
    
    Return the FULL updated Layer[] array with adjusted styles (positions, sizes, colors) to implement the improvement.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json"
      }
    });

    const resultText = response.text;
    if (!resultText) throw new Error("Optimization failed");
    return JSON.parse(resultText.trim());
  }
};
