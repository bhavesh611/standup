# Daily Standup Logger

A lightweight personal web app for managing daily design team standups — one-click Slack formatting and automatic logging to Google Docs.

**Live:** https://bhavesh611.github.io/standup

## Features

- Add / edit / delete projects and tasks inline
- Check off tasks (renders as strikethrough in Slack output)
- Drag to reorder projects
- Enter to add a new task, Backspace on empty task to delete
- **Copy for Slack** — formats and copies standup text, then logs to Google Docs
- **New Day** — clears tasks, keeps project names
- All data persisted in `localStorage`

## Setup

### 1. Google Docs Logging (optional)

1. Create a Google Doc and copy its ID from the URL (`/d/<ID>/edit`)
2. Go to [script.google.com](https://script.google.com) → New project
3. Paste the contents of `Code.gs`, set the `DOC_ID` constant at the top
4. **Deploy → New deployment → Web app**
   - Execute as: Me
   - Who has access: Anyone
5. Copy the deployed URL

### 2. Connect the app

Open the app and click **Copy for Slack** — on first use it will prompt you to paste the Apps Script URL. You can update it anytime via the ⚙ Settings icon.

## Local development

No build step needed — plain HTML. Just open `index.html` in a browser.

## Files

| File | Purpose |
|---|---|
| `index.html` | The full web app (self-contained) |
| `Code.gs` | Google Apps Script — deploy separately at script.google.com |
| `.github/workflows/deploy.yml` | GitHub Actions — deploys to `gh-pages` on push to `main` |

## GitHub Pages setup

After first push:

1. Repo **Settings → Pages**
2. Source: **Deploy from a branch** → Branch: `gh-pages` → `/ (root)`
3. Save — app will be live at `https://bhavesh611.github.io/standup`
