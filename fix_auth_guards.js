const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'apps', 'api', 'src');

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let originalContent = content;
  
  // Replace the hardcoded fallbacks
  content = content.replace(/req\.user\?\.userId\s*\|\|\s*1/g, 'req.user.userId');
  content = content.replace(/req\?\.user\?\.userId\s*\|\|\s*1/g, 'req.user.userId');
  content = content.replace(/Number\(req\?\.user\?\.userId\)\s*\|\|\s*1/g, 'req.user.userId');
  
  // Re-enable guards where commented out
  content = content.replace(/\/\/\s*Temporarily\s+(?:remove|disable)\s+auth\s+guard(?:s)?\s+for\s+testing\s*\n\s*\/\/\s*TODO:\s*Re-enable\s+@UseGuards\(JwtAuthGuard\)(?:[^\n]*)\n/gi, '@UseGuards(JwtAuthGuard)\n  ');
  
  // If we applied @UseGuards but it's not imported, import it
  if (content.includes('@UseGuards(JwtAuthGuard)') && !content.includes('JwtAuthGuard')) {
    // This is a naive check. A better check:
    if (!content.includes('import { JwtAuthGuard }')) {
      const importStmt = `import { JwtAuthGuard } from "../auth/jwt-auth.guard";\n`;
      content = importStmt + content;
    }
  }

  // Also make sure @UseGuards is imported from @nestjs/common
  if (content.includes('@UseGuards') && !content.includes('UseGuards')) {
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
console.log("Done fixing fallbacks.");
