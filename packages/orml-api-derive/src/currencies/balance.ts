import { ApiInterfaceRx } from '@polkadot/api/types';
import { memo } from '@polkadot/api-derive/util';
import { AccountInfo } from '@polkadot/types/interfaces';
import { AccountId, Balance, OrmlAccountData } from '@open-web3/orml-types/interfaces';
import { Observable } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';

export function balance(
  instanceId: string,
  api: ApiInterfaceRx
): (address: AccountId | string | Uint8Array, token: any) => Observable<Balance> {
  return memo(
    instanceId,
    (address: AccountId | string | Uint8Array, token: any): Observable<Balance> => {
      return api.rpc.system.properties().pipe(
        mergeMap((properties) => {
          const currencyId = api.registry.createType('CurrencyId' as any, token);
          const nativeTokenSymbol = properties.tokenSymbol.unwrapOrDefault().toString();
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

          const key1 = api.query.tokens.accounts.creator.meta.type.asDoubleMap.key1.toString();
          const arg = key1 === 'CurrencyId' ? [token, address] : [address, token];
          return api.query.tokens.accounts<OrmlAccountData>(...arg).pipe(
            map((result) => {
              return result.free;
            })
          );
        })
      );
    }
  );
}
