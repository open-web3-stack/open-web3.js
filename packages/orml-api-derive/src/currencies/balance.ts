import { ApiInterfaceRx } from '@polkadot/api/types';
import { memo } from '@polkadot/api-derive/util';
import { AccountInfo } from '@polkadot/types/interfaces';
import { AccountId, Balance, OrmlAccountData } from '@open-web3/orml-types/interfaces';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export function balance(
  instanceId: string,
  api: ApiInterfaceRx
): (address: AccountId | string | Uint8Array, token: any) => Observable<Balance> {
  return memo(
    instanceId,
    (address: AccountId | string | Uint8Array, token: any): Observable<Balance> => {
      const currencyId = api.registry.createType('CurrencyId' as any, token);
      const nativeCurrencyId = api.consts.currencies.nativeCurrencyId;

      if (currencyId.eq(nativeCurrencyId)) {
        return api.query.system.account<AccountInfo>(address).pipe(
          map((result) => {
            return result.data.free;
          })
        );
      } else {
        const key1 = api.query.tokens.accounts.creator.meta.type.asDoubleMap.key1.toString();
        const arg = key1 === 'CurrencyId' ? [token, address] : [address, token];
        return api.query.tokens.accounts<OrmlAccountData>(...arg).pipe(
          map((result) => {
            return result.free;
          })
        );
      }
    }
  );
}
