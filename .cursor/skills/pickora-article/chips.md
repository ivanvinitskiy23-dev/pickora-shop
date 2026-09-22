# Pickora article chips (tags)

Source of truth for `/articles/` filter chips and hub cards.  
**Hub categories** (nav / Popular Categories) stay the four big buckets.  
**Chips** are finer topic tags — one article can have **1–3** chips.

## Hub category → default chips

| Hub (`Category` in brief) | Hub URL | Typical chips |
|---|---|---|
| Home & Kitchen | `/home-kitchen/` | `kitchen`, `cleaning`, `home`, often + `smart-home` |
| Consumer Electronics | `/consumer-electronics/` | `electronics`, `audio`, `mobile`, often + `wearables` |
| Fitness & Health | `/fitness-health/` | `fitness`, often + `wearables` / `audio` |
| Pet Supplies | `/pet-supplies/` | `pets`, often + `smart-home` |

## Allowed chip slugs (UI)

Show these buttons on `/articles/` (keep order):

| Slug | Label on chip / badge | Use for |
|---|---|---|
| `audio` | Audio | Headphones, earbuds, speakers, gym earbuds |
| `electronics` | Electronics | Broad CE; keyboards, webcams, e-readers, hubs; also pair with audio/mobile |
| `mobile` | Mobile | Phone cases, chargers/cables, power banks, phone-adjacent accessories |
| `kitchen` | Kitchen | Air fryers, coffee, espresso, microwave, toaster ovens, blenders, mixers, kettles, Instant Pot, dishwashers |
| `cleaning` | Cleaning | Robot vacuums, stick vacuums, vacuum comparisons / how-to |
| `smart-home` | Smart Home | Connected home devices (robot vacs, pet cameras, smart feeders, GPS collars when app-led) |
| `fitness` | Fitness | Home gym, mats, dumbbells, bands, rollers, jump ropes, gym setups |
| `wearables` | Wearables | Fitness trackers, smartwatches, rings (Oura), tracker buying guides |
| `pets` | Pets | Pet cameras, feeders, beds, litter, fountains, grooming, GPS collars |
| `home` | Home | Mattress toppers and other non-kitchen home comfort (future bedding/living) |

`all` is UI-only (not stored on cards).

## Rules for the writer / publisher

1. Every live article card **must** set `data-categories="slug1 slug2"` (space-separated).
2. Prefer **2 chips** when the topic spans buckets (e.g. pet camera → `pets smart-home`; gym earbuds → `audio fitness`).
3. Max **3** chips per article. First chip = primary badge color; 2nd = soft badge.
4. Card markup:
   ```html
   <article class="pk-card" data-categories="audio electronics">
     ...
     <div class="pk-card-tags">
       <span class="pk-card-tag">Audio</span>
       <span class="pk-card-tag pk-card-tag--soft">Electronics</span>
     </div>
   ```
5. Hero badge on the article page may stay the **hub** name (Home & Kitchen, …). Chips are for hub discovery + filtering.
6. Brief field **Chips:** list 1–3 slugs from the table above (required before publish).
7. Do **not** invent new chip slugs in a one-off publish. If a topic does not fit, use the closest existing chip and note in the brief; only add a new chip when CONTENT-BANK shows ≥3 upcoming titles that need it (then update this file + `articles/index.html` chips + `pickora-article-filters.js`).

## Suggested chips for CONTENT-BANK pipeline

| Topic pattern | Chips |
|---|---|
| Microwaves, coffee, espresso, air fryer, toaster oven, blender, mixer, kettle, Instant Pot, dishwasher | `kitchen` |
| Stick / robot vacuum, vacuum vs, how to choose robot vacuum | `cleaning smart-home` |
| Mattress toppers / bedding | `home` |
| Headphones, earbuds, Bluetooth speakers, ANC, AirPods vs Sony | `audio electronics` |
| Gym earbuds | `audio fitness` |
| Power banks, chargers, iPhone cases | `mobile electronics` |
| Mechanical keyboards, webcams, USB-C hubs, e-readers | `electronics` |
| Sony WH worth-it | `audio electronics` |
| Fitness trackers, smartwatch guides, Fitbit vs Garmin, Oura, tracker mistakes | `wearables fitness` |
| Yoga mats, dumbbells, bands, rollers, jump ropes, home gym budget | `fitness` |
| Pet cameras, Furbo vs, large-dog camera | `pets smart-home` |
| Pet feeders, GPS collars | `pets smart-home` |
| Dog beds, litter, fountains, grooming | `pets` |

## Reserved (not in UI yet)

Do not use until 3+ briefs need them: `office` (desk gear split from electronics), `outdoor`. Prefer `electronics` / `home` until then.
