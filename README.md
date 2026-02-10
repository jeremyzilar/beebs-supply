# Beeb's Supply Chain Game

An incremental/idle game about building a dog treat empire, inspired by [Universal Paperclips](http://www.decisionproblem.com/paperclips/). You start at your kitchen table making treats by hand and grow through the real-world stages of a pet food supply chain — from selling to people on the street to Amazon, Sprouts, and Petco shelves.

Built as a pure client-side app (HTML + CSS + vanilla JS) hosted on GitHub Pages.

## How to Play Locally

```sh
cd docs
python3 -m http.server
# Open http://localhost:8000
```

## Game Design

### 5 Phases of Growth

#### Phase 1: Kitchen Table

- Click to make treats by hand
- Resources: ingredients (bought at retail prices), time, a home oven/dehydrator
- Sell at farmers markets and via a simple website (direct-to-consumer)
- Challenges: shelf life decay (treats expire), labeling compliance (FDA registration, nutritional analysis, state registrations)
- Goal: accumulate enough revenue to move to Phase 2

#### Phase 2: Shared Commercial Kitchen

- Unlock commercial mixer and dehydrator (automation — treats per second increases)
- Shift to wholesale ingredient sourcing (lower cost per unit)
- First wholesale accounts: 5-20 local independent pet stores
- New mechanic: **net-30 payment terms** — stores don't pay for 30 days, so cash flow becomes a resource to manage
- Need UPC barcodes (GS1 membership cost), better packaging
- Challenge: balancing production vs. shelf life vs. demand. Overproduction = waste. Underproduction = lost accounts.

#### Phase 3: Co-Packer or Own Facility

- Big decision point (the player chooses): co-pack (lower capital, less control, long lead times) vs. own facility (high capital, full control)
- Unlock regional distributors (they take 20-30% margin)
- New retail channels: regional chains (Pet Supplies Plus), Chewy marketplace
- New mechanics: **lead time management**, **distributor relationships**, **FSMA compliance** (food safety plan, PCQI)
- The "3-month window" — new retail accounts evaluate quickly; bad sell-through = delisting
- Third-party audits (SQF certification) as a purchasable upgrade

#### Phase 4: National Distribution

- Unlock PetSmart, Petco (requires broker relationships, EDI compliance, slotting fees)
- 3PL warehousing and freight logistics
- SKU proliferation — managing multiple flavors/sizes across distribution centers
- Chargebacks for compliance failures (wrong labels, late shipments)
- Marketing spend: demos, coupons, endcap displays
- Freight cost as a major expense line
- Recall risk events (random chance, mitigated by quality systems)

#### Phase 5: Empire / Endgame

- International expansion, private label deals, acquisition offers
- Supply chain optimization as the core puzzle — minimizing waste, maximizing throughput
- Extended Producer Responsibility (packaging sustainability costs)
- Win conditions: get acquired, reach target revenue, or fully automate the supply chain

### Core Resources

| Resource        | Description                                           |
| --------------- | ----------------------------------------------------- |
| **Treats**      | Finished product inventory                            |
| **Ingredients** | Raw materials (proteins, grains, etc.)                |
| **Cash**        | Money in the bank                                     |
| **Reputation**  | Affects demand and retailer willingness to stock you  |
| **Compliance**  | Regulatory standing (affects risk of fines/recalls)   |
| **Shelf Life**  | Treats decay over time — unsold inventory loses value |

### Key Mechanics That Mirror Reality

- **Margin stacking**: Margins shrink as distributors (20-30%) and retailers (40-50%) each take their cut
- **Cash flow timing**: Revenue lags behind expenses due to net-30/net-60 payment terms
- **Quality vs. speed tradeoffs**: Cutting corners increases output but raises recall risk
- **Shelf life pressure**: A real constraint that forces smart inventory management
- **Scaling paradox**: Getting into a big retailer is exciting but can bankrupt you if you can't fulfill orders or absorb the margin hit
- **The label problem**: Multi-state registration, AAFCO compliance, nutritional analysis — expensive and tedious but mandatory

## Hosting

Served from the `/docs` folder via GitHub Pages. Enable in repo settings: Deploy from branch > `main` > `/docs`.

## Tech Stack

- Vanilla HTML/CSS/JavaScript
- No frameworks, no build step
- Client-side only (runs entirely in the browser)
- Game state saved to localStorage
