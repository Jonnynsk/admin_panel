# Admin Panel

SPA-админка: React 17 + Redux/Saga + `connected-react-router` + Ant Design 4 + Vite.

API: `https://rest-test.machineheads.ru`

## Live

https://jonnynsk.github.io/admin_panel/

## Запуск локально

```bash
cp .env.example .env
npm install
npm run dev
```

## GitHub Pages

Деплой через Actions (`.github/workflows/deploy-pages.yml`) на push в `master`.

В Settings → Pages → **Source** выбери **GitHub Actions** (не «Deploy from a branch»).
