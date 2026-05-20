ALTER TABLE `search_runs` ADD `user_id` text REFERENCES user(id);--> statement-breakpoint
CREATE INDEX `search_runs_user_idx` ON `search_runs` (`user_id`);