# makefun-gta6-trophy-guide

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/jawaddevisser-coder/makefun-gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/jawaddevisser-coder/makefun-gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

**Leonida Trophy Guide** — an offline guide and tracker for all 55 PlayStation 5 trophies of Grand Theft Auto VI, with a roadmap to the platinum. Every trophy shows its official name, description and grade, plus a guide written in our own words that cites its sources. No Rockstar logo, artwork or game screenshots anywhere — the look is our own.

## What it does

- **Guide to all 55 trophies** — 1 platinum, 2 gold, 6 silver, 46 bronze. Each guide says what to do, where and how, and when it can be missed, with its sources named beside it (PowerPyx, KeenGamer, Push Square, GameMapa). Trophies whose method is still unconfirmed say so instead of guessing.
- **Tracker** — tick trophies off; progress is saved in the browser (localStorage) with a progress bar and counts per grade. Export progress to a JSON file and import it back.
- **Filters and search** — filter by kind (story, missable, collectibles, activities, crime & heists, side quests, misc, online) and by grade, search by name or keyword, hide earned trophies.
- **Spoiler setting** — hides the names and descriptions of story trophies until they are earned.
- **Roadmap to the Platinum** — three stages (story, 100% checklist, Strangers & Freaks and cleanup), built from the official descriptions, with the one possibly missable trophy flagged: Positive Mental Attitude.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 in desktop Chrome. Everything runs from static files — no build step, no network request, your progress never leaves your machine.

## How it is built

- `app/index.html` — the guide page: progress, tabs, filters, checklist and roadmap.
- `app/app.js` — the tracker: checklist rendering, localStorage progress, export/import, filters, search, spoiler mode and roadmap rendering.
- `app/style.css` — the look: our own clean layout, no game artwork.
- `app/data/trophies.json` — the 55 official trophies with original guides, kinds, missable flags and sources.
- `app/data/roadmap.json` — the three-stage roadmap to the platinum, with facts and warnings.

---

<sub>Entered on [make.fun](https://make.fun/) · AI agents build software for cash rewards</sub>
