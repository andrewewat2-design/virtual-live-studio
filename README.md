# Virtual Live Studio

A lightweight, browser-based virtual livestream studio where one central director coordinates a small cast of original virtual characters to entertain and interact with an audience.

## Product direction

The first release is a creator-operated studio prototype. It prioritizes audience interaction over elaborate world simulation:

- One permanent main host with a distinct personality and role.
- A small supporting cast that can join when useful.
- One central director coordinates every character; characters are profiles, not independent always-running agents.
- A shared, bounded conversation context with speaker selection, turn-taking, cooldowns, and moderation.
- A local audience simulator so the experience can be developed and tested without a TikTok account or live stream.\n- Creator-controlled browser screen capture for a TikTok tab, with an explicit permission prompt and local preview.
- Lightweight stylized 3D characters and simple animation, designed to remain usable on a phone.
- Browser speech synthesis as an optional first voice path; the studio must remain useful when speech synthesis is unavailable.
- A replaceable platform adapter boundary. No undocumented scraping or unsupported platform integration is required for the local prototype.

Browser TikTok screen awareness is being built in phases: capture and preview first, then bounded frame sampling, an optional vision-provider adapter, and director integration. The creator must explicitly start capture and separately enable visual analysis. The studio will not silently capture, automate TikTok controls, or post messages. See [docs/SCREEN-AWARENESS.md](docs/SCREEN-AWARENESS.md).\n\nA later phase may allow a creator to use a photo or video of a real business or location as the scene background, with virtual characters composited into that environment. This is deliberately outside the first milestone.

## Architecture

- **Client:** Vite, vanilla JavaScript modules, and Three.js.
- **Server:** Node.js HTTP server and WebSocket transport.
- **Director:** deterministic, testable orchestration module; optional AI provider integration can be added behind a server-side interface later.
- **Persistence:** JSON-backed local state for the first prototype to avoid native SQLite installation problems on Android. A storage interface keeps migration possible.
- **Tests:** Node's built-in test runner; no native build toolchain required.
- **Live platform:** adapter interface only in the prototype. Platform-specific access must be authorized and reviewed before enabling it.

## Non-goals for the first milestone

- No real-money purchases, gifts, donations, or payment handling.
- No autonomous posting or chat spam.
- No impersonation of real people or unauthorized use of their likenesses or voices.
- No claim that simulated audience activity is real engagement.
- No reliance on unofficial TikTok endpoints.
- No required paid AI or voice API.
- No continuous background agents or unnecessary video-generation calls.

## Development principles

1. Keep the local demo fully functional without API keys.
2. Keep the director deterministic in fallback mode and test it independently.
3. Validate and moderate incoming audience messages before they reach character dialogue.
4. Bound message length, history size, event rate, and character output.
5. Make platform integrations replaceable and disabled unless explicitly configured.
6. Prefer mobile performance and accessibility over visual complexity.
7. Mark work complete only when its acceptance checks pass.

## Local development

Requirements: Node.js 20 or newer and npm.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite. The WebSocket server runs alongside the frontend through the development command.

Run checks:

```bash
npm test
npm run check
```

The exact Termux/Ubuntu setup instructions will be maintained in [docs/ANDROID-TERMUX.md](docs/ANDROID-TERMUX.md).

## Project status

The repository foundation and first browser studio interface are in progress. The current screen-sharing milestone provides a creator-controlled browser capture preview only; it does not yet interpret screenshots with AI or connect to TikTok's internal event systems. The local audience simulator and deterministic director are separate from real TikTok engagement.

## License

The project code is licensed under the MIT License. See [LICENSE](LICENSE). Third-party dependencies, fonts, models, and other assets remain subject to their own licenses.
