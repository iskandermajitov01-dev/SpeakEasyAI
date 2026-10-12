CREATE TABLE `app_accounts` (
	`user_id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`password_hash` text NOT NULL,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `app_accounts_username_unique` ON `app_accounts` (`username`);--> statement-breakpoint
CREATE TABLE `app_auth_attempts` (
	`bucket` text PRIMARY KEY NOT NULL,
	`attempts` integer NOT NULL,
	`expires` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `app_auth_sessions` (
	`token_hash` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires` integer NOT NULL
);
