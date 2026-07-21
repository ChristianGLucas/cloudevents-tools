# cloudevents-tools

Deterministic parsing, spec-conformance validation, and structural inspection
of [CloudEvents](https://cloudevents.io/) (CNCF CloudEvents v1.0) — the
standardized event envelope used by Knative, serverless platforms, and
webhook/eventing systems. Built for the [Axiom](https://axiom.dev) marketplace
(handle `christiangeorgelucas`).

## What this is

A CloudEvent is treated as JSON plus CloudEvents-spec-semantic extraction:
parse a structured-mode event into its attributes and data, validate against
the v1.0 spec's required-attribute and type rules, pull out
required/optional/extension context attributes individually, classify and
extract the `data` payload (JSON / text / base64), convert between
binary-mode (`ce-`-prefixed HTTP headers + body) and structured-mode (a
single JSON document) in both directions, detect which mode a headers+body
pair is in, validate a bare attribute name against the CloudEvents naming
rule, and check a routing-style structural filter (type/source/subject)
against an event. Batch documents
(`application/cloudevents-batch+json`) are parsed as a whole, with a single
malformed event reported per-item rather than failing the batch.

## Nodes

| Node | Description |
|---|---|
| `ParseEvent` | Parse a structured-mode CloudEvent JSON document. |
| `ValidateEvent` | Validate against the v1.0 spec's structural rules. |
| `ExtractRequiredAttributes` | id, source, specversion, type. |
| `ExtractOptionalAttributes` | datacontenttype, dataschema, subject, time. |
| `ExtractExtensionAttributes` | Every attribute outside the spec's context set. |
| `ExtractData` | Classify/extract the `data` payload (json/text/base64/empty). |
| `BinaryToStructured` | Convert ce-* headers + body into structured JSON. |
| `StructuredToBinary` | Convert structured JSON into ce-* headers + body. |
| `DetectMode` | Determine structured/batch/binary/unknown from headers. |
| `ValidateAttributeName` | Check a bare name against the naming rule. |
| `GetSpecVersion` | Extract just `specversion`. |
| `ExtractRoutingFields` | type/source/subject in one call. |
| `MatchFilter` | Pure structural routing-filter match. |
| `BatchParse` | Parse a CloudEvents batch (JSON array) document. |

## Library

Uses the CNCF [`cloudevents/sdk-javascript`](https://github.com/cloudevents/sdk-javascript)
(Apache-2.0) JSON Schema for v1.0 structural validation only — never its
`CloudEvent` object model (whose constructor silently fabricates a missing
`id` via a random UUID and a missing `time` via the wall clock) and never its
HTTP transport/emit surface. An event is always caller-supplied text; this
package never fetches a `dataschema`/`source` URI, never touches the
network, never reads the wall clock, and never generates randomness — a
missing `id` or `time` is reported, never invented.

## License

MIT — Copyright (c) 2026 Christian George Lucas.
