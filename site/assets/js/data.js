/* ==========================================================================
   TEAM JBYangC — 全站数据层 / Site data layer
   --------------------------------------------------------------------------
   所有会被替换成真实内容的东西都集中在这个文件里：
     · 素材路径（照片、徽章、印花、签名、视频）
     · 选手名单与位置
     · 赛事记录（目前为空的示例行）
     · 关注渠道
   改这一个文件，全站所有页面同步更新。

   Everything replaceable lives here: asset paths, roster, match records and
   contact details. Edit this file and every page follows.
   ========================================================================== */

(function () {
  'use strict';

  /* ------------------------------------------------------------------------
     1. 素材根目录 / Asset root
     ------------------------------------------------------------------------
     站点是完全离线自包含的：素材就在站点目录内的 assets/media 下，
     所以这里是一个纯相对路径。双击 index.html 也能正常读取，
     不需要本地服务器、不需要联网。

     素材已就位（无需再手动复制）
     ------------------------------------------------------------------------
     下列子文件夹已经在 site\assets\media\ 内，结构与本站所有路径一一对应：

       site\
       └── assets\
           └── media\
               ├── 队伍徽章\      （含 3 个队徽动画 mp4）
               ├── 选手照片\      （含 YangC / Miyabi / Remilia / shen / Aspirin / Copier 六个子文件夹）
               ├── 选手印花\      （含 YangC / Miyabi / Remilia / shen / Flash 五个子文件夹）
               ├── 选手签名\      （5 个 webp）
               ├── 队服\          （2 个 webp）
               ├── 入场动画\      （1 个 mp4）
               └── 合影\          （TEAM JBYangC核心成员.webp）

     说明：
       · 各子文件夹里的文件不要改名。
       · 不要改动素材文件夹内部的任何文件名，本站所有路径都按现有名字写好了。
       · 素材已全部转为 WebP；以后新增的图若仍是 PNG/JPG，
          在 data.js 里照实写 `.png` / `.jpg` 即可，不必先转换。
       · "合影" 这个文件夹名是我定的，里面放《TEAM JBYangC核心成员.webp》。
         如果你想用别的名字，改下面 GROUP_PHOTO 那一行即可。

     这个变量以后不用再动：素材在站点内部，整个 site 文件夹拷到任何位置、
     任何电脑上都能直接用。

     This is a purely relative path — assets live inside the site folder, so the
     site works when index.html is opened directly by double-clicking it.

     CJK 与括号字符由 encodeURI 在运行时处理，书写时不用做任何转义。
  ------------------------------------------------------------------------ */
  var ASSET_ROOT = 'assets/media';

  /** 安全拼接素材路径：处理中文、括号、空格 */
  function asset(relativePath) {
    return encodeURI(ASSET_ROOT + '/' + relativePath);
  }

  /** 团队合影：路径按需修改，改完首页与素材库会一起跟着变 */
  var GROUP_PHOTO = asset('合影/TEAM JBYangC核心成员.webp');

  /* ------------------------------------------------------------------------
     2. 徽章素材 / Crest assets
  ------------------------------------------------------------------------ */
  var CREST = {
    color:          asset('队伍徽章/队徽（彩）.webp'),
    colorOpaque:    asset('队伍徽章/队徽(不透明).webp'),
    simple:         asset('队伍徽章/队徽（简洁）.webp'),
    simpleCutout:   asset('队伍徽章/队徽（简洁抠图）.webp'),
    whiteBlack:     asset('队伍徽章/队徽（白黑）.webp'),
    whiteBlackT:    asset('队伍徽章/队徽（白黑透明背景）.webp'),
    mono:           asset('队伍徽章/队徽（黑白）.webp'),
    monoCutout:     asset('队伍徽章/队徽（黑白抠图）.webp'),
    lowOpacity:     asset('队伍徽章/队徽（低透明度）.webp'),

    anim1:          asset('队伍徽章/TEAM JBYangC队徽动画.mp4'),
    anim2:          asset('队伍徽章/TEAM JBYangC队徽动画2.mp4'),
    anim3:          asset('队伍徽章/TEAM JBYangC队徽动画3.mp4')
  };

  /* ------------------------------------------------------------------------
     3. 选手名单 / Roster
     ------------------------------------------------------------------------
     role      : 游戏内位置
     photos    : 按优先级排列的候选照片，第一张为主图（抠图优先）。
                 会逐个降级，全部失败后回退到印花，再回退到 ID 首字母。
     sticker   : 印花 / 贴纸
     signature : 签名（透明底）
     accent    : 选手卡专属渐变，用于区分与点缀
  ------------------------------------------------------------------------ */
  var ROSTER = [
    {
      id: 'YangC',
      handle: 'YangC',
      alias: { cn: '鸡仔', en: '鸡仔' },
      role: { cn: '自由人', en: 'Free Agent' },
      roleKey: 'free',
      since: '2024',
      captain: false,
      founder: true,
      tagline: { cn: '一切的起点...',
                 en: 'The starting point of everything ...' },
      accent: ['#22d3ee', '#6366f1'],
      photos: [
        asset('选手照片/YangC/YangC（抠图）.webp'),
        asset('选手照片/YangC/YangC新.webp'),
        asset('选手照片/YangC/YangC新2.webp'),
        asset('选手照片/YangC/YangC.webp'),
        asset('选手照片/YangC/YangC1.webp'),
        asset('选手照片/YangC/YangC2.webp'),
        asset('选手照片/YangC/YangC3.webp')
      ],
      sticker:   asset('选手印花/YangC/YangC印花.webp'),
      stickerT:  asset('选手印花/YangC/YangC印花（透明）.webp'),
      sticker2:  asset('选手印花/YangC/YangC贴纸2.webp'),
      signature: asset('选手签名/YangC签名（透明）.webp')
    },
    {
      id: 'Miyabi',
      handle: 'Miyabi',
      alias: { cn: '', en: '' },
      role: { cn: '突破手', en: 'Entry Fragger' },
      roleKey: 'entry',
      since: '2024',
      captain: false,
      tagline: { cn: '最会偷包之人',
                 en: 'The person who is best at secretly dismantling bombs.' },
      accent: ['#a78bfa', '#22d3ee'],
      photos: [
        asset('选手照片/Miyabi/Miyabi（抠图）.webp'),
        asset('选手照片/Miyabi/Miyabi1.webp'),
        asset('选手照片/Miyabi/Miyabi2.webp'),
        asset('选手照片/Miyabi/Miyabi3.webp'),
        asset('选手照片/Miyabi/Miyabi4.webp'),
        asset('选手照片/Miyabi/Miyabi.webp')
      ],
      sticker:   asset('选手印花/Miyabi/Miyabi印花.webp'),
      stickerT:  asset('选手印花/Miyabi/Miyabi印花（透明）.webp'),
      sticker2:  asset('选手印花/Miyabi/Miyabi印花2.webp'),
      signature: asset('选手签名/Miyabi的签名.webp')
    },
    {
      id: 'Remilia',
      handle: 'Remilia',
      alias: { cn: '土豆', en: 'Potato' },
      role: { cn: '指挥', en: 'In-Game Leader' },
      roleKey: 'igl',
      since: '2024',
      captain: true,
      tagline: { cn: '红红的豆',
                 en: 'Red Red の Potato.' },
      accent: ['#38bdf8', '#818cf8'],
      photos: [
        asset('选手照片/Remilia/Remilia（抠图）.webp'),
        asset('选手照片/Remilia/Remilia1.webp'),
        asset('选手照片/Remilia/Remilia2.webp'),
        asset('选手照片/Remilia/Remilia3.webp'),
        asset('选手照片/Remilia/Remilia.webp')
      ],
      sticker:   asset('选手印花/Remilia/Remilia印花2018波士顿.webp'),
      stickerT:  asset('选手印花/Remilia/Remilia印花2018波士顿（透明）.webp'),
      sticker2:  asset('选手印花/Remilia/Remilia印花2018伦敦.webp'),
      signature: asset('选手签名/Remilia的签名.webp')
    },
    {
      id: 'shen',
      handle: 'shen',
      alias: { cn: '小旺', en: '小旺' },
      role: { cn: '突破手', en: 'Entry Fragger' },
      roleKey: 'entry',
      since: '2025',
      captain: false,
      tagline: { cn: '对枪风格直接，失误也直接。',
                 en: 'Direct duels, direct mistakes.' },
      accent: ['#2dd4bf', '#3b82f6'],
      photos: [
        asset('选手照片/shen/shen（抠图）.webp'),
        asset('选手照片/shen/shen1.webp'),
        asset('选手照片/shen/shen2.webp'),
        asset('选手照片/shen/shen3.webp'),
        asset('选手照片/shen/shen.webp')
      ],
      sticker:   asset('选手印花/shen/shen印花.webp'),
      stickerT:  asset('选手印花/shen/shen印花（透明）.webp'),
      sticker2:  asset('选手印花/shen/shen印花2.webp'),
      signature: asset('选手签名/shen签名.webp')
    },
    {
      id: 'Aspirin',
      handle: 'Aspirin',
      alias: { cn: '', en: '' },
      role: { cn: '狙击手', en: 'AWPer' },
      roleKey: 'awp',
      since: '2024',
      captain: false,
      tagline: { cn: '架枪的人。一枪定音，也可能一枪听个响。',
                 en: 'Holds the angle. One shot to settle it — or to make everyone laugh.' },
      accent: ['#60a5fa', '#22d3ee'],
      photos: [
        asset('选手照片/Aspirin/Aspirin.webp'),
        asset('选手照片/Aspirin/Aspirin1.webp'),
        asset('选手照片/Aspirin/Aspirin2.webp'),
        asset('选手照片/Aspirin/Aspirin3.webp'),
        asset('选手照片/Aspirin/Aspirin（队服）.webp')
      ],
      jersey:    asset('选手照片/Aspirin/Aspirin（队服）.webp'),
      idPhoto:   asset('选手照片/Aspirin/Aspirin（证件照）.webp'),
      sticker:   null,
      signature: null
    },
    {
      id: 'Flash',
      handle: 'Flash',
      alias: { cn: '', en: '' },
      role: { cn: '自由人', en: 'Free Agent' },
      roleKey: 'free',
      since: '2024',
      captain: false,
      tagline: { cn: '队伍里最神秘的一个...',
                 en: 'The most mysterious one in the team ...' },
      accent: ['#f472b6', '#8b5cf6'],
      photos: [],                                  // 暂无照片，卡片自动回退到印花
      sticker:   asset('选手印花/Flash/Flash印花.webp'),
      stickerT:  asset('选手印花/Flash/Flash印花（透明）.webp'),
      sticker2026: asset('选手印花/Flash/Flash印花2018伦敦.webp'),
      sticker2:  asset('选手印花/Flash/Flash印花2018伦敦（透明）.webp'),
      signature: asset('选手签名/Flash的签名.webp')
    },
    {
      id: 'Copier',
      handle: 'Copier',
      alias: { cn: '艾老师', en: 'Teacher Ai' },
      role: { cn: '自由人', en: 'Free Agent' },
      roleKey: 'free',
      since: '2026',
      captain: false,
      tagline: { cn: '新鲜的血液',
                 en: 'Fresh blood.' },
      accent: ['#34d399', '#0ea5e9'],
      photos: [
        asset('选手照片/Copier/Copier（抠图）.webp'),
        asset('选手照片/Copier/屏幕截图 2026-09-19 195651.webp')
      ],
      sticker:   null,
      signature: null
    }
  ];

  /* ------------------------------------------------------------------------
     4. 赛事记录 / Match records
     ------------------------------------------------------------------------
     按日期倒序自动排列，'win' / 'loss' / 'friendly' 对应三种结果标签。
     要加记录，复制下面任意一项改成真实数据即可；一条都没有时，
     表格会显示 5 行灰色占位行，不会空着。
  ------------------------------------------------------------------------ */
  var MATCHES = [
    // {
    //   date: '2024-12-06',
    //   event: { cn: '队内对抗赛', en: 'Internal Scrim' },
    //   opponent: 'Mixed 5',
    //   score: '16 : 12',
    //   map: 'Mirage',
    //   result: 'win'
    // }
       {
         date: '2024-12-22',
         event: { cn: '东北Major', en: 'Dongbei Major' },
         opponent: 'Mixed 5',
         score: '0 : 2',
         map: 'Mirage',
         result: 'loss'
       }

  ];

  var MATCH_RESULTS = {
    win:      { cn: '胜', en: 'WIN' },
    loss:     { cn: '负', en: 'LOSS' },
    friendly: { cn: '友谊', en: 'FRIENDLY' }
  };

  /* ------------------------------------------------------------------------
     5. 素材库 / Media library
     ------------------------------------------------------------------------
     entryAnimations 目前只有一份「无声小」版本。
     以后补了新版本，往数组里加一项即可，页面会自动多出一个视频卡。
  ------------------------------------------------------------------------ */
  var MEDIA = {
    /* 团队合影：首页与素材库都会用到 */
    groupPhoto: {
      src: GROUP_PHOTO,
      title: { cn: '队伍合影', en: 'Team photo' },
      note: {
        cn: '核心成员合影。',
        en: 'The core members, together.'
      }
    },

    crestAnimations: [
      { src: CREST.anim1, title: { cn: '队徽动画 · 其一', en: 'Crest Animation I' },
        note: { cn: '队徽动画 · 其一', en: 'Crest Animation I' } },
      { src: CREST.anim2, title: { cn: '队徽动画 · 其二', en: 'Crest Animation II' },
        note: { cn: '队徽动画 · 其二', en: 'Crest Animation II' } },
      { src: CREST.anim3, title: { cn: '队徽动画 · 其三', en: 'Crest Animation III' },
        note: { cn: '队徽动画 · 其三', en: 'Crest Animation III' } }
    ],

    entryAnimations: [
      { src: asset('入场动画/入场动画（无声小）.mp4'),
        title: { cn: '入场动画', en: 'Entry Animation' },
        note: { cn: '入场动画', en: 'Entry Animation' } }
    ],

    crestStill: [
      { src: CREST.color,       title: { cn: '队徽 · 彩色', en: 'Crest — Colour' } },
      { src: CREST.colorOpaque, title: { cn: '队徽 · 彩色（不透明）', en: 'Crest — Colour, opaque' } },
      { src: CREST.simple,      title: { cn: '队徽 · 简洁', en: 'Crest — Simple' } },
      { src: CREST.simpleCutout,title: { cn: '队徽 · 简洁抠图', en: 'Crest — Simple, cutout' } },
      { src: CREST.whiteBlack,  title: { cn: '队徽 · 白黑', en: 'Crest — White/Black' } },
      { src: CREST.whiteBlackT, title: { cn: '队徽 · 白黑透明', en: 'Crest — White/Black, transparent' } },
      { src: CREST.mono,        title: { cn: '队徽 · 黑白', en: 'Crest — Mono' } },
      { src: CREST.monoCutout,  title: { cn: '队徽 · 黑白抠图', en: 'Crest — Mono, cutout' } },
      { src: CREST.lowOpacity,  title: { cn: '队徽 · 低透明度', en: 'Crest — Low opacity' } }
    ],

    gear: [
      { src: asset('队服/队服.webp'),          title: { cn: '队服', en: 'Team Jersey' } },
      { src: asset('队服/队服（扣背景）.webp'), title: { cn: '队服 · 扣背景', en: 'Team Jersey — cutout' } },
      { src: GROUP_PHOTO,                    title: { cn: '队伍合影', en: 'Team photo' } }
    ]
  };

  /* ------------------------------------------------------------------------
     6. 关注渠道 / Contact & channels
     ------------------------------------------------------------------------
     由「关注我们」页与页脚读取。
     有 href 的条目会变成可点击的卡片；value 与 href 都留空的条目整行隐藏。
  ------------------------------------------------------------------------ */
  var CONTACT = [
    {
      key: 'bilibili',
      icon: 'video',
      label: { cn: '哔哩哔哩', en: 'Bilibili' },
      value: { cn: 'JBYangC 官方频道', en: 'JBYangC official channel' },
      href: 'https://space.bilibili.com/3747563503094085?spm_id_from=333.1387.follow.user_card.click',
      featured: true,
      note: {
        cn: '队内对局片段、入场动画与新素材都会发在这里，关注后更新不会错过。',
        en: 'Match clips, entry animations and new assets are posted here. Follow to keep up with uploads.'
      },
      placeholder: { cn: '频道整理中', en: 'Channel coming soon' }
    },
    {
      key: 'qq',
      icon: 'chat',
      label: { cn: 'QQ 群', en: 'QQ Group' },
      value: '组建中...',                                   // ← 待填：群号
      href: '无',                                    // ← 待填：加群链接
      placeholder: { cn: '群号待公布', en: 'To be announced' }
    },
    {
      key: 'discord',
      icon: 'headset',
      label: { cn: 'Discord 服务器', en: 'Discord Server' },
      value: '组建中...',                                   // ← 待填：邀请链接
      href: 'none',
      placeholder: { cn: '邀请链接待公布', en: 'To be announced' }
    },
    {
      key: 'steam',
      icon: 'steam',
      label: { cn: 'Steam 组', en: 'Steam Group' },
      value: '组建中...',                                   // ← 待填：组主页
      href: 'none',
      placeholder: { cn: '组主页待公布', en: 'To be announced' }
    }
  ];

  /* ------------------------------------------------------------------------
     7. 站点通用信息 / Site meta
  ------------------------------------------------------------------------ */
  var SITE = {
    name: 'JBYangC',
    fullName: 'TEAM JBYangC',
    founded: '2024-11',
    game: 'Counter-Strike 2',
    location: { cn: '中国', en: 'China' },
    tagline: {
      cn: '并肩开黑的普通玩家',
      en: 'Ordinary players, in it together'
    },
    /* 浏览器标签页图标，跟随素材根目录一起走 */
    favicon: asset('队伍徽章/队徽（简洁抠图）.webp')
  };

  /* ------------------------------------------------------------------------
     8. 选手战绩 / Player performance stats
     ------------------------------------------------------------------------
     数据来自各队员的完美平台战绩卡片（TEAM JBYangC\队员数据参考代码）。
     原始数值原样保留，未做任何改动或补齐：
       · abilities 是雷达图与能力条的唯一数据来源：一条轴 = 一项能力、
         半径 = 该项百分比，所以轴名、等级、数值都能标注出来。
       · radarGrid / radar 是参考卡片里的原始多边形坐标，现已不参与渲染。
         当初改用能力数据生成，是因为原卡片网格有 8 条轴、而能力只有 6 项，
         轴与轴之间对不上任何指标，既无法标注也没法读数，且各人轴数还不一致
         （8 / 6 / 5）。这两个字段保留下来只是为了随时能换回原样式，
         确认不需要之后可以直接删掉，页面不受影响。
       · 某位队员缺少的条目（例如 Flash 没有「补枪」）不会补造。
       · power 为 null 表示参考卡片里没有提供完美战力。
     指标与能力只存键名，中英标签集中在 player.html 的 pd.metric.* / pd.ability.* 里。
  ------------------------------------------------------------------------ */
  var PLAYER_STATS = {
    YangC: {
      nickname: '东莞汤令山',
      power: 1811,
      season: { rank: 'C+', score: 1217 },
      current: { rank: 'C+', score: 1217 },
      history: { rank: 'B+', score: 1608 },
      rings: [
        { k: 'we', value: '6.8', offset: 210 },
        { k: 'rating', value: '0.88', offset: 230 }
      ],
      metrics: [
        { k: 'matches', v: '14' },
        { k: 'winrate', v: '43%' },
        { k: 'hs', v: '47.8%' },
        { k: 'adr', v: '67' },
        { k: 'kd', v: '0.71', low: true },
        { k: 'rws', v: '8.03' }
      ],
      radarGrid: [
        '150,20 234,66 268,150 234,234 150,280 66,234 32,150 66,66',
        '150,50 212,84 240,150 212,216 150,250 88,216 60,150 88,84',
        '150,80 192,104 212,150 192,196 150,220 108,196 88,150 108,104',
        '150,110 172,124 184,150 172,176 150,190 128,176 116,150 128,124'
      ],
      radar: '150,134 170,142 178,150 166,164 144,172 126,162 118,148 132,136',
      abilities: [
        { k: 'aim', grade: 'C', pct: 38 },
        { k: 'trade', grade: 'B', pct: 58 },
        { k: 'entry', grade: 'C', pct: 34 },
        { k: 'utility', grade: 'C', pct: 36 },
        { k: 'clutch', grade: 'B', pct: 56 },
        { k: 'awp', grade: 'D', pct: 20 }
      ]
    },
    Miyabi: {
      power: 2210,
      season: { rank: 'C+', score: 1420 },
      current: { rank: 'C+', score: 1420 },
      rings: [
        { k: 'we', value: '9.2', offset: 130 },
        { k: 'rating', value: '1.17', offset: 115 }
      ],
      metrics: [
        { k: 'matches', v: '23' },
        { k: 'winrate', v: '48%' },
        { k: 'hs', v: '50.6%' },
        { k: 'adr', v: '87' },
        { k: 'kd', v: '1.09' },
        { k: 'rws', v: '11.51' }
      ],
      radarGrid: [
        '150,20 234,66 268,150 234,234 150,280 66,234 32,150 66,66',
        '150,50 212,84 240,150 212,216 150,250 88,216 60,150 88,84',
        '150,80 192,104 212,150 192,196 150,220 108,196 88,150 108,104',
        '150,110 172,124 184,150 172,176 150,190 128,176 116,150 128,124'
      ],
      radar: '150,88 200,102 210,146 186,192 146,204 104,180 92,144 114,106',
      abilities: [
        { k: 'aim', grade: 'B', pct: 64 },
        { k: 'trade', grade: 'B', pct: 62 },
        { k: 'entry', grade: 'B', pct: 60 },
        { k: 'utility', grade: 'A', pct: 76 },
        { k: 'clutch', grade: 'A', pct: 74 },
        { k: 'awp', grade: 'B', pct: 58 }
      ]
    },
    Remilia: {
      power: 2346,
      season: { rank: 'B', score: 1542 },
      current: { rank: 'B', score: 1483 },
      rings: [
        { k: 'we', value: '9.6', offset: 118 },
        { k: 'rating', value: '1.18', offset: 112 }
      ],
      metrics: [
        { k: 'matches', v: '34' },
        { k: 'winrate', v: '50%' },
        { k: 'hs', v: '47.7%' },
        { k: 'adr', v: '88' },
        { k: 'kd', v: '1.22' },
        { k: 'rws', v: '10.86' }
      ],
      radarGrid: [
        '150,20 234,66 268,150 234,234 150,280 66,234 32,150 66,66',
        '150,50 212,84 240,150 212,216 150,250 88,216 60,150 88,84',
        '150,80 192,104 212,150 192,196 150,220 108,196 88,150 108,104',
        '150,110 172,124 184,150 172,176 150,190 128,176 116,150 128,124'
      ],
      radar: '150,94 194,108 206,148 182,188 144,200 106,178 94,142 118,110',
      abilities: [
        { k: 'aim', grade: 'C', pct: 48 },
        { k: 'trade', grade: 'B', pct: 63 },
        { k: 'entry', grade: 'C', pct: 46 },
        { k: 'utility', grade: 'A', pct: 78 },
        { k: 'clutch', grade: 'A', pct: 75 },
        { k: 'awp', grade: 'B', pct: 60 }
      ]
    },
    shen: {
      nickname: 'casio',
      power: 2114,
      season: { rank: 'C+', score: 1374 },
      current: { rank: 'C+', score: 1374 },
      rings: [
        { k: 'we', value: '8.5', offset: 144 },
        { k: 'rating', value: '1.10', offset: 152 }
      ],
      metrics: [
        { k: 'matches', v: '15' },
        { k: 'winrate', v: '67%' },
        { k: 'hs', v: '42.9%' },
        { k: 'adr', v: '71' },
        { k: 'kd', v: '1.08' },
        { k: 'rws', v: '9.39' }
      ],
      radarGrid: [
        '150,20 234,66 268,150 234,234 150,280 66,234 32,150 66,66',
        '150,50 212,84 240,150 212,216 150,250 88,216 60,150 88,84',
        '150,80 192,104 212,150 192,196 150,220 108,196 88,150 108,104',
        '150,110 172,124 184,150 172,176 150,190 128,176 116,150 128,124'
      ],
      radar: '150,112 182,122 192,150 174,174 142,186 114,170 102,144 124,118',
      abilities: [
        { k: 'aim', grade: 'C', pct: 44 },
        { k: 'trade', grade: 'A', pct: 76 },
        { k: 'entry', grade: 'C', pct: 42 },
        { k: 'utility', grade: 'B', pct: 62 },
        { k: 'clutch', grade: 'A', pct: 74 },
        { k: 'awp', grade: 'B', pct: 58 }
      ]
    },
    Aspirin: {
      nickname: 'nin0',
      power: 2108,
      season: { rank: 'C+', score: 1371 },
      current: { rank: 'C+', score: 1371 },
      rings: [
        { k: 'we', value: '10.2', offset: 85 },
        { k: 'rating', value: '1.29', offset: 110 }
      ],
      metrics: [
        { k: 'matches', v: '13' },
        { k: 'winrate', v: '54%' },
        { k: 'hs', v: '49.5%' },
        { k: 'adr', v: '93' },
        { k: 'kd', v: '1.33' },
        { k: 'rws', v: '11.20' }
      ],
      radarGrid: [
        '150,20 252,82 252,218 150,280 48,218 48,82',
        '150,50 226,98 226,202 150,250 74,202 74,98',
        '150,80 202,114 202,186 150,220 98,186 98,114',
        '150,110 178,130 178,170 150,190 122,170 122,130'
      ],
      radar: '150,42 234,104 210,210 148,252 72,204 64,96',
      abilities: [
        { k: 'aim', grade: 'A', pct: 82 },
        { k: 'trade', grade: 'A', pct: 78 },
        { k: 'entry', grade: 'B', pct: 62 },
        { k: 'utility', grade: 'C', pct: 42 },
        { k: 'clutch', grade: 'S', pct: 92 },
        { k: 'awp', grade: 'A', pct: 80 }
      ]
    },
    Flash: {
      nickname: 'Shining-Asuna',
      power: null,
      season: { rank: 'D+', score: 1074 },
      current: { rank: 'D+', score: 1074 },
      rings: [
        { k: 'we', value: '7.0', offset: 185 },
        { k: 'rating', value: '0.95', offset: 158 }
      ],
      metrics: [
        { k: 'matches', v: '18' },
        { k: 'winrate', v: '44%' },
        { k: 'hs', v: '33.6%' },
        { k: 'adr', v: '70' },
        { k: 'kd', v: '0.87' },
        { k: 'rws', v: '8.24' }
      ],
      radarGrid: [
        '150,20 260,108 218,246 82,246 40,108',
        '150,55 228,114 200,220 100,220 72,114',
        '150,90 196,122 176,194 124,194 104,122',
        '150,122 170,136 160,168 140,168 130,136'
      ],
      radar: '150,106 182,134 164,180 134,174 124,128',
      abilities: [
        { k: 'aim', grade: 'D', pct: 32 },
        { k: 'entry', grade: 'D', pct: 30 },
        { k: 'clutch', grade: 'C', pct: 45 },
        { k: 'utility', grade: 'B', pct: 62 },
        { k: 'awp', grade: 'C', pct: 42 }
      ]
    },
    Copier: {
      power: 1936,
      season: { rank: 'C+', score: 1336 },
      current: { rank: 'C+', score: 1284 },
      rings: [
        { k: 'we', value: '7.8', offset: 170 },
        { k: 'rating', value: '1.02', offset: 145 }
      ],
      metrics: [
        { k: 'matches', v: '15' },
        { k: 'winrate', v: '53%' },
        { k: 'hs', v: '49.5%' },
        { k: 'adr', v: '71' },
        { k: 'kd', v: '0.93' },
        { k: 'rws', v: '9.23' }
      ],
      radarGrid: [
        '150,20 252,82 252,218 150,280 48,218 48,82',
        '150,50 226,98 226,202 150,250 74,202 74,98',
        '150,80 202,114 202,186 150,220 98,186 98,114',
        '150,110 178,130 178,170 150,190 122,170 122,130'
      ],
      radar: '150,95 192,122 180,184 146,206 104,176 112,118',
      abilities: [
        { k: 'aim', grade: 'B', pct: 65 },
        { k: 'trade', grade: 'B', pct: 63 },
        { k: 'entry', grade: 'C', pct: 40 },
        { k: 'utility', grade: 'B', pct: 60 },
        { k: 'clutch', grade: 'A', pct: 78 },
        { k: 'awp', grade: 'C', pct: 38 }
      ]
    }
  };

  /* ------------------------------------------------------------------------
     导出 / Export
  ------------------------------------------------------------------------ */
  window.JB = {
    SITE: SITE,
    CREST: CREST,
    ROSTER: ROSTER,
    PLAYER_STATS: PLAYER_STATS,
    MATCHES: MATCHES,
    MATCH_RESULTS: MATCH_RESULTS,
    MEDIA: MEDIA,
    CONTACT: CONTACT,
    asset: asset
  };
})();
