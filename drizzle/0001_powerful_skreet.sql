CREATE TABLE `academy_events` (
	`user_id` text NOT NULL,
	`event_key` text NOT NULL,
	`xp` integer NOT NULL,
	`coins` integer NOT NULL,
	`created` text NOT NULL,
	PRIMARY KEY(`user_id`, `event_key`)
);
--> statement-breakpoint
CREATE TABLE `academy_profiles` (
	`user_id` text PRIMARY KEY NOT NULL,
	`display_name` text NOT NULL,
	`level` text DEFAULT 'A1' NOT NULL,
	`placed` integer DEFAULT 0 NOT NULL,
	`xp` integer DEFAULT 0 NOT NULL,
	`coins` integer DEFAULT 0 NOT NULL,
	`public` integer DEFAULT 0 NOT NULL,
	`owned` text DEFAULT '[]' NOT NULL,
	`theme` text DEFAULT 'sky' NOT NULL,
	`avatar` text DEFAULT '' NOT NULL,
	`title` text DEFAULT '' NOT NULL,
	`level_sessions` integer DEFAULT 0 NOT NULL,
	`custom_topics` text DEFAULT '[]' NOT NULL,
	`settings` text DEFAULT '{}' NOT NULL,
	`joined` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `academy_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`level` text NOT NULL,
	`topic` text NOT NULL,
	`turns` integer DEFAULT 0 NOT NULL,
	`claimed` integer DEFAULT 0 NOT NULL,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `academy_tests` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`kind` text NOT NULL,
	`level` text NOT NULL,
	`questions` text NOT NULL,
	`submitted` integer DEFAULT 0 NOT NULL,
	`created` integer NOT NULL
);
