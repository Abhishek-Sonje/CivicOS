PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_issues` (
	`id` text PRIMARY KEY NOT NULL,
	`post_title` text NOT NULL,
	`description_text` text,
	`image_url` text,
	`timestamp` text NOT NULL,
	`location_text` text NOT NULL,
	`source_url` text NOT NULL,
	`category` text NOT NULL,
	`severity` integer NOT NULL,
	`lat` real,
	`lon` real,
	`geocode_status` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_issues`("id", "post_title", "description_text", "image_url", "timestamp", "location_text", "source_url", "category", "severity", "lat", "lon", "geocode_status") SELECT "id", "post_title", "description_text", "image_url", "timestamp", "location_text", "source_url", "category", "severity", "lat", "lon", 'ok' FROM `issues`;--> statement-breakpoint
DROP TABLE `issues`;--> statement-breakpoint
ALTER TABLE `__new_issues` RENAME TO `issues`;--> statement-breakpoint
PRAGMA foreign_keys=ON;