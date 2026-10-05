# Pickora Studio вЂ” Audit Findings Memory
# Last updated: 2026-10-05 (ALL FIXED; shipped commit)
# HTML: pk-studio/audit/01-05 + index.html + 05-before-after.html
# Status: OPEN | PLANNED | FIXED
# Severity: P0 | P1 | P2 | P3

## Meta
- Scope: pk-studio + admin-api used by Studio
- Dig agents: composer-2.5-fast explore (ops/auth/media + home/pins/products/articles)
- Next: wrangler deploy admin-api (preview/home|pins, live import, probe hubs). Before/after: 05-before-after.html

## Index (quick)
P0: A-01
P1: A-02 A-03 A-04 A-05 A-06 A-19 A-32 A-33
P2: A-07..A-13 A-21..A-31 A-34..A-39 A-43
P3: A-14..A-18 A-20 A-40..A-42

---

## A-01 | P0 | Team | FIXED (verified 2026-10-05)
- was: sessionIsOwner() used s.user.owner; session is flat {owner}
- fix applied: return !!(s?.owner || s?.user?.owner || s?.role === "owner")
- verified: ops.js sessionIsOwner matches auth.js setSession shape; invitePanel toggle uses isOwner
- files: pk-studio/js/ops.js

## A-02 | P1 | Home/Pins | FIXED (verified 2026-10-05)
- was: no draft offline preview APIs
- fix applied: POST /api/preview/home|pins + btn-home-offline / btn-pins-offline
- verified: handlePreviewHome/Pins; openHomeOfflinePreview bindings
- files: admin-api/src/index.js, publish_home.js, publish_pins.js, pk-studio/js/app.js, index.html

## A-03 | P1 | Home/Pins | FIXED (verified 2026-10-05)
- was: Save without buy-URL validation
- fix applied: isGoodBuyUrl on saveHome/savePins; reject bare amzn.to/ and link.amazon/
- verified: single isGoodBuyUrl; saveHome/savePins check before POST
- files: pk-studio/js/app.js

## A-04 | P1 | Publish | FIXED (verified 2026-10-05)
- was: module publish no client preflight
- fix applied: publishModule loads draft, shows checklist confirm (counts + warnings)
- verified: ops.js publishModule preflight + publishPreflightConfirm i18n
- files: pk-studio/js/ops.js, i18n.js

## A-05 | P1 | Media | FIXED (verified 2026-10-05)
- was: delete does not scrub draft references
- fix applied: findMediaDraftUsages scan + confirmDeleteMediaInUse before DELETE
- verified: ops.js findMediaDraftUsages + deleteMedia confirm path
- files: pk-studio/js/ops.js, i18n.js

## A-06 | P1 | Media | FIXED (verified 2026-10-05)
- was: Media panel no Upload UI
- fix applied: media-upload-input + uploadMedia + copy path UI
- verified: index.html media-upload-*; ops.js uploadMedia/showMediaUploadPath
- files: pk-studio/index.html, ops.js

## A-07 | P2 | Pins | FIXED (verified 2026-10-05)
- was: multi-store only textarea
- fix applied: buyLinksEditorHtml for pin products
- verified: pinProductsEditorHtml uses buyLinksEditorHtml
- files: pk-studio/js/app.js

## A-08 | P2 | Home | FIXED (verified 2026-10-05)
- was: Top picks single amazonUrl
- fix applied: buyLinksEditorHtml in Studio; links[] + amazonUrl derived; carousel renderStoreButtons
- verified: renderTopPicksEditor buy-links; pickora-top-picks.js renderStoreButtons; ?v=8
- files: pk-studio/js/app.js, assets/js/pickora-top-picks.js, index.html

## A-09 | P2 | Articles | FIXED (verified 2026-10-05)
- was: live list not openable in editor
- fix applied: GET /api/articles/:slug/live + Import to draft button
- verified: getLiveArticleJson; importLiveArticle; data-import-live UI
- files: admin-api/src/index.js, pk-studio/js/articles.js, i18n.js

## A-10 | P2 | UX | FIXED (verified 2026-10-05)
- was: stub https://link.amazon/ / amzn.to/ on new items
- fix applied: empty url defaults in app.js + blocks.js product/cta starters
- verified: grep new defaults use url:""
- files: app.js, blocks.js

## A-11 | P2 | Ops | FIXED (verified 2026-10-05)
- was: dead #btn-back-from-* listeners
- fix applied: removed dead binding block from ops.js
- verified: grep btn-back-from в†’ no matches
- files: pk-studio/js/ops.js

## A-12 | P2 | i18n | FIXED (verified 2026-10-05)
- was: data-i18n-placeholder ignored
- fix applied: applyI18n sets placeholder from data-i18n-placeholder
- verified: applyI18n loop present in app.js
- files: pk-studio/js/app.js

## A-13 | P2 | Media | FIXED (verified 2026-10-05)
- was: imgSrc hardcodes production Worker
- fix applied: mediaBase from PK_AUTH.API
- verified: imgSrc uses PK_AUTH.API
- files: pk-studio/js/app.js

## A-14 | P3 | Security UX | FIXED (verified 2026-10-05)
- was: owner login prefilled in HTML
- fix applied: #field-login value=""
- verified: index.html empty value
- files: pk-studio/index.html

## A-15 | P3 | Cache | FIXED (verified 2026-10-05)
- was: mixed ?v= cache bust
- fix applied: all studio assets ?v=20261005c
- verified: index.html script/link tags
- files: pk-studio/index.html

## A-16 | P3 | Copy | FIXED (verified 2026-10-05)
- was: fallback panel coming soon outdated
- fix applied: i18n soon/panelSoon* = module failed to load
- verified: panelSoonTitle RU/EN updated
- files: pk-studio/js/i18n.js

## A-17 | P3 | Code | FIXED (verified 2026-10-05)
- was: dead fileToDataUrl, duplicateAt
- fix applied: removed both functions
- verified: grep no fileToDataUrl/duplicateAt defs used
- files: app.js, blocks.js

## A-18 | P3 | Pins | FIXED (verified 2026-10-05)
- was: no pin reorder; live shuffle
- fix applied: ↑↓ reorder buttons + pins-shuffle-load checkbox → shuffleOnLoad
- verified: renderPinsEditor data-pin-up/down; index.html pins-shuffle-load
- files: pk-studio/js/app.js, index.html

## A-19 | P1 | SEO | FIXED (verified 2026-10-05)
- was: listArticleDrafts omitted blocks
- fix applied: return blocks array from meta
- verified: index.js listArticleDrafts has blocks:
- files: admin-api/src/index.js

## A-32 | P1 | Publish pins/products | FIXED (verified 2026-10-05)
- was: absUrl lacked media rewrite
- fix applied: Worker media rewrite in publish_pins.js + publish_products.js
- verified: absUrl checks /api/media/file/
- files: publish_pins.js, publish_products.js

## A-33 | P1 | Home UI | FIXED (verified 2026-10-05)
- was: lang switch dropped unsaved top-pick edits
- fix applied: readTopPicksForm() before renderHomeEditor
- verified: readTopPicksForm mutates homeData.topPicks
- files: pk-studio/js/app.js

## A-34 | P2 | SEO gate | FIXED (verified 2026-10-05)
- was: collectDraftAffiliateUrls missed richtext/html
- fix applied: scrapeText on bodyHtml + richtext/intro/html blocks
- verified: seo-gate.js scrapeText present
- files: pk-studio/js/seo-gate.js

## A-20 | P3 | Media/API | FIXED (accepted by design 2026-10-05)
- was: GET /api/media/file/* is public (needed for <img> on site)
- decision: keep public Worker media URLs; no signed URLs this pass
- verified: intentional; documented here
- files: n/a (policy)

## A-21 | P2 | Security | FIXED (verified 2026-10-05)
- was: POST /api/links/check fetches arbitrary URLs (SSRF)
- fix applied: allowlist amazon/amzn/walmart/bestbuy/target/pickora; block private IPs
- verified: handleLinkCheck ALLOW_HOST + isPrivateHost
- files: admin-api/src/index.js

## A-22 | P2 | SEO UX | FIXED (verified 2026-10-05)
- was: loadSeo ignored !res.ok
- fix applied: check res.ok; 401 logout
- verified: loadSeo early return on !res.ok
- files: pk-studio/js/ops.js

## A-23 | P2 | SEO UX | FIXED (verified 2026-10-05)
- was: UI counts all links but checks only first 20
- fix applied: seoCheckingBatch / seoAllOkChecked show "{n} of {total}"
- verified: ops.js runLinkCheck batch note; i18n keys present
- files: pk-studio/js/ops.js, i18n.js

## A-24 | P2 | Team audit | FIXED (verified 2026-10-05)
- was: invite/remove audit_log.user_login = target not actor
- fix applied: handleTeamInvite/Remove take actor; log actor.login; detail = target
- verified: routes pass user; bind(actor?.login)
- files: admin-api/src/index.js

## A-25 | P2 | Team auth | FIXED (verified 2026-10-05)
- was: login trims OWNER_* but requireOwner may not → invite denied
- fix applied: shared ownerEnvCredentials().trim for login+password
- verified: requireOwner + handleLogin use ownerEnvCredentials
- files: admin-api/src/index.js

## A-26 | P2 | Media API | FIXED (verified 2026-10-05)
- was: delete always {ok:true} even if missing
- fix applied: 404 not_found when del.meta.changes === 0
- verified: handleMediaDelete changes check
- files: admin-api/src/index.js

## A-27 | P2 | Media API | FIXED (verified 2026-10-05)
- was: INSERT ON CONFLICT UPDATE can overwrite after uniqueness probe
- fix applied: insert-only; on UNIQUE retry suffix once else 409
- verified: no ON CONFLICT UPDATE on media_files insert
- files: admin-api/src/index.js

## A-28 | P2 | Media | FIXED (verified 2026-10-05)
- was: delete D1 only; GitHub wp-content orphan remains
- fix applied: deleteFile() when GITHUB_TOKEN; key uploads/→wp-content/uploads/
- verified: github.js deleteFile; handleMediaDelete calls it
- files: admin-api/src/github.js, index.js

## A-29 | P2 | Auth | FIXED (verified 2026-10-05)
- was: me() synthesized user on network error
- fix applied: catch returns null
- verified: auth.js me() catch
- files: pk-studio/js/auth.js

## A-30 | P2 | Ops | FIXED (verified 2026-10-05)
- was: no shared 401 → logout in ops flows
- fix applied: PK_AUTH.apiFetch + ops apiFetch wrapper on all ops API calls
- verified: auth.js apiFetch; ops.js uses apiFetch not raw fetch
- files: pk-studio/js/auth.js, ops.js

## A-31 | P2 | Auth API | FIXED (verified 2026-10-05)
- was: verifyPassword saltHex.match without null guard → 500
- fix applied: validate hash parts; saltPairs null → false
- verified: verifyPassword guards
- files: admin-api/src/index.js

## A-32 | P1 | Publish pins/products | FIXED (verified 2026-10-05)
- was: absUrl lacked media rewrite
- fix applied: Worker media rewrite in publish_pins.js + publish_products.js
- verified: absUrl checks /api/media/file/
- files: publish_pins.js, publish_products.js

## A-34 | P2 | SEO gate | FIXED (verified 2026-10-05)
- was: collectDraftAffiliateUrls missed richtext/html
- fix applied: scrapeText on bodyHtml + richtext/intro/html blocks
- verified: seo-gate.js scrapeText present
- files: pk-studio/js/seo-gate.js

## A-35 | P2 | Publish home | FIXED (verified 2026-10-05)
- was: empty topPicks.picks skips patchTopPickShell → stale HTML
- fix applied: always patch when topPicks present; empty pick clears shell; src regex [^"]*
- verified: node _verify_a35_a39.mjs (cleared title/amazon/CAT)
- files: admin-api/src/publish_home.js

## A-36 | P2 | Pins UI | FIXED (verified 2026-10-05)
- was: filters not editable in Studio
- fix applied: #pins-filters editor; readPinsFiltersForm on save
- verified: renderPinsEditor filters UI; readPinsForm calls readPinsFiltersForm
- files: pk-studio/js/app.js, index.html, i18n.js

## A-37 | P2 | Articles UI | FIXED (verified 2026-10-05)
- was: reopen Articles resets wizard emptyDraft — loses unsaved work
- fix applied: isDraftDirty + confirm articlesDiscardUnsaved before reset
- verified: articles.js open(); i18n keys
- files: pk-studio/js/articles.js, i18n.js

## A-38 | P2 | Articles UI | FIXED (verified 2026-10-05)
- was: cover preview skipped media rewrite
- fix applied: mediaSrc() for art-cover-preview
- verified: mediaSrc in articles.js; fillForm uses it
- files: pk-studio/js/articles.js

## A-39 | P2 | Products publish | FIXED (verified 2026-10-05)
- was: replaceProductCards endRe fails if card has zero buy buttons
- fix applied: depth-walk fallback when no btns; keep btn regex when present
- verified: node _verify_a35_a39.mjs A-39 + A-39b
- files: admin-api/src/publish_products.js

## A-40 | P3 | Articles UI | FIXED (verified 2026-10-05)
- was: live list capped slice(0,20)
- fix applied: show all + search filter via #articles-live-search
- verified: articles.js renderLists no slice; search input bound
- files: pk-studio/js/articles.js, index.html

## A-41 | P3 | Blocks | FIXED (verified 2026-10-05)
- was: type html compiles unsanitized
- fix applied: sanitizeRichHtml on html blocks (client + Worker compile)
- verified: article_blocks.js + blocks.js case "html"
- files: admin-api/src/article_blocks.js, pk-studio/js/blocks.js

## A-42 | P3 | Home | FIXED (verified 2026-10-05)
- was: saveHome allows duplicate review URLs
- fix applied: normalizeUrl map; block save with homeDupReviewUrls
- verified: saveHome dupReviews check; i18n keys
- files: pk-studio/js/app.js, i18n.js

## A-43 | P2 | Products | FIXED (verified 2026-10-05)
- was: save allows hubs without GitHub page; fail only at publish skipped
- fix applied: POST /api/probe/hubs + saveProducts confirm if missing
- verified: handleProbeHubs getFileSha; saveProducts probe call
- files: admin-api/src/index.js, pk-studio/js/app.js, i18n.js

---

## Agent tips
- Prefer composer-2.5-fast for digs
- When fixing: update this file status в†’ FIXED; bump Studio ?v=; wrangler if API
- Do not live-publish content without owner OK
- Mirror path in repo: pk-studio/audit/FINDINGS.md

