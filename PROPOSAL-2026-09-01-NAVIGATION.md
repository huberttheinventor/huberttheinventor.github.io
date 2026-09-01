# PROPOSAL — navigation and architecture for 100+ guides

Written 2026-09-01, revised the same day against the founder's answers:
**100+ guides within 12 months · no topic groups, newest first · labels read
`Nº004 · Google Search` · prev/next and related links wanted.**

Every measurement below was taken this session against the site as it stands,
served locally at 1280 / 1440 / 1920 and 390. Every external claim carries its
source.

**Status, 2026-09-01 — SHIPPED and live.** P0 (one source for the chrome, plus
`_data/guides.json`), P1 (`/guides/`), P2 (header down to Guides / The List),
P3 (prev, next and related on every guide), P4 (labels) and P6 (mobile) are all
live on `main`.

P5 (the ⌘K palette) is deliberately not built — it belongs at ~25 guides.

The stopgap was never built and should not be: measured after this was written,
`flex-wrap: wrap` turns the nav into two rows and grows the header from 81px to
118px at 1440 *today*. That is a visible regression on every page to prevent a
problem that does not exist until Guide 11. The real fix landed instead and is
smaller.

Two things learned after shipping, for whoever picks this up:

- **The archive was rebuilt once.** The first version set row titles at 30px in
  the display face and the ordinal at 12px mono at 55% opacity, and read as a
  stack of headlines rather than a list. It is now a four-column ruled index
  (Nº / Title / System / Run) at 53px row pitch, sixteen rows to a screen.
  Four options were built side by side before choosing; the per-row FILED stamp
  and the film-still thumbnails were both built and rejected, for reasons in the
  commit.
- **The next two things to break are known.** At around 30 rows the column
  header and the filter field scroll out of view and both want to become
  sticky — the fixed site header has no background, so that needs a top offset
  worked out rather than `top: 0`. And a hundred rows at identical weight with a
  hairline between each becomes a wall; a heavier rule every ten would give the
  eye a foothold. Neither is urgent at ten guides.

Also corrected while here: the system maps are **not** unreadable on a phone.
Measured on all eight guides — the SVG is switched off below 600px and a
`.map__phone` block replaces it with a readable numbered list plus the legend.
That shipped 2026-08-29. The only residual is the caption, which still says
"one picture" when on a phone it is a list; founder chose to leave it.

---

## The forcing fact

**Guide 11 breaks the desktop header.** Not "gets cluttered" — breaks.

The nav is `display: flex; flex-wrap: nowrap; justify-content: flex-end` in a
66%-width column. Its items already sum to more than the column, so it overflows
*leftward*, out of its own container, toward the wordmark. Measured clearance
between the first nav item and the right edge of the HUBERT logotype:

| guides | 1280 | 1440 | 1920 |
|---|---|---|---|
| 10 (today) | 101px | **19px** | **25px** |
| 11 | 32px | **−64px** | **−87px** |
| 12 | **−41px** | −152px | −204px |
| 15 | −260px | −417px | −557px |
| 20 | −630px | −863px | −1152px |

Negative = drawn over the wordmark. At 1440 and 1920 that is **the very next
video you post**.

It fails silently. `html { overflow-x: clip }` means no scrollbar appears — past
roughly Guide 13 the left-most links cross x=0 and are **discarded**. No error,
no overflow indicator, the links simply stop existing on screen.

At your stated rate this is not a runway problem. It is a this-month problem.

---

## Three things underneath it

### 1. The nav *is* the index. There is no other one.

Distinct guides linked from **page content** (excluding header and mobile menu):

| page | guides linked in body |
|---|---|
| `index.html` | **2** — Guide 01 and Guide 02 only |
| every one of the ten guide pages | **0** |
| `404.html` | 0 |
| `privacy.html` | 1 |

The homepage carries 27 links to guide pages; 22 are chrome, 5 are body links,
and those 5 reach only two guides. **Guides 03–10 are reachable from exactly one
place on the whole site: the header.**

So the header is not merely cluttered. It is load-bearing, and it is the thing
about to break.

### 2. Every guide is a dead end.

All ten guide pages link **zero** other guides from their body. None has
prev/next. A viewer arrives from a reel, watches one film, reads one guide, and
is offered nothing else. For traffic that arrives one guide at a time from
Instagram and TikTok, this is the largest retention loss on the site — larger
than the nav problem.

### 3. `Guide 07` tells nobody anything.

Eleven of fourteen nav labels are ordinals. Nothing in `Guide 04` says "Google
Search". NN/G's eyetracking finds people read roughly the first two words of a
link and that link text should lead with the information-carrying word
([*Writing Hyperlinks*](https://www.nngroup.com/articles/writing-links/);
[*Better Link Labels*](https://www.nngroup.com/articles/better-link-labels/)).
Ordinals carry none, and they make anchor text useless for search — which for a
site whose growth plan is 100+ indexed pages is a real cost.

You have chosen `Nº004 · Google Search`. That is the right call: the filing
conceit survives as the ordinal, the subject does the scanning work.

---

## What changes because it is 100+ and ungrouped

I proposed a `Guides ▾` mega-menu panel before you answered. **With no topic
groups and 100+ items, that is the wrong pattern and I am withdrawing it.**

- A mega menu's entire advantage is grouped, scannable columns with headings
  ([NN/G, *Mega Menus Work Well for Site
  Navigation*](https://www.nngroup.com/articles/mega-menus-work-well/)). With no
  groups there is nothing to put in columns — it degenerates into a 100-item
  scrolling list inside a dropdown, which is worse than a page in every respect.
- Hidden navigation carries a real measured penalty: across 179 participants on 6
  sites, NN/G found hidden nav dropped content discoverability by more than 20%,
  raised rated task difficulty 21%, and made desktop users at least 39% slower
  ([*Hamburger Menus and Hidden Navigation Hurt UX
  Metrics*](https://www.nngroup.com/articles/hamburger-menus/)). Paying that
  penalty to hide your only index is a bad trade.

**So: `Guides` becomes a plain link to a real archive page, not a dropdown.**
Simpler, faster, no hidden-nav penalty, no maintenance, and it scales to 500.

The other thing that changes: **site search is now justified.** The usual advice
is that under ~100 pages you invest in navigation rather than search ([AddSearch,
*Site Search vs Navigation*](https://www.addsearch.com/blog/site-search-vs-navigation/);
[MeasuringU, *Search vs.
Browse*](https://measuringu.com/search-browse/)). You are heading straight
through that threshold. Search belongs **on the archive page**, as filter-as-you-
type — not as a magnifying glass in the site chrome.

---

## The thing you are missing

You asked. This is it, and it is bigger than the nav.

**There is no build step, and the chrome is hand-copied into every HTML file.**
That is survivable at 13 pages. At 100+ it is the dominant cost and the dominant
bug source — and it has already bitten: the last review found `404.html` shipped
with no header at all, and the `?v=` cache token had to be rewritten across
**498 asset URLs in 13 files** by script.

At 100 guides, every one of these becomes a 100-file edit:

- changing a nav item
- bumping the cache token
- fixing a footer typo
- adding prev/next links
- any accessibility fix in the shared chrome

And every one of them can land on 97 of 100 files and be missed on three, exactly
the way the 404 was. That failure mode gets more likely as the count grows, not
less.

**Recommendation: a small build step whose output is still committed static
HTML.** Roughly 40 lines of Node: partials for `<head>`, header, footer and
scripts; a `guides.json` manifest; a script that stamps them into each page and
writes the cache token from one constant. You run it before committing; GitHub
Pages still serves plain files; the deploy model does not change at all. What
changes is that the chrome has **one** source instead of a hundred.

Everything else in this proposal gets dramatically cheaper once that exists.
Without it, P1–P4 below are each a 100-file manual edit, forever.

---

## Proposals, in build order

### P0 · One source for the chrome, and a `guides.json` manifest

The manifest is the spine everything else reads:

```
{ "n": 4, "slug": "google-search", "title": "Google Search",
  "headline": "It doesn't search the internet. It searches a copy.",
  "runtime": "2:41", "published": "2026-08-14",
  "poster": "img/guide/guide-04-poster.jpg",
  "blurb": "One line on what you learn.",
  "tags": ["indexing", "infrastructure"] }
```

Tags are stored even though the nav is ungrouped — they cost nothing now and they
are what makes "related guides" and archive filtering possible later, without a
migration.

### P1 · `guides.html` — the real archive. *Do this first.*

Every guide, newest first, rendered from the manifest. Per row: `Nº0NN`, title,
the system, runtime, date, one line of blurb, poster thumbnail.

Because you are heading past 100, it needs three things a small list would not:

- **Filter-as-you-type**, matching title, system and tags. Client-side over the
  manifest — no service, no build, works on GitHub Pages.
- **One long page, no pagination.** Rows are cheap; paging an archive is a known
  annoyance and hurts both scanning and SEO. Revisit only past ~200.
- **Real anchor text** on every row, which is 100 indexable internal links
  pointing at your guides with their subject in the link.

**On-brand execution:** the card catalogue. Each row is an index card in a drawer
— ordinal, title, `FILED` stamp, hairline rule. The filing language already
exists; nothing new is invented. The filter box reads as the drawer label.

This also resolves the homepage tension you flagged: `index.html` can keep
leading with Guide 01 as a shop window, because it is no longer the only door.

### P2 · Header down to four items. *Deadline-bound.*

```
HUBERT        Guides        Sources        The List ●
```

`Guides` links straight to `guides.html`. `Index` is retired as a label — it
points at the homepage, which indexes nothing, and the word would fight
`guides.html`.

Four items, inside the 4–7 range that horizontal bars comfortably carry
([LogRocket](https://blog.logrocket.com/ux-design/making-clear-navigation-menus-better-ux/)).
**It never grows again**, whatever the guide count.

### P3 · End every guide with somewhere to go.

Below the sources block: **previous / next**, plus **related guides**.

- Prev/next is derived from the manifest. Zero per-guide maintenance.
- Related is computed from shared tags, top three, rather than hand-picked. You
  chose hand-picked related, and that is right at ten guides — but it becomes 300
  editorial decisions at 100. Tags give you the same result and stop being work.
  If you want to override a specific one, a `related` field in the manifest wins
  over the computed set.

Uses the existing `.button__big` link row. No new design language.

### P4 · Labels get their titles

`Guide 04` → `Nº004 · Google Search` in the nav panel, the archive, prev/next and
related. Ordinal kept, information added.

### P5 · `⌘K` palette — at ~25 guides

Type-to-jump over the manifest. Suits a developer audience, is a real convention
rather than a novelty ([UX Patterns for
Developers](https://uxpatterns.dev/patterns/advanced/command-palette)), and reads
as a terminal, which is on brand. It is an accelerator for people who already
know what they want; it solves none of the three problems above. After P1–P3.

### P6 · Mobile: name the drawer

The mobile menu is a `Menu` button hiding fifteen links, growing by one a video.
Two small changes:

1. Label it **`Guides`**. NN/G's follow-up found the control's wording drives
   whether people find the navigation at all ([*Beyond the
   Hamburger*](https://www.nngroup.com/articles/find-navigation-mobile-even-hamburger/)).
2. Put **All guides →** first in the panel, above the list, so the panel never
   has to be the whole index on a phone. Past ~20 guides the panel should show
   only the latest few plus that link.

Not proposing bottom-tab navigation: right for 3–5 app-like sections, wrong for a
reading site.

---

## Not proposing

- **Site-wide search chrome.** Filter on the archive covers it until well past
  100. A global search box is a service or an index to maintain.
- **Topic grouping in the nav.** Your call, and correct — reverse-chronological
  is honest and needs no taxonomy upkeep. Tags in the manifest keep the option
  open.
- **Archive pagination.** See P1.
- **Restructuring the homepage.** Out of scope by your instruction, and P1 makes
  it unnecessary.

---

## Sequence and the deadline

| | why now |
|---|---|
| **P0** chrome source + manifest | everything else is a 100-file edit without it |
| **P2** header to four items | **before Guide 11 ships**, or the header breaks |
| **P1** `guides.html` | the destination `Guides` needs to point at |
| **P3** prev/next + related | biggest retention gain, smallest build |
| **P4** labels | same commit as P1/P2 |
| **P6** mobile label | same commit as P2 |
| **P5** `⌘K` | ~25 guides |

**Stopgap if you need to post before P2 lands:** one line, `flex-wrap: wrap` on
`.nav`, gives a wrapped second row instead of a collision. Ugly, safe, reversible.

---

## Sources

- [NN/G — Hamburger Menus and Hidden Navigation Hurt UX Metrics](https://www.nngroup.com/articles/hamburger-menus/) — 179 participants, 6 sites; source of the discoverability, difficulty and task-time figures quoted above
- [NN/G — Beyond the Hamburger: What Makes Navigation Discoverable on Mobile](https://www.nngroup.com/articles/find-navigation-mobile-even-hamburger/)
- [NN/G — Mega Menus Work Well for Site Navigation](https://www.nngroup.com/articles/mega-menus-work-well/)
- [NN/G — Writing Hyperlinks: Salient, Descriptive, Start with Keyword](https://www.nngroup.com/articles/writing-links/)
- [NN/G — Better Link Labels: 4Ss for Encouraging Clicks](https://www.nngroup.com/articles/better-link-labels/)
- [LogRocket — Making clear website navigation menus for better UX](https://blog.logrocket.com/ux-design/making-clear-navigation-menus-better-ux/)
- [AddSearch — Site Search vs Navigation](https://www.addsearch.com/blog/site-search-vs-navigation/)
- [MeasuringU — Search vs. Browse on Websites](https://measuringu.com/search-browse/)
- [UX Patterns for Developers — Command Palette](https://uxpatterns.dev/patterns/advanced/command-palette)

**A note on numbers.** Blog write-ups of the NN/G material circulate figures like
"mega menus are 37% faster" and "23% higher abandonment without group headings".
I could not trace either to a primary NN/G study and have not used them. The only
quantitative claims above come from the NN/G hamburger study, read at source this
session, and from measurements taken on this site.
