CREATE TABLE `visitor_reflections` (
	`id` text PRIMARY KEY NOT NULL,
	`visitor_id` text NOT NULL,
	`name` text NOT NULL,
	`message` text NOT NULL,
	`locale` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `reflection_date` ON `visitor_reflections` (`created_at`,`id`);--> statement-breakpoint
CREATE INDEX `reflection_visitor_date` ON `visitor_reflections` (`visitor_id`,`created_at`);