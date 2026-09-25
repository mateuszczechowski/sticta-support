# Sticta — website

Public pages for Sticta, the macOS app that turns your photos into sticker wallpapers.

- Home (landing + launch list): https://sticta.app/
- Support: https://sticta.app/support
- Privacy Policy: https://sticta.app/privacy

The launch list is an EmailOctopus form (ID in `home.js`, reCAPTCHA off, double opt-in on). The page posts to it directly, with no EmailOctopus or Google script.

Sticker images in `assets/home/` were cut by Sticta's own pipeline from CC0 sample photos (Unsplash via Wikimedia Commons); the map is Natural Earth.

Served by GitHub Pages under the custom domain in `CNAME`; the domain is registered at Cloudflare, with DNS there set to "DNS only".

Contact: sticta@proton.me

After editing `style.css`, `home.css` or `home.js`, run `python3 tools/stamp.py`: it stamps their links in every page with a content hash, so browsers never pair a new page with a cached old stylesheet.
