export const BEHANCE_PROFILE_URL = "https://www.behance.net/jorgeaorf"

export const GALLERY_PROJECTS = [
  "Clin Summit 2025",
  "Clin - Identidade visual 2025",
  "Agiben - Site oficial",
  "Clin - Site oficial",
  "Escola SOAP | Home concept",
  "InstaLOD | 99design contest concept",
  "Vouloir Salon",
  "Buffet Arcádia | Planejamento 2023",
  "Prefeitura de Bezerros",
  "GF Trainer | 10 Anos",
] as const

export function getGalleryCenter(index: number): [number, number, number] {
  return [-117 + index * 30, 0, 110]
}

export function getPlazaPortal(index: number, totalCount = 10) {
  const half = Math.ceil(totalCount / 2)
  const side = index < half ? -1 : 1
  const sideCount = side < 0 ? half : Math.max(1, totalCount - half)
  const slot = side < 0 ? index : index - half
  const span = 40
  const z =
    sideCount <= 1
      ? -2
      : -22 + (slot / (sideCount - 1)) * span
  return {
    side,
    position: [side * 31.4, 0, z] as [number, number, number],
  }
}
