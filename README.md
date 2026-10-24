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
