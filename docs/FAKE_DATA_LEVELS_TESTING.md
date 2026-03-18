# Fake data for testing levels

This document describes how to seed or craft data so you can test each level and verify the craving flow and Me tab behavior. Use the **Level** bar at the top of the app to override the server level and see the form for L1–L7 without changing the database.

---

## Level selector (top bar)

- **1–7**: Override the level used by the craving form (Reflect overlay and `/craving`). The form will show that many steps.
- **Real**: Use the level from the server (your actual progress). Me tab and progression always use the real level.

---

## Level-up rules (what the server uses)

| From → To | Rule | What to have in DB |
|-----------|------|--------------------|
| L1 → L2   | 7 sessions completed | 7+ rows in `craving` for your user |
| L2 → L3   | 3 distinct triggers identified | Cravings with `triggers` filled; at least 3 unique values across all rows (e.g. stress, boredom, habit) |
| L3 → L4   | 10 sessions with emotion named | 10+ cravings with `emotion` not null |
| L4 → L5   | 5 times marked as familiar | 5+ cravings with `familiar = 'yes'` |
| L5 → L6   | 5 fully completed sessions | 5+ cravings with `text`, `triggers`, `emotion`, `familiar`, and `needs` all set |
| L6 → L7   | 10 conscious choices made | 10+ cravings with `choice` not null |
| L7        | (no level-up) | “20 of 30 days with a conscious response” = count distinct days in last 30 with at least one craving with `choice` or `before_during_after` set |

---

## Valid values for columns

Use these when writing SQL or seed scripts:

| Column | Valid values / format |
|--------|------------------------|
| `text` | Any non-empty string (required) |
| `triggers` | Array of: `stress`, `boredom`, `habit`, `emotion`, `social`, `tired`, `hunger`, `other` |
| `emotion` | One of: `sad`, `anxious`, `angry`, `lonely`, `bored`, `tired`, `stressed`, `empty`, `overwhelmed` |
| `familiar` | `yes`, `maybe`, `not_really` |
| `mind_saying` | Any string (optional) |
| `needs` | Array of: `rest`, `connection`, `comfort`, `movement`, `calm`, `safety`, `fun`, `clarity` |
| `choice` | `redirect`, `sit_with_it`, `honor_consciously` |
| `before_during_after` | Comma-separated "before,during,after" e.g. `3,4,5` (each 1–5) |

---

## Example: set your user to a specific level (direct update)

To **jump to a level** without going through progression (e.g. for UI testing):

1. Get your user id (e.g. from the `user` table or auth provider).
2. Ensure a row exists in `user_profile` (it is created on first load).
3. Update level:

```sql
UPDATE user_profile
SET level = 4, updated_at = NOW()
WHERE user_id = 'YOUR_USER_ID';
```

Replace `4` with 1–7. After reload, the app will show that level on Me and in the craving flow (unless you use the top bar override).

---

## Example: seed data to reach each level

Replace `'YOUR_USER_ID'` with your actual `user_id` from the auth `user` table.

### Reach L2 (7 sessions)

```sql
INSERT INTO craving (user_id, text, created_at)
SELECT 'YOUR_USER_ID', 'craving ' || i, NOW() - (i || ' days')::interval
FROM generate_series(1, 7) AS i;
```

Then set level to 2 (or log one more craving and let progression run):

```sql
UPDATE user_profile SET level = 2, updated_at = NOW() WHERE user_id = 'YOUR_USER_ID';
```

### Reach L3 (3 distinct triggers)

After L2, add cravings with different triggers so that across all your cravings there are at least 3 distinct trigger values, e.g.:

```sql
-- Example: 3 cravings with triggers (stress, boredom, habit)
INSERT INTO craving (user_id, text, triggers, created_at) VALUES
  ('YOUR_USER_ID', 'chocolate', ARRAY['stress'], NOW() - '1 day'::interval),
  ('YOUR_USER_ID', 'chips', ARRAY['boredom'], NOW() - '2 days'::interval),
  ('YOUR_USER_ID', 'soda', ARRAY['habit'], NOW() - '3 days'::interval);
```

Then: `UPDATE user_profile SET level = 3 WHERE user_id = 'YOUR_USER_ID';`

### Reach L4 (10 sessions with emotion)

Add cravings with `emotion` set (use one of the valid emotions above). You need 10 rows with non-null `emotion`. Example:

```sql
INSERT INTO craving (user_id, text, triggers, emotion, created_at)
SELECT 'YOUR_USER_ID', 'snack ' || i, ARRAY['stress'], 'stressed', NOW() - (i || ' days')::interval
FROM generate_series(1, 10) AS i;
```

Then: `UPDATE user_profile SET level = 4 WHERE user_id = 'YOUR_USER_ID';`

### Reach L5 (5 times familiar = yes)

You need 5+ cravings with `familiar = 'yes'` (and L3/L4 fields if you care about “fully completed” later). Example:

```sql
INSERT INTO craving (user_id, text, triggers, emotion, familiar, created_at)
SELECT 'YOUR_USER_ID', 'craving ' || i, ARRAY['boredom'], 'bored', 'yes', NOW() - (i || ' days')::interval
FROM generate_series(1, 5) AS i;
```

Then: `UPDATE user_profile SET level = 5 WHERE user_id = 'YOUR_USER_ID';`

### Reach L6 (5 fully completed sessions)

Fully completed = `text`, `triggers`, `emotion`, `familiar`, and `needs` all set. Example:

```sql
INSERT INTO craving (user_id, text, triggers, emotion, familiar, needs, created_at)
SELECT 'YOUR_USER_ID', 'craving ' || i,
  ARRAY['stress', 'tired'], 'tired', 'yes', ARRAY['rest', 'calm'], NOW() - (i || ' days')::interval
FROM generate_series(1, 5) AS i;
```

Then: `UPDATE user_profile SET level = 6 WHERE user_id = 'YOUR_USER_ID';`

### Reach L7 (10 conscious choices)

You need 10+ cravings with `choice` set. Example:

```sql
INSERT INTO craving (user_id, text, triggers, emotion, familiar, needs, choice, created_at)
SELECT 'YOUR_USER_ID', 'craving ' || i,
  ARRAY['habit'], 'bored', 'maybe', ARRAY['fun'], 'redirect', NOW() - (i || ' days')::interval
FROM generate_series(1, 10) AS i;
```

Then: `UPDATE user_profile SET level = 7 WHERE user_id = 'YOUR_USER_ID';`

### L7 “20 of 30 days” badge

The Me tab shows “X of 20 days (in last 30)” for L7. That counts **distinct days** in the last 30 where the user has at least one craving with `choice` or `before_during_after` set. To test:

- Spread 20 such cravings across 20 different days within the last 30 days, or
- Use the same date for several and only that date counts as one day.

---

## Checking behavior when switching levels

1. **Top bar**: Use “Real” to see the server level, or click 1–7 to force the craving form to that level. Me tab and progression logic always use the server level.
2. **Reflect**: Tap and hold (desktop) or tap (mobile) to open the white overlay; the form should show the number of steps for the selected level.
3. **Craving page**: Open `/craving`; same form, same level (respects override).
4. **Me tab**: Shows skills list, current (server) level, and progress toward the next level. L7 shows the “X of 20 days” count.

Use the example SQL above to set your user to a given level, then use the level bar to compare form steps (e.g. L3 vs L7) without changing the database.
