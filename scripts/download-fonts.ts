import fs from "fs";
import path from "path";

// Fonts available in public/fonts/ as static TTFs.
// To add more fonts, download Regular + Bold TTFs and place them in public/fonts/
// using the naming convention: FontFamily-Regular.ttf, FontFamily-Bold.ttf
// (spaces in family names become underscores: "Crimson Text" -> "Crimson_Text")

const EXPECTED_FONTS = [
  { family: "Inter", files: ["Inter-Regular.ttf", "Inter-Bold.ttf", "Inter-SemiBold.ttf"] },
  { family: "Poppins", files: ["Poppins-Regular.ttf", "Poppins-Bold.ttf"] },
  { family: "Lato", files: ["Lato-Regular.ttf", "Lato-Bold.ttf"] },
  { family: "Barlow", files: ["Barlow-Regular.ttf", "Barlow-Bold.ttf"] },
  { family: "Bebas Neue", files: ["Bebas_Neue-Regular.ttf"] },
  { family: "Crimson Text", files: ["Crimson_Text-Regular.ttf", "Crimson_Text-Bold.ttf"] },
];

const FONTS_DIR = path.join(process.cwd(), "public", "fonts");

function main() {
  console.log(`Checking fonts in ${FONTS_DIR}...\n`);

  let ok = 0;
  let missing = 0;

  for (const font of EXPECTED_FONTS) {
    console.log(`${font.family}:`);
    for (const file of font.files) {
      const filePath = path.join(FONTS_DIR, file);
      if (fs.existsSync(filePath)) {
        const size = fs.statSync(filePath).size;
        console.log(`  [ok]   ${file} (${(size / 1024).toFixed(0)} KB)`);
        ok++;
      } else {
        console.log(`  [miss] ${file}`);
        missing++;
      }
    }
  }

  console.log(`\n${ok} files present, ${missing} missing.`);
  if (missing > 0) {
    console.log("Download missing TTFs manually and place them in public/fonts/");
  }
}

main();
