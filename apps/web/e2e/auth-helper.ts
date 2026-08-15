import { expect, Page, TestInfo } from '@playwright/test';

export async function onboardOrganization(page:Page,testInfo:TestInfo,ar:boolean){
  const email=`qa-${testInfo.project.name}-${Date.now()}-${Math.random().toString(36).slice(2)}@example.sa`;
  const password='Multazim!QA2026';
  await page.addInitScript(locale=>localStorage.setItem('multazim-locale',locale),ar?'ar':'en');
  await page.goto('/sign-up');
  await page.getByLabel(ar?'الاسم الكامل':'Full name').fill(ar?'مسؤول امتثال الجامعة':'University Compliance Owner');
  await page.getByLabel(ar?'البريد الإلكتروني للعمل':'Work email').fill(email);
  await page.locator('input[name="password"]').fill(password);
  await page.getByLabel(ar?'تأكيد كلمة المرور':'Confirm password').fill(password);
  await page.getByRole('button',{name:ar?'إنشاء الحساب':'Create account'}).click();
  await expect(page).toHaveURL(/\/organization\/new/,{timeout:15000});
  await page.goto('/profile');
  await page.locator('input[name="mobile"]').fill('+966511111111');
  await page.locator('input[name="job_title"]').fill(ar?'مسؤول الالتزام':'Compliance Owner');
  await page.getByRole('button',{name:ar?'حفظ التغييرات':'Save changes'}).click();
  await expect(page.getByRole('status')).toContainText(ar?'تم حفظ الملف الشخصي':'Profile saved');
  await page.goto('/organization/new');
  await page.getByLabel(ar?'اسم المؤسسة بالعربية *':'Organization name in Arabic *').fill('جامعة الإمام محمد بن سعود الإسلامية');
  await page.getByLabel(ar?'اسم المؤسسة بالإنجليزية *':'Organization name in English *').fill('Imam Mohammad Ibn Saud Islamic University');
  await page.getByLabel(ar?'جهة الاتصال الرئيسية':'Primary contact').fill(ar?'مكتب الالتزام':'Compliance Office');
  await page.getByRole('button',{name:ar?'التالي':'Next',exact:true}).click();
  for(let step=0;step<3;step++)await page.getByRole('button',{name:ar?'التالي':'Next',exact:true}).click();
  await page.getByRole('button',{name:ar?'إنشاء المؤسسة':'Create organization'}).click();
  await expect(page).toHaveURL(/\/workspace/);
  await expect(page.getByRole('heading',{name:ar?'جامعة الإمام محمد بن سعود الإسلامية':'Imam Mohammad Ibn Saud Islamic University'})).toBeVisible();
  return{email,password};
}
