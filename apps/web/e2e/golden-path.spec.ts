import {expect,test} from '@playwright/test';

test('bilingual compliance golden path',async({page})=>{
  const ar=test.info().project.name.startsWith('ar-');
  await page.addInitScript(locale=>localStorage.setItem('multazim-locale',locale),ar?'ar':'en');
  await page.goto('/evidence');
  await expect(page.locator('html')).toHaveAttribute('dir',ar?'rtl':'ltr');
  await page.getByRole('button',{name:ar?'رفع دليل':'Upload evidence'}).click();
  await page.getByLabel(ar?'عنوان الدليل':'Evidence title').fill(`E2E evidence ${test.info().project.name}`);
  await page.getByLabel(ar?'الملف':'File').setInputFiles({name:'evidence.pdf',mimeType:'application/pdf',buffer:Buffer.from('%PDF-1.4\nE2E evidence')});
  await page.getByRole('button',{name:ar?'رفع وحفظ الدليل':'Upload and save evidence'}).click();
  await expect(page.getByRole('status')).toContainText(ar?'تم رفع الدليل':'Evidence uploaded');

  await page.goto('/assessment');
  await expect(page.locator('html')).toHaveAttribute('lang',ar?'ar':'en');
  const start=page.getByRole('button',{name:ar?'بدء التقييم':'Start assessment'});
  if(await start.isVisible().catch(()=>false))await start.click();
  const status=page.getByLabel(ar?'حالة الضابط':'Control status');
  await status.selectOption('non_compliant');
  await page.getByLabel(ar?'المبرر':'Rationale').fill(ar?'لا توجد مراجعة موثقة للحسابات ذات الصلاحيات العالية.':'No documented privileged-account review is available.');
  await page.getByLabel(ar?'ملاحظات المقيّم':'Assessor comments').fill(ar?'يتطلب إجراءً تصحيحيًا.':'Corrective action is required.');
  await page.getByLabel(ar?'إعادة استخدام دليل':'Reuse evidence').selectOption({index:1});
  await page.getByRole('button',{name:ar?'حفظ التقدم':'Save progress'}).click();
  await expect(page.getByText(ar?'اكتمال التقييم':'Assessment completeness')).toBeVisible();
  await page.getByRole('button',{name:ar?'إنشاء فجوة ومعالجة':'Create gap and remediation'}).click();
  await expect(page.getByRole('status')).toContainText(ar?'تم إنشاء الفجوة':'Gap and remediation');
  const download=page.waitForEvent('download');
  await page.getByRole('button',{name:ar?'إنشاء التقرير':'Generate report'}).click();
  expect((await download).suggestedFilename()).toContain(`-${ar?'ar':'en'}.pdf`);

  await page.goto('/dashboard');
  await expect(page.locator('body')).not.toBeEmpty();
  await expect(page.locator('[data-nextjs-dialog]')).toHaveCount(0);
  await page.goto('/audits');
  await expect(page.locator('body')).toContainText(ar?'غرفة التدقيق':'Audit Room');
});
