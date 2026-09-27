# Brown Co Services website

The website for Brown Co Services, a family-owned terrace contractor in Henderson, Iowa. It is one
page with one job: get farmers to call.

---

## The one file you edit

Almost everything on the site — phone number, address, services, wording, photos — lives in
**one file**:

```
src/config/business.ts
```

Open it and change the words between the `'single quotes'`. Keep the quotes, and keep the comma at
the end of the line.

**Before:**

```ts
phone: '(712) 555-0100',
```

**After:**

```ts
phone: '(712) 444-1234',
```

Rules that keep the site from breaking:

- Keep the `'quotes'` around text, and the `,` comma at the end of each line.
- If your text has an apostrophe (like `we'll`), wrap it in "double quotes" instead:
  `text: "We'll come out and look.",`
- Words in `{curly braces}` fill themselves in. `{phone}` becomes your phone number and `{area}`
  becomes "within 100 miles of Henderson, Iowa". Leave them as they are.
- Lines that start with `//` are notes. The website ignores them.

If you make a mistake, the site **does not break**. The update is refused, the old site stays up,
and the error message tells you the line to fix (see "If a change is refused" below).

---

## Change the phone number

In `src/config/business.ts`, find:

```ts
phone: '(712) 555-0100',
```

Change the number and save. That one line updates the phone number **everywhere**: the top bar, the
big button at the top, the terraces section, the service area section, the footer, and the
information search engines read.

---

## Swap a photo

1. Put your photo in the `public/images/` folder, for example `hero.jpg`. Use a JPEG or PNG. The
   top photo looks best at least 1600 pixels wide; the "About" photo at least 1200.
2. In `src/config/business.ts`, find the `photos:` section and change the file name, the
   description, and who took it:

   ```ts
   hero: {
     file: 'hero.jpg',
     alt: 'New terraces on a hillside near Henderson after spring planting',
     source: 'Owner photo',
     isPlaceholder: false,
   },
   ```

   - `alt` is a short description for people who can't see the photo. Describe what's in it.
   - `source` says who owns the photo (it must be yours or properly licensed).
   - Set `isPlaceholder: false` once it's a real photo.

The website makes fast, smaller copies of the photo automatically. You don't need to resize it.

---

## Add or remove a service

In `src/config/business.ts`, find the `services:` list. Each service is one line:

```ts
{ name: 'Ponds and watering holes', description: 'Livestock ponds and watering holes, dug and built to hold water.', icon: 'pond' },
```

- **To add one:** copy a whole line, paste it right below, and change the name and description.
- **To remove one:** delete its whole line.
- `icon` must be one of: `tile`, `waterway`, `pond`, `ditch`, `clearing`, `grading`, `culvert`.
- Keep the description to one sentence.

The terrace services are in the `terraces:` section above it and work the same way.

---

## Editing on GitHub.com (no software needed)

1. Open the repository on GitHub and click `src/config/business.ts`.
2. Click the **pencil icon** (Edit this file).
3. Make your change.
4. Click **Commit changes**.

The site checks your change and republishes itself in about two minutes.

**Which changes publish straight away:** changes to `src/config/business.ts` and to photos in
`public/images/`. Any other file (layout, colors, code) must go through a pull request so the full
checks can be done first. The system blocks direct changes to other files.

### If a change is refused

Open the **Actions** tab on GitHub and click the red run. The error names the problem in plain
words, for example:

```
business.ts → contact.phone: "712-555-01" needs 10 digits, like (712) 555-0100
```

Fix that line and commit again. Until then, the previous version of the site stays online.

---

## Words we never use

The site never mentions age, retirement, or succession, and never describes the business as being
handed over. The family history is about **experience and continuity**. The checks refuse any
change that uses words like "retire", "retirement", "age", "succession", "successor", "stepping
down", "hand over", or "take over". (Words that only contain those letters, like "drainage" or
"Page County", are fine.)

---

## Deploy

**GitHub Pages (the default):**

1. In the repository, go to **Settings → Pages** and set **Source** to **GitHub Actions**.
2. Push to the `main` branch. The workflow checks everything, builds the site, and publishes it.
3. To use your own domain, add it under **Settings → Pages → Custom domain**, and set
   `websiteUrl` in `business.ts` to the same address.

**Netlify (one command):**

```sh
npm run deploy:netlify
```

**Cloudflare Pages (one command):**

```sh
npm run deploy:cloudflare
```

For Netlify or Cloudflare, you need [Node.js](https://nodejs.org) 22 or newer and to run
`npm install` once first. The first deploy asks you to log in.

**Set `websiteUrl` before deploying to Netlify or Cloudflare.** Those deploys don't get a web
address from GitHub, so both commands refuse to run while `websiteUrl` is still
`https://www.example.com`.

*Optional, stricter setup:* in **Settings → Branches**, turn on "Require a pull request before
merging" for `main`. Then even phone-number changes go through a quick pull request (the GitHub
editor offers this when you commit).

---

## Before launch checklist

Run `npm run todo` to list what's left, or look for `TODO` in `src/config/business.ts`:

- [ ] Real phone number (`contact.phone`)
- [ ] Street address and ZIP (`contact.street`, `contact.zip`)
- [ ] Owner's name, founder's name, how they're related, and the owner's pronoun (`family`)
- [ ] How many years the owner has built terraces (`family.ownerYearsLabel`)
- [ ] Exact founding year (`foundedYear`, then `foundedConfirmed: true`)
- [ ] Website address (`websiteUrl`)
- [ ] Map coordinates for Henderson (`serviceArea.centerGeo`)
- [ ] Licensed & insured? (`licensedInsured: true` shows it in the footer)
- [ ] NRCS specifications and EQIP eligibility (`terraces.nrcsConfirmed`)
- [ ] Each fact in the green strip (`trustFacts`, set `confirmed: true`)
- [ ] "We farm in this area too" is accurate? (`family.weFarmHere: true` shows it)
- [ ] Real photo for the top of the page (`photos.hero`)

---

## Checks that run on every change

1. **Build check** — the site builds, `business.ts` has no typos, the phone number is the same
   everywhere (at least four tap-to-call links), there is one main headline that mentions
   terraces, every image has a description, and the logo and icons are present.
2. **HTML validation** — the page is well-formed for browsers and screen readers.
3. **Banned words** — none of the words listed above appear anywhere on the site.

Run all three yourself with `npm test`.

---

## For developers

- `npm run dev` — local preview with live reload
- `npm run build` — builds the site into `dist/`
- `npm test` — the three checks above
- Stack: Astro (static output, no client framework), Tailwind CSS v4, self-hosted Barlow fonts.
  The only JavaScript is a small inline menu toggle; the site works fully without it.
- `src/config/derived.ts` holds computed values and the build-time checks — the owner never edits it.
- `scripts/prebuild.mjs` makes WebP photo sizes and the favicon set before every build.
- Project rules: `.specify/memory/constitution.md`. Feature spec and plan: `specs/001-terrace-marketing-site/`.
