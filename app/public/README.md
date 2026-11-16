# public 目录

Astro 会把 `public/` 里的内容原样复制到 `dist/`，不做处理。

## 还需要把素材复制进来

现有素材在 `..\site\assets\`（84 个文件、约 8 MB），需要原样复制到本目录，
让 URL 路径保持 `/assets/media/...` 不变：

```powershell
robocopy ..\site\assets .\assets /E
```

复制完成后目录结构应为：

```
app\public\assets\
├── css\style.css
├── js\data.js
├── js\main.js
└── media\
    ├── 队伍徽章\
    ├── 选手照片\
    ├── 选手印花\
    ├── 选手签名\
    ├── 队服\
    ├── 入场动画\
    └── 合影\
```

> 注意：`data.js` 现在会被 `public\assets\js\` 原样暴露出去。
> 迁移到 Astro 后应该改成 TypeScript 模块交给构建器处理，
> 而不是继续放在 public 里当静态文件。
