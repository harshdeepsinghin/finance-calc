const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

const distJsDir = path.join(__dirname, '../dist/js');

async function minifyFiles() {
  try {
    const files = ['shared.js', 'engine.js'];
    for (const file of files) {
      const filePath = path.join(distJsDir, file);
      if (fs.existsSync(filePath)) {
        console.log(`Minifying ${file}...`);
        const content = fs.readFileSync(filePath, 'utf8');
        const minified = await esbuild.transform(content, {
          minify: true,
          target: 'es2020'
        });
        fs.writeFileSync(filePath, minified.code, 'utf8');
        console.log(`Minified ${file} successfully.`);
      } else {
        console.warn(`Warning: File ${filePath} not found for minification.`);
      }
    }
    console.log('Post-build minification completed successfully.');
  } catch (err) {
    console.error('Error during post-build minification:', err);
    process.exit(1);
  }
}

minifyFiles();
