# Jiahong's Reminders for Future AI-tutor GSR

## Successor Tips

- Generative AIs may not be the best solution for every problem. Consider simpler alternatives (e.g., keyword search, rule-based systems, classic algorithms) before jumping to them.
- When using Generative AIs, transparency and explainability are key. Always consider the usecases and instructors' perspectives first. They make things easier to implement but are not necessary for most of our usecases.
- Make your tools persistently available with detailed and straightforward documentation. Instructors and TAs may not have time to learn new tools, so make it easy for them to get started.
- Prioritize instructors', TAs', and students' daily usage, pain points, and workflows. Instructors may have different preferences and workflows with their courses.
- Start small—prototype one “core” use-case, gather feedback from one course and one assignment, then iterate outward.

## Future Ideas

### 1. Student-Facing Learning & Support Tools

#### 1.1 Syllabus & Course Content Q&A

- What: A lightweight “Let Me Google That for You”–style interface that ingests the course syllabus (via RAG or simple parsing) and answers common policy/deadline questions.
- Why: Reduces repetitive inbox traffic and ensures students get consistent, immediate answers.
- Next Steps:

  1.  Prototype a minimal web UI that ingests a syllabus PDF and answers keyword queries.
  2.  Measure question frequency in Canvas to prioritize topics.
  3.  Leverage RAG with justifcations and linked references to course materials for transparency and explanability.

#### 1.2 Assignment Guidance & Breakdown

- What: A bot that, given an assignment prompt, estimates total effort, breaks it into subtasks, and suggests an optimal work order.
- Why: Helps students plan time and reduces last-minute confusion. Also helps instructors scaffolding assignments and identify common pitfalls in assignment design.
- Next Steps:

  1.  Survey past assignment rubrics to identify common subtasks.
  2.  Build a template engine that maps rubric items to time estimates.
  3.  Leverage LLMs to generate a breakdown based on the prompt and rubric.

#### 1.3 Accessibility & Translation Workflows

- What: End-to-end pipeline for video transcription, speaker ID, and translation into multiple languages.
- Why: Ensures course materials are accessible to all students and supports non-native speakers.
- Next Steps:

  1.  Evaluate open-source transcription engines (e.g., Whisper).
  2.  Build a demo that transcribes one lecture video, segments by speaker, and outputs translated captions.

### 2. Instructor & TA Empowerment Tools

#### 2.1 Assignment-Specification Creator

- What: Low-code interface for instructors to define new assignments: components (file upload, text box, URL), validation logic, and feedback messages.
- Why: Lowers barrier for faculty to adopt advanced validator tools.
- Next Steps:

  1.  Sketch a React UI for adding/removing “components” and editing check functions.
  2.  Connect to the existing assignment.js class structure.

#### 2.2 Live Engagement & Polling Layer

- What: Canvas-integrated Slido-style module for live quizzes and polls, with automatic gradebook syncing.
- Why: Increases in-class participation and provides real-time insight into comprehension.
- Next Steps:

  1.  Review open-source Slido clones and Canvas grading APIs.
  2.  Build a minimal widget for 5-question polling and gradebook export.

#### 2.3 Pedagogy Coaching Suite

- What: Tools for instructors to review and refine course materials:
  Syllabus critique
  Slide/material auto-improvement
  Assignment text revision suggestions
- Why: Ensures high-quality, consistent course design across sections.
- Next Steps:

  1.  Develop a “course review” prompt library.
  2.  Pilot on one lecture slide deck and compare before/after metrics (e.g., clarity survey).

### 3. Course Planning & Advising

#### 3.1 Social Matchmaking & Study Groups

- What: A system that pairs students into study groups based on complementary strengths/interests (students fill out their strengths/interests in a survey).
- Why: Fosters peer learning and mentorship.
- Next Steps:

  1.  Define survey questions to capture strengths/interests.
  2.  Implement a matching algorithm (e.g., Gale–Shapley variant) OR LLM-based matching with scoring and justifications for transparency and explainability.

### 4. Content Ingestion & Resource Integration

#### 4.1 Traditional Material Ingestion for Search & Reference

- What: Pipeline to ingest PDFs, slide decks, and readings into a searchable index (Elasticsearch or simple vector DB).
- Why: Central “Resource Hub” for students and instructors to quickly find relevant examples and papers.
- Next Steps:

  1.  Build or integrate with the Canvas “Add to Hub” button.
  2.  Index one course’s materials and evaluate search relevance.
