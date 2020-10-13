export default function jsonrpcFromDefs(definitions: Record<string, { rpc?: Record<string, any> }>) {
  const jsonrpc: Record<string, Record<string, any>> = {};

  return Object.keys(definitions)
    .filter((key) => Object.keys(definitions[key]?.rpc || {}).length !== 0)
    .forEach((section): void => {
      jsonrpc[section] = {};
      Object.entries(definitions[section].rpc as Record<string, any>).forEach(([method, def]): void => {
        const isSubscription = !!def.pubsub;

        jsonrpc[section][method] = {
          ...(def as any),
          isSubscription,
          jsonrpc: `${section}_${method}`,
          method,
          section
        };
      });
    });
}
