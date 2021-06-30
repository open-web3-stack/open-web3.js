import merge from 'lodash.merge';

export default function typesAliasFromDefs(
  definitions: Record<string, Record<string, any>>,
  initAlias: Record<string, any> = {}
): Record<string, any> {
  return Object.values(definitions).reduce(
    (res: Record<string, any>, { typesAlias }): Record<string, any> => merge({}, typesAlias, res),
    initAlias
  );
}
