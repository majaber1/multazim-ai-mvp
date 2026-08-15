import {defineConfig,devices} from '@playwright/test';

export default defineConfig({
  testDir:'./e2e',timeout:45_000,fullyParallel:false,workers:1,retries:1,reporter:[['list'],['html',{open:'never'}]],
  use:{baseURL:'http://127.0.0.1:3100',trace:'retain-on-failure',screenshot:'only-on-failure'},
  webServer:[
    {command:'python -m uvicorn app.main:app --app-dir ../api --host 127.0.0.1 --port 8100',url:'http://127.0.0.1:8100/health',reuseExistingServer:false,timeout:120_000,env:{APP_ENV:'development',ALLOWED_ORIGINS:'http://127.0.0.1:3100',SQLITE_PATH:'.data/e2e.db',UPLOAD_DIR:'.data/e2e-evidence'}},
    {command:'npm run dev -- --hostname 127.0.0.1 --port 3100',url:'http://127.0.0.1:3100',reuseExistingServer:false,timeout:120_000,env:{NEXT_PUBLIC_API_URL:'http://127.0.0.1:8100'}},
  ],
  projects:[
    {name:'ar-desktop',use:{...devices['Desktop Chrome'],locale:'ar-SA'}},
    {name:'en-desktop',use:{...devices['Desktop Chrome'],locale:'en-SA'}},
    {name:'ar-mobile',use:{...devices['Pixel 7'],locale:'ar-SA'}},
    {name:'en-mobile',use:{...devices['Pixel 7'],locale:'en-SA'}},
  ],
});
