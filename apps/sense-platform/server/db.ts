import { drizzle } from "drizzle-orm/mysql2";
import { and, desc, eq, inArray, isNull, not, or } from "drizzle-orm";
import { InsertReport, InsertReportEvent, InsertUser, Report, ReportEvent, reportEvents, reports, users, InsertProvider, Provider, providers, providerMembers, ProviderProduct, InsertProviderProduct, providerProducts, ProviderService, InsertProviderService, providerServices, providerAuditEvents, InsertProviderAuditEvent, ProviderMember, InsertNotification, Notification, notifications, CheckoutHandoff, InsertCheckoutHandoff, checkoutHandoffs, ReportRating, InsertReportRating, reportRatings } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function createNotification(input: InsertNotification): Promise<Notification> {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const result = await db.insert(notifications).values(input);
  const id = Number(result[0].insertId);
  const rows = await db.select().from(notifications).where(eq(notifications.id, id)).limit(1);
  if (!rows[0]) throw new Error("Notification was not created");
  return rows[0];
}

export async function listNotificationsForUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt)).limit(100);
}

export async function markNotificationRead(userId: number, notificationId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.update(notifications).set({ readAt: new Date() }).where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)));
  return db.select().from(notifications).where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId))).limit(1).then((rows) => rows[0]);
}

export async function markAllNotificationsRead(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.update(notifications).set({ readAt: new Date() }).where(and(eq(notifications.userId, userId), isNull(notifications.readAt)));
  return { updated: true };
}

export async function createReport(input: InsertReport): Promise<Report> {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const result = await db.insert(reports).values(input);
  const id = Number(result[0].insertId);
  const rows = await db.select().from(reports).where(eq(reports.id, id)).limit(1);
  if (!rows[0]) throw new Error("Report was not created");
  return rows[0];
}

export async function listReportsForUser(userId: number): Promise<Report[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(reports).where(eq(reports.reporterId, userId)).orderBy(desc(reports.createdAt));
}

export async function listOperationalReports(userId: number): Promise<Report[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(reports).where(or(eq(reports.assignedToId, userId), not(eq(reports.status, "closed")))).orderBy(desc(reports.createdAt));
}

export async function getReportKpiData(): Promise<{ reports: Report[]; events: ReportEvent[]; ratings: ReportRating[] }> {
  const db = await getDb();
  if (!db) return { reports: [], events: [], ratings: [] };
  const [reportRows, eventRows, ratingRows] = await Promise.all([
    db.select().from(reports).orderBy(desc(reports.createdAt)),
    db.select().from(reportEvents).orderBy(desc(reportEvents.createdAt)),
    db.select().from(reportRatings).orderBy(desc(reportRatings.createdAt)),
  ]);
  return { reports: reportRows, events: eventRows, ratings: ratingRows };
}

export async function getReportById(id: number): Promise<Report | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(reports).where(eq(reports.id, id)).limit(1);
  return rows[0];
}

export async function updateReportStatus(id: number, status: Report["status"], assignedToId?: number | null, evidenceUrl?: string | null, reviewReason?: string | null) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const update: Partial<Report> = { status };
  if (assignedToId !== undefined) update.assignedToId = assignedToId;
  if (evidenceUrl !== undefined) update.evidenceUrl = evidenceUrl;
  if (reviewReason !== undefined) update.reviewReason = reviewReason;
  await db.update(reports).set(update).where(eq(reports.id, id));
  return getReportById(id);
}

export async function attachReportEvidence(id: number, evidenceUrl: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.update(reports).set({ evidenceUrl }).where(eq(reports.id, id));
  return getReportById(id);
}

export async function addReportEvent(input: InsertReportEvent) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.insert(reportEvents).values(input);
}

export async function getReportRating(reportId: number, citizenId: number): Promise<ReportRating | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(reportRatings).where(and(eq(reportRatings.reportId, reportId), eq(reportRatings.citizenId, citizenId))).limit(1);
  return rows[0];
}

export async function upsertReportRating(input: InsertReportRating): Promise<ReportRating> {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.insert(reportRatings).values(input).onDuplicateKeyUpdate({
    set: { rating: input.rating, comment: input.comment ?? null, updatedAt: new Date() },
  });
  const rows = await db.select().from(reportRatings).where(and(eq(reportRatings.reportId, input.reportId), eq(reportRatings.citizenId, input.citizenId))).limit(1);
  if (!rows[0]) throw new Error("Report rating was not saved");
  return rows[0];
}

export async function createProvider(input: InsertProvider): Promise<Provider> {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const result = await db.insert(providers).values(input);
  const id = Number(result[0].insertId);
  const row = await db.select().from(providers).where(eq(providers.id, id)).limit(1);
  if (!row[0]) throw new Error("Provider was not created");
  return row[0];
}

export async function getProviderById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const row = await db.select().from(providers).where(eq(providers.id, id)).limit(1);
  return row[0];
}

export async function listProvidersForUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const owned = await db.select().from(providers).where(eq(providers.ownerUserId, userId));
  const memberships = await db.select().from(providerMembers).where(eq(providerMembers.userId, userId));
  const memberProviderIds = memberships.map((membership) => membership.providerId);
  if (memberProviderIds.length === 0) return owned;
  const memberProviders = await db.select().from(providers).where(inArray(providers.id, memberProviderIds));
  const seen = new Set(owned.map((provider) => provider.id));
  return [...owned, ...memberProviders.filter((provider) => !seen.has(provider.id))];
}

export async function getProviderMember(providerId: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const row = await db.select().from(providerMembers).where(or(eq(providerMembers.providerId, providerId), eq(providerMembers.userId, userId)));
  return row.find((member) => member.providerId === providerId && member.userId === userId);
}

export async function listProviderMembers(providerId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(providerMembers).where(eq(providerMembers.providerId, providerId)).orderBy(desc(providerMembers.updatedAt));
}

export async function upsertProviderMember(providerId: number, userId: number, role: ProviderMember["role"] = "editor") {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const existing = await getProviderMember(providerId, userId);
  if (existing) {
    await db.update(providerMembers).set({ role, status: "active" }).where(eq(providerMembers.id, existing.id));
    return getProviderMember(providerId, userId);
  }
  const result = await db.insert(providerMembers).values({ providerId, userId, role, status: "invited" });
  const id = Number(result[0].insertId);
  const row = await db.select().from(providerMembers).where(eq(providerMembers.id, id)).limit(1);
  return row[0];
}

export async function updateProviderMember(id: number, input: Partial<Pick<ProviderMember, "role" | "status">>) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.update(providerMembers).set(input).where(eq(providerMembers.id, id));
  const row = await db.select().from(providerMembers).where(eq(providerMembers.id, id)).limit(1);
  return row[0];
}

export async function removeProviderMember(id: number) {
  return updateProviderMember(id, { status: "suspended" });
}

export async function listProviderProducts(providerId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(providerProducts).where(eq(providerProducts.providerId, providerId)).orderBy(desc(providerProducts.updatedAt));
}

export async function listProviderServices(providerId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(providerServices).where(eq(providerServices.providerId, providerId)).orderBy(desc(providerServices.updatedAt));
}

export async function createProviderProduct(input: InsertProviderProduct): Promise<ProviderProduct> {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const result = await db.insert(providerProducts).values(input);
  const id = Number(result[0].insertId);
  const row = await db.select().from(providerProducts).where(eq(providerProducts.id, id)).limit(1);
  if (!row[0]) throw new Error("Product was not created");
  return row[0];
}

export async function createProviderService(input: InsertProviderService): Promise<ProviderService> {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const result = await db.insert(providerServices).values(input);
  const id = Number(result[0].insertId);
  const row = await db.select().from(providerServices).where(eq(providerServices.id, id)).limit(1);
  if (!row[0]) throw new Error("Service was not created");
  return row[0];
}

export async function updateProvider(id: number, input: Partial<InsertProvider>) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.update(providers).set(input).where(eq(providers.id, id));
  return getProviderById(id);
}

export async function updateProviderProduct(id: number, input: Partial<InsertProviderProduct>) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.update(providerProducts).set(input).where(eq(providerProducts.id, id));
  const row = await db.select().from(providerProducts).where(eq(providerProducts.id, id)).limit(1);
  return row[0];
}

export async function updateProviderService(id: number, input: Partial<InsertProviderService>) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.update(providerServices).set(input).where(eq(providerServices.id, id));
  const row = await db.select().from(providerServices).where(eq(providerServices.id, id)).limit(1);
  return row[0];
}

export async function addProviderAuditEvent(input: InsertProviderAuditEvent) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.insert(providerAuditEvents).values(input);
}

export async function archiveProviderProduct(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.update(providerProducts).set({ status: "archived", deletedAt: new Date() }).where(eq(providerProducts.id, id));
  const row = await db.select().from(providerProducts).where(eq(providerProducts.id, id)).limit(1);
  return row[0];
}

export async function archiveProviderService(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.update(providerServices).set({ status: "archived", deletedAt: new Date() }).where(eq(providerServices.id, id));
  const row = await db.select().from(providerServices).where(eq(providerServices.id, id)).limit(1);
  return row[0];
}

export async function listPublicProviderProducts() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({ product: providerProducts })
    .from(providerProducts)
    .innerJoin(providers, eq(providerProducts.providerId, providers.id))
    .where(and(eq(providerProducts.status, "published"), isNull(providerProducts.deletedAt), eq(providers.status, "approved")))
    .then((rows) => rows.map(({ product }) => product));
}

export async function listPublicProviderServices() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({ service: providerServices })
    .from(providerServices)
    .innerJoin(providers, eq(providerServices.providerId, providers.id))
    .where(and(eq(providerServices.status, "published"), isNull(providerServices.deletedAt), eq(providers.status, "approved")))
    .then((rows) => rows.map(({ service }) => service));
}

export async function listPendingProviders() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(providers).where(eq(providers.status, "pending_review"));
}

export async function createCheckoutHandoff(input: InsertCheckoutHandoff): Promise<CheckoutHandoff | undefined> {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.insert(checkoutHandoffs).values(input).onDuplicateKeyUpdate({ set: { checkoutUrl: input.checkoutUrl, status: "handed_off" } });
  const rows = await db.select().from(checkoutHandoffs).where(eq(checkoutHandoffs.checkoutId, input.checkoutId)).limit(1);
  return rows[0];
}

export async function listCheckoutHandoffsForUser(userId: number): Promise<CheckoutHandoff[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(checkoutHandoffs).where(eq(checkoutHandoffs.userId, userId)).orderBy(desc(checkoutHandoffs.createdAt));
}


export async function getCheckoutHandoffForUser(userId: number, handoffId: number): Promise<CheckoutHandoff | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db
    .select()
    .from(checkoutHandoffs)
    .where(and(eq(checkoutHandoffs.id, handoffId), eq(checkoutHandoffs.userId, userId)))
    .limit(1);
  return rows[0];
}
