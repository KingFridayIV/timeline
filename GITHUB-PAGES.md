# Publish Timeline on GitHub and open it on your iPhone

GitHub Pages is a good fit for this game: it serves the existing HTML, CSS, and JavaScript without a server. GitHub also keeps an update history, making it a useful home while we continue development. The included workflow tests the game before publishing each update.

## First publication — no command line required

1. Download `timeline-github.zip` and extract it on your computer. Keep the extracted folder as your working copy.
2. Sign in at [GitHub](https://github.com/new) and create a repository named `timeline`. Choose **Public** for GitHub Free. Add a README to initialize the repository on the default `main` branch. Do not add a license unless you have chosen one.
3. In the repository, open **Settings → Pages**. Under **Build and deployment**, set **Source** to **GitHub Actions**. You do not need to select a starter workflow; this project includes one.
4. Return to **Code → Add file → Upload files**. Drag the extracted folder's **contents** into the upload area, including `dist`, `tests`, `.github`, `package.json`, `server.mjs`, and the guides. Upload the files and folders, not the ZIP or its outer container folder. Commit to `main`. The provided README replaces the initial README.
5. Check that `.github/workflows/pages.yml` exists in the repository. If your upload skipped the dot-folder, use **Add file → Create new file**, enter `.github/workflows/pages.yml`, and paste the matching local file's contents. Commit it.
6. Open **Actions → Publish Timeline**. When the run succeeds, open **Settings → Pages → Visit site**. It will normally be `https://YOUR-USERNAME.github.io/timeline/`.
7. Send that published link to your iPhone and open it in Safari. You can also use Safari's Share menu to add it to your Home Screen as a shortcut. The hosted game needs an internet connection; the shortcut is not a separate offline app.

GitHub documents the [publishing-source setting](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site) and [Pages workflow](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages). The workflow uploads only `dist/`; source tests and project guides are kept out of the website output.

## Subsequent updates

Update the same repository on `main`; keep the directory structure intact. Every push or browser upload triggers tests and a fresh deployment at the same URL. Refresh Safari after the successful deployment. Your phone's progress remains unless browser data, the site address, or the game's storage version changes.

For frequent development, [GitHub Desktop](https://desktop.github.com/) is more convenient than repeated browser uploads. Clone the repository once, work inside that checkout, then commit changes and push to `main`. The live deployment follows automatically. Tell the next development task to use that checkout so edits stay in one working copy.

## If publication fails

- No workflow appears: check that the `.github/workflows/pages.yml` file was uploaded at the repository root.
- A Pages configuration error: set Settings → Pages → Source to GitHub Actions, then rerun the failed workflow.
- No automatic run: the workflow watches `main`. If your default branch has a different name, rename it to `main` or update the workflow's `branches` setting.
- A blank page or missing files: confirm `dist/index.html`, `app.js`, `engine.js`, `events.js`, `labels.js`, and `style.css` are all present. The workflow must publish `dist`, not the entire repository.
- Tests fail: the deployment will stop and the previously published version remains live. Fix the failing test or game change before publishing again.

## Is there a reason to use another host?

For a public prototype, no compelling reason: GitHub Pages matches this version well. GitHub Free supports Pages from public repositories; publishing from a private repository requires an eligible paid plan. A private repository alone does not make a normal Pages site private. See [GitHub Pages availability](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages).

If you later want invitation-only previews, accounts, synchronized scores, or protected leaderboards, those requirements call for hosting and/or a backend beyond this static setup. GitHub can still hold the source code.

The `127.0.0.1` preview address works only on the computer running it. Use the published HTTPS link on your iPhone. Laptop and phone statistics are separate because they use their own browser storage.

No GitHub repository has been created and no files have been uploaded by this task. The package and workflow are ready for the steps above.
