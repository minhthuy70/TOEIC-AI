import { NotificationsService } from './notifications.service';

describe('NotificationsService email report helpers', () => {
  it('builds a valid daily report email payload', () => {
    const service = new NotificationsService({} as any);

    const payload = (service as any).buildProgressEmailPayload({
      title: 'Báo cáo tiến độ hàng ngày',
      summary: 'Hôm nay bạn đã học 25 từ mới và đạt 850 điểm.',
      metrics: [
        { label: 'Từ mới', value: '25' },
        { label: 'Điểm', value: '850' },
      ],
      ctaUrl: '/dashboard',
      ctaLabel: 'Xem chi tiết',
    });

    expect(payload.subject).toContain('Báo cáo tiến độ hàng ngày');
    expect(payload.text).toContain('25');
    expect(payload.html).toContain('/dashboard');
    expect(payload.html).toContain('Xem chi tiết');
  });
});
