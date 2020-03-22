import { Dispatcher, builder } from '../dispatcher';
import { SingleEventSource, createEvent, onEvent, createEvents, MultiEventSource, onEvents } from '../eventSources';

describe('Dispatcher', () => {
  let dispatcher: Dispatcher;

  ['', 'with same name event'].forEach((name, index) => {
    describe(`SingleEventSource ${name}`, () => {
      let events: string[];
      let events2: string[];
      let testEvent: SingleEventSource<string>;
      let testEvent2: SingleEventSource<string>;

      beforeEach(() => {
        events = [];
        events2 = [];
        testEvent = createEvent('TestEvent');
        testEvent2 = createEvent(index === 0 ? 'TestEvent' : 'TestEvent2');
        dispatcher = builder()
          .addHandler(onEvent(testEvent, s => events.push(s)))
          .addHandler(onEvent(testEvent2, s => events2.push(s)))
          .build();
      });

      it('should emit event', async () => {
        await testEvent.emit('a');
        expect(events).toEqual(['a']);
        expect(events2).toEqual([]);

        await testEvent.emit('b');
        expect(events).toEqual(['a', 'b']);
        expect(events2).toEqual([]);

        await testEvent2.emit('c');
        expect(events).toEqual(['a', 'b']);
        expect(events2).toEqual(['c']);

        await testEvent2.emit('d');
        expect(events).toEqual(['a', 'b']);
        expect(events2).toEqual(['c', 'd']);
      });
    });
  });

  describe('MultiEventSource', () => {
    let fooEvnets: string[] = [];
    let barEvents: number[];
    let source: MultiEventSource<{ foo: string; bar: number }>;

    beforeEach(() => {
      fooEvnets = [];
      barEvents = [];
      source = createEvents();
      dispatcher = builder()
        .addHandler(
          onEvents(source, {
            foo: x => fooEvnets.push(x),
            bar: x => barEvents.push(x)
          })
        )
        .build();
    });

    it('should emit event', async () => {
      await source.emit('foo', 'a');
      expect(fooEvnets).toEqual(['a']);
      expect(barEvents).toEqual([]);

      await source.emit('foo', 'b');
      expect(fooEvnets).toEqual(['a', 'b']);
      expect(barEvents).toEqual([]);

      await source.emit('bar', 1);
      expect(fooEvnets).toEqual(['a', 'b']);
      expect(barEvents).toEqual([1]);

      await source.emit('bar', 2);
      expect(fooEvnets).toEqual(['a', 'b']);
      expect(barEvents).toEqual([1, 2]);
    });

    it('should teardown', async () => {
      dispatcher.teardown();

      await source.emit('foo', 'a');
      await source.emit('bar', 1);
      expect(fooEvnets).toEqual([]);
      expect(barEvents).toEqual([]);
    });
  });

  describe('maxConcurrentCount', () => {
    let events: string[];
    let deferreds: [() => void, () => void][];
    let testEvent: SingleEventSource<string>;

    beforeEach(() => {
      events = [];
      deferreds = [];
      testEvent = createEvent('TestEvent');
      dispatcher = builder()
        .addHandler(
          onEvent(testEvent, s =>
            new Promise((resolve, reject) => {
              deferreds.push([resolve, reject]);
            }).finally(() => {
              events.push(s);
            })
          ).withOptions({ maxConcurrentCount: 3 })
        )
        .build();
    });

    describe('should limit to 3 concurrent calls', () => {
      it('on success', async () => {
        const promises = [testEvent.emit('a'), testEvent.emit('b'), testEvent.emit('c'), testEvent.emit('d')];

        deferreds.forEach(([resolve]) => resolve());
        await Promise.all(promises);

        expect(events).toEqual(['a', 'b', 'c']);
      });

      it('on error', async () => {
        const promises = [testEvent.emit('a'), testEvent.emit('b'), testEvent.emit('c'), testEvent.emit('d')];

        deferreds.forEach(([, reject]) => reject());
        await Promise.all(promises);

        expect(events).toEqual(['a', 'b', 'c']);
      });

      it('when tasks finished', async () => {
        const promises = [testEvent.emit('a'), testEvent.emit('b'), testEvent.emit('c')];

        deferreds[1][0]()

        await promises[1];

        promises.push(testEvent.emit('d'), testEvent.emit('e'));

        deferreds.forEach(([resolve]) => resolve());
        await Promise.all(promises);

        expect(events).toEqual(['b', 'a', 'c', 'd']);
      })
    });
  });
});
