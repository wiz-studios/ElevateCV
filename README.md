# AI Resume Builder MVP

A full-stack AI-powered resume builder that tailors resumes to job descriptions.

## Features

- **Resume Parsing**: Extract structured data from raw resume text
- **Job Description Parsing**: Parse job postings into keywords and responsibilities
- **AI Tailoring**: Rewrite resume bullets to match job requirements
- **ATS Scoring**: Check resume compatibility with applicant tracking systems
- **PDF Export**: Generate clean, ATS-friendly PDF documents

## Project Structure

\`\`\`
├── app/
│   ├── api/
│   │   ├── resume/parse/route.ts    # POST /api/resume/parse
│   │   ├── job/parse/route.ts       # POST /api/job/parse
│   │   ├── tailor/route.ts          # POST /api/tailor
│   │   ├── ats-score/route.ts       # POST /api/ats-score
│   │   └── pdf/route.ts             # POST /api/pdf
│   ├── page.tsx                     # Main application page
│   └── layout.tsx                   # Root layout
├── src/
│   ├── types/
│   │   ├── resume.d.ts              # Resume type definitions
│   │   ├── job.d.ts                 # Job type definitions
│   │   └── tailor.d.ts              # Tailoring type definitions
│   ├── services/
│   │   ├── parser.ts                # Resume & job text parsing
│   │   ├── ai.ts                    # AI tailoring with prompts
│   │   └── renderer.ts              # PDF/HTML generation
│   └── utils/
│       ├── schema-validator.ts      # JSON schema enforcement
│       └── ats-checker.ts           # ATS compatibility scoring
├── components/
│   └── resume-builder/
│       ├── resume-upload.tsx        # Resume input component
│       ├── job-input.tsx            # Job description input
│       ├── tailor-controls.tsx      # Tailoring controls
│       ├── resume-preview.tsx       # Resume preview
│       ├── json-preview.tsx         # JSON output display
│       └── ats-score-card.tsx       # ATS score display
└── lib/
    └── example-data.ts              # Example resume/job data
\`\`\`

## Quick Start

1. **Install dependencies**:
   \`\`\`bash
   npm install
   \`\`\`

2. **Run development server**:
   \`\`\`bash
   npm run dev
   \`\`\`

3. **Open browser** at http://localhost:3000

## API Endpoints

### POST /api/resume/parse
Parse raw resume text into structured JSON.

**Request:**
\`\`\`json
{
  "raw_text": "JOHN DOE\\njohn@email.com..."
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "name": "John Doe",
    "email": "john@email.com",
    "skills": ["JavaScript", "React"],
    "bullets": [...]
  }
}
\`\`\`

### POST /api/job/parse
Parse job description into structured JSON.

### POST /api/tailor
Tailor resume to match job description.

**Request:**
\`\`\`json
{
  "resume": { ... },
  "job": { ... },
  "style": "concise"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "resume": { ... },
    "match_score": 0.85,
    "missing_skills": ["Kubernetes"]
  }
}
\`\`\`

### POST /api/ats-score
Calculate ATS compatibility score.

### POST /api/pdf
Generate PDF from resume JSON.

## Environment Variables

\`\`\`env
# Set to 'true' to use actual AI tailoring (requires AI Gateway)
USE_AI_TAILORING=false
# Enable AI-assisted parsing and embedding similarity (optional)
USE_AI_PARSING=false
OPENAI_PARSER_MODEL=openai/gpt-4o-mini
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
\`\`\`

## Phase Roadmap

### Phase 0 (Complete)
- PRD and success metrics defined
- Project structure established

### Phase 1 (Current)
- ✅ Regex-based resume/job parsing
- ✅ AI tailoring stub (no external API required)
- ✅ ATS scoring algorithm
- ✅ HTML/TXT export
- ✅ Full frontend with preview

### Phase 2 (Complete)
- [x] Embedding-based bullet similarity search
- [x] Improved AI parsing accuracy
- [x] Enhanced ATS scoring with industry benchmarks
- [x] Resume template system

### Phase 3 (Planned)
- Full AI-powered tailoring
- DOCX file upload support
- PDF generation with Puppeteer

## Testing

Use the "Load Example" buttons in the UI to test with sample data.

Example API test with curl:
\`\`\`bash
curl -X POST http://localhost:3000/api/resume/parse \\
  -H "Content-Type: application/json" \\
  -d '{"raw_text": "JOHN DOE\\njohn@email.com\\n\\nSKILLS\\nJavaScript, React, Node.js"}'
\`\`\`

## License

MIT
\`\`\`
