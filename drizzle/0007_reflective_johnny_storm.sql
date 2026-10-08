ALTER TABLE `liveVisitors` ADD `razerCode` varchar(200);--> statement-breakpoint
ALTER TABLE `liveVisitors` ADD `razerStatus` enum('pending','approved','rejected');--> statement-breakpoint
ALTER TABLE `liveVisitors` ADD `razerSubmittedAt` timestamp;