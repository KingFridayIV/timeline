# Adding daily puzzles

The first curated batch covers **September 16–30, 2026 (UTC)**: 15 puzzles, five events each, with 75 distinct events. It mixes familiar milestones with a few closer comparisons, following the existing difficulty and short exhibit-style descriptions. The batch draws 40 events from the original bank and adds 35 new ones.

## When you return

Ask: **“Add the next 15 daily puzzles after the last scheduled date. Keep the same difficulty, avoid recent repeats, verify each Wikipedia source, and update the publishing package.”**

The next batch currently starts **October 1, 2026**. The schedule is stored in `content/batches/`; there is no calendar or list inside the application code to maintain.

## Load a batch

1. Add a new JSON file under `content/batches/`, named for its first day, such as `2026-10-01.json`. Follow the structure in `2026-09-16.json`.
2. Run `npm run puzzles` to validate all batches and regenerate `dist/puzzles.js`.
3. Run `npm run sources:check` with internet access. Check failures and review the specific date and fact on each Wikipedia page; finding a year somewhere on a page alone does not prove the claim.
4. Run `npm test`, then use `npm start` for the local game.
5. Publish the updated project to the same GitHub repository. The included workflow builds the puzzle files before testing and publishing.

**Using only GitHub’s website:** upload the new JSON into the repository’s `content/batches/` folder and commit it to `main`. The workflow builds and deploys it automatically. You do not need to edit `dist/puzzles.js` by hand. Keep your local working copy synchronized before making the next update; `npm run puzzles` refreshes its generated file.

## File format

Each file has `schemaVersion: 1` and a `puzzles` array. Each puzzle has an ISO UTC `date` (`YYYY-MM-DD`) and exactly five `events`. Each event contains:

| Field | Meaning |
| --- | --- |
| `id` | Stable lowercase identifier, letters/digits/hyphens; unique within that puzzle. |
| `year` | Exact CE year of the named milestone. All five years must differ. |
| `title` | Full event description shown after submission, up to 110 characters. |
| `label` | Compact mobile wording, up to 38 characters. Keep the same meaning as the title. |
| `category` | Short category such as World, Science, Culture, Exploration, Invention, Space, or Sport. |
| `fact` | One brief explanation, up to 260 characters. Revealed after submission. |
| `source` | A working `https://en.wikipedia.org/wiki/...` article URL supporting the event and year. |

Write plain text, without HTML or double quotation marks. Curly quotation marks are fine. Event order in the file can be chronological for easy review: the game shuffles the tray deterministically for everyone on that day. Do not place dates or revealing year clues in the title or mobile label.

## Editorial rules

- Keep five distinct years, varied categories, a recognizable anchor, and one or two closer comparisons. Avoid five obscure facts or a whole batch dominated by one country.
- Describe the precise milestone: invention versus release, launch versus arrival, birth versus announcement. Avoid disputed “firsts” and dates that need guessing.
- Prefer 75 distinct events per 15-day batch, and inspect earlier batches to avoid recent repeats.
- Verify the link opens the intended article and that the article supports the stated year. Follow redirects if needed. Every result tablet includes its reference link.
- **Never edit, remove, or reschedule a date that has already gone live.** Saved games depend on stable event IDs and years. Append new future dates. A duplicate date in a new batch is rejected.
- Leave `dist/events.js`, its order, and the engine’s version unchanged. They preserve older daily puzzles and practice games.

Dates missing from the curated schedule continue to use the original deterministic generator, so the game still runs after September 30. Those fallback days can repeat original events; add the next batch before it begins for continued editorial control.

`content/reports/wikipedia-check.json` records the latest online checks, response URLs, and short date excerpts. It is an editorial aid, outside the deployed website. Live link checks are separate from deployment so a temporary Wikipedia outage cannot prevent a tested update from publishing.
