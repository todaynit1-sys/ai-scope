# AI SCOPE design and advertising

The existing dashboard palette remains the source: ink #17263f, muted #647087,
blue #2563eb, surface white, paper #f5f7fa, border #e4e9f0.
Use locally hosted Pretendard Variable (SIL OFL; public/fonts license).
Main sections use 12px radius; controls and model chips use 6px.
The performance-price chart remains the first main section. Preserve source
attribution, missing-value labels, model and effort checkboxes, filters and refresh.
Default families and effort selections are defined in lib/live-selection.mjs.
No generated marketing graphic represents measured model performance.

## Advertising placements

components/ad-slot.tsx has two placements outside the chart and controls:
after-summary (after ranking cards, before the data table), and before-footer.
Neither appears in lecture capture, history or methodology.
Empty placements contain no text or label and reserve 90px desktop / 100px mobile. No ad provider, tracking code or network request is enabled.
Pass approved React ad content as children when connecting a provider.
Use a responsive unit within the reserved container; for example 728x90 on desktop
and 320x100 on mobile. Keep the label visible; avoid expanding beyond the reserved
height, autoplay, overlays, sticky banners, or units inside the graph and filters.
Do not tie ad loading to model refresh. Ad failure must leave comparisons working.

## Brand assets

Header and favicon share a simple scope/crosshair mark.
The generated v3 thumbnail is for social previews and exports, not a dashboard hero.
Layout metadata connects Open Graph and Twitter large image cards to the asset.
Previous v1/v2 assets remain saved.
