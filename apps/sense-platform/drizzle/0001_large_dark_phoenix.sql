CREATE TABLE `reportEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reportId` int NOT NULL,
	`actorId` int NOT NULL,
	`fromStatus` varchar(32),
	`toStatus` varchar(32) NOT NULL,
	`note` text,
	`evidenceUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reportEvents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reporterId` int NOT NULL,
	`assignedToId` int,
	`title` varchar(180) NOT NULL,
	`description` text NOT NULL,
	`category` enum('accessibility','road','lighting','waste','transport','other') NOT NULL DEFAULT 'accessibility',
	`status` enum('draft','submitted','review','assigned','in_progress','awaiting_approval','closed','reopened') NOT NULL DEFAULT 'submitted',
	`priority` enum('low','normal','high','urgent') NOT NULL DEFAULT 'normal',
	`latitude` varchar(32),
	`longitude` varchar(32),
	`address` varchar(255),
	`evidenceUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','citizen','staff','field','supervisor','admin') NOT NULL DEFAULT 'citizen';