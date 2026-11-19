export type ArtworkShape =
  | "torusknot"
  | "icosahedron"
  | "torus"
  | "cone"
  | "octahedron"
  | "dodecahedron"
  | "capsule"
  | "bust"

export type Artwork = {
  id: string
  title: string
  artist: string
  year: string
  medium: string
  description: string
  shape: ArtworkShape
  color: string
  emissive: string
  metalness: number
  roughness: number
  position: [number, number, number]
  rotationSpeed: number
  scale: number
}

// Galeria: eixo X de -8 a 8, eixo Z de -22 a 22.
// Esculturas alinhadas ao longo das paredes laterais (x = -5.2 e x = 5.2).
export const ARTWORKS: Artwork[] = [
  {
    id: "aurora",
    title: "Kinetic Aurora",
    artist: "Helena Vasquez",
    year: "2021",
    medium: "Polished bronze",
    description:
      "A continuous topological knot with no beginning and no end, symbolizing the perpetual flow of time and memory.",
    shape: "torusknot",
    color: "#d4af37",
    emissive: "#3a2e0a",
    metalness: 1,
    roughness: 0.15,
    position: [-5.2, 1.4, -16],
    rotationSpeed: 0.3,
    scale: 1,
  },
  {
    id: "fragmento",
    title: "Primordial Fragment",
    artist: "Kenji Nakamura",
    year: "2019",
    medium: "Faceted crystal",
    description:
      "An icosahedral form reminiscent of atomic structures, capturing and refracting surrounding light.",
    shape: "icosahedron",
    color: "#7fb5d9",
    emissive: "#0e2836",
    metalness: 0.4,
    roughness: 0.05,
    position: [5.2, 1.4, -16],
    rotationSpeed: -0.25,
    scale: 1.05,
  },
  {
    id: "orbita",
    title: "Suspended Orbit",
    artist: "Marina Duarte",
    year: "2022",
    medium: "Brushed steel",
    description:
      "The ring evokes rotating celestial bodies—a meditation on gravity, distance, and return.",
    shape: "torus",
    color: "#c0c0c8",
    emissive: "#1a1a20",
    metalness: 0.9,
    roughness: 0.3,
    position: [-5.2, 1.5, -6],
    rotationSpeed: 0.4,
    scale: 1,
  },
  {
    id: "ascese",
    title: "The Marble Thinker",
    artist: "Tobias Lindqvist",
    year: "2018",
    medium: "Carrara marble",
    description:
      "A classic hand-carved bust paying homage to Michelangelo's Renaissance tradition. Its serene gaze and marble surface invite contemplation of the idealized human form.",
    shape: "bust",
    color: "#ece7dc",
    emissive: "#1a1712",
    metalness: 0,
    roughness: 0.72,
    position: [5.2, 1.3, -6],
    rotationSpeed: 0.12,
    scale: 1,
  },
  {
    id: "prisma",
    title: "Inner Prism",
    artist: "Amara Okoye",
    year: "2023",
    medium: "Cast glass",
    description:
      "The perfect octahedron questions the duality between what reflects and what reveals, between surface and core.",
    shape: "octahedron",
    color: "#6fb5a8",
    emissive: "#0f2a26",
    metalness: 0.3,
    roughness: 0.1,
    position: [-5.2, 1.4, 4],
    rotationSpeed: -0.35,
    scale: 1.1,
  },
  {
    id: "nucleo",
    title: "Core",
    artist: "Rafael Sørensen",
    year: "2020",
    medium: "Oxidized copper",
    description:
      "A dense, earthy dodecahedron celebrating raw matter and the hidden geometry found in nature.",
    shape: "dodecahedron",
    color: "#c17a54",
    emissive: "#2b160d",
    metalness: 0.7,
    roughness: 0.45,
    position: [5.2, 1.4, 4],
    rotationSpeed: 0.28,
    scale: 1,
  },
  {
    id: "silencio",
    title: "Vertical Silence",
    artist: "Yara Benítez",
    year: "2024",
    medium: "Matte resin",
    description:
      "A serene, monolithic capsule—an invitation to contemplative quiet amidst the noise of the world.",
    shape: "capsule",
    color: "#8a8f98",
    emissive: "#131518",
    metalness: 0.2,
    roughness: 0.6,
    position: [-5.2, 1.4, 14],
    rotationSpeed: 0.15,
    scale: 1,
  },
  {
    id: "eco",
    title: "Golden Echo",
    artist: "Helena Vasquez",
    year: "2022",
    medium: "Mirrored brass",
    description:
      "A companion piece to 'Kinetic Aurora', reflecting the visitor and turning them into part of the artwork itself.",
    shape: "torusknot",
    color: "#e0b84a",
    emissive: "#332708",
    metalness: 1,
    roughness: 0.1,
    position: [5.2, 1.4, 14],
    rotationSpeed: -0.3,
    scale: 0.95,
  },
]
