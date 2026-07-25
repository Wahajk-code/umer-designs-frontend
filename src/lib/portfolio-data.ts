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
  {
    slug: 'stacked-two',
    title: 'Stacked Two',
    category: 'CONTAINER',
    year: 2023,
    location: 'Ojai, CA',
    sqft: 1040,
    coverImage: PORTFOLIO_IMAGES[6],
    gallery: [PORTFOLIO_IMAGES[6], INTERIOR_IMAGES[2], INTERIOR_IMAGES[5]],
    description:
      'A two-story stacked-container build on a sloped lot, using the grade change to tuck a ground-floor studio under the main living level above.',
  },
  {
    slug: 'ridge-lodge',
    title: 'Ridge Lodge',
    category: 'RESIDENTIAL',
    year: 2023,
    location: 'Park City, UT',
    sqft: 3120,
    coverImage: PORTFOLIO_IMAGES[7],
    gallery: [PORTFOLIO_IMAGES[7], INTERIOR_IMAGES[0], INTERIOR_IMAGES[4]],
    description:
      'A five-bedroom mountain home with a heavy timber-and-stone base built to anchor the structure against ridge-line winds, and a great room stacked with glass toward the valley view.',
  },
  {
    slug: 'canal-container',
    title: 'Canal Container',
    category: 'CONTAINER',
    year: 2022,
    location: 'Galveston, TX',
    sqft: 860,
    coverImage: PORTFOLIO_IMAGES[8],
    gallery: [PORTFOLIO_IMAGES[8], INTERIOR_IMAGES[1], INTERIOR_IMAGES[3]],
    description:
      'A single-container canal-front weekend home raised on piers for flood clearance, with a wraparound deck built for fishing gear and slow evenings.',
  },
  {
    slug: 'low-hip-farmhouse',
    title: 'Low Hip Farmhouse',
    category: 'RESIDENTIAL',
    year: 2022,
    location: 'Lancaster County, PA',
    sqft: 2380,
    coverImage: PORTFOLIO_IMAGES[9],
    gallery: [PORTFOLIO_IMAGES[9], INTERIOR_IMAGES[2], INTERIOR_IMAGES[0]],
    description:
      'A low hip-roofed farmhouse built to sit quietly among working fields, with a deep wraparound porch and a mudroom sized for real farm use.',
  },
];

export function getAllPortfolioImages(): string[] {
  return PORTFOLIO_IMAGES;
}
