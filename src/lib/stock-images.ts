/**
 * Free-to-use Unsplash imagery for marketing/placeholder use (architecture,
 * interiors, portfolio). Every URL below was verified live (HTTP 200) before
 * being committed — see the design-system extraction notes.
 */

function unsplash(id: string, width = 1200): string {
  return `https://images.unsplash.com/${id}?w=${width}&q=80&auto=format&fit=crop`;
}

export const HERO_IMAGE = unsplash('photo-1600585154340-be6161a56a0c', 1600);

export const EXTERIOR_IMAGES = [
  unsplash('photo-1600607687939-ce8a6c25118c'),
  unsplash('photo-1600596542815-ffad4c1539a9'),
  unsplash('photo-1600047509807-ba8f99d2cdde'),
  unsplash('photo-1523217582562-09d0def993a6'),
  unsplash('photo-1449844908441-8829872d2607'),
  unsplash('photo-1576941089067-2de3c901e126'),
];

export const INTERIOR_IMAGES = [
  unsplash('photo-1600210492486-724fe5c67fb0'),
  unsplash('photo-1560448204-e02f11c3d0e2'),
  unsplash('photo-1600566753190-17f0baa2a6c3'),
  unsplash('photo-1600210491892-03d54c0aaf87'),
  unsplash('photo-1518780664697-55e3ad937233'),
  unsplash('photo-1600566752355-35792bedcfea'),
];

export const PORTFOLIO_IMAGES = [
  ...EXTERIOR_IMAGES,
  unsplash('photo-1600585152220-90363fe7e115'),
  unsplash('photo-1613977257363-707ba9348227'),
  unsplash('photo-1580587771525-78b9dba3b914'),
  unsplash('photo-1484154218962-a197022b5858'),
  ...INTERIOR_IMAGES,
];

export const ABOUT_IMAGE = unsplash('photo-1494526585095-c41746248156', 1200);
export const PROCESS_IMAGE = unsplash('photo-1512917774080-9991f1c4c750', 1200);
export const CONTACT_IMAGE = unsplash('photo-1502672260266-1c1ef2d93688', 1200);
