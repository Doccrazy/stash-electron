import { loadMessagesFromContext } from './utils/i18n/message';
import { flushCache } from './utils/i18n/translate';

function load() {
  // @ts-ignore
  const localesContext = require.context('./locale', false, /^.*\.yml$/);
  loadMessagesFromContext(localesContext);
  return localesContext.id;
}
const contextId = load();

if ((module as any).hot) {
  (module as any).hot.accept(contextId, () => {
    load();
    flushCache();
  });
}
