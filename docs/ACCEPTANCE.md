# Acceptance checks

## Local studio foundation

- [ ] `npm run check` passes.
- [ ] `npm test` passes.
- [ ] `npm run build` passes.
- [ ] Studio loads at localhost and connects to the local WebSocket server.
- [ ] Start and pause controls update state.
- [ ] Local visitor messages appear and are moderated.
- [ ] Director replies use only the configured cast.
- [ ] Voice synthesis can be enabled and disabled without breaking chat.
- [ ] Clearing the room resets the visible conversation.

## Browser screen capture milestone SA-1

- [ ] The creator must click the share button to open the browser's native chooser.
- [ ] The creator can select a TikTok browser tab/window when the browser offers it.
- [ ] The preview appears only after permission is granted.
- [ ] A visible SHARING state is displayed.
- [ ] Stop sharing ends all capture tracks and clears the preview.
- [ ] Closing the selected tab or stopping capture externally returns the studio to NOT SHARED.
- [ ] Permission denial and unsupported browser states are explained without crashing the studio.
- [ ] No captured frames are sent to the server or an AI provider in SA-1.

## Future screen-awareness milestones

Do not mark AI visual reading complete until frame sampling, explicit analysis consent, provider integration, confidence handling, deduplication, privacy controls, and director integration have their own passing tests.

## Supervised fan-event milestone

- [ ] `npm run check` includes the fan-event agent module and its tests.
- [ ] `npm test` verifies supported and unsupported gifts/instructions.
- [ ] Starting the show enables the local fan-event simulator.
- [ ] A simulated Rose triggers a coordinated cast applause animation and a thank-you.
- [ ] A simulated Universe triggers a personalised demo verse for the named fan.
- [ ] Dance and switch-places instructions trigger bounded reusable stage animations.
- [ ] Unknown gift names and arbitrary instructions are rejected.
- [ ] Pausing the show prevents fan-event performances.
- [ ] The UI labels all fan events as local simulation, not real TikTok gifts.
- [ ] No TikTok login, credentials, real gifts, or platform integration are required.
