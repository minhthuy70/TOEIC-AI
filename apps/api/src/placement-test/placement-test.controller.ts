import { Controller, Get } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Controller('placement-test')
export class PlacementTestController {
  @Get()
  getPlacementTest() {
    const filePath = path.join(
      process.cwd(),
      '..',
      '..',
      'data',
      'placement-test.json',
    );
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  }
}
