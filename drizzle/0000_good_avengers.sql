CREATE TABLE `issues` (
	`id` text PRIMARY KEY NOT NULL,
	`post_title` text NOT NULL,
	`description_text` text,
	`image_url` text,
	`timestamp` text NOT NULL,
	`location_text` text NOT NULL,
	`source_url` text NOT NULL,
	`category` text NOT NULL,
	`severity` integer NOT NULL,
	`lat` real NOT NULL,
	`lon` real NOT NULL
);
