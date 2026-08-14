CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`kind` enum('report','provider','order','system') NOT NULL DEFAULT 'system',
	`title` varchar(180) NOT NULL,
	`body` text NOT NULL,
	`href` varchar(500),
	`sourceType` varchar(40),
	`sourceId` int,
	`readAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
