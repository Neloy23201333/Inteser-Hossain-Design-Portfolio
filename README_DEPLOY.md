# Inteser Hossain — Design Portfolio

Static, deployment-ready portfolio website built from the Hudson template foundation and reorganized around Inteser's actual design practice.

## Final content structure

1. Preserved landing artwork + INTE. navigation
2. Sticky seamless capability ticker
3. Designer introduction + visual capability wall
4. Project directory
5. Campaign case studies
   - HSBC Business Case Competition 2025–2026
   - BIZVERSE
   - BRAINIACS 2025
   - BEEHUNT
6. Editorial & content systems
   - BIZBUZZ
   - BIZ BEE Stormers
   - Seasonal & cultural communication
   - Cyber Vigilance / BRACU Shikari
7. Digital & experimental practice
   - Dodge web experience
   - Entertainment interface studies
   - Experimental poster studies
   - Motion studies
8. Design in practice / event context
9. Complete finished-work archive
10. About + experience + education
11. Bottom continuous ticker
12. Redesigned contact / social-links board

## Important presentation rules implemented

- Portfolio artwork is never cropped to fit a fixed box.
- Images preserve their full aspect ratio with natural height.
- Videos are also contained rather than cropped.
- Small 12px visual gaps are used between artwork.
- Artwork corners use subtle 10px rounding.
- The light middle of the site uses the supplied fixed paper-grid background.
- Lower sections return to a dark visual system so the site flows dark → light → dark.
- The archive removes one exact duplicate from the original asset set and excludes the raw generative/source image from the Cyber Vigilance folder.
- Event photographs are presented as contextual evidence rather than primary design outputs.

## Contact configuration

Edit `js/site-config.js` to change email or profile links.

Current links:
- Email: inte23201333@gmail.com
- LinkedIn: linkedin.com/in/inteser-hossain/
- GitHub: github.com/Neloy23201333
- CV: `assets/docs/Inteser-Hossain-Design-CV.pdf`

## Deployment

No build step is required. Upload the contents of this folder to any static host, for example:

- Vercel
- Netlify
- GitHub Pages
- Cloudflare Pages

Set `index.html` as the site entry point.

## Template attribution

The site retains StyleShout / Hudson attribution in the footer in accordance with the source template's attribution requirement.

## Animated paper background
The light middle of the portfolio uses a custom canvas-based wavy grid inspired by the supplied reference video. The animation code is in `js/wave-paper-grid.js`; its canvas styling is in `css/portfolio.css` under `#wave-paper-grid`.

## Autonomous white wave-grid background
The light paper section uses `js/wave-paper-grid.js`. The animation is time-driven only and does not react to page scroll. Brightness/visibility is controlled by the final `AUTONOMOUS WHITE WAVE PAPER` block in `css/portfolio.css`.


## Dark-section ambient treatment
The black sections use a lightweight pure-CSS cyan studio-light drift and soft sweep. The effect lives at the end of `css/portfolio.css` and requires no JavaScript or controls.

Landing cyan shine refinement: the landing artwork uses a softer cyan-tinted specular sweep with lower opacity, preserving the approved layout and lower-section animation.
