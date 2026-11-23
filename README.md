# SRDA Associates for Netlify

This project contains the website, the About page and office gallery, and the password-protected photo manager. It uses Netlify Functions and Netlify Blobs. The inquiry form opens a prefilled email draft addressed to srdaassociates@gmail.com.

## Deploy from GitHub

1. Extract the ZIP. Open the `srda-associates-netlify` folder.
2. Create a GitHub repository and upload the **contents** of that folder so `netlify.toml`, `package.json`, `web/`, and `netlify/` are at the repository root.
3. In Netlify, choose **Add new project → Import an existing project → GitHub** and select your repository. Keep the base directory blank. The project config sets the build command to `npm run check`, the publish directory to `web`, and the functions directory to `netlify/functions`.
4. In the Netlify project's environment variables, add `GALLERY_ADMIN_PASSWORD` as a secret with a unique password of at least 24 characters. Use the Functions scope if your plan offers scopes, and make the value available to Production. Deploy or redeploy after setting it.
5. Open the generated `.netlify.app` URL. Test the About link, phone and WhatsApp buttons, and the email draft.
6. Open `/manage-photos/` on your new site. When the browser asks for credentials, enter **owner** as the username and your `GALLERY_ADMIN_PASSWORD` as the password. Upload a JPG, PNG, or WebP up to 4 MB. The caption is optional. Confirm that the photo appears under **About**.

Import the repository to deploy the complete project. Uploading only the `web` folder through Netlify Drop leaves out the photo-management functions. Photo uploads on the earlier demo use separate storage. Re-upload any photos you want on the Netlify site.

## Try it locally

Install Node.js 22 or later. From the extracted project folder, run `npm ci`, then `npm run check`. For a local Netlify preview, set `GALLERY_ADMIN_PASSWORD` in a local `.env` file, run `npx netlify-cli dev`, and open the URL printed in the terminal. Keep your `.env` file and gallery password out of GitHub.

## Main files

| Path | Purpose |
| --- | --- |
| `web/index.html` | Homepage, service list, contact details, and inquiry form |
| `web/about.html` | Separate About page and office gallery |
| `web/style.css` | Layout, responsive styles, and colours |
| `web/site.js` | Prefilled email draft for inquiries |
| `web/gallery.js` | Photo display, uploads, and removals |
| `netlify/functions/gallery/` | Owner-only photo manager and image storage |
| `netlify.toml` | Netlify build settings, page routing, and security headers |

This package keeps the demo's `noindex` setting. When you are ready for Google indexing, remove that setting from the public page headers in `netlify.toml` and redeploy the final site. Keep the owner-only photo manager protected.

[GitHub and Netlify deployment guide](https://docs.netlify.com/deploy/create-deploys/)
