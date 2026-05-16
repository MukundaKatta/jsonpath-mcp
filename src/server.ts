#!/usr/bin/env node
/**
 * jsonpath MCP server. One tool: `query`.
 *
 * Query a JSON value with JSONPath expressions ($.foo.bar[*], $..price,
 * $.items[?(@.in_stock)]). Backed by `jsonpath-plus`.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { JSONPath } from 'jsonpath-plus';

const VERSION = '0.1.0';

export interface QueryOpts {
  json: unknown;
  path: string;
  result_type?: 'value' | 'path' | 'all';
}

export function query(opts: QueryOpts): unknown {
  // jsonpath-plus types its `json` option as string|number|boolean|object|any[]|null;
  // we accept any JSON-shaped input, so cast through `object`.
  return JSONPath({
    path: opts.path,
    json: opts.json as object,
    resultType: opts.result_type ?? 'value',
  });
}

const server = new Server({ name: 'jsonpath', version: VERSION }, { capabilities: { tools: {} } });

const TOOLS = [
  {
    name: 'query',
    description:
      'Apply a JSONPath expression to a JSON value. result_type: value (default), path, or all.',
    inputSchema: {
      type: 'object',
      properties: {
        json: { description: 'Any JSON value.' },
        path: { type: 'string', description: 'JSONPath, e.g. $.items[*].price' },
        result_type: { type: 'string', enum: ['value', 'path', 'all'], default: 'value' },
      },
      required: ['json', 'path'],
    },
  },
] as const;

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const { name, arguments: args } = req.params;
  try {
    if (name !== 'query') return errorResult('unknown tool: ' + name);
    const a = args as unknown as QueryOpts;
    return jsonResult({ matches: query(a) });
  } catch (err) {
    return errorResult('jsonpath failed: ' + (err as Error).message);
  }
});

function jsonResult(value: unknown) {
  return { content: [{ type: 'text', text: JSON.stringify(value, null, 2) }] };
}
function errorResult(message: string) {
  return { isError: true, content: [{ type: 'text', text: message }] };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  process.stderr.write(`jsonpath MCP server v${VERSION} ready on stdio\n`);
}
