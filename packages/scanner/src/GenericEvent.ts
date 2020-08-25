import { GenericEvent as _GenericEvent } from '@polkadot/types';

function toHump(name: string) {
  return name.replace(/\_(\w)/g, (_, l) => l.toUpperCase());
}

export default class GenericEvent extends _GenericEvent {
  get argsDef() {
    try {
      const meta: any = this.meta.toJSON();
      const args = meta?.args;
      if (!args || !args.length) {
        return {};
      }
      const doc = meta.documentation.join('\n');
      const def = doc
        .match(/\[([\w\s,]*)\]/)?.[1]
        .split(',')
        .map((s: string) => s.trim());

      const data: any = this.data.toJSON();

      if (def.length !== args.length || def.length !== data.length) {
        return null;
      }

      return data.reduce((result: Record<string, any>, curr: any, index: number) => {
        const name = toHump(def[index]);
        result[name] = curr;
        return result;
      }, {} as Record<string, any>);
    } catch {
      return null;
    }
  }
}
