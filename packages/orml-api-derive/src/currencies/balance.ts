import { ApiInterfaceRx } from '@polkadot/api/types';
import { AccountInfo, AccountId, Balance } from '@polkadot/types/interfaces';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { memo } from '../util';

export function balance(
  api: ApiInterfaceRx
): (address: AccountId | string | Uint8Array, token: any) => Observable<Balance> {
  return memo(
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
        return api.query.tokens.accounts<any>(...arg).pipe(
          map((result) => {
            return result.free;
          })
        );
      }
    }
  );
}
