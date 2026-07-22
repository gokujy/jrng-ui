import { Subject } from 'rxjs';
import { JAsyncDataController, JAsyncDataResult } from './async-data';

describe('JAsyncDataController', () => {
  it('cancels the previous observable request', async () => {
    const requests: Subject<JAsyncDataResult<string>>[] = [];
    const controller = new JAsyncDataController<string, string>({
      load: () => {
        const request = new Subject<JAsyncDataResult<string>>();
        requests.push(request);
        return request;
      },
    });
    void controller.load('first');
    const latest = controller.load('second');
    expect(requests[0].observed).toBe(false);
    requests[1].next({ items: ['latest'] });
    await latest;
    expect(controller.snapshot.items).toEqual(['latest']);
  });

  it('reuses cached query results and supports invalidation', async () => {
    let calls = 0;
    const controller = new JAsyncDataController<number, { search: string }>({
      load: async () => ({ items: [++calls] }),
    });
    await controller.load({ search: 'a' });
    await controller.load({ search: 'a' });
    expect(calls).toBe(1);
    controller.invalidate();
    await controller.load({ search: 'a' });
    expect(calls).toBe(2);
  });
});
