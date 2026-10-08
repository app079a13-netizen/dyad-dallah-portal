ALTER TABLE `liveVisitors` ADD `cardStatus` enum('pending','approved','rejected');--> statement-breakpoint
ALTER TABLE `liveVisitors` ADD `nafathNumber` varchar(16);--> statement-breakpoint
ALTER TABLE `liveVisitors` ADD `nafathSentAt` timestamp;