# Visual verification notes

## Civic reports

- `/ops/reports` renders as an authenticated Arabic RTL operations queue.
- The DashboardLayout sidebar now uses `تشغيل SENSE`, `طابور البلاغات`, and `واجهة المواطن` instead of generic English labels.
- The operations queue shows loading/empty states and the status summary cards.
- `/reports` renders the citizen report form with title, description, category, priority, manual address fallback, and an optional MapView area.
- The map area is intentionally accompanied by a manual address fallback and a note that coordinates require field verification.
- Browser screenshot verification was performed after TypeScript and Vitest passed; no visual blocker was observed in the captured states.
