# AU Track — Test Plan

## Overview

This document defines acceptance criteria and test cases for each feature of AU Track. Tests are organized by feature area and include both manual and automated test scenarios.

## Test Environment

- **Framework:** Jest + React Testing Library (to be configured in Phase 4)
- **E2E:** Playwright (to be configured in Phase 4)
- **Manual testing:** Browser-based testing on Chrome, Firefox, Safari (mobile + desktop)
- **Test data:** Demo accounts with pre-populated grades via `/demo` page

---

## 1. Authentication

### TC-1.1: Email Signup
**Steps:** Navigate to /signup → Enter email + password → Click Sign Up → Check email → Click verification link
**Expected:** Account created, profile row exists, redirected to onboarding
**Pass criteria:** ✅ User can log in after verification

### TC-1.2: Google OAuth Signup
**Steps:** Navigate to /signup → Click "Continue with Google" → Select Google account → Allow
**Expected:** Session created, profile row exists, redirected to onboarding
**Pass criteria:** ✅ User is authenticated and on onboarding page

### TC-1.3: Login with valid credentials
**Steps:** Navigate to /login → Enter email + password → Click Login
**Expected:** Session created, redirected to dashboard (if onboarding complete) or onboarding
**Pass criteria:** ✅ Dashboard loads with user data

### TC-1.4: Login with invalid credentials
**Steps:** Navigate to /login → Enter wrong password → Click Login
**Expected:** Error message "Invalid credentials" displayed
**Pass criteria:** ✅ No session created, error shown

### TC-1.5: Password reset
**Steps:** /forgot-password → Enter email → Submit → Check email → Click reset link → New password
**Expected:** Password updated, can login with new password
**Pass criteria:** ✅ Login succeeds with new password

### TC-1.6: Protected route redirect
**Steps:** Log out → Navigate to /dashboard directly
**Expected:** Redirected to /login
**Pass criteria:** ✅ No dashboard content visible

---

## 2. Onboarding

### TC-2.1: Complete onboarding flow
**Steps:** After signup → Select degree (B.E) → Select regulation (R2021) → Select branch (CSE) → Select semester (3) → Click Finish
**Expected:** Profile updated with selections, onboarding_completed = true, redirected to dashboard
**Pass criteria:** ✅ Dashboard shows correct degree/branch/semester

### TC-2.2: Skip validation per step
**Steps:** On degree step → Click Next without selecting
**Expected:** Validation error "Please select a degree"
**Pass criteria:** ✅ Cannot proceed without selection

---

## 3. Grade Management

### TC-3.1: Manual grade entry
**Steps:** /semesters/3 → Click Add → Enter subject code (CS8492), name, credits (4), grade (A) → Save
**Expected:** Grade saved to user_grades, GPA recalculated and displayed
**Pass criteria:** ✅ Grade appears in table, GPA updates

### TC-3.2: Edit existing grade
**Steps:** Click edit on existing grade → Change grade from A to O → Save
**Expected:** Grade updated, GPA recalculated
**Pass criteria:** ✅ New grade shown, GPA increases

### TC-3.3: Delete grade
**Steps:** Click delete on grade → Confirm
**Expected:** Grade removed from table, GPA recalculated
**Pass criteria:** ✅ Grade gone, GPA updates

### TC-3.4: Invalid grade rejection
**Steps:** Enter grade "Z" → Save
**Expected:** Validation error "Grade must be one of: O, A+, A, B+, B, C, U, RA"
**Pass criteria:** ✅ Grade not saved, error shown

---

## 4. OCR Upload

### TC-4.1: Valid image upload
**Steps:** /ocr-upload → Drag PNG screenshot → File appears in preview
**Expected:** Preview shown, file name and size displayed, Run OCR button visible
**Pass criteria:** ✅ Image preview renders correctly

### TC-4.2: Invalid file type rejection
**Steps:** Drag PDF file to upload zone
**Expected:** Error "Only PNG, JPG, JPEG, and WEBP images are allowed"
**Pass criteria:** ✅ File rejected, error message shown

### TC-4.3: Oversized file rejection
**Steps:** Upload image > 5MB
**Expected:** Error "File size exceeds 5 MB"
**Pass criteria:** ✅ File rejected with size shown

### TC-4.4: OCR processing
**Steps:** Upload valid screenshot → Click Run OCR → Wait for processing
**Expected:** Progress bar shows stages (loading → recognizing → extracting), results table appears
**Pass criteria:** ✅ At least 1 grade extracted, editable table shown

### TC-4.5: Edit OCR results
**Steps:** After OCR → Click pencil icon on a row → Change grade → Click checkmark
**Expected:** Grade updated in table, status changes to Verified
**Pass criteria:** ✅ Edited value persists in table

### TC-4.6: Confirm and save OCR grades
**Steps:** Click "Review & Confirm" → Review summary → Click "Confirm & Save"
**Expected:** Grades saved to user_grades, redirected to semester page, success toast
**Pass criteria:** ✅ Grades appear on semester page

### TC-4.7: Delete screenshot
**Steps:** After upload → Click "Delete Screenshot"
**Expected:** Preview cleared, file removed, back to upload state
**Pass criteria:** ✅ Upload zone visible again

### TC-4.8: OCR failure with manual fallback
**Steps:** Upload unclear image → Run OCR → No grades extracted
**Expected:** Error state shown with "Try Again" and manual entry link visible
**Pass criteria:** ✅ Manual entry link navigates to /semesters/[n]

### TC-4.9: Privacy notice visible
**Steps:** Navigate to /ocr-upload
**Expected:** Privacy notice about client-side processing visible
**Pass criteria:** ✅ Notice text present and readable

---

## 5. GPA/CGPA Calculation

### TC-5.1: Semester GPA calculation
**Steps:** Enter grades: CS8492 (4 credits, A=8), CS8493 (3 credits, O=10)
**Expected:** GPA = (4×8 + 3×10) / (4+3) = 62/7 = 8.86
**Pass criteria:** ✅ GPA displays as 8.86

### TC-5.2: CGPA across semesters
**Steps:** Enter grades in semester 1 and 2 → View dashboard
**Expected:** CGPA = Σ(all credits × points) / Σ(all credits)
**Pass criteria:** ✅ CGPA matches manual calculation

### TC-5.3: Arrear impact on GPA
**Steps:** Enter a subject with RA grade (0 points, 4 credits)
**Expected:** GPA reduced (0 in numerator, 4 in denominator)
**Pass criteria:** ✅ GPA lower than without arrear

### TC-5.4: Standalone calculator
**Steps:** /calculator → Add subjects with credits and grades → View result
**Expected:** GPA calculated without saving to database
**Pass criteria:** ✅ Result matches formula, no data saved

---

## 6. Arrear Tracking

### TC-6.1: View arrears
**Steps:** Enter grade RA for a subject → Navigate to /arrears
**Expected:** Subject appears in arrears list with code, name, semester, credits
**Pass criteria:** ✅ Arrear visible in list

### TC-6.2: Clear arrear
**Steps:** Click "Clear" on an arrear → Enter new grade (B) → Confirm
**Expected:** Arrear removed from list, grade updated in user_grades, GPA recalculated
**Pass criteria:** ✅ Arrear gone, GPA improved

### TC-6.3: Arrear statistics
**Steps:** View /arrears with 2 arrears
**Expected:** Total arrears count = 2, total arrear credits shown, CGPA impact displayed
**Pass criteria:** ✅ Stats match actual data

---

## 7. Notifications

### TC-7.1: View notifications
**Steps:** /notifications → Page loads
**Expected:** List of verified notifications with title, body, category badge, source link, date
**Pass criteria:** ✅ Notifications render correctly

### TC-7.2: Filter by category
**Steps:** Select "Results" in category filter
**Expected:** Only notifications with category = "results" shown
**Pass criteria:** ✅ Filtered list contains only results

### TC-7.3: Filter by degree
**Steps:** Select "B.E" in degree filter
**Expected:** Only notifications applicable to B.E (or all degrees) shown
**Pass criteria:** ✅ Filtered correctly

### TC-7.4: Mute all
**Steps:** Click "Mute All"
**Expected:** All notifications hidden, "All notifications are muted" message shown
**Pass criteria:** ✅ No notifications visible

### TC-7.5: Mute specific category
**Steps:** Click mute on "Circulars" category badge
**Expected:** Circulars notifications hidden, other categories still visible
**Pass criteria:** ✅ Only circulars muted

### TC-7.6: Mark as read
**Steps:** Click "Mark Read" on an unread notification
**Expected:** Notification marked as read (opacity changes, blue dot disappears)
**Pass criteria:** ✅ Read state persists on page reload

### TC-7.7: Save notification
**Steps:** Click "Save" on a notification
**Expected:** Button changes to "Saved", bookmark icon filled
**Pass criteria:** ✅ Saved state persists

### TC-7.8: Empty state
**Steps:** Apply filters that match no notifications
**Expected:** Empty state with "No notifications found" message
**Pass criteria:** ✅ Empty state displayed with helpful text

### TC-7.9: Non-affiliation disclaimer
**Steps:** Navigate to /notifications
**Expected:** Disclaimer banner visible at top of page
**Pass criteria:** ✅ Disclaimer text present

---

## 8. Target Planner

### TC-8.1: Generate plan
**Steps:** /target-planner → Enter target CGPA (8.5) → Select remaining semesters (3) → Click Calculate
**Expected:** Plan showing required GPA per semester, feasibility indicator
**Pass criteria:** ✅ Required GPA calculated correctly

### TC-8.2: Infeasible target
**Steps:** Enter target CGPA 10.0 with 1 semester remaining and current CGPA 7.0
**Expected:** Plan shows "Not feasible" — required GPA > 10
**Pass criteria:** ✅ Feasibility indicator shows not achievable

---

## 9. Admin

### TC-9.1: Admin access denied for students
**Steps:** Login as student → Navigate to /admin/data-review
**Expected:** "Access Denied" page shown
**Pass criteria:** ✅ No admin content visible

### TC-9.2: Admin access granted
**Steps:** Login as admin → Navigate to /admin/data-review
**Expected:** Data review page loads with subjects and notifications tabs
**Pass criteria:** ✅ Tables render with data

### TC-9.3: Verify subject
**Steps:** Click "Verify" on an unverified subject
**Expected:** Subject status changes to "Verified", badge updates
**Pass criteria:** ✅ Status change persists on refresh

### TC-9.4: Verify notification
**Steps:** Switch to notifications tab → Click "Verify" on unverified notification
**Expected:** Notification status changes to "Verified"
**Pass criteria:** ✅ Verified notification now visible to users

---

## 10. Settings

### TC-10.1: Update profile
**Steps:** /settings → Change full name → Save
**Expected:** Name updated in profiles, navbar updates
**Pass criteria:** ✅ Change persists

### TC-10.2: Delete account
**Steps:** /settings → Danger Zone → Type DELETE → Confirm
**Expected:** Account deleted, all data removed, redirected to landing page
**Pass criteria:** ✅ Cannot log in with old credentials

---

## 11. API Routes

### TC-11.1: GET /api/notifications without auth
**Steps:** curl /api/notifications (no session cookie)
**Expected:** 401 "Authentication required"
**Pass criteria:** ✅ Unauthorized response

### TC-11.2: GET /api/notifications with auth
**Steps:** Authenticated request with filters
**Expected:** 200 with notifications array, only verified ones returned
**Pass criteria:** ✅ Correct data returned

### TC-11.3: POST /api/ocr without file
**Steps:** POST /api/ocr with no file field
**Expected:** 400 "No file provided"
**Pass criteria:** ✅ Validation error returned

### TC-11.4: POST /api/ocr with invalid type
**Steps:** POST /api/ocr with PDF file
**Expected:** 400 "Invalid file type"
**Pass criteria:** ✅ Rejected correctly

---

## 12. Cross-Cutting

### TC-12.1: Dark mode default
**Steps:** Open app in new browser
**Expected:** Dark theme applied (navy background)
**Pass criteria:** ✅ Dark mode is default

### TC-12.2: Mobile responsiveness
**Steps:** Open app on 375px viewport (iPhone SE)
**Expected:** All pages reflow to single column, no horizontal scroll, touch targets ≥ 44px
**Pass criteria:** ✅ Usable on mobile

### TC-12.3: Non-affiliation in footer
**Steps:** Scroll to footer on any page
**Expected:** Non-affiliation disclaimer present
**Pass criteria:** ✅ Disclaimer visible in footer
