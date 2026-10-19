# AgriCare AI implementation plan

## Goal
Replace the template screen with a responsive, practical AgriCare AI application based on the uploaded brief.

## Work
- Build a complete agricultural health experience with clear navigation for plant analysis, fertilizer guidance, analysis history/dashboard, and project information.
- Implement image selection, drag-and-drop, preview, format/size validation, progress, and a cautious result experience. Never show fabricated model predictions or confidence; identify demo/unconfigured analysis clearly.
- Implement a fertilizer questionnaire that uses only provided crop, growth, soil and symptom inputs; distinguish nutrient support from disease treatment and request missing data instead of inventing measurements or doses.
- Add Lovable Cloud-backed persistence for analysis history and dashboard data, with access controls and privacy-conscious storage.
- Integrate a supported server-side image analysis model if available and configure it safely; explain any model/credential blocker rather than faking inference.
- Add route-specific metadata, focused tests for rules and key flows, and setup/limitations information based on what is actually configured.

## Technical details
- Use the existing TanStack Start and React stack, semantic design tokens, and project component conventions.
- Use Lovable Cloud for persistent data and server-side analysis; keep image analysis and any credentials off the browser.
- Validate the live app and available tests, then report which capabilities are real, demo-only, or blocked by external setup.
