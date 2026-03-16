import { pgTable, serial, integer, text, timestamp } from 'drizzle-orm/pg-core';
import { user } from './auth.schema';

export const task = pgTable('task', {
	id: serial('id').primaryKey(),
	title: text('title').notNull(),
	priority: integer('priority').notNull().default(1)
});

export const craving = pgTable('craving', {
	id: serial('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	text: text('text').notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull()
});

export * from './auth.schema';
