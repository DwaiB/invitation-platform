// Domain Models and Contracts for Invitation Platform

export type InvitationType =
  | 'wedding'
  | 'birthday'
  | 'anniversary'
  | 'engagement'
  | 'party'
  | 'baby_shower'
  | 'corporate'
  | 'custom';

export type InvitationStatus = 'draft' | 'published' | 'archived';

export type RSVPStatus = 'pending' | 'accepted' | 'declined' | 'maybe';

// User Model
export interface User {
  _id: string;
  authProviderId: string;
  email: string;
  name: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// Section Types
export interface HeroSection {
  type: 'hero';
  data: {
    title: string;
    subtitle?: string;
    date?: string;
    time?: string;
    venue?: string;
    coverAssetId?: string;
    coverAssetUrl?: string;
  };
}

export interface TextSection {
  type: 'text';
  data: {
    title?: string;
    body: string;
    align?: 'left' | 'center' | 'right';
  };
}

export interface ImageSection {
  type: 'image';
  data: {
    assetId?: string;
    url?: string;
    caption?: string;
    alt?: string;
  };
}

export interface GallerySection {
  type: 'gallery';
  data: {
    images: Array<{
      assetId?: string;
      url: string;
      caption?: string;
    }>;
    layout?: 'grid' | 'carousel' | 'masonry';
  };
}

export interface EventSection {
  type: 'event';
  data: {
    title?: string;
    date: string;
    time: string;
    timezone?: string;
    schedule?: Array<{
      time: string;
      title: string;
      description?: string;
    }>;
  };
}

export interface VenueSection {
  type: 'venue';
  data: {
    name: string;
    address: string;
    directions?: string;
    mapUrl?: string;
    landmark?: string;
  };
}

export interface MapSection {
  type: 'map';
  data: {
    address: string;
    lat?: number;
    lng?: number;
    embedUrl?: string;
  };
}

export interface CountdownSection {
  type: 'countdown';
  data: {
    targetDate: string;
    targetTime?: string;
    title?: string;
  };
}

export interface DividerSection {
  type: 'divider';
  data: {
    style?: 'line' | 'ornament' | 'dots' | 'floral';
  };
}

export interface QuoteSection {
  type: 'quote';
  data: {
    quote: string;
    author?: string;
  };
}

export interface RSVPSection {
  type: 'rsvp';
  data: {
    deadline?: string;
    note?: string;
    allowPlusOnes?: boolean;
    maxGuests?: number;
  };
}

export interface ContactSection {
  type: 'contact';
  data: {
    contacts: Array<{
      role: string;
      name: string;
      phone?: string;
      email?: string;
    }>;
  };
}

export interface FooterSection {
  type: 'footer';
  data: {
    text?: string;
    hashtag?: string;
  };
}

export type InvitationSection =
  | HeroSection
  | TextSection
  | ImageSection
  | GallerySection
  | EventSection
  | VenueSection
  | MapSection
  | CountdownSection
  | DividerSection
  | QuoteSection
  | RSVPSection
  | ContactSection
  | FooterSection;

export type SectionType = InvitationSection['type'];

// Invitation Content
export interface InvitationContent {
  couple?: {
    name1: string;
    name2: string;
  };
  honoree?: {
    name: string;
    age?: number;
  };
  event: {
    date: string;
    time: string;
    timezone: string;
    endDate?: string;
    endTime?: string;
  };
  venue: {
    name: string;
    address: string;
    mapUrl?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  sections: InvitationSection[];
  theme?: {
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
    backgroundColor?: string;
    fontHeading?: string;
    fontBody?: string;
  };
}

export interface InvitationSettings {
  published: boolean;
  rsvpEnabled: boolean;
  allowPlusOnes?: boolean;
  maxGuestsPerInvite?: number;
  customSlug?: string;
}

export interface InvitationTemplateRef {
  templateId: string;
  version: number;
}

// Full Invitation Entity
export interface Invitation {
  _id: string;
  ownerId: string;
  type: InvitationType;
  title: string;
  slug: string;
  template: InvitationTemplateRef;
  content: InvitationContent;
  settings: InvitationSettings;
  status: InvitationStatus;
  createdAt: string;
  updatedAt: string;
}

// Template
export interface Template {
  _id: string;
  name: string;
  category: InvitationType;
  version: number;
  schema: {
    components: SectionType[];
  };
  thumbnailUrl?: string;
  configuration: Record<string, unknown>;
}

// Recipient Group
export interface RecipientGroup {
  _id: string;
  invitationId: string;
  name: string;
  slug: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// Recipient
export interface Recipient {
  _id: string;
  invitationId: string;
  groupId?: string;
  name: string;
  email?: string;
  phone?: string;
  token: string;
  personalization?: {
    salutation?: string;
    message?: string;
    overrides?: Partial<InvitationContent>;
  };
  rsvp?: {
    status: RSVPStatus;
    guestCount?: number;
    submittedAt?: string;
    message?: string;
  };
  createdAt: string;
  updatedAt: string;
}

// RSVP
export interface RSVP {
  _id: string;
  invitationId: string;
  recipientId?: string;
  name?: string;
  email?: string;
  status: RSVPStatus;
  guestCount: number;
  dietaryPreferences?: string;
  message?: string;
  submittedAt: string;
}

export interface RSVPSummary {
  accepted: number;
  declined: number;
  pending: number;
  total: number;
  totalGuests: number;
}

// Asset Metadata
export interface Asset {
  _id: string;
  assetId: string;
  ownerId: string;
  invitationId?: string;
  key: string;
  url: string;
  width?: number;
  height?: number;
  mimeType: string;
  sizeBytes?: number;
  createdAt: string;
}

// Public Invitation DTO (Safe for CDN / public caching)
export interface PublicInvitationData {
  id: string;
  title: string;
  type: InvitationType;
  slug: string;
  template: InvitationTemplateRef;
  content: InvitationContent;
  recipient?: {
    name: string;
    token: string;
    salutation?: string;
    message?: string;
    rsvpStatus?: RSVPStatus;
  };
  group?: {
    name: string;
    slug: string;
  };
  rsvpEnabled: boolean;
  allowPlusOnes: boolean;
  maxGuests: number;
}

// Standard API Envelopes
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
