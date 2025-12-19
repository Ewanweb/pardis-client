# راهنمای Deployment

## نحوه تنظیم CI/CD Pipeline

### 1. GitHub Secrets مورد نیاز

برای فعال‌سازی deployment، باید secrets زیر را در GitHub repository تنظیم کنید:

#### برای SSH Deployment:

```
DEPLOY_KEY: کلید SSH خصوصی
PROD_USER: نام کاربری سرور
PROD_HOST: آدرس IP یا دامنه سرور
STAGING_USER: نام کاربری سرور staging
STAGING_HOST: آدرس سرور staging
```

#### برای AWS S3 + CloudFront:

```
AWS_ACCESS_KEY_ID: کلید دسترسی AWS
AWS_SECRET_ACCESS_KEY: کلید مخفی AWS
AWS_REGION: منطقه AWS (مثل us-east-1)
S3_BUCKET: نام bucket S3
CLOUDFRONT_DISTRIBUTION_ID: شناسه CloudFront
```

#### برای Netlify:

```
NETLIFY_SITE_ID: شناسه سایت Netlify
NETLIFY_AUTH_TOKEN: توکن احراز هویت Netlify
```

#### برای Vercel:

```
VERCEL_TOKEN: توکن Vercel
```

#### برای اعلان‌ها:

```
SLACK_WEBHOOK_URL: آدرس webhook Slack
SNYK_TOKEN: توکن Snyk برای اسکن امنیتی
```

### 2. فعال‌سازی Deployment

1. **SSH Deployment**: خطوط مربوط به SSH را uncomment کنید
2. **AWS S3**: خطوط مربوط به AWS را uncomment کنید
3. **Netlify**: خطوط مربوط به Netlify را uncomment کنید
4. **Vercel**: خطوط مربوط به Vercel را uncomment کنید
5. **GitHub Pages**: خطوط مربوط به GitHub Pages را uncomment کنید

### 3. مراحل Pipeline

#### Quality Check:

- ESLint
- TypeScript type checking
- Unit tests (اگر موجود باشد)

#### Build:

- Build برای development و production
- ایجاد artifacts
- تولید اطلاعات build

#### Security:

- npm audit
- Snyk security scan

#### Deploy Staging:

- فقط برای branch `develop`
- Deploy به محیط staging
- Health check

#### Deploy Production:

- فقط برای branch `main`
- Deploy به محیط production
- Health check
- اعلان موفقیت

#### Release:

- ایجاد release جدید
- تولید changelog
- Tag گذاری

### 4. نحوه استفاده

#### برای Development:

```bash
git checkout develop
git add .
git commit -m "feature: add new functionality"
git push origin develop
```

#### برای Production:

```bash
git checkout main
git merge develop
git push origin main
```

### 5. مثال‌های Deployment

#### SSH Deployment:

```yaml
- name: Deploy via SSH
  run: |
    echo "${{ secrets.DEPLOY_KEY }}" > deploy_key
    chmod 600 deploy_key
    ssh -i deploy_key -o StrictHostKeyChecking=no ${{ secrets.PROD_USER }}@${{ secrets.PROD_HOST }} "rm -rf /var/www/html/*"
    scp -i deploy_key -r dist/* ${{ secrets.PROD_USER }}@${{ secrets.PROD_HOST }}:/var/www/html/
```

#### AWS S3 Deployment:

```yaml
- name: Deploy to AWS S3
  run: |
    aws s3 sync dist/ s3://${{ secrets.S3_BUCKET }} --delete
    aws cloudfront create-invalidation --distribution-id ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }} --paths "/*"
```

#### Netlify Deployment:

```yaml
- name: Deploy to Netlify
  run: |
    npm install -g netlify-cli
    netlify deploy --dir=dist --site=${{ secrets.NETLIFY_SITE_ID }} --auth=${{ secrets.NETLIFY_AUTH_TOKEN }} --prod
```

### 6. نکات مهم

1. **Environment Variables**: متغیرهای محیطی در GitHub Secrets تنظیم کنید
2. **Branch Protection**: برای branch `main` protection rules تنظیم کنید
3. **Review Required**: برای production deployment، review اجباری کنید
4. **Health Checks**: همیشه health check اضافه کنید
5. **Rollback Plan**: برنامه rollback داشته باشید

### 7. مانیتورینگ

- GitHub Actions logs
- Deployment notifications
- Health check results
- Performance monitoring

### 8. عیب‌یابی

#### مشکلات رایج:

1. **npm ci fails**: package-lock.json را بررسی کنید
2. **Build fails**: environment variables را چک کنید
3. **Deploy fails**: credentials و permissions را بررسی کنید
4. **Health check fails**: URL و endpoint را چک کنید
