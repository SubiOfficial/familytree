# familytree

React (Vite) version of the Family Tree single-person card and partner card.

## Quick view (no install)

Open `dist/index.html` in your browser (double-click it). It is a prebuilt copy of the app.

> Note: the `index.html` in the project root is for Vite only. It shows a blank page if opened directly; use `npm run dev` for that one.

## Run in development

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually http://localhost:5173).

## Structure

```
src/
  App.jsx                 canvas + state for the two default nodes
  data.js                 default nodes (id 5 "Unknown", id 1 "Grandpa & Grandma")
  styles.css              all card CSS, copied from the source
  components/
    Icons.jsx             shared #cam / #hrt SVG symbols
    Person.jsx            React version of personHTML()
    GenderBadge.jsx
    SingleCard.jsx        single-person node
    PartnerCard.jsx       partner node (root badge, heart, branch toggle)
```

## Interactions

- Click a photo circle to pick an image.
- Double-click a name to edit it; Enter or click away to save.
- + Child increases the child count; Collapse/Expand toggles the branch label.
- + Partner turns a single card into a partner card.
- Set as Root Node moves the root highlight to that card.
- × deletes the card.
