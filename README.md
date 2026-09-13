# Timeline — restore the timeline

A mobile-first daily ordering puzzle, built as a dependency-free static website.

## Local play

With Node.js 20 or later installed, run `npm start` and open http://127.0.0.1:4173/. No install or build step is required. Keep the terminal open while playing; Ctrl+C stops the server. `npm test` runs the checks.

## The game

Five event fragments and five empty timeline spaces are available from the beginning. Tap a fragment and then a space to place it. Tap an occupied tile and another space to swap or move it. Selecting an unplaced fragment and an occupied space returns the displaced fragment to the tray. Return tile removes the selected tile; Undo reverses the last move. All five fragment choices remain available throughout.

Submit the whole arrangement once. All years and the final score are revealed together. The result includes your submitted order, the correct chronology, event explanations, and source links. There are no timed rounds, lives, or individual-answer reveals.

Daily boards and results persist on this device. Practice is unlimited and stays separate from daily statistics. Daily puzzles reset at midnight UTC. Version 2 has separate saved data because the old score is not comparable; version-1 data is left untouched.

## Scoring

Five events produce ten unique pairs. A pair earns one point when its earlier event appears before its later event. Timeline integrity is correct pairs / 10, expressed as a percentage.

- A B C D E: 10 pairs, 100%.
- E A B C D: 6 pairs, 60%. The correctly ordered four-event sequence still earns credit.
- B A C D E: 9 pairs, 90%.
- E D C B A: 0 pairs, 0%.

Exact positions are shown in the result only as a comparison. They do not determine the score. A fully random order averages 50%, so this is an order-accuracy measure, not a percentile or a difficulty-adjusted rating.

## Phone design

The board uses two compact columns: timeline and fragments. Short exhibit labels keep tiles readable while full titles appear in the reveal. Tap controls avoid drag-and-drop conflicts with phone scrolling. The style uses archive paper, ink, bronze, serif exhibit headings, numbered fragments, and a broken chronology line that becomes continuous when filled. Small screens can scroll naturally; text is never clipped to force every device into a fixed height.

Controls support keyboard focus and Enter/Space. Date and score information is not inserted into the playable board or accessible tool responses before submission. As with any static game, the complete answer data remains inspectable in the downloaded source.

## GitHub and phone review

See [GITHUB-PAGES.md](GITHUB-PAGES.md) for the step-by-step setup. The supplied `.github/workflows/pages.yml` tests the game and publishes only `dist/` after each push to `main`. You do not need a database, hosting credentials, or a build service.

`timeline-github.zip` contains the complete source, workflow, tests, and guide. `timeline-web.zip` contains only the publishable website, for other static hosts. Extract archives before uploading; do not publish the ZIP itself.

No repository has been created or pushed and no online deployment has been performed in this update.

## Refinement blocks

- `dist/engine.js`: puzzle generation, board operations, validation, pair scoring, statistics.
- `dist/app.js`: tap interactions, result reveal, sharing, persistence, optional WebMCP tools.
- `dist/style.css` and `dist/index.html`: mobile layout and museum-inspired presentation.
- `dist/events.js`: immutable event bank and sources. `dist/labels.js`: editable short display labels.
- `.github/workflows/pages.yml`: test-and-publish workflow.

Do not reorder, add, or remove entries from the current seeded event bank after publishing it: doing so changes active puzzles. Use a new content version and explicit activation date for bank changes. Wording or short-label edits that preserve IDs, order, and dates do not change the seeded selection.

## Validation and limits

Automated checks cover all 120 five-tile permutations, the 60% example, a year of deterministic daily puzzles, moves/swaps/returns, duplicate and invalid inputs, one-time submission, save validation, and streaks. A DOM-adapter test exercises the real UI handlers and verifies that dates are absent before submission and all reveal afterwards. It also checks undo, mode isolation, persistence, and the optional structured tools. This update was not tested on physical iPhone hardware or with browser automation.

Scores are casual and device-local. Clearing browser storage clears progress. The device clock determines the day; simultaneous tabs are last-write-wins. A static client is not appropriate for prize-based or cheat-resistant leaderboards without a backend. Google Fonts has system-font fallbacks; font loading is optional for gameplay. Event links open Wikipedia; the content bank is a starter collection for later editorial expansion.
