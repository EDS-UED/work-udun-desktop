type Feature = {
  title: string;
  body: string;
};

type StorySection = {
  eyebrow?: string;
  title: string;
  body?: string;
  features?: Feature[];
  tags?: string[];
  cta?: { label: string; to: string };
  tone?: 'plain' | 'soft' | 'dark';
  visual?:
    | 'chains'
    | 'security'
    | 'organization'
    | 'automation'
    | 'platform'
    | 'globe'
    | 'apiIntegration';
};

type StoryPage = {
  eyebrow?: string;
  title: string;
  subtitle: string;
  primaryCta?: { label: string; to: string };
  secondaryCta?: { label: string; to: string };
  showcaseCards?: [string, string][];
  sections: StorySection[];
  closing?: {
    title: string;
    body?: string;
    primaryCta: { label: string; to: string };
    secondaryCta?: { label: string; to: string };
  };
};

export type SiteContent = {
  home: StoryPage;
  wallet: StoryPage;
  mpc: StoryPage;
  solutions: StoryPage;
  download: StoryPage;
  developers: StoryPage;
  help: StoryPage;
};

const english: SiteContent = {
  home: {
    eyebrow: 'The enterprise wallet, upgraded',
    title: 'UDun Wallet 3.0',
    subtitle: 'Enterprise Digital Asset Management, Reimagined',
    primaryCta: { label: 'Download Now', to: '/download' },
    secondaryCta: { label: 'Visit Developer Center', to: '/developers' },
    showcaseCards: [
      ['Unified Management', 'Every chain in one unified view'],
      ['MPC Security', 'Keys held as distributed shards'],
      ['Team Workflows', 'Role-based access and approvals'],
      ['Custom Structure', 'Wallets shaped to your organization'],
      ['Automation', 'Smart operations w/ hands-free experience'],
      ['API Access', 'Programmable control via robust APIs'],
    ],
    sections: [
      {
        eyebrow: 'A new standard',
        title: 'Safer. Smarter. Faster.',
        features: [
          {
            title: 'Safer',
            body: 'Powered by MPC, keys are stored as shards in a distributed manner — security at the protocol level.',
          },
          {
            title: 'Smarter',
            body: 'A redesigned interface makes enterprise asset management more efficient than ever.',
          },
          {
            title: 'Faster',
            body: 'Built for automation and programmatic control, so operations run without manual overhead.',
          },
        ],
        cta: { label: 'Explore UDun Wallet 3.0', to: '/wallet' },
        visual: 'platform',
      },
      {
        eyebrow: 'Built around your business',
        title: 'One Infrastructure for Every Digital Asset Operation',
        body: 'From exchanges and payment platforms to card businesses and Web3 apps, UDun adapts to how your business runs.',
        tags: ['Exchanges', 'Payment Platforms', 'Card Businesses', 'Web3 Apps'],
        cta: { label: 'Learn About Our Advantages', to: '/solutions' },
        tone: 'soft',
      },
      {
        eyebrow: 'Core technology',
        title: "Security Is the Foundation We're Built On",
        body: 'With deep expertise in cryptography and secure infrastructure, UDun builds robust digital asset systems for enterprises worldwide. At its core, Multi-Party Computation (MPC) ensures the full private key never exists in one place, protecting your assets from single-point exposure and insider risk.',
        cta: { label: 'Explore MPC Technology', to: '/mpc' },
        tone: 'dark',
        visual: 'security',
      },
      {
        eyebrow: 'The Choice of Growing Businesses Worldwide',
        title: 'Built for trust at global scale.',
        features: [
          { title: '8 Years', body: 'Building secure digital asset infrastructure.' },
          { title: '50+ Countries', body: 'Supporting teams across global markets.' },
          { title: '1,000+ Enterprises', body: 'Trusted by growing digital businesses.' },
          { title: '0 Incidents', body: 'A security record built through discipline.' },
        ],
        visual: 'globe',
      },
    ],
  },
  wallet: {
    eyebrow: 'Product',
    title: 'Udun Wallet 3.0',
    subtitle:
      'A major upgrade to the enterprise wallet — rebuilt for security, scale, and the way your team operates.',
    primaryCta: { label: 'Download Now', to: '/download' },
    secondaryCta: { label: 'Visit Developer Center', to: '/developers' },
    sections: [
      {
        eyebrow: '01 / Cross-chain management',
        title: 'One Platform, Every Chain',
        features: [
          { title: '40+ networks', body: 'Coverage across the chains your business relies on.' },
          { title: '100+ tokens', body: 'Manage your digital assets from one place.' },
          { title: 'Self-listing', body: 'Add support for new assets as your business evolves.' },
        ],
        visual: 'chains',
      },
      {
        eyebrow: '02 / Security upgrade',
        title: 'Private Keys, Now Protected by MPC Technology',
        features: [
          {
            title: 'Multi-level security',
            body: 'Even if a password is lost, MPC shards remain the final safeguard.',
          },
          {
            title: 'Distributed ownership',
            body: 'Asset ownership is held jointly across multiple devices, avoiding single-point risk.',
          },
          {
            title: 'Hardware freedom',
            body: 'Phones, computers, and servers can all serve as secure storage for key shards.',
          },
        ],
        cta: { label: 'Explore MPC Technology', to: '/mpc' },
        tone: 'dark',
        visual: 'security',
      },
      {
        eyebrow: '03 / Enterprise control',
        title: 'Asset Management That Mirrors Your Organization',
        features: [
          { title: 'Structured wallets', body: 'Map wallet architecture to your account hierarchy.' },
          { title: 'Roles and permissions', body: 'Give every team member the right level of access.' },
          { title: 'Risk controls', body: 'Shape policies around your operating requirements.' },
          { title: 'Approval workflows', body: 'Move decisions through clear team approvals.' },
        ],
        visual: 'organization',
      },
      {
        eyebrow: '04 / High-volume operations',
        title: 'Automation Capabilities, Built for High-Volume Operations.',
        features: [
          { title: 'One-click consolidation', body: 'Bring distributed balances together efficiently.' },
          { title: 'Automated approvals', body: 'Keep routine operations moving within your rules.' },
          { title: 'Real-time monitoring', body: 'Stay informed with continuous alerts and visibility.' },
        ],
        tone: 'soft',
        visual: 'automation',
      },
      {
        eyebrow: '05 / Extensible infrastructure',
        title: 'Build More with UDun',
        body: 'Built for exchanges, payment platforms, card businesses, Web3 apps, and more.',
        features: [
          { title: 'Embed', body: 'Connect UDun to your existing management systems.' },
          { title: 'Control', body: 'Operate programmatically through robust API interfaces.' },
          { title: 'Create', body: 'Build new cross-platform applications on UDun.' },
        ],
        cta: { label: 'Explore Advantages', to: '/solutions' },
        visual: 'platform',
      },
    ],
    closing: {
      title: 'Bring your assets under one secure system.',
      primaryCta: { label: 'Download Now', to: '/download' },
      secondaryCta: { label: 'Visit Developer Center', to: '/developers' },
    },
  },
  mpc: {
    eyebrow: 'Multi-Party Computation',
    title: 'Udun 3.0, Now Comes with Multi-Party Computation',
    subtitle:
      'UDun Wallet 3.0 uses Multi-Party Computation (MPC) and a Trusted Execution Environment (TEE) to secure wallet operations while keeping you in full control.',
    primaryCta: { label: 'Get Started', to: '/download' },
    secondaryCta: { label: 'Talk to Sales', to: '/help-center?contact=1' },
    sections: [
      {
        eyebrow: 'Reducing operational risk',
        title: 'Protection at every point of exposure.',
        tags: ['Private Key Theft', 'Insider Threats', 'Password Leaks', 'Device Loss', 'Mismanagement'],
        tone: 'soft',
        visual: 'security',
      },
      {
        eyebrow: 'Three layers of protection',
        title: 'Multi-Layered Security',
        features: [
          {
            title: 'Private Key',
            body: "Keys are split into distributed shards from the moment they're created, removing the risk of a single point of exposure.",
          },
          {
            title: 'Ownership',
            body: 'Shards are stored across multiple devices, preventing single-point asset loss.',
          },
          {
            title: 'Governance & Access',
            body: 'Threshold signing requires multi-party authorization, and MPC shards add an extra layer of verification to everyday access.',
          },
        ],
        tone: 'dark',
        visual: 'security',
      },
      {
        eyebrow: 'Governance that evolves',
        title: 'Flexible Signing Models',
        body: 'Support 2-of-2 MPC for single-signature simplicity, or M-of-N MPC for multi-party approval as your governance grows.',
        visual: 'organization',
      },
    ],
    closing: {
      title: 'Security you can build on.',
      primaryCta: { label: 'Get Started', to: '/download' },
      secondaryCta: { label: 'Talk to Sales', to: '/help-center?contact=1' },
    },
  },
  solutions: {
    eyebrow: 'Solutions',
    title: 'Wallet Solution, Designed for Modern Businesses',
    subtitle:
      'From exchanges to payment platforms to card businesses, UDun provides the secure wallet infrastructure to launch and scale, without building the chain layer yourself.',
    primaryCta: { label: 'Contact Us', to: '/help-center?contact=1' },
    sections: [
      {
        eyebrow: 'The hard parts, handled',
        title: 'Your team focuses on growth. We handle the infrastructure.',
        features: [
          {
            title: 'Technical Complexity',
            body: 'Manage wallets and security across many networks without a dedicated crypto team.',
          },
          {
            title: 'Operational Overhead',
            body: 'Avoid the high cost of running and maintaining node infrastructure.',
          },
          {
            title: 'Scaling Pains',
            body: 'Grow transaction volume and user accounts on a system designed for it.',
          },
        ],
        tone: 'soft',
        visual: 'platform',
      },
      {
        eyebrow: 'Exchanges & Trading Platforms',
        title: 'Move from deposits to withdrawals with less friction.',
        features: [
          { title: 'Individual addresses', body: 'Independent deposit address for every end user.' },
          { title: 'Automated movement', body: 'Omnibus collection and automated withdrawals via API.' },
          { title: 'Threshold review', body: 'Passwordless auto-review within limits you set.' },
        ],
        visual: 'chains',
      },
      {
        eyebrow: 'Card Businesses & Payment Platforms',
        title: 'Payment operations designed for continuous movement.',
        features: [
          { title: 'Batch payouts', body: 'High-frequency, small-amount batch payouts.' },
          { title: 'Live callbacks', body: 'Real-time deposit and withdrawal callbacks to your system.' },
          { title: 'Unified control', body: 'Manage multiple assets and accounts in one place.' },
        ],
        tone: 'dark',
        visual: 'automation',
      },
      {
        eyebrow: 'Web3 Apps',
        title: 'Build your experience on proven wallet infrastructure.',
        features: [
          { title: 'Your application', body: "Build your own application on UDun's infrastructure." },
          { title: 'API control', body: 'Operate through robust programmatic interfaces.' },
          { title: 'One integration', body: 'Reach 40+ networks through a single integration.' },
        ],
        visual: 'platform',
      },
      {
        eyebrow: 'Less infrastructure',
        title: 'Skip the Infrastructure Burden',
        body: 'Running your own nodes across chains is expensive and slow to maintain. UDun connects you to 40+ networks out of the box, with new assets added continuously, so your team builds on the business, not the backend.',
        tone: 'soft',
        visual: 'chains',
      },
      {
        eyebrow: 'Policies built around you',
        title: 'Your Approval Structure, Mapped to Your Assets',
        body: 'Set roles, layer approvals, and let funds within your thresholds move automatically while high-value transfers wait for the right sign-off. Multiple employees, multiple permissions, assigned in a click.',
        visual: 'organization',
      },
    ],
    closing: {
      title: 'Ready to Build on UDun?',
      body: "Tell us what you're building. Our team will help you design a solution that fits.",
      primaryCta: { label: 'Contact Us', to: '/help-center?contact=1' },
    },
  },
  download: {
    title: 'Download Udun Wallet 3.0',
    subtitle:
      'Get started with secure, MPC-powered digital asset management. Available on desktop and mobile.',
    sections: [
      {
        eyebrow: 'Available everywhere',
        title: 'Or choose the platform that works for your team below.',
        features: [
          { title: 'macOS', body: 'Native desktop access for Apple silicon and Intel Macs.' },
          { title: 'Windows', body: 'Secure operations across your business workstations.' },
          { title: 'iOS', body: 'Review and approve important activity while on the move.' },
          { title: 'Android', body: 'Keep your operating team connected from anywhere.' },
        ],
        tone: 'soft',
        visual: 'platform',
      },
      {
        eyebrow: 'For engineering teams',
        title: 'Ready to integrate?',
        body: 'Connect deposits, withdrawals, and asset management to your systems through our API interfaces.',
        cta: { label: 'Visit Developer Center', to: '/developers' },
        visual: 'apiIntegration',
      },
      {
        eyebrow: 'Legacy access',
        title: 'Still using Udun Wallet 2.0?',
        body: 'Support for version 2.0 continues until a date to be announced. We recommend upgrading to 3.0 for the latest security and features.',
        cta: { label: 'Download 2.0', to: '#legacy' },
      },
    ],
  },
  developers: {
    eyebrow: 'Developers',
    title: 'Build digital asset operations into your product.',
    subtitle:
      'Connect addresses, deposits, withdrawals, callbacks, and asset management through one robust integration.',
    primaryCta: { label: 'Explore API Features', to: '#features' },
    sections: [
      {
        eyebrow: 'API capabilities',
        title: 'The building blocks your product needs.',
        tags: [
          'Generate Address',
          'Withdrawal',
          'Transaction Callback',
          'Address Validation',
          'Supported Tokens',
          'Address Lookup',
          'SDK Download',
        ],
        tone: 'dark',
        visual: 'automation',
      },
    ],
  },
  help: {
    eyebrow: 'Help Center',
    title: 'Find the answer. Keep moving.',
    subtitle: 'Guidance for setup, integration, wallet operations, and supported assets.',
    sections: [
      {
        eyebrow: 'Browse topics',
        title: 'Everything you need to get started.',
        features: [
          { title: 'Getting Started', body: 'Set up UDun Wallet and establish your team.' },
          { title: 'FAQ', body: 'Answers to common product and account questions.' },
          { title: 'Wallet Integration', body: 'Connect UDun to your existing systems.' },
          { title: 'Tokens & Codes', body: 'Review supported assets and status codes.' },
        ],
        tone: 'soft',
        visual: 'platform',
      },
    ],
  },
};

const chinese: SiteContent = {
  home: {
    eyebrow: '企业钱包，全新升级',
    title: 'UDun Wallet 3.0',
    subtitle: '企业数字资产管理，全新升级',
    primaryCta: { label: '立即下载', to: '/download' },
    secondaryCta: { label: '前往开发者中心', to: '/developers' },
    showcaseCards: [
      ['跨鏈資產集中管理', '多鏈、多帳戶資產集中管理，即時掌握全局動態'],
      ['MPC 安全', '私鑰分片分散儲存，降低單點洩露風險'],
      ['企業式資管模式', '角色權限分明，審批流程清晰'],
      ['自定義錢包架構', '自訂結構，貼合企業組織體系'],
      ['業務自動化', '自動化操作執行，減少人工負擔'],
      ['API 接入', '完善的開發者工具，實現程式化整合'],
    ],
    sections: [
      {
        eyebrow: '全新标准',
        title: '更安全，更智慧，更高效',
        features: [
          {
            title: '更安全',
            body: '采用 MPC 技术，私钥以 MPC 分片分布式存储，从底层架构就守住安全关卡。',
          },
          { title: '更智慧', body: '全新界面设计，管理企业资产更轻松、更直觉。' },
          {
            title: '更高效',
            body: '支持自动化与程序化控制，日常操作不必再大量依赖人工处理。',
          },
        ],
        cta: { label: '探索 UDun Wallet 3.0', to: '/wallet' },
        visual: 'platform',
      },
      {
        eyebrow: '围绕业务打造',
        title: '一套系统，满足企业各类数字资产运营需求',
        body: '无论是交易所、支付平台、卡商，或是 Web3 应用，UDun 都能配合你的业务模式灵活运作。',
        tags: ['交易所', '支付平台', '卡商', 'Web3 应用'],
        cta: { label: '了解产品优势', to: '/solutions' },
        tone: 'soft',
      },
      {
        eyebrow: '核心技术',
        title: '安全，是我们一切技术的出发点',
        body: '凭借在密码学与信息安全领域的深厚积累，UDun 为全球企业打造稳固的数字资产系统。其核心技术多方安全计算（MPC），确保完整私钥从不集中存在于单一位置，让资产免于单点泄露与内部作恶风险。',
        cta: { label: '了解 MPC 技术', to: '/mpc' },
        tone: 'dark',
        visual: 'security',
      },
      {
        eyebrow: '全球成长型企业的共同选择',
        title: '以全球规模，建立长久信任',
        features: [
          { title: '8 年深耕', body: '持续打造安全的数字资产基础设施。' },
          { title: '50+ 国家', body: '为全球市场的企业团队提供服务。' },
          { title: '1,000+ 企业客户', body: '获得持续成长的数字企业信赖。' },
          { title: '0 起安全事故', body: '以严谨标准守护每一次资产操作。' },
        ],
        visual: 'globe',
      },
    ],
  },
  wallet: {
    eyebrow: '产品',
    title: '优盾钱包 3.0',
    subtitle: '优盾企业钱包全新升级，从安全性、规模化到团队协作方式，全面重新打造。',
    primaryCta: { label: '立即下载', to: '/download' },
    secondaryCta: { label: '前往开发者中心', to: '/developers' },
    sections: [
      {
        eyebrow: '01 / 跨链集中管理',
        title: '一站式管理所有链上资产',
        features: [
          { title: '40+ 公链网络', body: '覆盖企业业务所需的主流公链网络。' },
          { title: '100+ 种代币', body: '在同一平台集中管理多种数字资产。' },
          { title: '自主上币', body: '配合业务发展，灵活新增资产支持。' },
        ],
        visual: 'chains',
      },
      {
        eyebrow: '02 / 安全升级',
        title: '优盾钱包 3.0，现已全面采用 MPC 技术保护私钥安全',
        features: [
          {
            title: '多重防护机制',
            body: '即使密码丢失，MPC 分片仍是最后一道安全防线。',
          },
          {
            title: '分布式所有权',
            body: '资产所有权由多台设备共同持有，避免单点风险。',
          },
          {
            title: '无需独立硬件',
            body: '手机、电脑、服务器都能作为私钥分片的安全存储设备。',
          },
        ],
        cta: { label: '了解 MPC 技术', to: '/mpc' },
        tone: 'dark',
        visual: 'security',
      },
      {
        eyebrow: '03 / 企业管控',
        title: '适合企业的资产管理平台，兼顾安全、合规与高效',
        features: [
          { title: '结构化钱包', body: '钱包架构贴合企业账户体系。' },
          { title: '角色与权限', body: '确保每位团队成员权责对应。' },
          { title: '团队审批', body: '让资产操作流程符合业务标准。' },
          { title: '自定义风控', body: '依照企业需求制定资产安全规则。' },
        ],
        visual: 'organization',
      },
      {
        eyebrow: '04 / 高频运营',
        title: '针对高频交易场景打造自动化能力',
        features: [
          { title: '一键资产归集', body: '快速集中分散于不同地址的资产。' },
          { title: '审批自动化', body: '让规则内的日常操作自动流转。' },
          { title: '实时监控与提醒', body: '持续掌握重要动态与异常活动。' },
        ],
        tone: 'soft',
        visual: 'automation',
      },
      {
        eyebrow: '05 / 可扩展基础设施',
        title: '用 UDun，打造更多可能',
        body: '适用于交易所、支付平台、卡商、Web3 应用等多种场景。',
        features: [
          { title: '嵌入', body: '接入企业现有的管理系统。' },
          { title: '控制', body: '通过完善的 API 接口实现程序化操作。' },
          { title: '构建', body: '跨平台开发全新应用。' },
        ],
        cta: { label: '了解产品优势', to: '/solutions' },
        visual: 'platform',
      },
    ],
    closing: {
      title: '让你的资产，归于一套安全系统。',
      primaryCta: { label: '立即下载', to: '/download' },
      secondaryCta: { label: '前往开发者中心', to: '/developers' },
    },
  },
  mpc: {
    eyebrow: '多方安全计算',
    title: 'Udun 3.0，全面导入多方安全计算技术',
    subtitle:
      'UDun Wallet 3.0 采用多方安全计算（MPC）与可信赖执行环境（TEE）技术，在确保钱包安全运行的同时，让你完全掌控资产。',
    primaryCta: { label: '立即开始', to: '/download' },
    secondaryCta: { label: '联系商务', to: '/help-center?contact=1' },
    sections: [
      {
        eyebrow: '降低运营风险',
        title: '在每一个风险环节提供保护',
        tags: ['私钥窃取', '内部威胁', '密码泄露', '设备丢失', '管理疏失'],
        tone: 'soft',
        visual: 'security',
      },
      {
        eyebrow: '三层安全防御',
        title: '多层防御体系',
        features: [
          {
            title: '私钥层',
            body: '私钥从产生的那一刻起，就以分布式分片存在，彻底避免完整私钥外泄的风险。',
          },
          {
            title: '所有权层',
            body: '分片分散存储于多台设备，避免因单一设备出问题而造成资产损失。',
          },
          {
            title: '治理与操作层',
            body: '交易须经多方授权才能完成签署，日常操作也因为 MPC 分片多一层身份验证，更加安全。',
          },
        ],
        tone: 'dark',
        visual: 'security',
      },
      {
        eyebrow: '随治理需求扩展',
        title: '灵活的签名模式',
        body: '支持 2-of-2 MPC 单签模式，满足日常使用；也支持 M-of-N MPC 多签模式，因应企业治理需求扩充。',
        visual: 'organization',
      },
    ],
    closing: {
      title: '稳固的安全，让你安心构建业务。',
      primaryCta: { label: '立即开始', to: '/download' },
      secondaryCta: { label: '联系商务', to: '/help-center?contact=1' },
    },
  },
  solutions: {
    eyebrow: '产品优势',
    title: '为新世代企业打造',
    subtitle:
      '从交易所、支付平台到卡商，UDun 提供安全的钱包系统，让你快速上线、规模化发展，不必自行架设底层公链环境。',
    primaryCta: { label: '联系我们', to: '/help-center?contact=1' },
    sections: [
      {
        eyebrow: '直面客户挑战',
        title: '专注业务成长，底层基础设施交给我们',
        features: [
          {
            title: '技术复杂度',
            body: '没有专职的加密团队，却要横跨多条网络管理钱包与资产安全。',
          },
          { title: '运维成本', body: '自建并维护节点系统，成本高昂。' },
          { title: '扩展瓶颈', body: '交易量与用户数持续成长，系统却跟不上脚步。' },
        ],
        tone: 'soft',
        visual: 'platform',
      },
      {
        eyebrow: '交易所与交易平台',
        title: '让充值、归集与提现顺畅衔接',
        features: [
          { title: '独立地址', body: '为每位终端用户配置独立充值地址。' },
          { title: '自动流转', body: '通过 API 自动完成资金归集与提现。' },
          { title: '额度审核', body: '于设定额度内免密自动审核，无需人工处理。' },
        ],
        visual: 'chains',
      },
      {
        eyebrow: '卡商与支付平台',
        title: '为持续流转的支付业务而设计',
        features: [
          { title: '批量放款', body: '支持高频、小额的批量放款。' },
          { title: '实时回调', body: '充值与提现状态实时回调至你的系统。' },
          { title: '统一管理', body: '跨多资产、多账户集中管理。' },
        ],
        tone: 'dark',
        visual: 'automation',
      },
      {
        eyebrow: 'Web3 应用',
        title: '在成熟的钱包基础设施上打造产品',
        features: [
          { title: '你的应用', body: '在 UDun 的系统基础上打造你自己的应用。' },
          { title: 'API 控制', body: '通过完善的 API 接口实现程序化操作。' },
          { title: '一次对接', body: '一次对接即可触及 40+ 网络。' },
        ],
        visual: 'platform',
      },
      {
        eyebrow: '减少基础设施负担',
        title: '省去底层运维的负担',
        body: '若自行跨链架设节点，成本高昂且难以维护。UDun 让你开箱即可对接 40+ 公链网络，并持续新增资产，团队得以专注于业务本身，而非底层运维。',
        tone: 'soft',
        visual: 'chains',
      },
      {
        eyebrow: '依照企业制度执行',
        title: '让审批结构，对应到资产操作',
        body: '设定角色与分层审批，让额度内的资金自动流转，大额交易则保留人工签核。多名员工、多种权限，一键完成指派。',
        visual: 'organization',
      },
    ],
    closing: {
      title: '准备好要在 UDun 上打造你的业务了吗？',
      body: '告诉我们你正在打造什么，我们的团队将协助你规划合适的方案。',
      primaryCta: { label: '联系我们', to: '/help-center?contact=1' },
    },
  },
  download: {
    title: '下载优盾钱包 3.0',
    subtitle: '立即体验 MPC 技术守护的安全资产管理，支持桌面与移动设备。',
    sections: [
      {
        eyebrow: '支持多端使用',
        title: '或从下方选择适合你们团队的平台。',
        features: [
          { title: 'macOS', body: '支持 Apple 芯片与 Intel Mac 的桌面体验。' },
          { title: 'Windows', body: '在企业工作设备上安全管理资产。' },
          { title: 'iOS', body: '随时查看并审批重要资产活动。' },
          { title: 'Android', body: '让运营团队不受地点限制，保持连接。' },
        ],
        tone: 'soft',
        visual: 'platform',
      },
      {
        eyebrow: '面向开发团队',
        title: '准备好对接了吗？',
        body: '通过 API 接口，将充值、提现与资产管理接入你的系统。',
        cta: { label: '前往开发者中心', to: '/developers' },
        visual: 'apiIntegration',
      },
      {
        eyebrow: '旧版入口',
        title: '仍在使用优盾钱包 2.0？',
        body: '2.0 版本的服务支持将持续至〔日期待定〕。建议升级至 3.0，体验最新的安全技术与功能。',
        cta: { label: '下载 2.0', to: '#legacy' },
      },
    ],
  },
  developers: {
    eyebrow: '开发者中心',
    title: '将数字资产运营能力接入你的产品',
    subtitle: '通过一次稳定对接，连接地址、充值、提现、交易回调与资产管理能力。',
    primaryCta: { label: '探索 API 功能', to: '#features' },
    sections: [
      {
        eyebrow: 'API 能力',
        title: '构建产品所需的核心功能',
        tags: [
          '生成地址',
          '提币',
          '交易回调',
          '校验地址合法性',
          '取得支持币种',
          '校验地址是否存在',
          'SDK 下载',
        ],
        tone: 'dark',
        visual: 'automation',
      },
    ],
  },
  help: {
    eyebrow: '帮助中心',
    title: '找到答案，继续前进',
    subtitle: '提供系统设置、产品对接、钱包操作与支持资产等相关指引。',
    sections: [
      {
        eyebrow: '浏览主题',
        title: '从这里开始使用 UDun',
        features: [
          { title: '新手上路', body: '完成优盾钱包设置并建立企业团队。' },
          { title: '常见问题', body: '查看产品与账户相关问题的解答。' },
          { title: '钱包对接', body: '将 UDun 连接至企业现有系统。' },
          { title: '币种与状态码', body: '查询支持资产与相关状态码。' },
        ],
        tone: 'soft',
        visual: 'platform',
      },
    ],
  },
};

export const siteContent: Record<'en-US' | 'zh-CN', SiteContent> = {
  'en-US': english,
  'zh-CN': chinese,
};
