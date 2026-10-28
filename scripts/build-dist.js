const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const dist = path.join(root, "dist");
const pages = [
  "index.html",
  "about.html",
  "blog.html",
  "pricing.html",
  "product.html",
  "projects.html",
  "privacy.html",
  "quote.html",
  "services.html",
  "terms.html",
];

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(from, to);
    else fs.copyFileSync(from, to);
  }
}

function rewriteHtml(html) {
  return html
    .replaceAll('href="css/', 'href="assets/css/')
    .replaceAll('href="images/', 'href="assets/images/')
    .replaceAll('src="images/', 'src="assets/images/')
    .replaceAll('data-image="images/', 'data-image="assets/images/')
    .replaceAll('src="js/', 'src="assets/js/');
}

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(path.join(dist, "assets"), { recursive: true });

for (const page of pages) {
  const html = fs.readFileSync(path.join(root, page), "utf8");
  fs.writeFileSync(path.join(dist, page), rewriteHtml(html));
}

copyDir(path.join(root, "css"), path.join(dist, "assets", "css"));
copyDir(path.join(root, "js"), path.join(dist, "assets", "js"));
copyDir(path.join(root, "images"), path.join(dist, "assets", "images"));
fs.copyFileSync(path.join(root, ".htaccess"), path.join(dist, ".htaccess"));

console.log("dist ready");
