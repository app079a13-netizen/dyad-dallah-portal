CREATE TABLE `applicationSteps` (
	`id` int AUTO_INCREMENT NOT NULL,
	`applicationId` int,
	`sessionId` varchar(64) NOT NULL,
	`stepKey` varchar(50) NOT NULL,
	`data` text NOT NULL,
	`ipAddress` varchar(64),
	`userAgent` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `applicationSteps_id` PRIMARY KEY(`id`)
);
