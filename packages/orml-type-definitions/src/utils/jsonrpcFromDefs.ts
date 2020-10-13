export default function jsonrpcFromDefs(
  definitions: Record<string, { rpc?: Record<string, any> }>,
  jsonrpc: Record<string, Record<string, any>> = {}
): Record<string, Record<string, any>> {
  Object.keys(definitions)
    .filter((key) => Object.keys(definitions[key]?.rpc || {}).length !== 0)
    .forEach((section): void => {
      jsonrpc[section] = {};
      Object.entries(definitions[section].rpc as Record<string, any>).forEach(([method, def]): void => {
        const isSubscription = !!def.pubsub;

        jsonrpc[section][method] = {
          ...def,
          isSubscription,
          jsonrpc: `${section}_${method}`,
          method,
          section
        };
      });
    });

  return jsonrpc;
}
