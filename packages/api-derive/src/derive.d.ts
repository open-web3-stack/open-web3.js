import { AccountId, Balance, CurrencyId } from '@laminar/types/interfaces/runtime';
import { Observable } from 'rxjs';

declare module '@polkadot/api-derive/index' {
  interface derive {
    aaaa: any;
    currencies: any;
  }

  export interface ExactDerive extends DeriveAllSections<typeof derive> {
    aaaa: any;
  }

  interface DeriveAllSections {
    aaaa: any;
    currencies: any;
  }
}
