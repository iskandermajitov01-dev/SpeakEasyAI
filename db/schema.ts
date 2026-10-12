// Intentionally empty by default.
// Add Drizzle tables here when the site actually needs a database.
// See examples/d1/db/schema.ts for an opt-in example.
import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core';
export const accounts=sqliteTable('app_accounts',{
 userId:text('user_id').primaryKey(),username:text('username').notNull().unique(),passwordHash:text('password_hash').notNull(),created:integer('created').notNull()
});
export const authSessions=sqliteTable('app_auth_sessions',{
 tokenHash:text('token_hash').primaryKey(),userId:text('user_id').notNull(),expires:integer('expires').notNull()
});
export const authAttempts=sqliteTable('app_auth_attempts',{
 bucket:text('bucket').primaryKey(),attempts:integer('attempts').notNull(),expires:integer('expires').notNull()
});
export const profiles = sqliteTable('learning_profiles', {
 userId: text('user_id').primaryKey(),
 payload: text('payload').notNull(),
 updatedAt: text('updated_at').notNull(),
});
export const academyProfiles=sqliteTable('academy_profiles',{
 userId:text('user_id').primaryKey(),displayName:text('display_name').notNull(),level:text('level').notNull().default('A1'),placed:integer('placed').notNull().default(0),xp:integer('xp').notNull().default(0),coins:integer('coins').notNull().default(0),public:integer('public').notNull().default(0),owned:text('owned').notNull().default('[]'),theme:text('theme').notNull().default('sky'),avatar:text('avatar').notNull().default(''),title:text('title').notNull().default(''),levelSessions:integer('level_sessions').notNull().default(0),customTopics:text('custom_topics').notNull().default('[]'),settings:text('settings').notNull().default('{}'),joined:text('joined').notNull()
});
export const academyEvents=sqliteTable('academy_events',{userId:text('user_id').notNull(),eventKey:text('event_key').notNull(),xp:integer('xp').notNull(),coins:integer('coins').notNull(),created:text('created').notNull()},t=>[primaryKey({columns:[t.userId,t.eventKey]})]);
export const academyTests=sqliteTable('academy_tests',{id:text('id').primaryKey(),userId:text('user_id').notNull(),kind:text('kind').notNull(),level:text('level').notNull(),questions:text('questions').notNull(),submitted:integer('submitted').notNull().default(0),created:integer('created').notNull()});
export const academySessions=sqliteTable('academy_sessions',{id:text('id').primaryKey(),userId:text('user_id').notNull(),level:text('level').notNull(),topic:text('topic').notNull(),mission:text('mission').notNull().default(''),goals:text('goals').notNull().default('[]'),turns:integer('turns').notNull().default(0),claimed:integer('claimed').notNull().default(0),created:integer('created').notNull()});
