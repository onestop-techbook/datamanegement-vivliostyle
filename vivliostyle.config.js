import { VFM } from "@vivliostyle/vfm";

const isPrint = process.argv.includes("print.pdf");

const def = {
  title: "vivliostyle-sample", // populated into `publication.json`, default to `title` of the first entry or `name` in `package.json`.
  author: "oyakata <oyakata2438@gmail.com>", // default to `author` in `package.json` or undefined.
  language: "ja", // default to undefined.
  size: "JIS-B5", // JIS-B5: 教科書サイズ、A5: 最近流行りの小さいサイズの技術書
  theme: [
    "./fonts",
    "./theme-nice-techbook2",
  ],
  entry: [
    // 表紙
    // { rel: "cover" },

    // 扉
    // "00-title.md",
    "title.html",
    // 前書き
    "01-preface.md",

    // 目次
    { rel: "contents" },

    // 第一部 とにかく楽をする
    "part-easy.md",
    "chap-introduction.md",


    // 第二部 バックアップのための理論的なところについて
    "part-tips.md",
	"chap-digitaldata.md",

    "chap-ditflame-1.md",
	"chap-ditflame-2.md",
	"chap-ditflame-3.md",
	"chap-rhodium-infomation.md",
    "chap-device.md",
    "chap-datacategory.md",
    "chap-compression.md",
    "chap-datacorrection.md",
    "chap-riskassessment.md",	
    "chap-321rule.md",		
    "chap-oyakata-raid.md",
    "chap-backup-archive.md",	

    // 第三部 データマネジメントの実践について
	"part-datamanagement.md",
    "chap-forte-Increase_C-Drive_capacity.md",
    "chap-forte-cloudflare-r2.md",
    "chap-forte-iPhone.md",
    "chap-fumiyasac.md",
    "chap-kaminuma-promptengineering.md",
    "chap-kaminuma-datamanage.md",
    "chap-yuusukesan18.md",
    "chap-mobengineer.md",
    "chap-kawahara-2dai.md",
    "chap-rhodium-poem.md",
    "chap-sustainable-note-taking.md",
    "chap-yumechi-1.md",
    "chap-yumechi-2.md",
	"chap-raspinas-hizumi.md",

    // 後書き
    "90-postscript.md",
    "98-authors.md",
    "99-colophon.md",
  ],
  entryContext: "./src",

  // output: [ // path to generate draft file(s). default to '{title}.pdf'
  //   './output.pdf', // the output format will be inferred from the name.
  //   {
  //     path: './book',
  //     format: 'webpub',
  //   },
  // ],
  workspaceDir: ".vivliostyle", // directory which is saved intermediate files.
  toc: {
    title: "目次", // title of table of contents. default to 'Contents'.
    sectionDepth: 2,
    includeCover: false, // include cover page in table of contents. default to 'false'.
  },
  // cover: './cover.png', // cover image. default to undefined.
  vfm: {
    // options of VFM processor
    //   hardLineBreaks: true, // converts line breaks of VFM to <br> tags. default to 'false'.
    //   disableFormatHtml: true, // disables HTML formatting. default to 'false'.
  },
};

if (isPrint) {
  def.theme = [
    ...def.theme,
    // グレースケール印刷可能なPDF
    "./theme-nice-techbook2/theme-print-pdf.css",
  ];
} else {
  def.theme = [
    ...def.theme,
    // オンライン向けのフルカラーPDF
    "./theme-nice-techbook2/theme-online-pdf.css",
    "./theme-nice-techbook2/theme-base/css/lib/prism/base.css",
    "./theme-nice-techbook2/theme-base/css/lib/prism/theme-okaidia.css",
  ];
}

export default def;

