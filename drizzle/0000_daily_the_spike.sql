CREATE TABLE `tributes` (
	`id` text PRIMARY KEY NOT NULL,
	`person_id` text NOT NULL,
	`visitor_id` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tribute_person_visitor` ON `tributes` (`person_id`,`visitor_id`);--> statement-breakpoint
CREATE INDEX `tribute_person` ON `tributes` (`person_id`);