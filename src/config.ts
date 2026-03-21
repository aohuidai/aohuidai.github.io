export const SITE = {
  website: "https://daihuiao.github.io",
  author: "Dai Huiao",
  profile: "https://github.com/daihuiao",
  avatar: "/avatar-daihuiao.png",
  desc: "记录开发、工具、自动化和日常学习中的想法与实践。",
  title: "Dai Huiao 的博客",
  ogImage: "",
  lightAndDarkMode: true,
  postPerIndex: 4,
  postPerPage: 4,
  scheduledPostMargin: 15 * 60 * 1000, // 15 minutes
  showArchives: true,
  showBackButton: true, // show back button in post detail
  editPost: {
    enabled: true,
    text: "编辑此页",
    url: "https://github.com/daihuiao/daihuiao.github.io/edit/main/",
  },
  dynamicOgImage: true,
  dir: "ltr", // "rtl" | "auto"
  lang: "zh-CN", // html lang code. Set this empty and default will be "en"
  timezone: "Asia/Shanghai", // Default global timezone (IANA format) https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
} as const;
