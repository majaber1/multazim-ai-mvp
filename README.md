# ملتزم AI — Multazim AI

منصة SaaS عربية أولية لمساعدة المنشآت الصغيرة والمتوسطة في السعودية على تقييم جاهزية الامتثال، فحص المواقع، وإنشاء مسودات السياسات.

## ما تم بناؤه

- Landing page عربية احترافية.
- لوحة تحكم بدرجة امتثال، مخاطر، ومهام.
- استبيان تقييم تفاعلي مع احتساب النتيجة.
- فحص موقع MVP تجريبي.
- مركز مستندات ومسودات سياسات.
- Backend مبني بـ FastAPI.
- PostgreSQL + pgvector وRedis عبر Docker Compose.
- GitHub Actions لفحص البناء.
- تصميم Responsive RTL.

## التشغيل السريع

### الواجهة فقط

```bash
cd apps/web
npm install
npm run dev
```

افتح: http://localhost:3000

### النظام كاملًا عبر Docker

```bash
docker compose up --build
```

- Web: http://localhost:3000
- API docs: http://localhost:8000/docs
- Health: http://localhost:8000/health

## هيكل المشروع

```text
apps/web   Next.js + Tailwind
apps/api   FastAPI
infra      ملفات البنية المستقبلية
```

## المرحلة التالية

1. ربط Better Auth أو Auth.js.
2. إضافة Prisma أو SQLAlchemy migrations.
3. ربط Tap للاشتراكات.
4. ربط Resend للتنبيهات.
5. إضافة RAG للمصادر الرسمية مع pgvector.
6. إضافة OCR للفواتير والمستندات.
7. إضافة PostHog وSentry.

> تنبيه: مخرجات المنصة مسودات إرشادية وليست استشارة قانونية أو ضريبية.
