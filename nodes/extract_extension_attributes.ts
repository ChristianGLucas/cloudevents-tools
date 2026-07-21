import { EventDocument, ExtensionAttributesResult, ExtensionAttribute } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import { safeParseJson, isPlainObject, extractExtensions, MAX_DOCUMENT_CHARS } from './lib';

/**
 * Extract every extension attribute — any top-level JSON key outside the
 * CloudEvents v1.0 context-attribute set and outside data/data_base64.
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export async function extractExtensionAttributes(ax: AxiomContext, input: EventDocument): Promise<ExtensionAttributesResult> {
  const out = new ExtensionAttributesResult();
  const parsed = safeParseJson(input.getJson() || '', MAX_DOCUMENT_CHARS);
  if (!parsed.ok) {
    out.setOk(false);
    out.setError(parsed.error);
    return out;
  }
  if (!isPlainObject(parsed.value)) {
    out.setOk(false);
    out.setError('document is not a JSON object');
    return out;
  }
  out.setOk(true);
  for (const ext of extractExtensions(parsed.value)) {
    const e = new ExtensionAttribute();
    e.setName(ext.name);
    e.setValue(ext.value);
    e.setValueJson(ext.valueJson);
    e.setValueType(ext.valueType);
    out.addExtensions(e);
  }
  return out;
}
