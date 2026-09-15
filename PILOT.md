# Small pilot

The prepared release is **2.3.0**, with curated puzzles for September 16–30, 2026, resetting at midnight UTC. It is ready for publication using `GITHUB-PAGES.md`; this local package does not itself create a public URL.

## Before inviting friends

1. Publish the latest `timeline-github.zip` contents, including `content`, `scripts`, and `.github`. Wait for the successful Pages deployment.
2. Open the published HTTPS URL in Safari on your iPhone. Play practice once: drag, swap, submit, expand a fact, and share the result into a draft message. Check that the five rows of squares and the game link arrive intact. Do the same on Android Chrome if one is available. Native phone share sheets need this physical-device check; the desktop checks exercise their success, cancellation, and fallback paths with substitutes.
3. Play the daily puzzle and refresh once to confirm the result remains saved. This uses your one daily attempt, so practice first if you want to save it for later.
4. Send the same published URL to all testers. Ask for feedback by replying to your invitation; the game has no built-in feedback collection or analytics.

## Invitation text

I’m testing Timeline, a daily history puzzle. Put five events in order, then submit to see how you did. It takes a few minutes, and you get partial credit for events in the right relative order.

Try it here: [paste your published link]

Send me your score, and let me know: Was anything confusing? Did dragging feel comfortable on your phone? Was it too easy, too hard, or about right? If something breaks, please include your phone/browser and what you were doing.

## What the pilot does and does not measure

Scores and streaks are saved in that browser on that device. No sign-in, tracking service, leaderboard, or cross-device synchronization is included. Clearing browser data or changing the site address resets that device’s history. Private browsing may not retain it.

Daily dates follow UTC, not local midnight: in New York during September, the next puzzle arrives at 8 p.m. The countdown shows when it changes. Client-side answers are accessible to someone inspecting the website; this version is intended for friendly play.

The desktop test suite covers all 120 orderings, drag handling, daily saves, every curated puzzle, link format, content validation, and share-grid consistency. Wikipedia references were checked online on September 15, 2026: all 75 returned HTTP 200. Physical iPhone/Android testing and the live GitHub deployment remain the final host/device checks.
