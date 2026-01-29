-- ============================================================
-- ORPHAN DATA CLEANUP SCRIPT
-- ============================================================
-- This script deletes data from all tables where the user_id
-- references a user that no longer exists in the users table.
-- 
-- Run this ONCE after deploying the new deletion service to
-- clean up data from users who were previously deleted.
--
-- IMPORTANT: Review the counts before running the DELETE statements!
-- ============================================================

-- ============================================================
-- STEP 1: CHECK FOR ORPHANED DATA (READ ONLY)
-- Run these SELECT statements first to see what would be deleted
-- ============================================================

-- Check orphaned workout sets (via sessions)
SELECT 'workout_sets' as table_name, COUNT(*) as orphan_count
FROM workout_sets ws
JOIN workout_sessions s ON ws.session_id = s.id
WHERE s.user_id NOT IN (SELECT id FROM users);

-- Check orphaned workout sessions
SELECT 'workout_sessions' as table_name, COUNT(*) as orphan_count
FROM workout_sessions WHERE user_id NOT IN (SELECT id FROM users);

-- Check orphaned workout template exercises (via templates)
SELECT 'workout_template_exercises' as table_name, COUNT(*) as orphan_count
FROM workout_template_exercises wte
JOIN workout_templates wt ON wte.template_id = wt.id
WHERE wt.user_id NOT IN (SELECT id FROM users);

-- Check orphaned workout templates
SELECT 'workout_templates' as table_name, COUNT(*) as orphan_count
FROM workout_templates WHERE user_id NOT IN (SELECT id FROM users);

-- Check orphaned workout plan day exercises (via plans)
SELECT 'workout_plan_day_exercises' as table_name, COUNT(*) as orphan_count
FROM workout_plan_day_exercises wpde
JOIN workout_plan_days wpd ON wpde.workout_plan_day_id = wpd.id
JOIN workout_plans wp ON wpd.workout_plan_id = wp.id
WHERE wp.user_id NOT IN (SELECT id FROM users);

-- Check orphaned workout plan days (via plans)
SELECT 'workout_plan_days' as table_name, COUNT(*) as orphan_count
FROM workout_plan_days wpd
JOIN workout_plans wp ON wpd.workout_plan_id = wp.id
WHERE wp.user_id NOT IN (SELECT id FROM users);

-- Check orphaned workout plans
SELECT 'workout_plans' as table_name, COUNT(*) as orphan_count
FROM workout_plans WHERE user_id NOT IN (SELECT id FROM users);

-- Check orphaned meal foods (via meals)
SELECT 'meal_foods' as table_name, COUNT(*) as orphan_count
FROM meal_foods mf
JOIN meals m ON mf.meal_id = m.id
WHERE m.user_id NOT IN (SELECT id FROM users);

-- Check orphaned meals
SELECT 'meals' as table_name, COUNT(*) as orphan_count
FROM meals WHERE user_id NOT IN (SELECT id FROM users);

-- Check orphaned meal plans
SELECT 'meal_plans' as table_name, COUNT(*) as orphan_count
FROM meal_plans WHERE user_id NOT IN (SELECT id FROM users);

-- Check orphaned custom foods
SELECT 'custom_foods' as table_name, COUNT(*) as orphan_count
FROM custom_foods WHERE user_id NOT IN (SELECT id FROM users);

-- Check orphaned body metrics
SELECT 'body_metrics' as table_name, COUNT(*) as orphan_count
FROM body_metrics WHERE user_id NOT IN (SELECT id FROM users);

-- Check orphaned goals
SELECT 'goals' as table_name, COUNT(*) as orphan_count
FROM goals WHERE user_id NOT IN (SELECT id FROM users);

-- Check orphaned user profiles
SELECT 'user_profiles' as table_name, COUNT(*) as orphan_count
FROM user_profiles WHERE user_id NOT IN (SELECT id FROM users);

-- Check orphaned refresh tokens
SELECT 'refresh_tokens' as table_name, COUNT(*) as orphan_count
FROM refresh_tokens WHERE user_id NOT IN (SELECT id FROM users);

-- ============================================================
-- STEP 2: DELETE ORPHANED DATA (DESTRUCTIVE)
-- Only run these after confirming the counts look correct!
-- Delete in order: children first, then parents
-- ============================================================

-- Uncomment the lines below to perform the cleanup:

-- -- 1. Delete orphaned workout sets
-- DELETE FROM workout_sets WHERE session_id IN (
--     SELECT id FROM workout_sessions WHERE user_id NOT IN (SELECT id FROM users)
-- );

-- -- 2. Delete orphaned workout sessions
-- DELETE FROM workout_sessions WHERE user_id NOT IN (SELECT id FROM users);

-- -- 3. Delete orphaned workout template exercises
-- DELETE FROM workout_template_exercises WHERE template_id IN (
--     SELECT id FROM workout_templates WHERE user_id NOT IN (SELECT id FROM users)
-- );

-- -- 4. Delete orphaned workout templates
-- DELETE FROM workout_templates WHERE user_id NOT IN (SELECT id FROM users);

-- -- 5. Delete orphaned workout plan day exercises
-- DELETE FROM workout_plan_day_exercises WHERE workout_plan_day_id IN (
--     SELECT wpd.id FROM workout_plan_days wpd
--     JOIN workout_plans wp ON wpd.workout_plan_id = wp.id
--     WHERE wp.user_id NOT IN (SELECT id FROM users)
-- );

-- -- 6. Delete orphaned workout plan days
-- DELETE FROM workout_plan_days WHERE workout_plan_id IN (
--     SELECT id FROM workout_plans WHERE user_id NOT IN (SELECT id FROM users)
-- );

-- -- 7. Delete orphaned workout plans
-- DELETE FROM workout_plans WHERE user_id NOT IN (SELECT id FROM users);

-- -- 8. Delete orphaned meal foods
-- DELETE FROM meal_foods WHERE meal_id IN (
--     SELECT id FROM meals WHERE user_id NOT IN (SELECT id FROM users)
-- );

-- -- 9. Delete orphaned meals
-- DELETE FROM meals WHERE user_id NOT IN (SELECT id FROM users);

-- -- 10. Delete orphaned meal plans
-- DELETE FROM meal_plans WHERE user_id NOT IN (SELECT id FROM users);

-- -- 11. Delete orphaned custom foods
-- DELETE FROM custom_foods WHERE user_id NOT IN (SELECT id FROM users);

-- -- 12. Delete orphaned body metrics
-- DELETE FROM body_metrics WHERE user_id NOT IN (SELECT id FROM users);

-- -- 13. Delete orphaned goals
-- DELETE FROM goals WHERE user_id NOT IN (SELECT id FROM users);

-- -- 14. Delete orphaned user profiles
-- DELETE FROM user_profiles WHERE user_id NOT IN (SELECT id FROM users);

-- -- 15. Delete orphaned refresh tokens
-- DELETE FROM refresh_tokens WHERE user_id NOT IN (SELECT id FROM users);

-- ============================================================
-- VERIFICATION: Run the counts again to confirm cleanup
-- ============================================================
-- Re-run all the SELECT statements from Step 1 to verify counts are 0
