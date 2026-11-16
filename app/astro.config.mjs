// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  /* 上线前换成真实域名。这一步等价于旧站在做的 __SITE_URL__ 替换，
     域名定了之后 _build/set-domain.py 会同步提示。 */
  site: 'https://example.com',

  /* 纯静态输出：GitHub Pages 只托管静态文件，不需要 SSR 适配器 */
  output: 'static',

  /* 关掉开发工具栏。它会在页面里注入浮层，
     看真实观感时容易被误认为站点自己的 UI。 */
  devToolbar: { enabled: false },
});
