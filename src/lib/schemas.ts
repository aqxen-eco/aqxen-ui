import { z } from 'zod'

export const eosActorSchema = z
  .string()
  .min(1)
  .max(13)
  .regex(/^[a-z1-5.]+$/, 'Invalid EOS actor format')

export const createPostSchema = z.object({
  content: z.string().min(1).max(5000),
  badgeSymbol: z.array(z.string().max(16)).max(20).optional(),
  mention: z.array(eosActorSchema).max(50).optional(),
  parentId: z.string().uuid().optional(),
  organization: eosActorSchema.optional(),
  onChainPostId: z.string().max(32).optional(),
})

export const createAnnouncementSchema = z.object({
  content: z.string().min(1).max(5000),
  organization: eosActorSchema,
  onChainPostId: z.string().max(32).optional(),
})

export const getPostsSchema = z.object({
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(100),
  orderBy: z.enum(['asc', 'desc']),
  organizations: z.array(eosActorSchema).max(50).optional(),
  actor: eosActorSchema.optional(),
})

export const getAnnouncementsSchema = z.object({
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(100),
  orderBy: z.enum(['asc', 'desc']),
  organization: eosActorSchema,
})

export const getPostsByBadgeSchema = z.object({
  badgeSymbol: z.string().min(1).max(32),
  limit: z.number().int().min(1).max(100).optional(),
})

export const processBeamGiveSchema = z.object({
  postId: z.string().uuid(),
  recipientActor: eosActorSchema,
  badgeSymbol: z.string().min(1).max(16),
  trackingDeltas: z.record(z.string(), z.number()),
  deltaScore: z.number().int().min(0),
  orgAccount: eosActorSchema,
})

export const updateProfileSchema = z.object({
  name: z.string().max(100).optional(),
  about: z.string().max(2000).optional(),
  location: z.string().max(200).optional(),
  interests: z.string().max(500).optional(),
  avatarIpfs: z.string().max(200).optional(),
  coverIpfs: z.string().max(200).optional(),
})

export const contactSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().max(320),
  organizationName: z.string().max(200).optional(),
  message: z.string().min(1).max(5000),
})
