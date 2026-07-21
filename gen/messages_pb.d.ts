// package: christiangeorgelucas.cloudevents_tools
// file: messages.proto

import * as jspb from "google-protobuf";

export class EventDocument extends jspb.Message {
  getJson(): string;
  setJson(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): EventDocument.AsObject;
  static toObject(includeInstance: boolean, msg: EventDocument): EventDocument.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: EventDocument, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): EventDocument;
  static deserializeBinaryFromReader(message: EventDocument, reader: jspb.BinaryReader): EventDocument;
}

export namespace EventDocument {
  export type AsObject = {
    json: string,
  }
}

export class Header extends jspb.Message {
  getName(): string;
  setName(value: string): void;

  getValue(): string;
  setValue(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Header.AsObject;
  static toObject(includeInstance: boolean, msg: Header): Header.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Header, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Header;
  static deserializeBinaryFromReader(message: Header, reader: jspb.BinaryReader): Header;
}

export namespace Header {
  export type AsObject = {
    name: string,
    value: string,
  }
}

export class BinaryModeEvent extends jspb.Message {
  clearHeadersList(): void;
  getHeadersList(): Array<Header>;
  setHeadersList(value: Array<Header>): void;
  addHeaders(value?: Header, index?: number): Header;

  getBody(): string;
  setBody(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): BinaryModeEvent.AsObject;
  static toObject(includeInstance: boolean, msg: BinaryModeEvent): BinaryModeEvent.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: BinaryModeEvent, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): BinaryModeEvent;
  static deserializeBinaryFromReader(message: BinaryModeEvent, reader: jspb.BinaryReader): BinaryModeEvent;
}

export namespace BinaryModeEvent {
  export type AsObject = {
    headersList: Array<Header.AsObject>,
    body: string,
  }
}

export class ExtensionAttribute extends jspb.Message {
  getName(): string;
  setName(value: string): void;

  getValue(): string;
  setValue(value: string): void;

  getValueJson(): string;
  setValueJson(value: string): void;

  getValueType(): string;
  setValueType(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ExtensionAttribute.AsObject;
  static toObject(includeInstance: boolean, msg: ExtensionAttribute): ExtensionAttribute.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ExtensionAttribute, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ExtensionAttribute;
  static deserializeBinaryFromReader(message: ExtensionAttribute, reader: jspb.BinaryReader): ExtensionAttribute;
}

export namespace ExtensionAttribute {
  export type AsObject = {
    name: string,
    value: string,
    valueJson: string,
    valueType: string,
  }
}

export class Violation extends jspb.Message {
  getAttribute(): string;
  setAttribute(value: string): void;

  getMessage(): string;
  setMessage(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Violation.AsObject;
  static toObject(includeInstance: boolean, msg: Violation): Violation.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Violation, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Violation;
  static deserializeBinaryFromReader(message: Violation, reader: jspb.BinaryReader): Violation;
}

export namespace Violation {
  export type AsObject = {
    attribute: string,
    message: string,
  }
}

export class StructuredEvent extends jspb.Message {
  getId(): string;
  setId(value: string): void;

  getSource(): string;
  setSource(value: string): void;

  getSpecversion(): string;
  setSpecversion(value: string): void;

  getType(): string;
  setType(value: string): void;

  getDatacontenttype(): string;
  setDatacontenttype(value: string): void;

  getHasDatacontenttype(): boolean;
  setHasDatacontenttype(value: boolean): void;

  getDataschema(): string;
  setDataschema(value: string): void;

  getHasDataschema(): boolean;
  setHasDataschema(value: boolean): void;

  getSubject(): string;
  setSubject(value: string): void;

  getHasSubject(): boolean;
  setHasSubject(value: boolean): void;

  getTime(): string;
  setTime(value: string): void;

  getHasTime(): boolean;
  setHasTime(value: boolean): void;

  getHasData(): boolean;
  setHasData(value: boolean): void;

  getData(): string;
  setData(value: string): void;

  getDataBase64(): string;
  setDataBase64(value: string): void;

  getDataEncoding(): string;
  setDataEncoding(value: string): void;

  clearExtensionsList(): void;
  getExtensionsList(): Array<ExtensionAttribute>;
  setExtensionsList(value: Array<ExtensionAttribute>): void;
  addExtensions(value?: ExtensionAttribute, index?: number): ExtensionAttribute;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): StructuredEvent.AsObject;
  static toObject(includeInstance: boolean, msg: StructuredEvent): StructuredEvent.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: StructuredEvent, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): StructuredEvent;
  static deserializeBinaryFromReader(message: StructuredEvent, reader: jspb.BinaryReader): StructuredEvent;
}

export namespace StructuredEvent {
  export type AsObject = {
    id: string,
    source: string,
    specversion: string,
    type: string,
    datacontenttype: string,
    hasDatacontenttype: boolean,
    dataschema: string,
    hasDataschema: boolean,
    subject: string,
    hasSubject: boolean,
    time: string,
    hasTime: boolean,
    hasData: boolean,
    data: string,
    dataBase64: string,
    dataEncoding: string,
    extensionsList: Array<ExtensionAttribute.AsObject>,
  }
}

export class ParseEventResult extends jspb.Message {
  getOk(): boolean;
  setOk(value: boolean): void;

  getError(): string;
  setError(value: string): void;

  hasEvent(): boolean;
  clearEvent(): void;
  getEvent(): StructuredEvent | undefined;
  setEvent(value?: StructuredEvent): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ParseEventResult.AsObject;
  static toObject(includeInstance: boolean, msg: ParseEventResult): ParseEventResult.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ParseEventResult, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ParseEventResult;
  static deserializeBinaryFromReader(message: ParseEventResult, reader: jspb.BinaryReader): ParseEventResult;
}

export namespace ParseEventResult {
  export type AsObject = {
    ok: boolean,
    error: string,
    event?: StructuredEvent.AsObject,
  }
}

export class ValidateEventResult extends jspb.Message {
  getValid(): boolean;
  setValid(value: boolean): void;

  clearViolationsList(): void;
  getViolationsList(): Array<Violation>;
  setViolationsList(value: Array<Violation>): void;
  addViolations(value?: Violation, index?: number): Violation;

  hasEvent(): boolean;
  clearEvent(): void;
  getEvent(): StructuredEvent | undefined;
  setEvent(value?: StructuredEvent): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ValidateEventResult.AsObject;
  static toObject(includeInstance: boolean, msg: ValidateEventResult): ValidateEventResult.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ValidateEventResult, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ValidateEventResult;
  static deserializeBinaryFromReader(message: ValidateEventResult, reader: jspb.BinaryReader): ValidateEventResult;
}

export namespace ValidateEventResult {
  export type AsObject = {
    valid: boolean,
    violationsList: Array<Violation.AsObject>,
    event?: StructuredEvent.AsObject,
  }
}

export class RequiredAttributesResult extends jspb.Message {
  getOk(): boolean;
  setOk(value: boolean): void;

  getError(): string;
  setError(value: string): void;

  getId(): string;
  setId(value: string): void;

  getSource(): string;
  setSource(value: string): void;

  getSpecversion(): string;
  setSpecversion(value: string): void;

  getType(): string;
  setType(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): RequiredAttributesResult.AsObject;
  static toObject(includeInstance: boolean, msg: RequiredAttributesResult): RequiredAttributesResult.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: RequiredAttributesResult, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): RequiredAttributesResult;
  static deserializeBinaryFromReader(message: RequiredAttributesResult, reader: jspb.BinaryReader): RequiredAttributesResult;
}

export namespace RequiredAttributesResult {
  export type AsObject = {
    ok: boolean,
    error: string,
    id: string,
    source: string,
    specversion: string,
    type: string,
  }
}

export class OptionalAttributesResult extends jspb.Message {
  getOk(): boolean;
  setOk(value: boolean): void;

  getError(): string;
  setError(value: string): void;

  getDatacontenttype(): string;
  setDatacontenttype(value: string): void;

  getHasDatacontenttype(): boolean;
  setHasDatacontenttype(value: boolean): void;

  getDataschema(): string;
  setDataschema(value: string): void;

  getHasDataschema(): boolean;
  setHasDataschema(value: boolean): void;

  getSubject(): string;
  setSubject(value: string): void;

  getHasSubject(): boolean;
  setHasSubject(value: boolean): void;

  getTime(): string;
  setTime(value: string): void;

  getHasTime(): boolean;
  setHasTime(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): OptionalAttributesResult.AsObject;
  static toObject(includeInstance: boolean, msg: OptionalAttributesResult): OptionalAttributesResult.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: OptionalAttributesResult, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): OptionalAttributesResult;
  static deserializeBinaryFromReader(message: OptionalAttributesResult, reader: jspb.BinaryReader): OptionalAttributesResult;
}

export namespace OptionalAttributesResult {
  export type AsObject = {
    ok: boolean,
    error: string,
    datacontenttype: string,
    hasDatacontenttype: boolean,
    dataschema: string,
    hasDataschema: boolean,
    subject: string,
    hasSubject: boolean,
    time: string,
    hasTime: boolean,
  }
}

export class ExtensionAttributesResult extends jspb.Message {
  getOk(): boolean;
  setOk(value: boolean): void;

  getError(): string;
  setError(value: string): void;

  clearExtensionsList(): void;
  getExtensionsList(): Array<ExtensionAttribute>;
  setExtensionsList(value: Array<ExtensionAttribute>): void;
  addExtensions(value?: ExtensionAttribute, index?: number): ExtensionAttribute;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ExtensionAttributesResult.AsObject;
  static toObject(includeInstance: boolean, msg: ExtensionAttributesResult): ExtensionAttributesResult.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ExtensionAttributesResult, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ExtensionAttributesResult;
  static deserializeBinaryFromReader(message: ExtensionAttributesResult, reader: jspb.BinaryReader): ExtensionAttributesResult;
}

export namespace ExtensionAttributesResult {
  export type AsObject = {
    ok: boolean,
    error: string,
    extensionsList: Array<ExtensionAttribute.AsObject>,
  }
}

export class ExtractDataResult extends jspb.Message {
  getOk(): boolean;
  setOk(value: boolean): void;

  getError(): string;
  setError(value: string): void;

  getHasData(): boolean;
  setHasData(value: boolean): void;

  getDataEncoding(): string;
  setDataEncoding(value: string): void;

  getData(): string;
  setData(value: string): void;

  getDataBase64(): string;
  setDataBase64(value: string): void;

  getDatacontenttype(): string;
  setDatacontenttype(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ExtractDataResult.AsObject;
  static toObject(includeInstance: boolean, msg: ExtractDataResult): ExtractDataResult.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ExtractDataResult, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ExtractDataResult;
  static deserializeBinaryFromReader(message: ExtractDataResult, reader: jspb.BinaryReader): ExtractDataResult;
}

export namespace ExtractDataResult {
  export type AsObject = {
    ok: boolean,
    error: string,
    hasData: boolean,
    dataEncoding: string,
    data: string,
    dataBase64: string,
    datacontenttype: string,
  }
}

export class ModeConversionResult extends jspb.Message {
  getOk(): boolean;
  setOk(value: boolean): void;

  getError(): string;
  setError(value: string): void;

  clearHeadersList(): void;
  getHeadersList(): Array<Header>;
  setHeadersList(value: Array<Header>): void;
  addHeaders(value?: Header, index?: number): Header;

  getBody(): string;
  setBody(value: string): void;

  getStructuredJson(): string;
  setStructuredJson(value: string): void;

  hasEvent(): boolean;
  clearEvent(): void;
  getEvent(): StructuredEvent | undefined;
  setEvent(value?: StructuredEvent): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ModeConversionResult.AsObject;
  static toObject(includeInstance: boolean, msg: ModeConversionResult): ModeConversionResult.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ModeConversionResult, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ModeConversionResult;
  static deserializeBinaryFromReader(message: ModeConversionResult, reader: jspb.BinaryReader): ModeConversionResult;
}

export namespace ModeConversionResult {
  export type AsObject = {
    ok: boolean,
    error: string,
    headersList: Array<Header.AsObject>,
    body: string,
    structuredJson: string,
    event?: StructuredEvent.AsObject,
  }
}

export class DetectModeResult extends jspb.Message {
  getOk(): boolean;
  setOk(value: boolean): void;

  getError(): string;
  setError(value: string): void;

  getMode(): string;
  setMode(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): DetectModeResult.AsObject;
  static toObject(includeInstance: boolean, msg: DetectModeResult): DetectModeResult.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: DetectModeResult, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): DetectModeResult;
  static deserializeBinaryFromReader(message: DetectModeResult, reader: jspb.BinaryReader): DetectModeResult;
}

export namespace DetectModeResult {
  export type AsObject = {
    ok: boolean,
    error: string,
    mode: string,
  }
}

export class AttributeNameRequest extends jspb.Message {
  getName(): string;
  setName(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AttributeNameRequest.AsObject;
  static toObject(includeInstance: boolean, msg: AttributeNameRequest): AttributeNameRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AttributeNameRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AttributeNameRequest;
  static deserializeBinaryFromReader(message: AttributeNameRequest, reader: jspb.BinaryReader): AttributeNameRequest;
}

export namespace AttributeNameRequest {
  export type AsObject = {
    name: string,
  }
}

export class AttributeNameResult extends jspb.Message {
  getValid(): boolean;
  setValid(value: boolean): void;

  getReason(): string;
  setReason(value: string): void;

  getExceedsRecommendedLength(): boolean;
  setExceedsRecommendedLength(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AttributeNameResult.AsObject;
  static toObject(includeInstance: boolean, msg: AttributeNameResult): AttributeNameResult.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AttributeNameResult, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AttributeNameResult;
  static deserializeBinaryFromReader(message: AttributeNameResult, reader: jspb.BinaryReader): AttributeNameResult;
}

export namespace AttributeNameResult {
  export type AsObject = {
    valid: boolean,
    reason: string,
    exceedsRecommendedLength: boolean,
  }
}

export class SpecVersionResult extends jspb.Message {
  getOk(): boolean;
  setOk(value: boolean): void;

  getError(): string;
  setError(value: string): void;

  getSpecversion(): string;
  setSpecversion(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SpecVersionResult.AsObject;
  static toObject(includeInstance: boolean, msg: SpecVersionResult): SpecVersionResult.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SpecVersionResult, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SpecVersionResult;
  static deserializeBinaryFromReader(message: SpecVersionResult, reader: jspb.BinaryReader): SpecVersionResult;
}

export namespace SpecVersionResult {
  export type AsObject = {
    ok: boolean,
    error: string,
    specversion: string,
  }
}

export class RoutingFieldsResult extends jspb.Message {
  getOk(): boolean;
  setOk(value: boolean): void;

  getError(): string;
  setError(value: string): void;

  getType(): string;
  setType(value: string): void;

  getSource(): string;
  setSource(value: string): void;

  getSubject(): string;
  setSubject(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): RoutingFieldsResult.AsObject;
  static toObject(includeInstance: boolean, msg: RoutingFieldsResult): RoutingFieldsResult.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: RoutingFieldsResult, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): RoutingFieldsResult;
  static deserializeBinaryFromReader(message: RoutingFieldsResult, reader: jspb.BinaryReader): RoutingFieldsResult;
}

export namespace RoutingFieldsResult {
  export type AsObject = {
    ok: boolean,
    error: string,
    type: string,
    source: string,
    subject: string,
  }
}

export class MatchFilterRequest extends jspb.Message {
  getEventJson(): string;
  setEventJson(value: string): void;

  getTypeExact(): string;
  setTypeExact(value: string): void;

  getTypePrefix(): string;
  setTypePrefix(value: string): void;

  getSourceExact(): string;
  setSourceExact(value: string): void;

  getSourcePrefix(): string;
  setSourcePrefix(value: string): void;

  getSubjectExact(): string;
  setSubjectExact(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MatchFilterRequest.AsObject;
  static toObject(includeInstance: boolean, msg: MatchFilterRequest): MatchFilterRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: MatchFilterRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MatchFilterRequest;
  static deserializeBinaryFromReader(message: MatchFilterRequest, reader: jspb.BinaryReader): MatchFilterRequest;
}

export namespace MatchFilterRequest {
  export type AsObject = {
    eventJson: string,
    typeExact: string,
    typePrefix: string,
    sourceExact: string,
    sourcePrefix: string,
    subjectExact: string,
  }
}

export class MatchFilterResult extends jspb.Message {
  getOk(): boolean;
  setOk(value: boolean): void;

  getError(): string;
  setError(value: string): void;

  getMatches(): boolean;
  setMatches(value: boolean): void;

  clearReasonsList(): void;
  getReasonsList(): Array<string>;
  setReasonsList(value: Array<string>): void;
  addReasons(value: string, index?: number): string;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MatchFilterResult.AsObject;
  static toObject(includeInstance: boolean, msg: MatchFilterResult): MatchFilterResult.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: MatchFilterResult, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MatchFilterResult;
  static deserializeBinaryFromReader(message: MatchFilterResult, reader: jspb.BinaryReader): MatchFilterResult;
}

export namespace MatchFilterResult {
  export type AsObject = {
    ok: boolean,
    error: string,
    matches: boolean,
    reasonsList: Array<string>,
  }
}

export class BatchDocument extends jspb.Message {
  getJson(): string;
  setJson(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): BatchDocument.AsObject;
  static toObject(includeInstance: boolean, msg: BatchDocument): BatchDocument.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: BatchDocument, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): BatchDocument;
  static deserializeBinaryFromReader(message: BatchDocument, reader: jspb.BinaryReader): BatchDocument;
}

export namespace BatchDocument {
  export type AsObject = {
    json: string,
  }
}

export class BatchItem extends jspb.Message {
  getIndex(): number;
  setIndex(value: number): void;

  getOk(): boolean;
  setOk(value: boolean): void;

  getError(): string;
  setError(value: string): void;

  hasEvent(): boolean;
  clearEvent(): void;
  getEvent(): StructuredEvent | undefined;
  setEvent(value?: StructuredEvent): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): BatchItem.AsObject;
  static toObject(includeInstance: boolean, msg: BatchItem): BatchItem.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: BatchItem, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): BatchItem;
  static deserializeBinaryFromReader(message: BatchItem, reader: jspb.BinaryReader): BatchItem;
}

export namespace BatchItem {
  export type AsObject = {
    index: number,
    ok: boolean,
    error: string,
    event?: StructuredEvent.AsObject,
  }
}

export class BatchParseResult extends jspb.Message {
  getOk(): boolean;
  setOk(value: boolean): void;

  getError(): string;
  setError(value: string): void;

  clearEventsList(): void;
  getEventsList(): Array<BatchItem>;
  setEventsList(value: Array<BatchItem>): void;
  addEvents(value?: BatchItem, index?: number): BatchItem;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): BatchParseResult.AsObject;
  static toObject(includeInstance: boolean, msg: BatchParseResult): BatchParseResult.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: BatchParseResult, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): BatchParseResult;
  static deserializeBinaryFromReader(message: BatchParseResult, reader: jspb.BinaryReader): BatchParseResult;
}

export namespace BatchParseResult {
  export type AsObject = {
    ok: boolean,
    error: string,
    eventsList: Array<BatchItem.AsObject>,
  }
}

