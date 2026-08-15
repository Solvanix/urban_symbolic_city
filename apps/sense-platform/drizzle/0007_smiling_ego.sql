CREATE TABLE `commerceCartItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cartId` varchar(80) NOT NULL,
	`catalogItemId` int NOT NULL,
	`quantity` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `commerceCartItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `commerceCarts` (
	`id` varchar(80) NOT NULL,
	`userId` int,
	`status` enum('active','converted','abandoned') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `commerceCarts_id` PRIMARY KEY(`id`)
);
