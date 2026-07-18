# AJ Project Fleet

An interactive ocean-themed portfolio for AJ Miller T. Perez. Four animated ships represent Plugspot Finder, Pantry Guardian, Groupmate Matching, and Migration QA Estimator.

**Live site:** [aj-project-fleet.ajmillertperez562.chatgpt.site](https://aj-project-fleet.ajmillertperez562.chatgpt.site)

## Highlights

- Responsive animated ocean with selectable locations and sea conditions
- Four interactive 3D-style project ships with dedicated URL routes
- Compact, mobile-friendly project dialogs with background scroll locking
- Procedurally generated ocean ambience and interface sound effects
- Captain profile with a custom portrait and branded captain logo
- Local app-submission workflow with a Captain approval and rejection queue
- Dynamic project URLs, branded page metadata, logo, and favicon
- Accessible labels, keyboard dismissal, reduced-motion support, and semantic dialogs

## Routes

- `/` — portfolio fleet
- `/captain` — Captain profile and moderation queue
- `/add-ship` — app submission form
- `/projects/:slug` — project detail dialog

## Local development

### Requirements

- Node.js 22.13 or newer
- npm

```bash
npm ci
npm run dev
```

The development server prints the local URL when it starts.

## Quality checks

```bash
npm run lint
npm test
```

`npm test` builds the application, validates the deployable Worker artifact, and verifies the rendered metadata.

## Data and moderation

Custom ships and pending submissions are stored in the browser's `localStorage`. A submitted app remains out of the visible fleet until it is approved from the Captain panel. This client-side model is suitable for a personal portfolio demonstration; a multi-user production moderation system should use authenticated server-side storage.

## Technology

- React 19
- Next.js-compatible Vinext runtime
- TypeScript
- Vite
- Cloudflare Worker output
- CSS animations and Web Audio API

## Security

Do not commit `.env` files or API keys. Client-side applications must never embed an OpenAI API key; any future OpenAI integration should call a protected server-side endpoint.

## Author

AJ Miller T. Perez — [LinkedIn](https://www.linkedin.com/in/millertperez)
