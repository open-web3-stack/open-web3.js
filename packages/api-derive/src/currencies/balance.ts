import { ApiInterfaceRx } from '@polkadot/api/types';

import { AccountId, AccountIndex, Address, Balance } from '@orml/types/interfaces';
import { Observable } from 'rxjs';
import { memo } from '../util';

export function balance(
  api: ApiInterfaceRx
): (address:  | AccountId | Address | string, token: any) => Observable<Balance> {
  return memo(
    (address: AccountIndex | AccountId | Address | string, token: any): Observable<Balance> => {
      const CurrencyId = api.registry.get('CurrencyId');
      const currencyId = new (CurrencyId as any)(api.registry, token);
      const nativeCurrencyId = api.consts.currencies.nativeCurrencyId;

      if (currencyId.toHex() === nativeCurrencyId.toHex()) {
        return api.query.balances.freeBalance<Balance>(address as any);
      } else {
        return api.query.tokens.balance<Balance>(token, address as any);
      }
    }
  );
}
