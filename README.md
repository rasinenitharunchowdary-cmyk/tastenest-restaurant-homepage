# TasteNest Restaurant Homepage

A responsive, motion-rich React implementation of the complete restaurant Figma collection: **Purchase, Home-1 through Home-10, and Home Coffee**. Home-4 is the detailed flagship reconstruction; every remaining screen is available as its own direct route and design direction.

## Live deployment

[View TasteNest on Netlify](https://tastenest-home4-restaurant.netlify.app/)

## Highlights

- Responsive layouts for desktop, tablet, and mobile
- Direct routes for `/purchase`, `/home-1` … `/home-10`, and `/home-coffee`, plus a persistent in-page Figma screen picker on every route
- The complete Home-4 ecommerce sequence: hero, food categories, dual promotions, sponsor rail, offer banner, product grid, combo offer, services, about, flash deals, testimonial, delivery, gallery, and footer
- GSAP entrance reveals, hover depth, hero parallax, and a polished loader
- Lenis smooth scrolling
- Vanta.js + Three.js atmospheric texture in the charcoal deal section, loaded as a split bundle
- Working mobile menu, basket drawer, hero offer selector, food category controls, wish-list controls, order feedback, and newsletter feedback
- Local Barlow Condensed and Manrope font files
- Downloaded and compressed WebP food photography
- Reduced-motion support and accessible labels/landmarks

## Run locally

```bash
npm install
npm run dev
```

## Production checks

```bash
npm run check
npm run preview
```

The Netlify build configuration is included in `netlify.toml`.

## Design reference

[Restaurant Website templates Figma file](https://www.figma.com/design/HItEF1ylHMaqmnGYVZM2kp/Resturent-Website-templates--figmamarket.com-?node-id=0-1&p=f)

## Image licensing

Food photography is downloaded from Unsplash and optimized locally. See [ASSET_CREDITS.md](./ASSET_CREDITS.md).
