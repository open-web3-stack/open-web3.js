import { ApiInterfaceRx } from '@polkadot/api/types';

import { AccountId, Balance } from '@orml/types/interfaces';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { memo } from '../util';

export function balance(
  api: ApiInterfaceRx
): (address: AccountId | string | Uint8Array, token: any) => Observable<Balance> {
  return memo(
    (address: AccountId | string | Uint8Array, token: any): Observable<Balance> => {
      const CurrencyId = api.registry.get('CurrencyId');
      const currencyId = new (CurrencyId as any)(api.registry, token);
      const nativeCurrencyId = api.consts.currencies.nativeCurrencyId;

      if (currencyId.eq(nativeCurrencyId)) {
        return api.query.balances.account(address).pipe(
          map(result => {
            return result.free;
          })
        );
      } else {
        return api.query.tokens.balance<Balance>(token, address);
      }
    }
  );
}
