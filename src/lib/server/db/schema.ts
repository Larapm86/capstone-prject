import { pgTable, serial, integer, text, timestamp, index } from 'drizzle-orm/pg-core';
import { user } from './auth.schema';

export const task = pgTable('task', {
	id: serial('id').primaryKey(),
	title: text('title').notNull(),
	priority: integer('priority').notNull().default(1)
});

/** User progression: level 1–7, updated when progression rules are met. */
export const userProfile = pgTable('user_profile', {
	userId: text('user_id')
		.primaryKey()
		.references(() => user.id, { onDelete: 'cascade' }),
	level: integer('level').notNull().default(1),
	updatedAt: timestamp('updated_at')
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull()
});

export const craving = pgTable(
	'craving',
	{
		id: serial('id').primaryKey(),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		text: text('text').notNull(),
		createdAt: timestamp('created_at').defaultNow().notNull(),
		// Level-gated fields (nullable; only filled for sessions at that level)
		triggers: text('triggers').array(),
		emotion: text('emotion'),
		familiar: text('familiar'), // 'yes' | 'maybe' | 'not_really'
		mindSaying: text('mind_saying'),
		needs: text('needs').array(),
		choice: text('choice'), // 'redirect' | 'sit_with_it' | 'honor_consciously'
		beforeDuringAfter: text('before_during_after') // e.g. "3,4,5" for before,during,after 1–5
	},
	(table) => [index('craving_user_id_created_at_idx').on(table.userId, table.createdAt)]
);

export * from './auth.schema';
