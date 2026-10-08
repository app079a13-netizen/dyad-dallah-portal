CREATE TABLE `applications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fullName` varchar(200) NOT NULL,
	`middleName` varchar(200),
	`familyName` varchar(200) NOT NULL,
	`nationality` varchar(100) NOT NULL,
	`idType` varchar(50) NOT NULL,
	`idNumber` varchar(50) NOT NULL,
	`birthDate` varchar(20) NOT NULL,
	`title` varchar(50) NOT NULL,
	`email` varchar(320) NOT NULL,
	`gender` enum('male','female') NOT NULL,
	`phone` varchar(30),
	`city` varchar(100),
	`address` text,
	`educationLevel` varchar(100),
	`experience` text,
	`desiredPosition` varchar(200),
	`notes` text,
	`status` enum('new','reviewed','accepted','rejected') NOT NULL DEFAULT 'new',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `applications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `siteSettings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`redirectEnabled` boolean NOT NULL DEFAULT false,
	`redirectUrl` varchar(500),
	`siteTitle` varchar(200),
	`siteDescription` text,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `siteSettings_id` PRIMARY KEY(`id`)
);
