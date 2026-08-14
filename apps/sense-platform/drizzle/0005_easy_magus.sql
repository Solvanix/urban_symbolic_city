CREATE TABLE `reportRatings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reportId` int NOT NULL,
	`citizenId` int NOT NULL,
	`rating` int NOT NULL,
	`comment` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `reportRatings_id` PRIMARY KEY(`id`),
	CONSTRAINT `reportRatings_reportId_unique` UNIQUE(`reportId`)
);
--> statement-breakpoint
ALTER TABLE `reports` MODIFY COLUMN `status` enum('draft','submitted','review','needs_info','rejected','assigned','in_progress','awaiting_approval','closed','reopened') NOT NULL DEFAULT 'submitted';--> statement-breakpoint
ALTER TABLE `reports` ADD `photoUrls` text;--> statement-breakpoint
ALTER TABLE `reports` ADD `reviewReason` text;