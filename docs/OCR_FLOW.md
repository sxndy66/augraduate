# AU Track — OCR Flow Documentation

## Overview

The OCR (Optical Character Recognition) feature allows students to upload a screenshot of their Anna University results page and automatically extract subject codes, credits, and grades. This eliminates manual data entry and reduces transcription errors.

## Architecture

### Primary Path: Client-Side OCR (Tesseract.js)

```
User uploads screenshot
       ↓
File validation (type, size) — client-side
       ↓
Image preview displayed
       ↓
User clicks "Run OCR"
       ↓
Tesseract.js loaded dynamically (import())
       ↓
OCR processing in Web Worker (no UI freeze)
       ↓
Raw text extracted from image
       ↓
extractGradesFromText() parses text into structured entries
       ↓
Results displayed in editable table
       ↓
User reviews and corrects any misread values
       ↓
User confirms → grades saved to user_grades via Supabase
       ↓
Screenshot can be deleted (object URL revoked)
```

### Fallback Path: Server-Side OCR (Gemini Vision)

```
Client sends image to POST /api/ocr
       ↓
Server validates auth + file
       ↓
If GEMINI_API_KEY is set:
       ↓
Image sent to Google Gemini Vision API
       ↓
Gemini returns structured JSON (subject codes + grades)
       ↓
Server validates and returns to client
       ↓
If GEMINI_API_KEY is NOT set:
       ↓
Returns 501 with clientSideOcr: true
       ↓
Client falls back to Tesseract.js
```

## Privacy Considerations

### Client-Side OCR (Default)
- ✅ Image **never leaves the user's browser**
- ✅ No image data sent to any server
- ✅ Only extracted text/grades are saved (after user review)
- ✅ Image preview uses `URL.createObjectURL()` — local blob URL
- ✅ Deleting the screenshot revokes the object URL and clears memory

### Server-Side OCR (Optional)
- ⚠️ Image is sent to the server and then to Google Gemini Vision API
- ⚠️ Only enabled when `GEMINI_API_KEY` environment variable is set
- ⚠️ Image is processed in memory — not stored on disk or in database
- ⚠️ Only the extracted grade data is returned to the client
- ⚠️ Google Gemini API receives the image — subject to Google's data policies

### Privacy Notice (shown to user)
> "Your screenshot is processed entirely in your browser using client-side OCR (Tesseract.js). The image is never uploaded to our servers. Only the extracted grade data — which you review and confirm — is saved to your account."

## File Validation

| Rule | Value |
|------|-------|
| Accepted types | PNG, JPG, JPEG, WEBP |
| Max file size | 5 MB |
| Validation location | Client-side (UploadZone) + Server-side (API route) |
| Invalid file handling | Error message displayed, file rejected |

## Text Extraction & Parsing

### `extractGradesFromText()` — `lib/validators/ocr.ts`

The function parses raw OCR text line by line, looking for patterns:

1. **Subject code pattern:** `[A-Z]{2,4}\s?\d{2,5}[A-Z]?` (e.g., CS8492, IT8501, MA8151)
2. **Grade pattern:** `\b(O|A+|A|B+|B|C|U|RA)\b` (case-insensitive)
3. **Credits pattern:** `\b\d{1,2}\b` (number after subject code, before grade)

### Line Filtering
- Skips header lines (containing "course", "subject", "code", "credits", "grade", "result")
- Skips lines shorter than 5 characters
- Skips lines without both a subject code and a grade

### Confidence Scoring
- Each extracted entry gets a confidence score (default 0.85)
- Low-confidence entries are flagged with "Needs Review" badge in the UI
- Users can edit any entry before confirming

## Error Handling

| Error | Cause | User Action |
|-------|-------|-------------|
| No grades extracted | Unclear image, unsupported format | Try clearer screenshot or manual entry |
| OCR engine load failure | Network issue loading Tesseract | Retry or use manual entry |
| Invalid file type | Non-image file uploaded | Upload PNG/JPG/JPEG/WEBP only |
| File too large | > 5 MB | Compress or crop the screenshot |
| Save failure | Supabase error, network issue | Retry save or check connection |

## Fallback Strategy

1. **Primary:** Tesseract.js client-side OCR
2. **Fallback 1:** Server-side Gemini Vision OCR (if configured)
3. **Fallback 2:** Manual grade entry at `/semesters/[semester]`

The manual entry fallback link is always visible on the OCR upload page, ensuring students are never blocked by OCR failures.

## User Workflow States

| State | Description |
|-------|-------------|
| `upload` | Initial state — file upload zone visible |
| `processing` | OCR running — progress indicator shown |
| `results` | OCR complete — editable results table displayed |
| `confirm` | Pre-save confirmation — summary with projected GPA |

## Component Architecture

```
app/ocr-upload/page.tsx          — Main page orchestrating the flow
├── components/ocr/UploadZone.tsx     — Drag & drop + file validation
├── components/ocr/OCRProgress.tsx    — Progress indicator with stages
├── components/ocr/OCRResults.tsx     — Editable results table
└── components/ocr/OCRConfirm.tsx     — Confirmation + save step
```

## API Route

### `POST /api/ocr`
- **Auth:** Required (session check)
- **Input:** multipart/form-data with `file` (image) and optional `semester`
- **Output:** `{ success: boolean, text: string, grades: OCRGradeEntry[] }`
- **Fallback:** Returns `{ clientSideOcr: true }` when server OCR not configured

### `GET /api/ocr`
- Returns API status and usage information
- No auth required
