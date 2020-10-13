export default function typesAliasFromDefs(
  definitions: Record<string, Record<string, any>>,
  initAlias: Record<string, any> = {}
): Record<string, any> {
  return Object.values(definitions).reduce(
    (res: Record<string, any>, { typesAlias }): Record<string, any> => ({
      ...res,
      ...typesAlias
    }),
    initAlias
  );
}
