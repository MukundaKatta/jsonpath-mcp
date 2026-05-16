# jsonpath-mcp

[![npm](https://img.shields.io/npm/v/@mukundakatta/jsonpath-mcp.svg)](https://www.npmjs.com/package/@mukundakatta/jsonpath-mcp)
[![mcp](https://img.shields.io/badge/protocol-MCP-blue.svg)](https://modelcontextprotocol.io)

MCP server: query JSON with JSONPath. Backed by `jsonpath-plus`. Supports
recursive descent (`$..price`), filter expressions (`$.items[?(@.in_stock)]`),
and result-type variants (value / path / all).

## Tool

### `query`

```json
{ "json": { "books": [{ "title": "A", "price": 5 }, { "title": "B", "price": 12 }] },
  "path": "$.books[?(@.price < 10)].title" }
```

→ `{ "matches": ["A"] }`

## Configure

```json
{ "mcpServers": { "jsonpath": { "command": "npx", "args": ["-y", "@mukundakatta/jsonpath-mcp"] } } }
```

## License

MIT.
