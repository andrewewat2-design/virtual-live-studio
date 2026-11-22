# Gameplay awareness and streaming-source adapters

## Product decision

Virtual Live Studio should be able to react to the creator's broadcast content, not only to chat. Gameplay is an important content type. PUBG, GTA, racing games, sports games, and other streams can all feed the same central director through a common visual-observation interface.

The first implementation remains browser screen capture. Native high-performance game capture is a later desktop integration, not something the browser can reliably provide on its own.

## What we borrow from game-streaming software

OBS demonstrates a useful separation between scenes and sources: a stream can combine game capture, window/display capture, audio, images, and browser-based overlays. Its Game Capture source is a specialized, efficient desktop capture path for supported Windows games; ordinary browser capture is not an equivalent replacement. OBS also provides a Browser Source for web overlays and an authenticated WebSocket interface for integrations and scene/source events.

Virtual Live Studio borrows these architectural ideas without requiring OBS in the first release:

- **Content source:** browser tab/window capture now; OBS source adapter and desktop capture companion later.
- **Scene context:** game, lobby, loading screen, pause menu, cutscene, or non-game content.
- **Visual observation:** a bounded, timestamped description of what is visibly happening.
- **Event interpretation:** map observations into a small event vocabulary such as combat, elimination, near miss, vehicle crash, mission progress, victory/defeat, or uncertain/unknown.
- **Director response:** one central director decides whether and how a character reacts.
- **Creator controls:** enable/disable gameplay awareness, set reaction intensity, mute reactions, and pause analysis.

## Observation contract

A future visual provider should return structured data similar to:

```json
{
  "source": "game_capture",
  "content_type": "gameplay",
  "game_hint": "unknown",
  "scene": "active_gameplay",
  "events": [
    {
      "type": "near_miss",
      "summary": "Player narrowly avoided an incoming vehicle",
      "confidence": 0.82,
      "observed_at": "2026-01-01T12:00:00Z"
    }
  ],
  "uncertain": false
}
```

This is a schema example, not a real observation. Timestamps and confidence must be supplied by the actual provider. Unknown or low-confidence events must not trigger confident narration.

## Reaction policy

- React to meaningful events, not every frame.
- Deduplicate the same event across repeated frames.
- Apply event-specific cooldowns and a global speech cooldown.
- Prefer short reactions during intense gameplay; do not talk over critical moments continuously.
- Do not claim a kill, win, gift, score, or mission result unless it is visibly supported with sufficient confidence.
- Use game-specific telemetry or official APIs only where the creator has authorization and the integration is supported. Do not read game memory, inject into games, bypass anti-cheat, or automate gameplay.
- Do not auto-control TikTok or the game.
- Let the creator disable gameplay reactions immediately.

## Later desktop/OBS integration

A desktop edition can investigate OBS as an optional source provider:
- OBS Game Capture / Window Capture / Display Capture supplies the visual source.
- OBS Browser Source can display Virtual Live Studio character overlays.
- OBS WebSocket can communicate scene/source state and control OBS when explicitly configured by the creator. It must be password-protected and must not be exposed to the public internet.

The desktop adapter must be optional. The browser-only product remains useful without OBS. The OBS integration is not part of the current Android/Termux browser milestone.

## Implementation stages

- **GA-0:** define this source/observation contract and reaction policy.
- **GA-1:** add gameplay mode metadata and synthetic event fixtures to the local simulator.
- **GA-2:** connect validated screen observations to the director with cooldowns and confidence gates.
- **GA-3:** test on recorded sample gameplay clips and manually reviewed event labels.
- **GA-4:** investigate a desktop OBS adapter and overlay source.
- **GA-5:** add game-specific event adapters only when technically and legally supportable.

## Evaluation

Measure event precision, missed-event rate, false reactions per minute, duplicate reactions, reaction latency, and creator override frequency. A lower reaction rate with reliable timing is preferable to constant incorrect commentary.
