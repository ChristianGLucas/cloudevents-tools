import { EventDocument, ExtractDataResult } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import { safeParseJson, isPlainObject, classifyData } from './lib';

/**
 * Extract and classify a CloudEvent's `data` payload as "json", "text",
 * "base64" (data_base64), or "empty".
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export async function extractData(ax: AxiomContext, input: EventDocument): Promise<ExtractDataResult> {
  const out = new ExtractDataResult();
  const parsed = safeParseJson(input.getJson() || '');
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
  const data = classifyData(parsed.value);
  out.setOk(true);
  out.setHasData(data.hasData);
  out.setDataEncoding(data.encoding);
  out.setData(data.data);
  out.setDataBase64(data.dataBase64);
  const dct = parsed.value['datacontenttype'];
  out.setDatacontenttype(typeof dct === 'string' ? dct : '');
  return out;
}
