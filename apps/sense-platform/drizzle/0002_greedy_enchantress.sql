CREATE TABLE `providerAuditEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`providerId` int NOT NULL,
	`actorId` int NOT NULL,
	`entityType` enum('provider','member','product','service','payout') NOT NULL,
	`entityId` int,
	`action` varchar(80) NOT NULL,
	`summary` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `providerAuditEvents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `providerMembers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`providerId` int NOT NULL,
	`userId` int NOT NULL,
	`role` enum('owner','manager','editor','finance_viewer') NOT NULL DEFAULT 'editor',
	`status` enum('invited','active','suspended') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `providerMembers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `providerProducts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`providerId` int NOT NULL,
	`name` varchar(180) NOT NULL,
	`slug` varchar(220) NOT NULL,
	`description` text,
	`priceMinor` int,
	`currency` varchar(3) NOT NULL DEFAULT 'SAR',
	`inventoryQuantity` int,
	`imageUrl` text,
	`status` enum('draft','pending_review','published','paused','archived') NOT NULL DEFAULT 'draft',
	`deletedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `providerProducts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `providerServices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`providerId` int NOT NULL,
	`name` varchar(180) NOT NULL,
	`slug` varchar(220) NOT NULL,
	`description` text,
	`priceMinor` int,
	`currency` varchar(3) NOT NULL DEFAULT 'SAR',
	`accessibilityNotes` text,
	`serviceArea` varchar(180),
	`status` enum('draft','pending_review','published','paused','archived') NOT NULL DEFAULT 'draft',
	`deletedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `providerServices_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `providers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerUserId` int NOT NULL,
	`legalName` varchar(180) NOT NULL,
	`displayName` varchar(180) NOT NULL,
	`providerType` enum('product','service','both') NOT NULL DEFAULT 'service',
	`status` enum('draft','pending_review','approved','suspended','rejected') NOT NULL DEFAULT 'draft',
	`logoUrl` text,
	`description` text,
	`phone` varchar(40),
	`email` varchar(320),
	`websiteUrl` varchar(500),
	`payoutMethod` enum('manual_invoice','bank_reference','platform_wallet') NOT NULL DEFAULT 'manual_invoice',
	`payoutReference` varchar(180),
	`payoutBeneficiaryName` varchar(180),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `providers_id` PRIMARY KEY(`id`)
);
