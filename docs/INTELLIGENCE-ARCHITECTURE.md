# Intelligent cast and fan-event architecture

## Guiding separation

- **The director decides what should happen.**
- **Character profiles determine how it should feel.**
- **The performance layer determines how it should look and sound.**

Nova, Milo and Zuri are character identities, not separate autonomous agents. One central director owns turn-taking and coordinates the specialists.

## Specialist responsibilities

| Specialist | Responsibility | Boundary |
|---|---|---|
| Audience | Normalise viewer names and participation events | Does not invent real viewers |
| Event | Classify supported gifts and instructions | Unknown events are rejected |
| Personality | Apply the cast's roles, voice and relationships | Cannot change safety policy |
| Memory | Retain bounded, relevant interaction context | No sensitive profile inference |
| Performance | Turn an approved plan into speech, animation and sound | Can only select allow-listed actions |
| Safety | Validate content and permissions | Can block a request |
| Central director | Coordinate specialists and publish one coherent plan | Owns final orchestration |

## Current deterministic prototype

The current implementation is a rules-based demonstration, not a connected generative AI system.

| Input | Approved plan |
|---|---|
| Rose gift | Nova thanks the fan; all three characters clap |
| Universe gift | Cast celebrates; Milo performs a short personalised demo verse |
| Dance instruction | Cast performs a reusable dance motion |
| Switch-places instruction | Cast performs a lightweight position-change animation |
| Unknown gift or instruction | Rejected; no stage action runs |

The browser simulator sends these events over the local WebSocket. The server validates the event and returns a bounded performance plan. The browser plays the corresponding CSS animation and optionally reads the text or demo verse using built-in speech synthesis.

## Safety and authority

- Only explicitly supported event types and action names are accepted.
- Fan instructions cannot invoke arbitrary browser, operating-system, account, or network actions.
- TikTok gifts/comments are not connected; test controls are clearly labelled as local simulation.
- Creator controls remain authoritative. Pausing the show prevents fan-event performances.
- A future generative provider may propose dialogue or song lyrics, but deterministic policy and allow-listed performance execution remain outside the model.
- Any future platform integration must use an authorized, reviewed interface and least-privilege permissions.

## Next phases

1. Complete and test deterministic fan-event orchestration.
2. Replace emoji/orb stand-ins with original, consistent character artwork and rigged 3D avatars.
3. Add animation states: idle, clap, wave, laugh, dance, sing, walk and group celebration.
4. Add character relationship rules and richer shared context.
5. Add an optional generative dialogue/song provider behind a server-only adapter.
6. Add approved, consent-based platform event ingestion only after availability and policy are verified.

Do not claim real TikTok LIVE event support, real 3D rigging, generated music, or independent autonomous agents until those systems exist and pass acceptance tests.
