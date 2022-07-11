import { ApiInterfaceRx } from '@polkadot/api/types';
import { memo } from '@polkadot/api-derive/util';
import { AccountInfo } from '@polkadot/types/interfaces';
import { AccountId, Balance, OrmlAccountData } from '@open-web3/orml-types/interfaces';
import { Observable } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';

export const balance = (
  instanceId: string,
  api: ApiInterfaceRx
): ((address: AccountId | string | Uint8Array, token: any) => Observable<Balance>) => {
  return memo(instanceId, (address: AccountId | string | Uint8Array, token: any): Observable<Balance> => {
    return api.rpc.system.properties().pipe(
      mergeMap((properties): Observable<Balance> => {
        const currencyId = api.registry.createType('CurrencyId' as any, token);
        const nativeTokenSymbol = properties.tokenSymbol.unwrapOrDefault()[0].toString();
        const nativeCurrencyId = api.registry.createType(
          'CurrencyId' as any,
          (api.registry.getDefinition('CurrencyId') || '').includes('"Token":"TokenSymbol"')
            ? { Token: nativeTokenSymbol }
            : nativeTokenSymbol
        );

        if (currencyId.eq(nativeCurrencyId)) {
          return api.query.system.account<AccountInfo>(address).pipe(
            map((result) => {
              return result.data.free;
            })
          );
        }

        const lookupId = api.query.tokens.accounts.creator.meta.type.asMap.key;
        const [typeId] = api.registry.lookup.getSiType(lookupId).def.asTuple;
        const keyType = api.registry.lookup.getTypeDef(typeId).type;
        const arg = keyType === 'CurrencyId' ? [token, address] : [address, token];
        return api.query.tokens.accounts<OrmlAccountData>(...arg).pipe(
          map((result: OrmlAccountData) => {
            return result.free;
          })
        );
      })
    );
  });
};
