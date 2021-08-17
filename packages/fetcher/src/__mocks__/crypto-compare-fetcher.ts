import Fetcher from './fetcher';

export default class CryptoCompareFetcher extends Fetcher {
  constructor(public readonly source: string, private readonly apiKey: string, public readonly weight = 1) {
    super(source, weight);
  }
}
