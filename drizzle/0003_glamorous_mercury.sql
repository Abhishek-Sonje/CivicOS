ALTER TABLE `issues` ADD `source_type` text NOT NULL DEFAULT 'social';--> statement-breakpoint
ALTER TABLE `issues` ADD `relevance_score` real NOT NULL DEFAULT 0.5;
