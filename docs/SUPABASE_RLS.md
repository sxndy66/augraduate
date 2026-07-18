# AU Track — Row Level Security (RLS) Policies

## Overview

All tables in AU Track have Row Level Security (RLS) enabled. This ensures users can only access their own data and public/shared data. Admins have elevated access for data review and verification.

## Policy Patterns

### Pattern 1: User Owns the Row
```sql
CREATE POLICY "user_select_own" ON table_name
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "user_insert_own" ON table_name
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_update_own" ON table_name
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "user_delete_own" ON table_name
  FOR DELETE USING (auth.uid() = user_id);
```

### Pattern 2: Public Read, Authenticated Write
```sql
CREATE POLICY "public_read" ON table_name
  FOR SELECT USING (true);

CREATE POLICY "admin_write" ON table_name
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
```

## Table-by-Table Policies

### `profiles`
| Policy | Operation | Condition |
|--------|-----------|-----------|
| profiles_select_own | SELECT | `auth.uid() = id` |
| profiles_update_own | UPDATE | `auth.uid() = id` |
| admin_select_all | SELECT | `role = 'admin'` (via profiles lookup) |
| admin_update_all | UPDATE | `role = 'admin'` (via profiles lookup) |

> Users can read and update only their own profile. Admins can view and modify all profiles.

### `degrees`
| Policy | Operation | Condition |
|--------|-----------|-----------|
| degrees_public_read | SELECT | `true` |

> Public read — all degree options are visible to everyone (needed for onboarding before auth in demo mode).

### `regulations`
| Policy | Operation | Condition |
|--------|-----------|-----------|
| regulations_public_read | SELECT | `true` |

> Public read — regulation data is public reference information.

### `branches`
| Policy | Operation | Condition |
|--------|-----------|-----------|
| branches_public_read | SELECT | `true` |

> Public read — branch data is public reference information.

### `subjects`
| Policy | Operation | Condition |
|--------|-----------|-----------|
| subjects_select_verified | SELECT | `is_verified = true` (public) |
| subjects_select_own_submitted | SELECT | `auth.uid() = submitted_by` |
| admin_select_all | SELECT | admin role check |
| user_insert | INSERT | `auth.uid() = submitted_by` |
| admin_update | UPDATE | admin role check |
| admin_delete | DELETE | admin role check |

> Users can see verified subjects and their own submissions. Admins can see, update, and delete all.

### `user_grades`
| Policy | Operation | Condition |
|--------|-----------|-----------|
| grades_select_own | SELECT | `auth.uid() = user_id` |
| grades_insert_own | INSERT | `auth.uid() = user_id` |
| grades_update_own | UPDATE | `auth.uid() = user_id` |
| grades_delete_own | DELETE | `auth.uid() = user_id` |

> Strictly per-user — no cross-user access. Admins do not access individual grades.

### `user_semester_gpa`
| Policy | Operation | Condition |
|--------|-----------|-----------|
| sem_gpa_select_own | SELECT | `auth.uid() = user_id` |
| sem_gpa_upsert_own | INSERT | `auth.uid() = user_id` |
| sem_gpa_update_own | UPDATE | `auth.uid() = user_id` |
| sem_gpa_delete_own | DELETE | `auth.uid() = user_id` |

### `user_cgpa`
| Policy | Operation | Condition |
|--------|-----------|-----------|
| cgpa_select_own | SELECT | `auth.uid() = user_id` |
| cgpa_upsert_own | INSERT | `auth.uid() = user_id` |
| cgpa_update_own | UPDATE | `auth.uid() = user_id` |
| cgpa_delete_own | DELETE | `auth.uid() = user_id` |

### `arrears`
| Policy | Operation | Condition |
|--------|-----------|-----------|
| arrears_select_own | SELECT | `auth.uid() = user_id` |
| arrears_insert_own | INSERT | `auth.uid() = user_id` |
| arrears_update_own | UPDATE | `auth.uid() = user_id` |
| arrears_delete_own | DELETE | `auth.uid() = user_id` |

### `notifications`
| Policy | Operation | Condition |
|--------|-----------|-----------|
| notifications_select_verified | SELECT | `is_verified = true` |
| admin_select_all | SELECT | admin role check |
| admin_insert | INSERT | admin role check |
| admin_update | UPDATE | admin role check |
| admin_delete | DELETE | admin role check |

> Users see only verified notifications. Admins manage all notification data.

### `notification_reads`
| Policy | Operation | Condition |
|--------|-----------|-----------|
| reads_select_own | SELECT | `auth.uid() = user_id` |
| reads_insert_own | INSERT | `auth.uid() = user_id` |
| reads_delete_own | DELETE | `auth.uid() = user_id` |

### `saved_notifications`
| Policy | Operation | Condition |
|--------|-----------|-----------|
| saved_select_own | SELECT | `auth.uid() = user_id` |
| saved_insert_own | INSERT | `auth.uid() = user_id` |
| saved_delete_own | DELETE | `auth.uid() = user_id` |

### `muted_categories`
| Policy | Operation | Condition |
|--------|-----------|-----------|
| muted_select_own | SELECT | `auth.uid() = user_id` |
| muted_insert_own | INSERT | `auth.uid() = user_id` |
| muted_delete_own | DELETE | `auth.uid() = user_id` |

### `user_notes`
| Policy | Operation | Condition |
|--------|-----------|-----------|
| notes_select_own | SELECT | `auth.uid() = user_id` |
| notes_insert_own | INSERT | `auth.uid() = user_id` |
| notes_update_own | UPDATE | `auth.uid() = user_id` |
| notes_delete_own | DELETE | `auth.uid() = user_id` |

### `target_plans`
| Policy | Operation | Condition |
|--------|-----------|-----------|
| plans_select_own | SELECT | `auth.uid() = user_id` |
| plans_insert_own | INSERT | `auth.uid() = user_id` |
| plans_delete_own | DELETE | `auth.uid() = user_id` |

### `audit_log`
| Policy | Operation | Condition |
|--------|-----------|-----------|
| audit_admin_select | SELECT | admin role check |
| audit_admin_insert | INSERT | admin role check |

> Only admins can read and write audit logs.

## Admin Role Check SQL

Used in policies to verify admin status:

```sql
EXISTS (
  SELECT 1 FROM profiles
  WHERE id = auth.uid()
  AND role = 'admin'
)
```

## Security Notes

1. **No service role key in client** — All client queries use the anon key with RLS enforcement.
2. **Auth required for writes** — All INSERT/UPDATE/DELETE policies require `auth.uid()` to match.
3. **Public data is read-only** — Degrees, regulations, branches are publicly readable but not writable by non-admins.
4. **Grade data is private** — No user can ever access another user's grades, GPA, arrears, or notes.
5. **Notifications are moderated** — Only verified notifications are visible to users; admin must approve before public visibility.
