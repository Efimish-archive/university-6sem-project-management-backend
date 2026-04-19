# Управление IT проектами - бэк-энд

```bash
cp .env.example .env
openssl rand -base64 12 >> .env
bun drizzle push
bun src/db/seed.ts
bun start
```
