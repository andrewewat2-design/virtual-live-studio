# Browser TikTok Screen Awareness

## V1 target

The first screen-awareness target is TikTok opened in a desktop-class browser tab. The creator opens TikTok LIVE in that browser, returns to Virtual Live Studio, presses **Share TikTok screen**, and explicitly selects the TikTok tab/window in the browser's chooser.

The studio must never attempt silent capture, enumerate available tabs, bypass the browser chooser, or persist permission. The browser prompts for permission on every capture session.

## Capture pipeline

1. **Creator-controlled capture** — use `navigator.mediaDevices.getDisplayMedia()` from a direct button click. Request video only by default; do not request system audio in the first milestone.
2. **Preview and controls** — show a visible preview, capture status, selected surface type when exposed by the browser, and a prominent Stop button. Stop tracks immediately when the creator stops capture, the track ends, or the studio disconnects.
3. **Sampling** — do not stream every frame to a model. Sample at a low, configurable rate (initial target: one frame every 2–3 seconds) and only while the creator has enabled visual analysis.
4. **Privacy gate** — before any frame leaves the browser, show what is being shared and obtain a separate explicit opt-in to visual analysis. Keep frame resolution and size bounded. Do not persist raw frames by default.
5. **Vision adapter** — pass sampled frames to a replaceable vision provider. The provider returns structured observations, not free-form commands.
6. **Observation validation** — validate and timestamp observations; mark uncertain text as uncertain. Do not infer hidden data, private account information, or events that are not visible.
7. **Central director** — provide validated observations as context to the single director. The director decides whether a character should respond, ignore, ask for clarification, or wait. Characters do not run independent vision agents.

## Initial visible signals

- New visible comments and repeated questions.
- Visible usernames only when needed to address a comment; avoid retaining them.
- Visible gift/activity notifications.
- Visible LIVE status and audience metrics when legible.
- On-screen warnings or interruptions, which should cause the director to pause and notify the creator rather than improvise.

## Reliability rules

- OCR/vision output is fallible. Never present a low-confidence reading as fact.
- Deduplicate repeated observations across adjacent frames.
- Apply cooldowns so the same comment or notification does not trigger repeated dialogue.
- Do not auto-click, type into, or control TikTok.
- Do not automatically post comments or messages to TikTok.
- Never represent the local audience simulator as real TikTok viewers.
- If capture ends, the browser loses support, or vision is unavailable, clearly show that screen awareness is offline and keep the rest of the studio usable.

## Browser and mobile constraints

The Screen Capture API is not supported in every browser and generally requires a secure context. A direct user gesture is required to start capture, and the user must choose the surface in the browser's chooser. For local development, localhost is generally treated as a secure context by modern browsers, but the exact Android browser and version must be tested.

The first target is a browser-based TikTok tab. Capturing the TikTok Android app or another physical device is explicitly out of scope for V1 and will require separate versions/adapters.

## Implementation phases

- **SA-1:** permission flow, live preview, stop handling, visible status, browser compatibility diagnostics.
- **SA-2:** bounded frame sampling and explicit visual-analysis opt-in; no raw-frame persistence.
- **SA-3:** optional vision-provider adapter and structured observation schema.
- **SA-4:** director integration, deduplication, confidence handling, cooldowns, and tests with synthetic screenshots.
- **SA-5:** real-browser acceptance test using a TikTok LIVE session or a creator-controlled practice session.

No paid AI provider is required to run the studio's non-vision features. Vision analysis may require a configured provider until a suitable local model is deliberately selected and tested.
