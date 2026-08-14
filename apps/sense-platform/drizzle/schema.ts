import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "citizen", "staff", "field", "supervisor", "admin"]).default("citizen").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  kind: mysqlEnum("kind", ["report", "provider", "order", "system"]).default("system").notNull(),
  title: varchar("title", { length: 180 }).notNull(),
  body: text("body").notNull(),
  href: varchar("href", { length: 500 }),
  sourceType: varchar("sourceType", { length: 40 }),
  sourceId: int("sourceId"),
  readAt: timestamp("readAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

export const checkoutHandoffs = mysqlTable("checkoutHandoffs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  checkoutId: varchar("checkoutId", { length: 255 }).notNull().unique(),
  checkoutUrl: text("checkoutUrl").notNull(),
  status: mysqlEnum("status", ["handed_off", "unknown_external_status"]).default("handed_off").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CheckoutHandoff = typeof checkoutHandoffs.$inferSelect;
export type InsertCheckoutHandoff = typeof checkoutHandoffs.$inferInsert;

export const reports = mysqlTable("reports", {
  id: int("id").autoincrement().primaryKey(),
  reporterId: int("reporterId").notNull(),
  assignedToId: int("assignedToId"),
  title: varchar("title", { length: 180 }).notNull(),
  description: text("description").notNull(),
  category: mysqlEnum("category", ["accessibility", "road", "lighting", "waste", "transport", "other"]).default("accessibility").notNull(),
  status: mysqlEnum("status", ["draft", "submitted", "review", "needs_info", "rejected", "assigned", "in_progress", "awaiting_approval", "closed", "reopened"]).default("submitted").notNull(),
  priority: mysqlEnum("priority", ["low", "normal", "high", "urgent"]).default("normal").notNull(),
  latitude: varchar("latitude", { length: 32 }),
  longitude: varchar("longitude", { length: 32 }),
  address: varchar("address", { length: 255 }),
  evidenceUrl: text("evidenceUrl"),
  photoUrls: text("photoUrls"),
  reviewReason: text("reviewReason"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const reportEvents = mysqlTable("reportEvents", {
  id: int("id").autoincrement().primaryKey(),
  reportId: int("reportId").notNull(),
  actorId: int("actorId").notNull(),
  fromStatus: varchar("fromStatus", { length: 32 }),
  toStatus: varchar("toStatus", { length: 32 }).notNull(),
  note: text("note"),
  evidenceUrl: text("evidenceUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Report = typeof reports.$inferSelect;
export type InsertReport = typeof reports.$inferInsert;
export type ReportEvent = typeof reportEvents.$inferSelect;
export type InsertReportEvent = typeof reportEvents.$inferInsert;

export const reportRatings = mysqlTable("reportRatings", {
  id: int("id").autoincrement().primaryKey(),
  reportId: int("reportId").notNull().unique(),
  citizenId: int("citizenId").notNull(),
  rating: int("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ReportRating = typeof reportRatings.$inferSelect;
export type InsertReportRating = typeof reportRatings.$inferInsert;

export const providers = mysqlTable("providers", {
  id: int("id").autoincrement().primaryKey(),
  ownerUserId: int("ownerUserId").notNull(),
  legalName: varchar("legalName", { length: 180 }).notNull(),
  displayName: varchar("displayName", { length: 180 }).notNull(),
  providerType: mysqlEnum("providerType", ["product", "service", "both"]).default("service").notNull(),
  status: mysqlEnum("status", ["draft", "pending_review", "approved", "suspended", "rejected"]).default("draft").notNull(),
  logoUrl: text("logoUrl"),
  description: text("description"),
  phone: varchar("phone", { length: 40 }),
  email: varchar("email", { length: 320 }),
  websiteUrl: varchar("websiteUrl", { length: 500 }),
  payoutMethod: mysqlEnum("payoutMethod", ["manual_invoice", "bank_reference", "platform_wallet"]).default("manual_invoice").notNull(),
  payoutReference: varchar("payoutReference", { length: 180 }),
  payoutBeneficiaryName: varchar("payoutBeneficiaryName", { length: 180 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const providerMembers = mysqlTable("providerMembers", {
  id: int("id").autoincrement().primaryKey(),
  providerId: int("providerId").notNull(),
  userId: int("userId").notNull(),
  role: mysqlEnum("role", ["owner", "manager", "editor", "finance_viewer"]).default("editor").notNull(),
  status: mysqlEnum("status", ["invited", "active", "suspended"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const providerProducts = mysqlTable("providerProducts", {
  id: int("id").autoincrement().primaryKey(),
  providerId: int("providerId").notNull(),
  name: varchar("name", { length: 180 }).notNull(),
  slug: varchar("slug", { length: 220 }).notNull(),
  description: text("description"),
  priceMinor: int("priceMinor"),
  currency: varchar("currency", { length: 3 }).default("SAR").notNull(),
  inventoryQuantity: int("inventoryQuantity"),
  imageUrl: text("imageUrl"),
  status: mysqlEnum("status", ["draft", "pending_review", "published", "paused", "archived"]).default("draft").notNull(),
  deletedAt: timestamp("deletedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const providerServices = mysqlTable("providerServices", {
  id: int("id").autoincrement().primaryKey(),
  providerId: int("providerId").notNull(),
  name: varchar("name", { length: 180 }).notNull(),
  slug: varchar("slug", { length: 220 }).notNull(),
  description: text("description"),
  priceMinor: int("priceMinor"),
  currency: varchar("currency", { length: 3 }).default("SAR").notNull(),
  accessibilityNotes: text("accessibilityNotes"),
  serviceArea: varchar("serviceArea", { length: 180 }),
  status: mysqlEnum("status", ["draft", "pending_review", "published", "paused", "archived"]).default("draft").notNull(),
  deletedAt: timestamp("deletedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const providerAuditEvents = mysqlTable("providerAuditEvents", {
  id: int("id").autoincrement().primaryKey(),
  providerId: int("providerId").notNull(),
  actorId: int("actorId").notNull(),
  entityType: mysqlEnum("entityType", ["provider", "member", "product", "service", "payout"]).notNull(),
  entityId: int("entityId"),
  action: varchar("action", { length: 80 }).notNull(),
  summary: text("summary"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Provider = typeof providers.$inferSelect;
export type InsertProvider = typeof providers.$inferInsert;
export type ProviderMember = typeof providerMembers.$inferSelect;
export type ProviderProduct = typeof providerProducts.$inferSelect;
export type InsertProviderProduct = typeof providerProducts.$inferInsert;
export type ProviderService = typeof providerServices.$inferSelect;
export type InsertProviderService = typeof providerServices.$inferInsert;
export type ProviderAuditEvent = typeof providerAuditEvents.$inferSelect;
export type InsertProviderAuditEvent = typeof providerAuditEvents.$inferInsert;
