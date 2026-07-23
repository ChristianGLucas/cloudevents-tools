# cloudevents-tools

Deterministic parsing, spec-conformance validation, and structural inspection
of [CloudEvents](https://cloudevents.io/) (CNCF CloudEvents v1.0) — the
standardized event envelope used by Knative, serverless platforms, and
webhook/eventing systems. Built for the [Axiom](https://axiomide.com) marketplace
(handle `christiangeorgelucas`).

## Use it from your agent or app

Every node in this package is a **live, auto-scaling API endpoint** on the
[Axiom](https://axiomide.com) marketplace — call it from an AI agent or your own
code, with nothing to self-host.

**📦 See it on the marketplace:**
https://dev.axiomide.com/marketplace/christiangeorgelucas/cloudevents-tools@0.1.0

**Hook it up to an AI agent (MCP).** Add Axiom's hosted MCP server to any MCP
client and every node becomes a typed tool your agent can call — search the
catalog, inspect a schema, and invoke it directly.

```bash
# Claude Code
claude mcp add --transport http axiom https://api.axiomide.com/mcp \
  --header "Authorization: Bearer $AXIOM_API_KEY"
```

Claude Desktop, Cursor, or any config-based client:

```json
{
  "mcpServers": {
    "axiom": {
      "type": "http",
      "url": "https://api.axiomide.com/mcp",
      "headers": { "Authorization": "Bearer YOUR_AXIOM_API_KEY" }
    }
  }
}
```

**Call it from the CLI.**

```bash
axiom invoke christiangeorgelucas/cloudevents-tools/ParseEvent --input '{ ... }'
```

**Call it over HTTP.**

```bash
curl -X POST https://api.axiomide.com/invocations/v1/nodes/christiangeorgelucas/cloudevents-tools/0.1.0/ParseEvent \
  -H "Authorization: Bearer $AXIOM_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{ ... }'
```

> Input/output schema for each node is on the marketplace page above, or via
> `axiom inspect node christiangeorgelucas/cloudevents-tools/ParseEvent`.

### Get started free

Install the CLI:

```bash
# macOS / Linux — Homebrew
brew install axiomide/tap/axiom

# macOS / Linux — install script
curl -fsSL https://raw.githubusercontent.com/AxiomIDE/axiom-releases/main/install.sh | sh
```

**Windows:** download the `windows/amd64` `.zip` from the
[releases page](https://github.com/AxiomIDE/axiom-releases/releases), unzip it,
and put `axiom.exe` on your `PATH`.

Then `axiom version` to verify, `axiom login` (GitHub or Google) to authenticate,
and create an API key under **Console → API Keys**. Docs and sign-up at
**[axiomide.com](https://axiomide.com)**.

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
