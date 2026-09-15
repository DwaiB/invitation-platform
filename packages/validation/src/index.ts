import { z } from 'zod';

export const InvitationTypeEnum = z.enum([
  'wedding',
  'birthday',
  'anniversary',
  'engagement',
  'party',
  'baby_shower',
  'corporate',
  'custom',
]);

export const RSVPStatusEnum = z.enum(['pending', 'accepted', 'declined', 'maybe']);

export const HeroSectionSchema = z.object({
  type: z.literal('hero'),
  data: z.object({
    title: z.string().min(1, 'Title is required'),
    subtitle: z.string().optional(),
    date: z.string().optional(),
    time: z.string().optional(),
    venue: z.string().optional(),
    coverAssetId: z.string().optional(),
    coverAssetUrl: z.string().url().optional().or(z.literal('')),
  }),
});

export const TextSectionSchema = z.object({
  type: z.literal('text'),
  data: z.object({
    title: z.string().optional(),
    body: z.string().min(1, 'Text body cannot be empty'),
    align: z.enum(['left', 'center', 'right']).default('center'),
  }),
});

export const ImageSectionSchema = z.object({
  type: z.literal('image'),
  data: z.object({
    assetId: z.string().optional(),
    url: z.string().optional(),
    caption: z.string().optional(),
    alt: z.string().optional(),
  }),
});

export const GallerySectionSchema = z.object({
  type: z.literal('gallery'),
  data: z.object({
    images: z.array(
      z.object({
        assetId: z.string().optional(),
        url: z.string(),
        caption: z.string().optional(),
      }),
    ),
    layout: z.enum(['grid', 'carousel', 'masonry']).default('grid'),
  }),
});

export const EventSectionSchema = z.object({
  type: z.literal('event'),
  data: z.object({
    title: z.string().optional(),
    date: z.string().min(1, 'Event date is required'),
    time: z.string().min(1, 'Event time is required'),
    timezone: z.string().default('UTC'),
    schedule: z
      .array(
        z.object({
          time: z.string(),
          title: z.string(),
          description: z.string().optional(),
        }),
      )
      .optional(),
  }),
});

export const VenueSectionSchema = z.object({
  type: z.literal('venue'),
  data: z.object({
    name: z.string().min(1, 'Venue name is required'),
    address: z.string().min(1, 'Venue address is required'),
    directions: z.string().optional(),
    mapUrl: z.string().optional(),
    landmark: z.string().optional(),
  }),
});

export const MapSectionSchema = z.object({
  type: z.literal('map'),
  data: z.object({
    address: z.string().min(1),
    lat: z.number().optional(),
    lng: z.number().optional(),
    embedUrl: z.string().optional(),
  }),
});

export const CountdownSectionSchema = z.object({
  type: z.literal('countdown'),
  data: z.object({
    targetDate: z.string().min(1),
    targetTime: z.string().optional(),
    title: z.string().optional(),
  }),
});

export const DividerSectionSchema = z.object({
  type: z.literal('divider'),
  data: z.object({
    style: z.enum(['line', 'ornament', 'dots', 'floral']).default('line'),
  }),
});

export const QuoteSectionSchema = z.object({
  type: z.literal('quote'),
  data: z.object({
    quote: z.string().min(1),
    author: z.string().optional(),
  }),
});

export const RSVPSectionSchema = z.object({
  type: z.literal('rsvp'),
  data: z.object({
    deadline: z.string().optional(),
    note: z.string().optional(),
    allowPlusOnes: z.boolean().default(false),
    maxGuests: z.number().min(1).default(1),
  }),
});

export const ContactSectionSchema = z.object({
  type: z.literal('contact'),
  data: z.object({
    contacts: z.array(
      z.object({
        role: z.string(),
        name: z.string(),
        phone: z.string().optional(),
        email: z.string().email().optional(),
      }),
    ),
  }),
});

export const FooterSectionSchema = z.object({
  type: z.literal('footer'),
  data: z.object({
    text: z.string().optional(),
    hashtag: z.string().optional(),
  }),
});

export const InvitationSectionSchema = z.discriminatedUnion('type', [
  HeroSectionSchema,
  TextSectionSchema,
  ImageSectionSchema,
  GallerySectionSchema,
  EventSectionSchema,
  VenueSectionSchema,
  MapSectionSchema,
  CountdownSectionSchema,
  DividerSectionSchema,
  QuoteSectionSchema,
  RSVPSectionSchema,
  ContactSectionSchema,
  FooterSectionSchema,
]);

export const InvitationContentSchema = z.object({
  couple: z
    .object({
      name1: z.string().min(1),
      name2: z.string().min(1),
    })
    .optional(),
  honoree: z
    .object({
      name: z.string().min(1),
      age: z.number().optional(),
    })
    .optional(),
  event: z.object({
    date: z.string().min(1, 'Date is required'),
    time: z.string().min(1, 'Time is required'),
    timezone: z.string().default('UTC'),
    endDate: z.string().optional(),
    endTime: z.string().optional(),
  }),
  venue: z.object({
    name: z.string().min(1, 'Venue name is required'),
    address: z.string().min(1, 'Venue address is required'),
    mapUrl: z.string().optional(),
    coordinates: z
      .object({
        lat: z.number(),
        lng: z.number(),
      })
      .optional(),
  }),
  sections: z.array(InvitationSectionSchema).default([]),
  theme: z
    .object({
      primaryColor: z.string().optional(),
      secondaryColor: z.string().optional(),
      accentColor: z.string().optional(),
      backgroundColor: z.string().optional(),
      fontHeading: z.string().optional(),
      fontBody: z.string().optional(),
    })
    .optional(),
});

export const InvitationSettingsSchema = z.object({
  published: z.boolean().default(false),
  rsvpEnabled: z.boolean().default(true),
  allowPlusOnes: z.boolean().default(false),
  maxGuestsPerInvite: z.number().min(1).default(2),
  customSlug: z.string().min(3).max(64).regex(/^[a-zA-Z0-9_-]+$/).optional(),
});

export const CreateInvitationSchema = z.object({
  type: InvitationTypeEnum,
  title: z.string().min(2, 'Title must be at least 2 characters').max(120),
  templateId: z.string().default('classic-001'),
  templateVersion: z.number().default(1),
  content: InvitationContentSchema.partial().optional(),
  settings: InvitationSettingsSchema.partial().optional(),
});

export const UpdateInvitationSchema = z.object({
  title: z.string().min(2).max(120).optional(),
  type: InvitationTypeEnum.optional(),
  content: InvitationContentSchema.partial().optional(),
  settings: InvitationSettingsSchema.partial().optional(),
  template: z
    .object({
      templateId: z.string(),
      version: z.number(),
    })
    .optional(),
});

export const CreateRecipientSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().optional(),
  groupId: z.string().optional(),
  personalization: z
    .object({
      salutation: z.string().optional(),
      message: z.string().optional(),
      overrides: z.record(z.unknown()).optional(),
    })
    .optional(),
});

export const UpdateRecipientSchema = CreateRecipientSchema.partial();

export const BulkCreateRecipientSchema = z.object({
  recipients: z.array(CreateRecipientSchema).min(1, 'Provide at least one recipient'),
});

export const CreateGroupSchema = z.object({
  name: z.string().min(1, 'Group name is required').max(50),
  slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/, 'Slug must be lower-case alphanumeric with dashes'),
  description: z.string().optional(),
});

export const UpdateGroupSchema = CreateGroupSchema.partial();

export const SubmitRSVPSchema = z.object({
  status: z.enum(['accepted', 'declined', 'maybe']),
  guestCount: z.number().int().min(1).max(20).default(1),
  name: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  dietaryPreferences: z.string().max(300).optional(),
  message: z.string().max(500).optional(),
});

export const AssetUploadUrlSchema = z.object({
  fileName: z.string().min(1),
  mimeType: z.enum([
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/avif',
    'image/svg+xml',
    'video/mp4',
  ]),
  fileSize: z.number().max(10 * 1024 * 1024, 'File must be under 10MB'),
});

export type CreateInvitationInput = z.infer<typeof CreateInvitationSchema>;
export type UpdateInvitationInput = z.infer<typeof UpdateInvitationSchema>;
export type CreateRecipientInput = z.infer<typeof CreateRecipientSchema>;
export type BulkCreateRecipientInput = z.infer<typeof BulkCreateRecipientSchema>;
export type CreateGroupInput = z.infer<typeof CreateGroupSchema>;
export type SubmitRSVPInput = z.infer<typeof SubmitRSVPSchema>;
export type AssetUploadUrlInput = z.infer<typeof AssetUploadUrlSchema>;
