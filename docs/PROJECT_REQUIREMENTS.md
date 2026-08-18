# Project Requirements

## Source Material Reviewed

Primary material requested by the user:

- Official PDF: `C:\Users\LENOVO\OneDrive\Desktop\AI\AI_Palmistry & Tarot Intelligence Platform.pdf`
- Detailed pasted project request: `C:\Users\LENOVO\.codex\attachments\3a140265-0410-4cc6-997f-6caf54333a0c\pasted-text.txt`
- Blueprint image: `C:\Users\LENOVO\OneDrive\Desktop\AI\BluePrint.png`

Preserved copies inside this project:

- `docs/source-material/AI_Palmistry & Tarot Intelligence Platform.pdf`
- `docs/source-material/BluePrint.png`

## PDF Reading Note

The official PDF file was found and preserved. Full text extraction was attempted, but the available environment did not have a working PDF extraction library. Installing `pypdf` failed because Python package download hit SSL certificate verification errors.

The Phase 0 plan therefore uses:

- The detailed project request supplied in the attachment.
- The visible blueprint image.
- The PDF file as preserved source material for manual review.

Before implementation-heavy phases, the PDF should be manually reviewed if a PDF reader or extraction tool becomes available.

## Functional Requirements

The application should include:

- User registration.
- User login.
- Secure password hashing.
- JWT authentication.
- Logout.
- USER and ADMIN roles.
- Protected frontend routes.
- User profile management.
- Palm image upload.
- Palm analysis prototype.
- Tarot dataset loading.
- Tarot spreads and card drawing.
- AI interpretation service with fallback.
- Personality insights.
- Recommendation engine.
- Life trend analysis.
- Spiritual guidance score.
- User dashboard.
- Admin dashboard.
- Reading history.
- Analytics charts.
- Reports and PDF export.
- In-app notifications if time permits.
- Documentation and testing notes.

## Technical Requirements

Primary stack:

- Frontend: React.js, Vite, JavaScript.
- Styling: Tailwind CSS or simple CSS system decided during frontend phase.
- Backend: Python, FastAPI.
- Database: PostgreSQL.
- Charts: Chart.js.
- Image processing: Pillow/OpenCV where practical.
- Testing: Pytest where practical, Postman documentation.
- Version control: Git/GitHub ready.

Avoid unless genuinely needed:

- Redis.
- Kafka.
- Elasticsearch.
- Kubernetes.
- Microservices.
- MongoDB.
- Vector databases.
- Complex cloud infrastructure.

## Ethical Requirements

The app must clearly present palmistry and tarot as spiritual/self-reflection and entertainment/wellness content.

The app must not claim:

- Scientifically proven future prediction.
- Medical diagnosis.
- Guaranteed financial outcomes.
- Guaranteed relationship outcomes.

## Localhost Requirement

The final application should run locally:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8000`
- FastAPI docs: `http://localhost:8000/docs`
- PostgreSQL: `localhost:5432`

## Phase Rule

Development must stop after each phase and wait for user approval before continuing.
