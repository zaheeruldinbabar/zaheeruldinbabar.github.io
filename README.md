# Zaheer Malik — GitHub Pages Portfolio

A responsive static portfolio for Zaheer Malik (Muhammad Zaheer Ul Din Babar), built with HTML, CSS, and vanilla JavaScript. It is designed to deploy directly to GitHub Pages without a build step.

## Repository

Create or use the public repository:

`zaheeruldinbabar.github.io`

Expected URL after enabling GitHub Pages:

`https://zaheeruldinbabar.github.io/`

## Deploy

1. Create a **public** GitHub repository named `zaheeruldinbabar.github.io`.
2. Upload all files and folders from this package to the repository root.
3. Commit the files to the `main` branch.
4. Open **Settings → Pages** and set the build/deployment source to **GitHub Actions**.
5. The workflow in `.github/workflows/deploy.yml` will publish the site after a push to `main`.
6. Wait for the workflow to finish, then visit `https://zaheeruldinbabar.github.io/`.

## Profile photo

The hero image uses the GitHub avatar URL:

`https://github.com/zaheeruldinbabar.png?size=600`

This lets the site display the profile photo already associated with your GitHub account. If your GitHub avatar changes, the portfolio image should update automatically.

## Resume

Your uploaded resume is included at `assets/zaheer-babar-resume.pdf`. The file is publicly accessible when the site is deployed. Review the PDF first and remove any personal information you do not want public.

## Before publishing

- Confirm all text and dates.
- Check the external LinkedIn URL.
- Private repositories are represented by summaries and are not linked to private source code.
- Confirm project descriptions accurately reflect completed features.
- Add screenshots from your actual projects when available.
- Check that the resume is appropriate for public access.
- Do not add API keys, secrets, customer information, or private repository code.

## Customization

- Main content: `index.html`
- Design and responsive layout: `assets/style.css`
- Mobile navigation and scroll reveal: `assets/script.js`

## Design portfolio

The design portfolio is its own small site inside this repo, with its own look and no dependency on the main page's CSS or JS.

It is organised two ways:

- **By type of work.** Every design has a type: post, logo, flyer (brochures and flyers), ui, packaging, stationery, banner or illustration. `designs.html` has one section per type, and each type has its own page (`designs/posts.html`, `logos.html`, `brochures.html`, `ui.html`, `packaging.html`, `stationery.html`, `banners.html`, `illustration.html`) listing everything of that type, grouped by brand.
- **By brand.** Every brand or collection has its own page (`designs/<slug>.html`). A brand with several kinds of work is split into sections there: logos, stationery, packaging, posts, brochures, banners, UI.

Files:

- Styles and behaviour: `assets/design.css` and `assets/design.js`.
- Images: `assets/designs/<slug>/01.webp` (full size) and `01t.webp` (thumbnail), numbered in order.
- Data: `tools/design-projects.json`. Each project has `items` (image sizes) and a matching `types` list, one type per design, in the same order.

All pages are generated. To change text, order, a design's type, or which brands appear under "Complete brand work", edit `tools/design-projects.json`, then run:

    python tools/build_design_pages.py

Add `--images` (needs Pillow) to also rebuild the moving-strip tiles and the share-preview images. Do not edit the generated HTML by hand; the next build would overwrite it.

## Speed and accessibility

- Fonts are served from `assets/fonts` (no request to Google Fonts).
- Pages load the minified stylesheets `assets/style.min.css` and `assets/design.min.css`. Edit `style.css` or `design.css`, then run `python tools/minify_css.py` (the design build runs it for you).
- Each design has up to four sizes: `NNs.webp` (small), `NNt.webp` (thumbnail), `NNm.webp` (covers only) and `NN.webp` (full). `python tools/build_design_pages.py --images` regenerates the small and cover sizes.
- Brand accent colours used for small text are lightened automatically to keep them readable (the `--ink` value next to `--accent`).
