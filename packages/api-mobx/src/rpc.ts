import { WsProvider } from '@polkadot/rpc-provider';
import { isNumber } from '@polkadot/util';

export function createMethodSubscribe<T>(
  ws: WsProvider,
  methods: string[],
  params: any[],
  callback: (err?: Error, result?: T) => any
): () => void {
  const [updateType, subMethod, unsubMethod] = methods;

  let subscriptionPromise: Promise<string | number | void> = Promise.resolve();
  const errorHandler = (error: Error): void => {
    callback(error);
  };

  try {
    const update = (error: Error | null, result?: any): void => {
      if (error) {
        // errorHandler(error)
        return;
      }
      callback(undefined, result);
    };

    subscriptionPromise = ws.subscribe(updateType, subMethod, params, update).catch((error) => errorHandler(error));
  } catch (error) {
    errorHandler(error);
  }

  return (): void => {
    subscriptionPromise.then(
      (subscriptionId): Promise<boolean> =>
        isNumber(subscriptionId) ? ws.unsubscribe(updateType, unsubMethod, subscriptionId) : Promise.resolve(false)
    );
  };
}

export type SubscribeStorageResp = { block: string; changes: [string, string][] };

function subscribeStorage(ws: WsProvider, callback: (err?: Error, result?: SubscribeStorageResp) => any): () => void {
  return createMethodSubscribe<SubscribeStorageResp>(
    ws,
    ['state_storage', 'state_subscribeStorage', 'state_unsubscribeStorage'],
    [],
    callback
  );
}

export default subscribeStorage;
