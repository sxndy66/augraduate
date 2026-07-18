# AU Track — Legal Notes

## Non-Affiliation Disclaimer

**AU Track is an independent, student-built platform and is NOT affiliated with, endorsed by, sponsored by, or officially connected to Anna University or any of its affiliated colleges.**

This disclaimer is displayed:
- In the footer of every page
- On the notifications page (prominent banner)
- In the privacy policy
- In the terms of service
- In marketing materials and social media bios

### Required Wording
> "AU Track is an independent platform and is not affiliated with, endorsed by, or officially connected to Anna University. All information is provided for convenience and informational purposes only. Always verify with official university sources before making academic decisions."

## Privacy Obligations

### Data Collected
| Data | Purpose | Storage | Retention |
|------|---------|---------|-----------|
| Email address | Authentication, account recovery | Supabase Auth | Until account deletion |
| Full name (optional) | Display personalization | profiles table | Until account deletion |
| Degree/regulation/branch | Personalization, correct curriculum | profiles table | Until account deletion |
| Grade data | GPA/CGPA calculation | user_grades table | Until account deletion |
| Grade screenshots | OCR processing | Browser memory only | Deleted immediately after processing |
| Notification read state | UX (read/unread indicators) | notification_reads table | Until account deletion |
| Saved notifications | User bookmarks | saved_notifications table | Until user unsaves or deletes account |

### Data NOT Collected
- ❌ Grade screenshots (processed client-side, never uploaded)
- ❌ Location data
- ❌ Device fingerprints
- ❌ Browsing history
- ❌ Third-party tracking cookies
- ❌ Analytics with PII (planned: privacy-friendly analytics only)

### User Rights
1. **Right to Access** — Users can view all their data in the app (dashboard, settings)
2. **Right to Deletion** — Users can delete their account from Settings → Danger Zone, which removes all associated data
3. **Right to Export** — Users can request a data export (Phase 4 — automated)
4. **Right to Rectification** — Users can edit any of their data (grades, profile, notes)

### OCR Privacy
- Grade screenshots are processed entirely in the user's browser using Tesseract.js
- No image data is transmitted to AU Track servers (default mode)
- Only the extracted grade text — which the user reviews and confirms — is saved
- If server-side OCR (Gemini Vision) is enabled, images are processed in memory and not stored

## Terms of Service Summary

1. **Service is "as-is"** — AU Track is provided without warranties. GPA/CGPA calculations are for informational purposes only.
2. **Not a substitute for official records** — Always verify grades and notifications with Anna University official sources.
3. **User responsibility** — Users are responsible for the accuracy of data they enter or confirm via OCR.
4. **No guarantee of notification timeliness** — Notifications are sourced from public channels and may be delayed.
5. **Acceptable use** — No scraping, automated access, or abuse of the platform.
6. **Account termination** — AU Track reserves the right to terminate accounts that violate terms.
7. **Changes to terms** — Users will be notified of significant term changes.

## Disclaimer of Liability

AU Track and its creator (Santhosh V) are not liable for:
- Inaccurate OCR results (users review and confirm all extracted data)
- Incorrect GPA/CGPA calculations due to user input errors
- Missed or delayed notifications
- Academic decisions made based on app-provided information
- Data loss due to service outages or platform changes
- Any consequential damages arising from use of the platform

## Intellectual Property

- **AU Track codebase** — Owned by Santhosh V
- **Anna University name** — Trademark of Anna University; used descriptively under fair use for identification of the service's target audience
- **Subject data, regulations, grading system** — Public factual information from Anna University; used under fair use
- **Notifications** — Sourced from publicly available university channels; original content belongs to the respective publishers

## GDPR / IT Act Compliance

### GDPR (for EU users — precautionary)
- Lawful basis: Legitimate interest (providing academic tracking service requested by user)
- Data minimization: Only collect data necessary for the service
- Consent: Explicit consent during signup for data processing
- Right to erasure: Account deletion removes all personal data

### IT Act, 2000 (India)
- Reasonable security practices implemented (RLS, encrypted at rest via Supabase)
- No sensitive personal data (SPDI) collected beyond email and academic records
- Privacy policy clearly states data handling practices

## Cookie Usage

- **Auth cookies:** Supabase session tokens (HTTP-only, secure) — essential for authentication
- **No tracking cookies:** No Google Analytics, Facebook Pixel, or third-party trackers
- **localStorage:** Used for theme preference and notification mute settings — not cookies

## Children's Privacy

- AU Track is intended for college students (18+)
- No knowingly collected data from individuals under 18
- No age verification gate (college enrollment implies 18+)

## Open Source / License

The AU Track codebase is proprietary. The project is not open source. Third-party libraries are used under their respective licenses (MIT, Apache 2.0, etc.).

## Contact for Legal Matters

- **Email:** santhosh023166@gmail.com
- **Contact page:** /contact
- **Privacy policy:** /privacy
- **Terms of service:** /terms
