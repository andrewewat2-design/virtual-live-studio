# Virtual Live Studio

A lightweight, browser-based virtual entertainment studio. One central director coordinates an original cast, responds to audience activity, and triggers expressive stage performances.

## Product direction

The first release is a creator-operated local prototype focused on entertaining audience interaction rather than elaborate UI or world simulation.

- **Nova** is the warm, confident host who welcomes viewers and keeps the show moving.
- **Milo** is the playful comedian who brings spontaneous humour and performs celebration songs.
- **Zuri** is the sharp, witty challenger who starts friendly competitions and keeps the cast honest.
- The characters are profiles coordinated by one director, not three independent always-running AI agents.
- Specialist modules handle audience events, event classification, character/personality rules, performance planning, memory and safety boundaries.
- The local fan-event simulator supports a Rose applause reaction, a personalised demo song for a Universe gift, dancing, and cast position-change requests.
- Lightweight CSS motion and browser speech synthesis keep the prototype usable without paid services or API keys.
- A local audience simulator lets development continue without a TikTok account or live stream.
- Creator-controlled browser screen capture currently provides a local preview only. It does not send frames to a server or AI provider.

## Intelligence architecture

See [docs/INTELLIGENCE-ARCHITECTURE.md](docs/INTELLIGENCE-ARCHITECTURE.md).

The current fan-event director is deterministic and API-free. It demonstrates the agent responsibilities and event-to-performance pipeline; it is **not yet a generative AI integration**. Future language or music generation must remain behind server-side provider interfaces, with creator permissions and safety checks outside the model.

## Local development

Requirements: Node.js 20 or newer and npm.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite. The WebSocket server runs alongside the frontend.

Run checks:

```bash
npm run check
npm test
npm run build
```

## Important boundaries

- The Rose and Universe buttons are simulated test events, not real TikTok gifts.
- No TikTok account login, OAuth connection, or LIVE integration is implemented.
- No undocumented TikTok endpoints or scraping are used.
- Screen sharing is explicit and local-preview-only; it does not automatically grant access to TikTok comments or gifts.
- No real-money purchases, gifts, donations, or payment handling.
- No autonomous posting or chat spam.
- No impersonation of real people or unauthorized use of their likenesses or voices.
- Simulated audience activity is never represented as real engagement.
- No paid AI, TTS, or music API is required for the local prototype.

## Current milestone status

The local fan-event pipeline and reusable reaction animations are being introduced in this milestone. The visual characters are still lightweight CSS/emoji stand-ins; production-quality custom 3D avatars, full-body rigging, true singing/lip-sync, real position choreography, AI-generated songs, and authorized TikTok event ingestion remain future work. Do not mark those capabilities complete until implemented and acceptance-tested.

## License

The project code is licensed under the MIT License. See [LICENSE](LICENSE). Third-party dependencies and assets remain subject to their own licenses.
