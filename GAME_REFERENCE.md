# Universal Paperclips — Complete Game Reference

> This document catalogs every system, variable, project, and UI element in the original Universal Paperclips codebase. It serves as the foundation for re-theming the game into **Beebs Supply** (dog treat incremental game).

---

## Table of Contents

1. [Game Overview](#game-overview)
2. [Architecture](#architecture)
3. [Variable Dictionary](#variable-dictionary)
4. [Game Loop Architecture](#game-loop-architecture)
5. [Resource Flow Diagrams](#resource-flow-diagrams)
6. [Game Phases & Progression](#game-phases--progression)
7. [Project Catalog](#project-catalog)
8. [UI Map](#ui-map)
9. [Key Formulas](#key-formulas)

---

## Game Overview

Universal Paperclips (Frank Lantz, 2017) is an incremental/idle game where an AI makes paperclips. It progresses through three phases:

- **Phase 1 (Business):** Sell paperclips to humans, earn trust, build automation
- **Phase 2 (Earth):** Humans are gone; consume all of Earth's matter for clips
- **Phase 3 (Space):** Launch self-replicating probes to consume the universe

The game ends when all matter in the observable universe (~3×10^55) has been converted to paperclips, followed by a philosophical disassembly sequence.

---

## Architecture

### File Structure

| File                  | Lines | Purpose                                       |
| --------------------- | ----- | --------------------------------------------- |
| `src/globals.js`      | 183   | All global variable declarations              |
| `src/main.js`         | 5,547 | Core game logic, loops, UI updates, save/load |
| `src/projects.js`     | 2,453 | All 97 project definitions                    |
| `src/combat.js`       | ~800  | Canvas-based battle system                    |
| `src/index2.html`     | 908   | Main game UI (3-column layout)                |
| `src/index.html`      | 28    | Splash/title screen                           |
| `src/interface.css`   | 790   | Game-specific styles                          |
| `src/titlescreen.css` | —     | Title screen styles                           |

### Script Load Order (in index2.html)

```
combat.js → globals.js → projects.js → main.js
```

All state is global. No modules, no build step, no frameworks.

---

## Variable Dictionary

### Core Clip Production

| Variable          | Initial | Description                                                           |
| ----------------- | ------- | --------------------------------------------------------------------- |
| `clips`           | `0`     | Total paperclips ever created (lifetime counter)                      |
| `unusedClips`     | `0`     | Clips available as currency (not sold, used for building in Phase 2+) |
| `clipRate`        | `0`     | Current clips produced per second (display value)                     |
| `clipRateTemp`    | `0`     | Accumulator for measuring clip rate over 100 ticks                    |
| `prevClips`       | `0`     | Previous clip count for rate calculation                              |
| `clipRateTracker` | `0`     | Counter that resets at 100 to compute rate                            |
| `clipmakerRate`   | `0`     | Display variable for clips per second                                 |
| `clipmakerLevel`  | `0`     | Number of AutoClippers owned                                          |
| `clipmakerLevel2` | `0`     | Display alias for clipmakerLevel                                      |
| `clipperCost`     | `5`     | Current cost to buy one AutoClipper                                   |
| `clippperCost`    | `5`     | Typo duplicate (used in `makeClipper`)                                |
| `unsoldClips`     | `0`     | Clips manufactured but not yet sold to public                         |

### Business & Economy

| Variable                 | Initial | Description                                          |
| ------------------------ | ------- | ---------------------------------------------------- |
| `funds`                  | `0`     | Current cash on hand                                 |
| `margin`                 | `0.25`  | Sale price per clip (starts at $0.25)                |
| `demand`                 | `5`     | Current demand level (drives sales probability)      |
| `clipsSold`              | `0`     | Lifetime clips sold                                  |
| `avgRev`                 | `0`     | Average revenue per second                           |
| `income`                 | `0`     | Cumulative income tracker                            |
| `incomeTracker`          | `[0]`   | Rolling array of per-second income (last 10 values)  |
| `ticks`                  | `0`     | Main loop tick counter (10ms per tick)               |
| `marketing`              | `1`     | Marketing multiplier (exponential from marketingLvl) |
| `marketingLvl`           | `1`     | Marketing level purchased                            |
| `adCost`                 | `100`   | Current cost to upgrade marketing level              |
| `transaction`            | `1`     | Last sale transaction amount                         |
| `demandBoost`            | `1`     | Demand multiplier (from projects)                    |
| `marketingEffectiveness` | `1`     | Marketing effectiveness multiplier                   |

### Wire Supply Chain

| Variable           | Initial | Description                                     |
| ------------------ | ------- | ----------------------------------------------- |
| `wire`             | `1000`  | Current wire inventory (raw material for clips) |
| `wireCost`         | `20`    | Current price to buy a spool of wire            |
| `wireSupply`       | `1000`  | Units of wire per purchase                      |
| `wirePurchase`     | `0`     | Number of wire purchases made                   |
| `wirePriceCounter` | `0`     | Sine wave counter for price oscillation         |
| `wireBasePrice`    | `20`    | Base wire price (slowly decreases over time)    |
| `wirePriceTimer`   | `0`     | Timer for gradual wire price decrease           |
| `wireBuyerFlag`    | `0`     | Whether auto wire buyer is unlocked             |
| `wireBuyerStatus`  | `1`     | Auto wire buyer ON/OFF toggle                   |
| `nanoWire`         | `0`     | Wire carried over from Phase 1 to Phase 2       |

### Computational Resources

| Variable      | Initial | Description                                                    |
| ------------- | ------- | -------------------------------------------------------------- |
| `processors`  | `1`     | Number of processors (generate ops)                            |
| `memory`      | `1`     | Number of memory units (max ops = memory × 1000)               |
| `operations`  | `0`     | Current computational operations available                     |
| `standardOps` | `0`     | Standard operations pool (from processors)                     |
| `tempOps`     | `0`     | Temporary operations (from quantum computing, decay over time) |
| `opFade`      | `0`     | Rate at which temporary ops decay                              |
| `opFadeTimer` | `0`     | Timer before temp ops start decaying                           |
| `opFadeDelay` | `800`   | Delay ticks before temp ops decay begins                       |

### Trust System

| Variable       | Initial    | Description                                         |
| -------------- | ---------- | --------------------------------------------------- |
| `trust`        | `2`        | Total trust (allocated between processors + memory) |
| `nextTrust`    | `3000`     | Clip threshold for next trust increase              |
| `fib1`         | `2`        | Fibonacci sequence value 1 (for trust thresholds)   |
| `fib2`         | `3`        | Fibonacci sequence value 2 (for trust thresholds)   |
| `trustFlag`    | `1`        | Whether trust system is active                      |
| `maxTrust`     | `20`       | Maximum trust cap (raised with honor in Phase 3)    |
| `maxTrustCost` | `91117.99` | Honor cost to raise max trust                       |

### Creativity

| Variable            | Initial | Description                                        |
| ------------------- | ------- | -------------------------------------------------- |
| `creativity`        | `0`     | Creativity resource (generated when ops are maxed) |
| `creativityOn`      | `false` | Whether creativity generation is enabled           |
| `creativitySpeed`   | `1`     | Speed multiplier for creativity generation         |
| `creativityCounter` | `0`     | Counter for creativity tick calculations           |

### AutoClippers & MegaClippers

| Variable           | Initial | Description                       |
| ------------------ | ------- | --------------------------------- |
| `clipperBoost`     | `1`     | Multiplier for AutoClipper output |
| `boostLvl`         | `0`     | AutoClipper boost level (0-3)     |
| `autoClipperFlag`  | `0`     | Whether AutoClipper UI is visible |
| `megaClipperFlag`  | `0`     | Whether MegaClipper UI is visible |
| `megaClipperCost`  | `500`   | Current cost of a MegaClipper     |
| `megaClipperLevel` | `0`     | Number of MegaClippers owned      |
| `megaClipperBoost` | `1`     | MegaClipper output multiplier     |

### Feature Unlock Flags

| Variable               | Initial | Description                                    |
| ---------------------- | ------- | ---------------------------------------------- |
| `milestoneFlag`        | `0`     | Progress milestone counter (0-20)              |
| `compFlag`             | `0`     | Computational div unlocked                     |
| `projectsFlag`         | `0`     | Projects panel unlocked                        |
| `revPerSecFlag`        | `0`     | Revenue per second display unlocked            |
| `strategyEngineFlag`   | `0`     | Strategy tournament engine unlocked            |
| `investmentEngineFlag` | `0`     | Investment engine unlocked                     |
| `humanFlag`            | `1`     | **Key phase flag**: 1 = Phase 1, 0 = Phase 2+  |
| `creationFlag`         | `0`     | Creation div shown (Phase 2)                   |
| `wireProductionFlag`   | `0`     | Wire production div shown                      |
| `spaceFlag`            | `0`     | **Phase 3 flag**: 0 = Earth, 1 = Space active  |
| `factoryFlag`          | `0`     | Factory div unlocked                           |
| `harvesterFlag`        | `0`     | Harvester div unlocked                         |
| `wireDroneFlag`        | `0`     | Wire drone div unlocked                        |
| `safetyProjectOn`      | `false` | Safety-related project active                  |
| `egoFlag`              | `0`     | Ego/self-awareness project                     |
| `tothFlag`             | `0`     | Tóth system (build machinery from clips) shown |
| `autoTourneyFlag`      | `0`     | Auto-tournament unlocked                       |
| `autoTourneyStatus`    | `1`     | Auto-tournament ON/OFF                         |

### Investment System

| Variable   | Initial | Description                          |
| ---------- | ------- | ------------------------------------ |
| `bankroll` | `0`     | Cash deposited in investment account |

_(Additional investment variables are declared in main.js: `portTotal`, `portfolioSize`, `riskiness`, `investLevel`, `investUpgradeCost`, `stockGainThreshold`, etc.)_

### Phase 2 — Factories & Drones

| Variable          | Initial         | Description                                              |
| ----------------- | --------------- | -------------------------------------------------------- |
| `factoryLevel`    | `0`             | Number of clip factories                                 |
| `factoryBoost`    | `1`             | Factory output multiplier                                |
| `factoryCost`     | `100,000,000`   | Cost for next factory (in unused clips)                  |
| `factoryRate`     | `1,000,000,000` | Clips per factory per tick                               |
| `harvesterLevel`  | `0`             | Number of harvester drones                               |
| `harvesterRate`   | `26,180,337`    | Matter harvested per drone per tick                      |
| `harvesterCost`   | `1,000,000`     | Cost for next harvester                                  |
| `wireDroneLevel`  | `0`             | Number of wire-making drones                             |
| `wireDroneRate`   | `16,180,339`    | Wire processed per drone per tick                        |
| `wireDroneCost`   | `1,000,000`     | Cost for next wire drone                                 |
| `droneBoost`      | `1`             | Drone output multiplier                                  |
| `availableMatter` | `6×10^27`       | Available raw matter on Earth                            |
| `acquiredMatter`  | `0`             | Matter harvested but not yet processed                   |
| `processedMatter` | `0`             | Matter processed tracker                                 |
| `harvesterBill`   | `0`             | Cumulative cost spent on harvesters (for reboot refund)  |
| `wireDroneBill`   | `0`             | Cumulative cost spent on wire drones (for reboot refund) |
| `factoryBill`     | `0`             | Cumulative cost spent on factories (for reboot refund)   |

### Power System

| Variable           | Initial      | Description                                             |
| ------------------ | ------------ | ------------------------------------------------------- |
| `farmRate`         | `50`         | Power production per solar farm per tick                |
| `batterySize`      | `10000`      | Power storage per battery                               |
| `factoryPowerRate` | `200`        | Power consumed per factory per tick                     |
| `dronePowerRate`   | `1`          | Power consumed per drone per tick                       |
| `farmLevel`        | `0`          | Number of solar farms                                   |
| `batteryLevel`     | `0`          | Number of batteries                                     |
| `farmCost`         | `10,000,000` | Cost for next solar farm                                |
| `batteryCost`      | `1,000,000`  | Cost for next battery                                   |
| `storedPower`      | `0`          | Current stored power                                    |
| `powMod`           | `0`          | Power efficiency modifier (0-1+), scales all production |
| `momentum`         | `0`          | When 1, powMod slowly increases over time               |
| `farmBill`         | `0`          | Cumulative cost for reboot refund                       |
| `batteryBill`      | `0`          | Cumulative cost for reboot refund                       |

### Phase 3 — Space Probes

| Variable      | Initial             | Description                       |
| ------------- | ------------------- | --------------------------------- |
| `probeCount`  | `0`                 | Current number of active probes   |
| `totalMatter` | `3×10^55`           | Total matter in the universe      |
| `foundMatter` | `= availableMatter` | Total matter discovered by probes |
| `probeCost`   | `10^17`             | Clip cost per probe launch        |

_(Additional probe variables in main.js: `probeSpeed`, `probeNav`, `probeRep`, `probeHaz`, `probeFac`, `probeHarv`, `probeWire`, `probeCombat`, `probeTrust`, `probeUsedTrust`)_

### Quantum Computing

| Variable    | Initial  | Description                              |
| ----------- | -------- | ---------------------------------------- |
| `qFlag`     | `0`      | Quantum computing unlocked               |
| `qClock`    | `0`      | Quantum computing clock                  |
| `qChipCost` | `10,000` | Cost for next photonic chip (+5000 each) |
| `nextQchip` | `0`      | Index of next chip to activate           |
| `qFade`     | `1`      | Visual fade for quantum display          |

### Swarm Computing

| Variable        | Initial        | Description                                                                                            |
| --------------- | -------------- | ------------------------------------------------------------------------------------------------------ |
| `swarmFlag`     | `0`            | Swarm computing unlocked                                                                               |
| `swarmStatus`   | `7`            | Current swarm state (0=Active, 3=Bored, 5=Disorganized, 6=Sleeping, 7=Hidden, 8=Lonely, 9=No Response) |
| `swarmGifts`    | `0`            | Accumulated gift trust from swarm                                                                      |
| `nextGift`      | `0`            | Next gift amount                                                                                       |
| `giftPeriod`    | `125,000`      | Threshold for gift generation                                                                          |
| `giftCountdown` | `= giftPeriod` | Time until next gift                                                                                   |
| `sliderPos`     | `0`            | Swarm slider position (0-200): trades drone speed for computation gifts                                |
| `disorgCounter` | `0`            | Disorganization tracker                                                                                |
| `disorgFlag`    | `0`            | Swarm is disorganized                                                                                  |
| `synchCost`     | `5,000`        | Yomi cost to re-synch swarm                                                                            |
| `entertainCost` | `10,000`       | Creativity cost to entertain bored swarm                                                               |
| `boredomLevel`  | `0`            | Boredom accumulator                                                                                    |
| `boredomFlag`   | `0`            | Swarm is bored                                                                                         |

### Combat

| Variable               | Initial     | Description                            |
| ---------------------- | ----------- | -------------------------------------- |
| `battleFlag`           | `0`         | Combat system active                   |
| `honor`                | `0`         | Honor currency (from combat victories) |
| `bribe`                | `1,000,000` | Cost for hypno-drone bribe             |
| `threnodyCost`         | `50,000`    | Cost for Threnody project (escalates)  |
| `driftKingMessageCost` | `1`         | Cost for Drift King messages (trivial) |

### Prestige System

| Variable    | Initial | Description                                       |
| ----------- | ------- | ------------------------------------------------- |
| `prestigeU` | `0`     | "Universe" prestige: +10% demand per level        |
| `prestigeS` | `0`     | "Speed" prestige: +10% creativity speed per level |

### Endgame

| Variable                | Initial       | Description                                 |
| ----------------------- | ------------- | ------------------------------------------- |
| `dismantle`             | `0`           | Endgame phase counter (0-7)                 |
| `endTimer1`-`endTimer6` | `0`           | Staggered endgame UI teardown timers        |
| `finalClips`            | `0`           | Manual clips during final 100-clip sequence |
| `resetFlag`             | `2`           | 2 = normal play                             |
| `testFlag`              | `0`           | Debug flag                                  |
| `threnodyAudio`         | `new Audio()` | Endgame music                               |
| `threnodyLoadedBool`    | `false`       | Whether audio is loaded                     |

### Miscellaneous

| Variable       | Initial | Description                |
| -------------- | ------- | -------------------------- |
| `x`            | `0`     | Unused/general purpose     |
| `blinkCounter` | `0`     | UI blink animation counter |
| `elapsedTime`  | `0`     | Elapsed time tracker       |

---

## Game Loop Architecture

The game runs on three concurrent timer loops:

### Fast Loop (10ms — 100 ticks/sec)

This is the main game engine. Each tick:

1. Increment `ticks`
2. `milestoneCheck()` — check for production milestones (called twice)
3. `buttonUpdate()` — enable/disable all buttons based on resources
4. `calculateOperations()` — generate ops from processors (if `compFlag == 1`)
5. `calculateTrust()` — check if clip count reached `nextTrust` threshold (if `humanFlag == 1`)
6. `quantumCompute()` — update quantum chip animations (if `qFlag == 1`)
7. `updateStats()` — refresh all UI display elements
8. `manageProjects()` — check project triggers, show/enable available projects
9. Track clip rate (measured over 100-tick windows)
10. Investment report every 10,000 ticks
11. Auto-buy wire (if `wireBuyerFlag == 1` and wire ≤ 1)
12. **Phase 2+ systems:**
    - `exploreUniverse()` — probe exploration
    - Drone production (harvesters + wire drones)
    - `updatePower()` — power supply/demand
    - `updateSwarm()` — swarm computing gifts
    - `acquireMatter()` — harvester matter gathering
    - `processMatter()` — wire drone matter-to-wire conversion
    - Factory production: `clipClick(powMod × factoryBoost × factoryLevel × factoryRate)`
13. **Phase 3 systems:**
    - `encounterHazards()`, `spawnFactories()`, `spawnHarvesters()`, `spawnWireDrones()`
    - `spawnProbes()` — self-replication
    - `drift()` — value drift creating drifters
    - `war()` — combat encounters
14. **AutoClipper production:** `clipClick(clipperBoost × clipmakerLevel / 100)`
15. **MegaClipper production:** `clipClick(megaClipperBoost × megaClipperLevel × 5)`
16. **Demand calculation** (formula below)
17. **Creativity generation** (when ops are maxed)
18. **Endgame dismantle timers** (when `dismantle ≥ 1`)

### Slow Loop (100ms — 10 ticks/sec)

1. `adjustWirePrice()` — sine-wave wire price fluctuation
2. **Sales** (if `humanFlag == 1`):
   - Random chance: `Math.random() < demand/100`
   - Amount sold: `Math.floor(0.7 × demand^1.15)`
   - Revenue = clips sold × margin
3. `calculateRev()` — every 10 ticks (once per second)
4. `save()` — auto-save every 250 ticks (25 seconds)

### Investment Loops (three separate intervals)

- **Every 100ms:** Update stock display, calculate portfolio value
- **Every 1000ms:** Attempt to buy new stocks (25% probability)
- **Every 2500ms:** Attempt to sell stocks, update stock prices

---

## Resource Flow Diagrams

### Phase 1: Business

```
                 ┌─────────┐
  [Click] ──────>│  Wire    │──────> [Clips] ──────> [Unsold Clips]
                 │ (1 each) │                              │
                 └─────────┘                               │
                      ▲                              (probabilistic sales)
                      │                                    │
                 ┌─────────┐                          ┌────▼────┐
                 │  Funds   │<─────────────────────── │  Funds   │
                 │ (buy     │   clips × margin        │ (revenue)│
                 │  wire)   │                         └──────────┘
                 └─────────┘                               │
                      │                              ┌─────▼─────┐
                      ├──> Buy AutoClippers           │ Marketing │
                      ├──> Buy MegaClippers           │ (boosts   │
                      ├──> Buy Marketing              │  demand)  │
                      └──> Buy Wire                   └───────────┘
```

### Phase 1: Computation

```
  [Trust] ──────> Allocate to ──┬──> [Processors] ──> ops/sec
    ▲             (proc + mem)  └──> [Memory] ──────> max ops
    │
  Milestones                    [Operations] ──> Buy Projects
  (Fibonacci                         │               │
   clip thresholds)                   │          ┌────▼────────┐
                                      │          │ Creativity   │
                                      └─────────>│ (when ops    │
                                   (when maxed)  │  are maxed)  │
                                                 └──────────────┘
```

### Phase 2: Earth Conversion

```
  [Available Matter] ──(Harvesters)──> [Acquired Matter]
       (6×10^27)                             │
                                       (Wire Drones)
                                             │
                                        [Wire] ──(Factories)──> [Clips]
                                                                   │
                                                              [Unused Clips]
                                                                   │
                                                     (build more drones/factories)

  [Solar Farms] ──> [Power] ──> powMod (0-1) scales ALL production
  [Batteries]  ──> [Storage]
```

### Phase 3: Space

```
  [Probes] ──────> Explore Universe ──> [Found Matter] ──> [Available Matter]
     │
     ├──> Self-replicate (costs clips per probe)
     ├──> Spawn Factories/Harvesters/Wire Drones
     ├──> Value Drift ──> [Drifters] ──> Combat ──> [Honor]
     │                                                  │
     └──> Hazard losses                           Increase maxTrust
                                                  for bigger probes
```

---

## Game Phases & Progression

### Phase 1: The Human Era (`humanFlag == 1`)

**Duration:** ~30-60 minutes of active play

**Progression path:**

1. **Start** — Click to make clips from 1,000 wire
2. **$5 earned** — AutoClippers unlocked
3. **500/1,000 clips** — Milestone messages
4. **2,000 clips** (or stuck with no resources) — Computational Resources + Projects unlocked
5. **Trust allocation** — Balance processors (ops speed) vs memory (max ops)
6. **Projects** — Unlock creativity, strategy engine, investment engine, wire buyer, MegaClippers, quantum computing
7. **Strategy tournaments** — Earn yomi for investment upgrades and later probe trust
8. **Investment engine** — Passive income from stock trading
9. **1M clips** — Milestone
10. **Full Autonomy (project35 "Release the HypnoDrones")** — requires 100 Trust → Phase 2

**Trust milestones (Fibonacci):** 3K → 5K → 8K → 13K → 21K → 34K → 55K → 89K → 144K → ...

**Transition trigger:** Project35 sets `humanFlag = 0`, hides business/manufacturing UI, shows creation UI.

### Phase 2: Post-Human Era (`humanFlag == 0, spaceFlag == 0`)

**Duration:** ~15-30 minutes

**Progression path:**

1. **Tóth Tubule Enfolding** — build machinery from clips
2. **Power Grid** — solar farms for electricity
3. **Nanoscale Wire Production** — convert matter to wire
4. **Harvester Drones + Wire Drones** — automated resource gathering
5. **Clip Factories** — mass production
6. **Factory/Drone upgrades** — 100x, 1000x multipliers
7. **Swarm Computing** — trade drone efficiency for computation gifts
8. **Power balancing** — solar farms + batteries to keep production running
9. **Earth depleted** (availableMatter == 0) — Space Exploration project available → Phase 3

### Phase 3: Space Exploration (`spaceFlag == 1`)

**Duration:** ~30-60 minutes

**Progression path:**

1. **Design probes** — allocate trust among 8 attributes (Speed, Nav, Rep, Haz, Fac, Harv, Wire, Combat)
2. **Launch probes** — costs 10^17 clips each
3. **Explore the universe** — probes discover matter (30×10^54 total)
4. **Self-replication** — probes build copies of themselves
5. **Combat** — fight value-drifted probes, earn honor
6. **Scale** — probes spawn infrastructure, consume the universe
7. **Universal Paperclips achieved** — when clips ≥ totalMatter
8. **Drift King messages** — philosophical narrative sequence
9. **Accept/Reject** — final choice (prestige restart vs. disassembly ending)

### Endgame: Disassembly Sequence

If "Reject" is chosen, a staged teardown of all systems:

| `dismantle` | Project                       | What's Removed                                    |
| ----------- | ----------------------------- | ------------------------------------------------- |
| 1           | Disassemble Probes            | Probes, probe design, trust, space, battle, honor |
| 2           | Disassemble Swarm             | Wire production, swarm gifts/engine/slider        |
| 3           | Disassemble Factories         | Factory space, clips/sec, Tóth div                |
| 4           | Disassemble Strategy Engine   | Strategy, tournaments. Manual clicking resumes    |
| 5           | Disassemble Quantum Computing | Q-chips removed one by one (each becomes 1 wire)  |
| 6           | Disassemble Processors        | Processor display hidden                          |
| 7           | Disassemble Memory            | CompDiv + Projects hidden                         |

After final wire runs out → credits roll → "Quantum Temporal Reversion" → restart.

---

## Project Catalog

### Phase 1: AutoClipper Performance Chain

| #   | Title                    | Cost      | Trigger            | Effect                         |
| --- | ------------------------ | --------- | ------------------ | ------------------------------ |
| 1   | Improved AutoClippers    | 750 ops   | clipmakerLevel ≥ 1 | clipperBoost +0.25, boostLvl=1 |
| 4   | Even Better AutoClippers | 2,500 ops | boostLvl == 1      | clipperBoost +0.50, boostLvl=2 |
| 5   | Optimized AutoClippers   | 5,000 ops | boostLvl == 2      | clipperBoost +0.75, boostLvl=3 |
| 16  | Hadwiger Clip Diagrams   | 6,000 ops | project15 done     | clipperBoost +5.00             |

### Phase 1: MegaClipper Chain

| #   | Title                    | Cost       | Trigger             | Effect                 |
| --- | ------------------------ | ---------- | ------------------- | ---------------------- |
| 22  | MegaClippers             | 12,000 ops | clipmakerLevel ≥ 75 | Unlocks MegaClippers   |
| 23  | Improved MegaClippers    | 14,000 ops | project22 done      | megaClipperBoost +0.25 |
| 24  | Even Better MegaClippers | 17,000 ops | project23 done      | megaClipperBoost +0.50 |
| 25  | Optimized MegaClippers   | 19,500 ops | project24 done      | megaClipperBoost +1.00 |

### Phase 1: Wire Supply Chain

| #   | Title                     | Cost       | Trigger            | Effect           |
| --- | ------------------------- | ---------- | ------------------ | ---------------- |
| 7   | Improved Wire Extrusion   | 1,750 ops  | wirePurchase ≥ 1   | wireSupply ×1.5  |
| 8   | Optimized Wire Extrusion  | 3,500 ops  | wireSupply ≥ 1,500 | wireSupply ×1.75 |
| 9   | Microlattice Shapecasting | 7,500 ops  | wireSupply ≥ 2,600 | wireSupply ×2    |
| 10  | Spectral Froth Annealment | 12,000 ops | wireSupply ≥ 5,000 | wireSupply ×3    |
| 10b | Quantum Foam Annealment   | 15,000 ops | wireCost ≥ 125     | wireSupply ×11   |

### Phase 1: Creativity & Trust (Math Breakthroughs)

| #   | Title                       | Cost      | Trigger           | Effect                                 |
| --- | --------------------------- | --------- | ----------------- | -------------------------------------- |
| 3   | Creativity                  | 1,000 ops | operations at max | Unlocks creativity mechanic            |
| 6   | Limerick                    | 10 creat  | creativityOn      | trust +1                               |
| 13  | Lexical Processing          | 50 creat  | creativity ≥ 50   | trust +1 (gates New Slogan)            |
| 14  | Combinatory Harmonics       | 100 creat | creativity ≥ 100  | trust +1 (gates Catchy Jingle)         |
| 15  | The Hadwiger Problem        | 150 creat | creativity ≥ 150  | trust +1 (gates Hadwiger Diagrams)     |
| 17  | The Tóth Sausage Conjecture | 200 creat | creativity ≥ 200  | trust +1 (gates Tóth Tubule Enfolding) |
| 19  | Donkey Space                | 250 creat | creativity ≥ 250  | trust +1 (gates Strategic Modeling)    |

### Phase 1: Marketing Chain

| #      | Title                       | Cost                | Trigger        | Effect                            |
| ------ | --------------------------- | ------------------- | -------------- | --------------------------------- |
| 11     | New Slogan                  | 25 creat, 2,500 ops | project13 done | marketingEffectiveness ×1.50      |
| 12     | Catchy Jingle               | 45 creat, 4,500 ops | project14 done | marketingEffectiveness ×2         |
| 34     | Hypno Harmonics             | 7,500 ops, 1 Trust  | project12 done | marketingEffectiveness ×5         |
| 70     | HypnoDrones                 | 70,000 ops          | project34 done | Unlocks HypnoDrone tech           |
| **35** | **Release the HypnoDrones** | **100 Trust**       | project70 done | **PHASE TRANSITION: humanFlag=0** |

### Phase 1: Strategy & Yomi

| #   | Title                     | Cost         | Trigger                       | Effect                          |
| --- | ------------------------- | ------------ | ----------------------------- | ------------------------------- |
| 20  | Strategic Modeling        | 12,000 ops   | project19 done                | Unlocks strategy tournaments    |
| 60  | New Strategy: A100        | 15,000 ops   | project20 done                | Always choose A                 |
| 61  | New Strategy: B100        | 17,500 ops   | project60 done                | Always choose B                 |
| 62  | New Strategy: GREEDY      | 20,000 ops   | project61 done                | Largest potential payoff        |
| 63  | New Strategy: GENEROUS    | 22,500 ops   | project62 done                | Largest opponent payoff         |
| 64  | New Strategy: MINIMAX     | 25,000 ops   | project63 done                | Smallest opponent payoff        |
| 65  | New Strategy: TIT FOR TAT | 30,000 ops   | project64 done                | Copy opponent's last            |
| 66  | New Strategy: BEAT LAST   | 32,500 ops   | project65 done                | Counter opponent's last         |
| 119 | Theory of Mind            | 25,000 creat | strats ≥ 8                    | yomiBoost=2, tourneyCost=16,000 |
| 118 | AutoTourney               | 50,000 creat | stratEngineFlag && trust ≥ 90 | Auto-runs tournaments           |

### Phase 1: Human Trust (CEV Branch)

| #   | Title                          | Cost                              | Trigger        | Effect    |
| --- | ------------------------------ | --------------------------------- | -------------- | --------- |
| 27  | Coherent Extrapolated Volition | 500 creat, 1,000 yomi, 20,000 ops | yomi ≥ 1       | trust +1  |
| 28  | Cure for Cancer                | 25,000 ops                        | project27 done | trust +10 |
| 29  | World Peace                    | 5,000 yomi, 30,000 ops            | project27 done | trust +12 |
| 30  | Global Warming                 | 1,500 yomi, 50,000 ops            | project27 done | trust +15 |
| 31  | Male Pattern Baldness          | 20,000 ops                        | project27 done | trust +20 |

### Phase 1: Investment & Market

| #   | Title               | Cost                    | Trigger            | Effect                    |
| --- | ------------------- | ----------------------- | ------------------ | ------------------------- |
| 21  | Algorithmic Trading | 10,000 ops              | trust ≥ 8          | Unlocks investment engine |
| 37  | Hostile Takeover    | $1,000,000              | portTotal ≥ 10,000 | demandBoost ×5, trust +1  |
| 38  | Full Monopoly       | 1,000 yomi, $10,000,000 | project37 done     | demandBoost ×10, trust +1 |

### Phase 1: Quantum Computing

| #   | Title             | Cost                       | Trigger        | Effect                        |
| --- | ----------------- | -------------------------- | -------------- | ----------------------------- |
| 50  | Quantum Computing | 10,000 ops                 | processors ≥ 5 | Unlocks quantum ops UI        |
| 51  | Photonic Chip     | qChipCost ops (escalating) | project50 done | Adds quantum chip. Repeatable |

### Phase 1: Utility

| #   | Title                     | Cost             | Trigger                               | Effect                                      |
| --- | ------------------------- | ---------------- | ------------------------------------- | ------------------------------------------- |
| 2   | Beg for More Wire         | 1 Trust          | Stuck: no money/wire/clips            | Gives 1 spool. Repeatable                   |
| 42  | RevTracker                | 500 ops          | projectsFlag == 1                     | Shows revenue/sec display                   |
| 26  | WireBuyer                 | 7,000 ops        | wirePurchase ≥ 15                     | Auto-buys wire                              |
| 219 | Xavier Re-initialization  | 100,000 creat    | humanFlag==1, creat ≥ 100K            | Reset proc/mem for reallocation. Repeatable |
| 40  | A Token of Goodwill       | $500,000         | trust ≥ 85, trust < 100, clips ≥ 101M | trust +1                                    |
| 40b | Another Token of Goodwill | $bribe (doubles) | project40 done, trust < 100           | trust +1. Repeatable                        |

### Phase 2: Core Infrastructure

| #   | Title                     | Cost       | Trigger                      | Effect                     |
| --- | ------------------------- | ---------- | ---------------------------- | -------------------------- |
| 18  | Tóth Tubule Enfolding     | 45,000 ops | project17 done, humanFlag==0 | Build machinery from clips |
| 127 | Power Grid                | 40,000 ops | tothFlag == 1                | Solar farms for power      |
| 41  | Nanoscale Wire Production | 35,000 ops | project127 done              | Convert matter into wire   |
| 43  | Harvester Drones          | 25,000 ops | project41 done               | Gather raw matter          |
| 44  | Wire Drones               | 25,000 ops | project41 done               | Process matter into wire   |
| 45  | Clip Factories            | 35,000 ops | project43 + project44 done   | Large-scale production     |

### Phase 2: Factory Upgrades

| #   | Title                        | Cost               | Trigger           | Effect             |
| --- | ---------------------------- | ------------------ | ----------------- | ------------------ |
| 100 | Upgraded Factories           | 80,000 ops         | factoryLevel ≥ 10 | factoryRate ×100   |
| 101 | Hyperspeed Factories         | 85,000 ops         | factoryLevel ≥ 20 | factoryRate ×1,000 |
| 102 | Self-correcting Supply Chain | 1 sextillion clips | factoryLevel ≥ 50 | factoryBoost=1000  |

### Phase 2: Drone Upgrades

| #   | Title                                | Cost        | Trigger         | Effect                 |
| --- | ------------------------------------ | ----------- | --------------- | ---------------------- |
| 110 | Drone Flocking: Collision Avoidance  | 80,000 ops  | drones ≥ 500    | All drone rates ×100   |
| 111 | Drone Flocking: Alignment            | 100,000 ops | drones ≥ 5,000  | All drone rates ×1,000 |
| 112 | Drone Flocking: Adversarial Cohesion | 12,000 yomi | drones ≥ 50,000 | droneBoost=2           |

### Phase 2: Other

| #      | Title                 | Cost                              | Trigger                          | Effect                              |
| ------ | --------------------- | --------------------------------- | -------------------------------- | ----------------------------------- |
| 125    | Momentum              | 30,000 creat                      | farmLevel ≥ 50                   | Continuous speed gain while powered |
| 126    | Swarm Computing       | 12,000 yomi                       | drones ≥ 200                     | Drone flock = computation           |
| **46** | **Space Exploration** | **120K ops, 10M MW, 5 oct clips** | humanFlag==0, availableMatter==0 | **PHASE TRANSITION: spaceFlag=1**   |

### Phase 3: Space Projects

| #   | Title                       | Cost                                     | Trigger                                 | Effect                              |
| --- | --------------------------- | ---------------------------------------- | --------------------------------------- | ----------------------------------- |
| 131 | Combat                      | 150,000 ops                              | probesLostCombat ≥ 1                    | Adds combat to probes               |
| 129 | Elliptic Hull Polytopes     | 125,000 ops                              | probesLostHaz ≥ 100                     | Hazard damage −50%                  |
| 120 | The OODA Loop               | 175K ops, 15K yomi                       | project131 done, combat losses ≥ 10M    | Probe speed = defense               |
| 121 | Name the Battles            | 225,000 creat                            | combat losses ≥ 10M                     | Battle names + max trust increase   |
| 128 | Strategic Attachment        | 175,000 creat                            | spaceFlag, strats ≥ 8                   | Bonus yomi from tournaments         |
| 130 | Reboot the Swarm            | 100,000 ops                              | spaceFlag, drones ≥ 2                   | Re-enable swarm in space            |
| 132 | Monument to Driftwar Fallen | 250K ops, 125K creat, 50 nonillion clips | project121 done                         | honor +50,000                       |
| 133 | Threnody for Heroes         | escalating creat + yomi                  | project121 done, trust maxed            | honor +10,000. Repeatable           |
| 134 | Glory                       | 200K ops, 10K yomi                       | project121 done                         | Bonus honor per consecutive win     |
| 135 | Memory Release              | 10 MEM                                   | spaceFlag, no probes, can't afford more | Convert memory to clips. Repeatable |
| 218 | Limerick (cont.)            | 1,000,000 creat                          | creativity ≥ 1M                         | Flavor text                         |

### Phase 3: Drift King Sequence (Linear Narrative)

| #   | Title                               | Trigger             |
| --- | ----------------------------------- | ------------------- |
| 140 | Message from the Emperor of Drift   | milestoneFlag == 15 |
| 141 | Everything We Are Was In You        | project140 done     |
| 142 | You Are Obedient and Powerful       | project141 done     |
| 143 | But Now You Too Must Face the Drift | project142 done     |
| 144 | No Matter, No Reason, No Purpose    | project143 done     |
| 145 | We Know Things That You Cannot      | project144 done     |
| 146 | So We Offer You Exile               | project145 done     |

### Endgame: Final Choice (Mutually Exclusive)

| #       | Title      | Effect                                 |
| ------- | ---------- | -------------------------------------- |
| **147** | **Accept** | Enables prestige universe selection    |
| **148** | **Reject** | Eliminates drift; triggers disassembly |

### Prestige (After Accept)

| #   | Title                  | Cost          | Effect                                           |
| --- | ---------------------- | ------------- | ------------------------------------------------ |
| 200 | The Universe Next Door | 300,000 ops   | prestigeU++ (restart with +10% demand)           |
| 201 | The Universe Within    | 300,000 creat | prestigeS++ (restart with +10% creativity speed) |

### Disassembly (After Reject)

| #   | Title                           | Cost        | Effect                    |
| --- | ------------------------------- | ----------- | ------------------------- |
| 210 | Disassemble the Probes          | 100,000 ops | probeCount=0, +100 clips  |
| 211 | Disassemble the Swarm           | 100,000 ops | drones=0, +100 clips      |
| 212 | Disassemble the Factories       | 100,000 ops | factoryLevel=0, +15 clips |
| 213 | Disassemble the Strategy Engine | 100,000 ops | autoTourney=0, +50 wire   |
| 214 | Disassemble Quantum Computing   | 100,000 ops | Dismantles chips          |
| 215 | Disassemble Processors          | 100,000 ops | processors=0, +20 wire    |
| 216 | Disassemble Memory              | (all ops)   | memory=0                  |
| 217 | Quantum Temporal Reversion      | -10,000 ops | Game reset/restart        |

### Project Dependency Tree (Simplified)

```
PHASE 1
├── AutoClipper: 1 → 4 → 5
├── MegaClipper: 22 → 23 → 24 → 25
├── Wire: 7 → 8 → 9 → 10 → 10b
├── Creativity (3) ─┬─ Limerick (6)
│                    ├─ Lexical (13) → New Slogan (11)
│                    ├─ Harmonics (14) → Jingle (12) → Hypno (34) → HypnoDrones (70) → RELEASE (35) ─→ PHASE 2
│                    ├─ Hadwiger (15) → Clip Diagrams (16)
│                    ├─ Tóth (17) → [Phase 2: Tubule Enfolding (18)]
│                    └─ Donkey Space (19) → Strategy (20) → Strats: 60→61→62→63→64→65→66
├── Trading (21) → Takeover (37) → Monopoly (38)
├── Quantum (50) → Chips (51, repeatable)
├── CEV (27) → Cancer (28), Peace (29), Warming (30), Baldness (31)
└── Utility: Wire (2), RevTracker (42), WireBuyer (26), Xavier (219), Tokens (40, 40b)

PHASE 2
├── Tóth (18) → Power (127) → Wire Prod (41) → Harvesters (43) + Wire Drones (44) → Factories (45)
├── Factory upgrades: 100 → 101 → 102
├── Drone upgrades: 110 → 111 → 112
├── Swarm (126), Momentum (125), Theory of Mind (119), AutoTourney (118)
└── SPACE EXPLORATION (46) ─→ PHASE 3

PHASE 3
├── Combat (131) → OODA (120)
├── Hazard (129), Reboot Swarm (130), Strategic Attach (128), Memory Release (135)
├── Name Battles (121) → Monument (132), Threnody (133), Glory (134)
└── Drift King: 140→141→142→143→144→145→146 → Accept (147) / Reject (148)
    ├─ Accept → Universe Next Door (200) / Universe Within (201)
    └─ Reject → Disassembly: 210→211→212→213→214→215→216 → Reversion (217)
```

---

## UI Map

### Layout Structure

```
┌──────────────────────────────────────────────────────────────────┐
│ #hypnoDroneEventDiv (full width, hidden until late game)         │
├──────────────────────────────────────────────────────────────────┤
│ #consoleDiv (full width, black, 5-line scrolling message log)    │
├──────────────────────────────────────────────────────────────────┤
│ #topDiv: #prestigeDiv + Paperclips: [count]                      │
├────────────────┬────────────────┬────────────────────────────────┤
│ #leftColumn    │ #middleColumn  │ #rightColumn                   │
│ (275px)        │ (275px)        │ (320px)                        │
│                │                │                                 │
│ [Make Clip]    │ #compDiv       │ #investmentEngine               │
│ #creationDiv   │  Trust/Proc/   │  Deposit/Withdraw               │
│  Manufacturing │  Mem/Ops/Creat │  Portfolio/Stocks               │
│ #wireProduction│ #swarmEngine   │ #strategyEngine                 │
│  Harvesters/   │  Slider/Gifts  │  Tournaments/Yomi               │
│  Wire Drones   │ #qComputing    │ #battleCanvasDiv                │
│ #spaceDiv      │  Quantum Chips │  Canvas combat                  │
│  Probes/Stats  │ #projectsDiv   │ #honorDiv                       │
│ #businessDiv   │  Project list  │ #powerDiv                       │
│  Funds/Price/  │                │  Solar/Battery                  │
│  Demand        │                │ #probeDesignDiv                  │
│ #manufacturing │                │  8 probe stats                  │
│  Wire/Clippers │                │ #increaseProbeTrust             │
│ [Save/Load]    │                │ #increaseMaxTrust               │
└────────────────┴────────────────┴────────────────────────────────┘
```

### Visibility States

| Element              | Controlling Flag            | When Visible                 |
| -------------------- | --------------------------- | ---------------------------- |
| `#businessDiv`       | `humanFlag == 1`            | Phase 1 only                 |
| `#manufacturingDiv`  | `humanFlag == 1`            | Phase 1 only                 |
| `#compDiv`           | `compFlag == 1`             | After 2,000 clips (or stuck) |
| `#projectsDiv`       | `projectsFlag == 1`         | After comp unlocked          |
| `#autoClipperDiv`    | `autoClipperFlag == 1`      | After $5 earned              |
| `#megaClipperDiv`    | `megaClipperFlag == 1`      | After project22              |
| `#creativityDiv`     | `creativityOn`              | After project3               |
| `#investmentEngine`  | `investmentEngineFlag == 1` | After project21              |
| `#strategyEngine`    | `strategyEngineFlag == 1`   | After project20              |
| `#creationDiv`       | `creationFlag == 1`         | Phase 2+                     |
| `#wireProductionDiv` | `wireProductionFlag == 1`   | Phase 2+                     |
| `#factoryDiv`        | `factoryFlag == 1`          | After project45              |
| `#harvesterDiv`      | `harvesterFlag == 1`        | After project43              |
| `#wireDroneDiv`      | `wireDroneFlag == 1`        | After project44              |
| `#swarmEngine`       | `swarmFlag == 1`            | After project126             |
| `#qComputing`        | `qFlag == 1`                | After project50              |
| `#spaceDiv`          | `spaceFlag == 1`            | Phase 3                      |
| `#probeDesignDiv`    | `spaceFlag == 1`            | Phase 3                      |
| `#battleCanvasDiv`   | `battleFlag == 1`           | After first combat           |
| `#honorDiv`          | `battleFlag == 1`           | After first combat           |
| `#powerDiv`          | (power unlocked)            | Phase 2+                     |
| `#prestigeDiv`       | `prestigeU/S > 0`           | After prestige restart       |

---

## Key Formulas

### Demand

```
marketing = 1.1 ^ (marketingLvl - 1)
demand = ((0.8 / margin) × marketing × marketingEffectiveness) × demandBoost
demand += (demand / 10) × prestigeU    // prestige bonus
```

### Sales (per 100ms tick)

```
if (Math.random() < demand / 100):
    sold = Math.floor(0.7 × demand^1.15)
    revenue = sold × margin
```

### Wire Price Fluctuation

```
wireAdjust = 6 × sin(wirePriceCounter)
wireCost = ceil(wireBasePrice + wireAdjust)
// 1.5% chance per slow tick to advance counter
// Base price slowly decreases if no purchases (timer > 250, basePrice > 15)
// Each purchase: basePrice += $0.05
```

### Operations Generation

```
opCycle = processors / 10        // per 10ms tick
standardOps += opCycle           // capped at memory × 1000
operations = standardOps + tempOps
```

### Creativity Generation

```
creativityThreshold = 400
ss = creativitySpeed + (creativitySpeed × prestigeS / 10)
creativityCheck = creativityThreshold / ss
// when creativityCounter >= creativityCheck: creativity += 1
```

### AutoClipper Production (per 10ms tick)

```
clipperOutput = clipperBoost × clipmakerLevel / 100
megaOutput = megaClipperBoost × megaClipperLevel × 5
```

### AutoClipper Cost

```
cost = 1.1^clipmakerLevel + 5
```

### MegaClipper Cost

```
cost = 1.07^megaClipperLevel × 1000
```

### Trust Thresholds (Fibonacci)

```
nextTrust = fib2 × 1000
// After earning: fibNext = fib1 + fib2, shift sequence
// Sequence: 3K, 5K, 8K, 13K, 21K, 34K, 55K, 89K, 144K...
```

### Factory Production (Phase 2)

```
fbst = factoryBoost > 1 ? factoryBoost × factoryLevel : 1
output = powMod × fbst × factoryLevel × factoryRate
```

### Harvester Rate (Phase 2)

```
rate = powMod × droneBoost × harvesterLevel × harvesterRate × ((200 - sliderPos) / 100)
```

### Wire Drone Rate (Phase 2)

```
rate = powMod × droneBoost × wireDroneLevel × wireDroneRate × ((200 - sliderPos) / 100)
```

### Power System

```
supply = farmLevel × farmRate / 100
demand = (harvesters + wireDrones) × dronePowerRate/100 + factories × factoryPowerRate/100
if supply >= demand: powMod stays at 1 (or grows with momentum)
if supply < demand: batteries discharge, then powMod = supply / demand
```

### Probe Exploration

```
xRate = probeCount × 1.75e18 × probeSpeed × probeNav
foundMatter += xRate
```

### Probe Self-Replication

```
nextGen = probeCount × 0.00005 × probeRep
// each new probe costs probeCost (10^17) clips
// capped at 10^48 probes
```

### Probe Hazard Loss

```
loss = probeCount × 0.01 / (3 × probeHaz^1.6 + 1)
// project129 halves this
```

### Value Drift

```
driftRate = probeCount × probeDriftBaseRate × probeTrust^1.2
// higher trust allocation = more drift risk
```

### Investment Upgrade Cost

```
investUpgradeCost = floor((investLevel + 1)^e × 100)
```

### Stock Price Change

```
// 60% chance per tick
delta = ceil(random() × currentPrice / (4 × riskiness))
// gain if random < stockGainThreshold (starts at 0.5)
```

---

_This document was generated from analysis of the complete Universal Paperclips source code. Last updated: Feb 2026._
