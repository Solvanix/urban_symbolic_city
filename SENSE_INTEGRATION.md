# SENSE داخل Urban Symbolic City

تم تجهيز منصة SENSE داخل المسار `apps/sense-platform/` مع إبقاء موقع Urban Symbolic City وملفاته الأصلية في الجذر دون حذف أو استبدال.

## البنية

يظل `index.html` ومجلدات `assets/` و`interfaces/` و`projects/` و`symbolic_impact_analysis/` جزءًا من موقع Urban Symbolic City التعريفي. أما SENSE فهي تطبيق React/Express مستقل داخل `apps/sense-platform/`، وتحتفظ بملفات العميل والخادم ومخطط Drizzle واختبارات Vitest الخاصة بها.

## التشغيل المحلي

```bash
cd apps/sense-platform
pnpm install
pnpm run check
pnpm run test
pnpm run build
pnpm run dev
```

لا تُحفظ الأسرار أو ملفات `.env` أو `node_modules` أو مخرجات البناء في هذا المستودع. تحتاج SENSE إلى إعدادات بيئة التشغيل الخاصة بها عند نشرها.

## قرار النشر

يستمر موقع Urban Symbolic City كمظلة تعريفية على GitHub Pages ما لم يُعتمد قرار آخر. لا ينبغي تشغيل خادم Express من GitHub Pages؛ منصة SENSE تحتاج استضافة خادم مناسبة، لذلك يجب نشرها من المسار الفرعي بوصفها تطبيقًا مستقلًا أو ربطها بنطاق/مسار خلفي واضح.

## حالة المزايا

النسخة المنقولة تحتوي على الواجهة العامة، تكامل Shopify الأولي، السلة وCheckout الخارجي، وملف تفضيلات الوصول المحلي. لا ينبغي اعتبار البلاغات، الأدوار البلدية، الإشعارات، الخريطة، المساعد الذكي، مؤشرات الأداء، النظام المالي، أو تطبيق الهاتف مكتملة حتى تُبنى وتُختبر وتُوثق داخل SENSE.

## المسارات والروابط في نسخة الدمج

تم الحفاظ على مسارات Urban Symbolic City الأصلية في الجذر: `index.html`، `assets/`، `interfaces/`، `projects/`، `symbolic_impact_analysis/`، `README.md`، و`LICENSE`. تمت إضافة تطبيق SENSE تحت `apps/sense-platform/`، ويضم `client/` للواجهة، و`server/` للباك إند، و`drizzle/` للمخطط، و`docs/` للتوثيق، و`todo.md` لخطة التنفيذ. تمت إضافة هذا الملف في جذر المستودع لتوضيح البنية.

رابط الموقع الثابت الأصلي يبقى `https://solvanix.github.io/urban_symbolic_city/`. أما SENSE فمسار تشغيله المحلي هو `cd apps/sense-platform && pnpm run dev`، ولا ينبغي افتراض أن GitHub Pages يستطيع تشغيل خادم Express أو قاعدة بيانات SENSE.

## نتيجة الاختبار التشغيلي

تم تشغيل `pnpm install --frozen-lockfile` داخل `apps/sense-platform/`، ثم نجح `pnpm run check`، ونجحت الاختبارات: 4 ملفات اختبار، 10 اختبارات ناجحة واختبار واحد متخطى، ثم نجح `pnpm run build` للواجهة وخادم Express. ظهرت تحذيرات غير مانعة بشأن إعدادات `pnpm` القديمة وحجم حزمة الواجهة، ولا تُعد فشلًا وظيفيًا. لم تُنقل أسرار أو ملفات `.env` أو `node_modules` أو مخرجات `dist` إلى نسخة الدمج.

## حماية المستودع

هذه نسخة دمج تحضيرية. لم يتم دفعها إلى GitHub الخارجي. يجب مراجعة قائمة الملفات والاختبارات والتعارضات، ثم الحصول على تأكيد صريح قبل تنفيذ `git push`.
