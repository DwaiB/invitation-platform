import { Template } from '@repo/types';

export const API_VERSION = 'v1';
export const API_BASE_PATH = `/api/${API_VERSION}`;

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export const DEFAULT_TEMPLATES: Template[] = [
  {
    _id: 'classic-wedding-01',
    name: 'Classic Elegance Wedding',
    category: 'wedding',
    version: 1,
    thumbnailUrl: '/templates/classic-wedding.webp',
    schema: {
      components: ['hero', 'quote', 'event', 'venue', 'rsvp', 'footer'],
    },
    configuration: {
      theme: 'royal-gold',
      fontFamily: 'Playfair Display',
    },
  },
  {
    _id: 'modern-birthday-01',
    name: 'Neon Vibrant Birthday',
    category: 'birthday',
    version: 1,
    thumbnailUrl: '/templates/modern-birthday.webp',
    schema: {
      components: ['hero', 'countdown', 'event', 'venue', 'rsvp', 'footer'],
    },
    configuration: {
      theme: 'electric-violet',
      fontFamily: 'Outfit',
    },
  },
  {
    _id: 'golden-anniversary-01',
    name: 'Golden Jubilee Anniversary',
    category: 'anniversary',
    version: 1,
    thumbnailUrl: '/templates/golden-anniversary.webp',
    schema: {
      components: ['hero', 'gallery', 'event', 'venue', 'rsvp', 'footer'],
    },
    configuration: {
      theme: 'champagne-gold',
      fontFamily: 'Cormorant Garamond',
    },
  },
];
