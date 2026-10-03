import 'server-only';
import { manualSnapshot } from './sources/manual';
import { withValue } from './metrics';
export function getSnapshot(date = '2026-10-02') {
  const snapshot = manualSnapshot(date);
  const models = snapshot.models.filter(m => process.env.DATA_MODE === 'internal' || m.redistributionAllowed);
  return { ...snapshot, models: withValue(models) };
}
export const availableDates = ['2026-09-02','2026-09-25','2026-10-01','2026-10-02'];
