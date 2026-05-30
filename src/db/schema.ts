import { pgTable, text, timestamp, boolean, uuid, integer, serial, doublePrecision } from 'drizzle-orm/pg-core';

export const posts = pgTable('posts', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  subtitle: text('subtitle'),
  excerpt: text('excerpt').notNull(),
  content: text('content').notNull(),
  coverImage: text('cover_image'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  published: boolean('published').default(false),
});

export const videos = pgTable('videos', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  muxUploadId: text('mux_upload_id'),
  muxPlaybackId: text('mux_playback_id'),
  muxAssetId: text('mux_asset_id'),
  thumbnailUrl: text('thumbnail_url'),
  duration: integer('duration'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  published: boolean('published').default(false),
});

export const waypoints = pgTable('waypoints', {
  id: serial('id').primaryKey(),
  latitude: doublePrecision('latitude').notNull(),
  longitude: doublePrecision('longitude').notNull(),
  timestamp: timestamp('timestamp').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const pois = pgTable('pois', {
  id: text('id').primaryKey(),
  latitude: doublePrecision('latitude').notNull(),
  longitude: doublePrecision('longitude').notNull(),
  timestamp: timestamp('timestamp'),
  postId: text('post_id').references(() => posts.id),
  videoId: text('video_id').references(() => videos.id),
  label: text('label'),
  createdAt: timestamp('created_at').defaultNow(),
});