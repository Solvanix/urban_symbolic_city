CREATE TABLE `checkoutHandoffs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`checkoutId` varchar(255) NOT NULL,
	`checkoutUrl` text NOT NULL,
	`status` enum('handed_off','unknown_external_status') NOT NULL DEFAULT 'handed_off',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `checkoutHandoffs_id` PRIMARY KEY(`id`),
	CONSTRAINT `checkoutHandoffs_checkoutId_unique` UNIQUE(`checkoutId`)
);
