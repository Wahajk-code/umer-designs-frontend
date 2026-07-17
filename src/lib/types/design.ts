export type DesignCategory = 'CONTAINER' | 'RESIDENTIAL';
export type DesignStatus = 'DRAFT' | 'PUBLISHED' | 'HIDDEN';

export interface DesignFile {
  id: string;
  label: string;
  cloudinaryPublicId: string;
  resourceType: string;
  format: string;
  createdAt: string;
}

export interface Design {
  id: string;
  title: string;
  slug: string;
  category: DesignCategory;
  status: DesignStatus;
  basePriceCents: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  estimatedBuildCents: number;
  summary: string;
  description: string;
  coverImageUrl: string;
  galleryUrls: string[];
  createdAt: string;
  updatedAt: string;
  files?: DesignFile[];
}

export interface PaginatedDesigns {
  designs: Design[];
  total: number;
  page: number;
  pageSize: number;
}
