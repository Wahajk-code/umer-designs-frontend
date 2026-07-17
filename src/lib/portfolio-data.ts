import { EXTERIOR_IMAGES, INTERIOR_IMAGES, PORTFOLIO_IMAGES } from '@/lib/stock-images';

export interface PortfolioProject {
  slug: string;
  title: string;
  category: 'CONTAINER' | 'RESIDENTIAL';
  year: number;
  location: string;
  sqft: number;
  coverImage: string;
  gallery: string[];
  description: string;
}

export const PORTFOLIO_PROJECTS: PortfolioProject[] = [
  {
    slug: 'the-meridian-build',
    title: 'The Meridian',
    category: 'CONTAINER',
    year: 2025,
    location: 'Joshua Tree, CA',
    sqft: 960,
    coverImage: EXTERIOR_IMAGES[0],
    gallery: [EXTERIOR_IMAGES[0], INTERIOR_IMAGES[0], INTERIOR_IMAGES[1]],
    description:
      'A two-bedroom container home built for a young family wanting a weekend place that could eventually become full-time. Oriented to catch the morning light across the deck.',
  },
  {
    slug: 'fold-house',
    title: 'Fold House',
    category: 'RESIDENTIAL',
    year: 2025,
    location: 'Bend, OR',
    sqft: 2140,
    coverImage: EXTERIOR_IMAGES[1],
    gallery: [EXTERIOR_IMAGES[1], INTERIOR_IMAGES[2], INTERIOR_IMAGES[3]],
    description:
      'A folded roofline lets light into every room of this three-bedroom home without sacrificing privacy from the street. Built on a tight infill lot.',
  },
  {
    slug: 'duo-40',
    title: 'Duo 40',
    category: 'CONTAINER',
    year: 2024,
    location: 'Marfa, TX',
    sqft: 1280,
    coverImage: EXTERIOR_IMAGES[2],
    gallery: [EXTERIOR_IMAGES[2], INTERIOR_IMAGES[4], INTERIOR_IMAGES[5]],
    description:
      'Two shipping containers joined by a shared, covered breezeway — built as a live/work studio for a working artist.',
  },
  {
    slug: 'courtyard-one',
    title: 'Courtyard One',
    category: 'RESIDENTIAL',
    year: 2024,
    location: 'Tucson, AZ',
    sqft: 2860,
    coverImage: EXTERIOR_IMAGES[3],
    gallery: [EXTERIOR_IMAGES[3], INTERIOR_IMAGES[0], INTERIOR_IMAGES[2]],
    description:
      'A four-bedroom home wrapped around a central courtyard, built to stay cool through Sonoran summers without leaning on air conditioning alone.',
  },
  {
    slug: 'solo-20',
    title: 'Solo 20',
    category: 'CONTAINER',
    year: 2024,
    location: 'Taos, NM',
    sqft: 480,
    coverImage: EXTERIOR_IMAGES[4],
    gallery: [EXTERIOR_IMAGES[4], INTERIOR_IMAGES[1]],
    description:
      'A single-container studio built as a first home on family land — proof that 480 square feet can still feel spacious with the right layout.',
  },
  {
    slug: 'gable-north',
    title: 'Gable North',
    category: 'RESIDENTIAL',
    year: 2023,
    location: 'Missoula, MT',
    sqft: 1780,
    coverImage: EXTERIOR_IMAGES[5],
    gallery: [EXTERIOR_IMAGES[5], INTERIOR_IMAGES[3], INTERIOR_IMAGES[4]],
    description:
      'A steep-pitched gable roof built to shed heavy snow, with a wall of south-facing glass to pull in winter light.',
  },
];

export function getAllPortfolioImages(): string[] {
  return PORTFOLIO_IMAGES;
}
