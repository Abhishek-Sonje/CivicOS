CREATE TABLE `scraper_runs` (
	`id` text PRIMARY KEY NOT NULL,
	`collector_id` text NOT NULL,
	`status` text NOT NULL,
	`items_fetched` integer NOT NULL,
	`last_run` text NOT NULL,
	`error_message` text
);
