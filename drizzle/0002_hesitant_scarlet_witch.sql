CREATE TABLE `reflection_attachments` (
	`id` text PRIMARY KEY NOT NULL,
	`reflection_id` text NOT NULL,
	`filename` text NOT NULL,
	`content_type` text NOT NULL,
	`byte_size` integer NOT NULL,
	`object_key` text NOT NULL,
	FOREIGN KEY (`reflection_id`) REFERENCES `visitor_reflections`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `reflection_attachment_parent` ON `reflection_attachments` (`reflection_id`);