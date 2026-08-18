import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getAllSettings() {
    const settings = await this.prisma.systemSetting.findMany({
      where: { is_active: true }
    });
    
    // Convert array to object map for easy access on frontend
    const settingsMap: Record<string, string> = {};
    settings.forEach(s => {
      settingsMap[s.key] = s.value;
    });
    
    return settingsMap;
  }

  async getSetting(key: string, defaultValue: string = ''): Promise<string> {
    const setting = await this.prisma.systemSetting.findUnique({
      where: { key }
    });
    return setting?.value ?? defaultValue;
  }

  async updateSettings(settings: Record<string, string>) {
    // Upsert each setting
    const updatePromises = Object.entries(settings).map(([key, value]) => {
      return this.prisma.systemSetting.upsert({
        where: { key },
        update: { value, updated_at: new Date() },
        create: { key, value }
      });
    });

    await Promise.all(updatePromises);
    return { success: true, message: 'Settings updated successfully' };
  }
}
