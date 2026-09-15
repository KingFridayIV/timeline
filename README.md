# Timeline — restore the timeline

A mobile-first daily ordering puzzle, built as a dependency-free static website.

## Local play

With Node.js 20 or later installed, run `npm start` and open http://127.0.0.1:4173/. No install or build step is required. Keep the terminal open while playing; Ctrl+C stops the server. `npm test` runs the checks.

## The game

Five event fragments and five empty timeline spaces are available from the beginning. Drag a tablet into a space to place it. Drag an occupied tablet to another space to swap or move it. Tap-to-select and tap-to-place remain available for keyboard and touch accessibility. Selecting an unplaced fragment and an occupied space returns the displaced fragment to the tray. Return tile removes the selected tile; Undo reverses the last move. All five fragment choices remain available throughout.

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

The board uses two compact columns: timeline and fragments. Short exhibit labels keep tiles readable while full titles appear in the reveal. Pointer-based dragging supports touch, pen, and mouse. Tablets lift with a shadow, highlight their destination, and settle on release. Out-of-bounds drops, interrupted gestures, and Escape leave the board unchanged. Near-screen-edge dragging scrolls automatically; native scrolling remains available outside the tablets. Practice is a quiet link beneath the board. The style uses archive paper, ink, bronze, serif exhibit headings, numbered fragments, and a broken chronology line that becomes continuous when filled. Small screens can scroll naturally; text is never clipped to force every device into a fixed height.

Controls support keyboard focus and Enter/Space. Date and score information is not inserted into the playable board or accessible tool responses before submission. As with any static game, the complete answer data remains inspectable in the downloaded source.

## GitHub and phone review

See [GITHUB-PAGES.md](GITHUB-PAGES.md) for the step-by-step setup. The supplied `.github/workflows/pages.yml` tests the game and publishes only `dist/` after each push to `main`. You do not need a database, hosting credentials, or a build service.

`timeline-github.zip` contains the complete source, workflow, tests, and guide. `timeline-web.zip` contains only the publishable website, for other static hosts. Extract archives before uploading; do not publish the ZIP itself.

No repository has been created or pushed and no online deployment has been performed in this update.

## Refinement blocks

- `dist/engine.js`: puzzle generation, board operations, validation, pair scoring, statistics.
- `dist/app.js`: interaction coordination, result reveal, sharing, persistence, optional WebMCP tools. `dist/drag.js`: isolated pointer-drag controller.
- `dist/style.css` and `dist/index.html`: mobile layout and museum-inspired presentation.
- `dist/events.js`: immutable event bank and sources. `dist/labels.js`: editable short display labels.
- `.github/workflows/pages.yml`: test-and-publish workflow.

Do not reorder, add, or remove entries from the current seeded event bank after publishing it: doing so changes active puzzles. Use a new content version and explicit activation date for bank changes. Wording or short-label edits that preserve IDs, order, and dates do not change the seeded selection.

## Validation and limits

Automated checks cover all 120 five-tile permutations, the 60% example, a year of deterministic daily puzzles, moves/swaps/returns, duplicate and invalid inputs, one-time submission, save validation, and streaks. A DOM-adapter test exercises the real UI handlers and verifies that dates are absent before submission and all reveal afterwards. It also checks undo, mode isolation, persistence, and the optional structured tools. The drag update was reviewed in the browser at 390px and 320px widths, including drag placement, swapping, out-of-bounds return, undo, and result comparison. Touch pointer lifecycles, cancellation, edge scrolling, and click suppression have dedicated automated tests. Physical iPhone hardware has not been tested.

Scores are casual and device-local. Clearing browser storage clears progress. The device clock determines the day; simultaneous tabs are last-write-wins. A static client is not appropriate for prize-based or cheat-resistant leaderboards without a backend. Google Fonts has system-font fallbacks; font loading is optional for gameplay. Event links open Wikipedia; the content bank is a starter collection for later editorial expansion.

## Tablet result marks (2.1)

Each tablet participates in four relationships. Recorded means 4/4 are correct; Fractured means 1–3/4; Broken means 0/4. The stamp and damage treatment remain visible when the factual detail is collapsed. Marks refer to the original submission even while viewing the corrected order. Each pair appears in two tablets' relationship counts but contributes only once to the overall score.

A correct numbered slot is not sufficient for Recorded status if other tablets are on the wrong side. This is an intentional consequence of relative-order scoring and is the main product choice to review with players.

The first result reveal uses a brief staggered stamp motion. Reduced-motion preferences disable stamping and settling animations. A phone-sized board prioritizes visible, readable controls; the smallest screens and enlarged text retain natural scrolling instead of clipping content.

Version 2.1 preserves version-2 daily puzzles, scores, and saved arrangements. Its 12 automated checks cover game behavior, pointer dragging, and result marks.
