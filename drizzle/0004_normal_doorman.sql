CREATE TABLE `liveVisitors` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` varchar(64) NOT NULL,
	`currentPage` varchar(200) NOT NULL,
	`pageTitle` varchar(300),
	`ipAddress` varchar(64),
	`userAgent` text,
	`country` varchar(100),
	`displayName` varchar(200),
	`phone` varchar(30),
	`firstSeen` timestamp NOT NULL DEFAULT (now()),
	`lastSeen` timestamp NOT NULL DEFAULT (now()),
	`pageEnteredAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `liveVisitors_id` PRIMARY KEY(`id`),
	CONSTRAINT `liveVisitors_sessionId_unique` UNIQUE(`sessionId`)
);
--> statement-breakpoint
CREATE TABLE `visitorCommands` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` varchar(64) NOT NULL,
	`commandType` enum('redirect','reload','alert') NOT NULL,
	`payload` varchar(500) NOT NULL,
	`consumed` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`consumedAt` timestamp,
	CONSTRAINT `visitorCommands_id` PRIMARY KEY(`id`)
);
