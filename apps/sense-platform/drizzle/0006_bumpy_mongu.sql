CREATE TABLE `commerceCatalogItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`providerId` int,
	`sourceType` enum('product','service') NOT NULL,
	`sourceId` int,
	`name` varchar(180) NOT NULL,
	`slug` varchar(220) NOT NULL,
	`description` text,
	`priceMinor` int NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'SAR',
	`inventoryQuantity` int,
	`imageUrl` text,
	`status` enum('draft','published','paused','archived') NOT NULL DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `commerceCatalogItems_id` PRIMARY KEY(`id`),
	CONSTRAINT `commerceCatalogItems_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `commerceIntegrationEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int,
	`provider` enum('payment','logistics','store_sync','software_partner') NOT NULL,
	`eventType` varchar(100) NOT NULL,
	`externalEventId` varchar(255) NOT NULL,
	`payloadHash` varchar(128) NOT NULL,
	`status` enum('received','processed','failed','ignored') NOT NULL DEFAULT 'received',
	`attemptCount` int NOT NULL DEFAULT 0,
	`receivedAt` timestamp NOT NULL DEFAULT (now()),
	`processedAt` timestamp,
	CONSTRAINT `commerceIntegrationEvents_id` PRIMARY KEY(`id`),
	CONSTRAINT `commerceIntegrationEvents_externalEventId_unique` UNIQUE(`externalEventId`)
);
--> statement-breakpoint
CREATE TABLE `commerceOrderItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`catalogItemId` int NOT NULL,
	`providerId` int,
	`nameSnapshot` varchar(180) NOT NULL,
	`unitPriceMinor` int NOT NULL,
	`quantity` int NOT NULL,
	`totalMinor` int NOT NULL,
	CONSTRAINT `commerceOrderItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `commerceOrders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderNumber` varchar(40) NOT NULL,
	`userId` int NOT NULL,
	`status` enum('pending_payment','paid','processing','shipped','delivered','cancelled','refunded','requires_review') NOT NULL DEFAULT 'pending_payment',
	`paymentStatus` enum('pending','authorized','paid','failed','refunded') NOT NULL DEFAULT 'pending',
	`fulfillmentStatus` enum('unfulfilled','partial','fulfilled','cancelled') NOT NULL DEFAULT 'unfulfilled',
	`currency` varchar(3) NOT NULL DEFAULT 'SAR',
	`subtotalMinor` int NOT NULL,
	`shippingMinor` int NOT NULL DEFAULT 0,
	`totalMinor` int NOT NULL,
	`shippingName` varchar(180),
	`shippingPhone` varchar(40),
	`shippingAddress` text,
	`externalPaymentReference` varchar(255),
	`externalShipmentReference` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `commerceOrders_id` PRIMARY KEY(`id`),
	CONSTRAINT `commerceOrders_orderNumber_unique` UNIQUE(`orderNumber`)
);
