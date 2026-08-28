const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'apps', 'api', 'src');

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let originalContent = content;
  
  // Remove all existing @UseGuards(JwtAuthGuard) (to clean up the mess)
  content = content.replace(/@UseGuards\(JwtAuthGuard\)\s*/g, '');
  
  // Add @UseGuards(JwtAuthGuard) right above @Controller
  content = content.replace(/@Controller\(/g, '@UseGuards(JwtAuthGuard)\n@Controller(');
  
  // Clean up the comment " // Default to user ID 1 for testing"
  content = content.replace(/\s*\/\/\s*Default to user ID 1 for testing/g, '');

  // Add the imports if missing
  if (!content.includes('import { JwtAuthGuard }')) {
    content = `import { JwtAuthGuard } from "../auth/jwt-auth.guard";\n` + content;
  }
  
  if (!content.includes('UseGuards')) {
      content = content.replace('import { Controller,', 'import { Controller, UseGuards,');
  }

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Fixed: ${filePath}`);
  }
}

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('controller.ts')) {
      fixFile(fullPath);
    }
  }
}

walk(srcDir);
console.log("Done fixing decorators.");
