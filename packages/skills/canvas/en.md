---
name: canvas
description: Use to add, connect, move, rename, or delete nodes in Infinite Canvas, arrange layouts, switch canvases, or invoke node functions. Perform and verify changes through canvas tools. Use a production skill for a complete story or video project.
metadata:
  version: "2.1.3"
  displayName: Build and Organize Canvas Nodes
  author: Infinite Canvas
  github: https://github.com/HBAI-Ltd/Toonflow-app
---

# Build and Organize Canvas Nodes

Use English for explanations and newly created text unless the user requests another language. Preserve supplied dialogue, exact reference handles, tool parameters, and model-required fixed syntax. Supporting source material does not override the selected output language.

Control the running canvas through the enabled canvas-operations tool. It requires canvas context; when missing, ask the user to open the target project's canvas and enable the tool. Never bypass it with canvas JSON edits.

## Procedure

1. Read known node IDs directly. Otherwise inspect the active overview with `getCanvas({})` and locate by name/type/selection with `findCanvasNodes`. Request `getCanvas({ include: ["nodeTypes"] })` only when adding nodes.
2. Select the requested operations below and await each result. Reuse returned IDs; never invent IDs, types, ports, or functions.
3. Read necessary fields with `getCanvasNodes` and local connections with `getCanvasEdges`. For content changes, obtain a function's description and complete `parameters` through `getNodeTools`, then invoke through `nodeTools`.
4. After structural changes, use `fitCanvas` when needed and verify only affected nodes/names/connections. `arrangeCanvas` already fits the viewport. Report only completed operations.

For story/video production, first read [Production Stages and Confirmation](references/videoProduction.md). Default to the currently approved stage: gather information, present results, ask about changes, and wait for explicit continuation. A short-film request does not authorize creating all storyboard/generation nodes at once; failed questions, skips, and silence are not approval.

Normally derive character/scene/prop assets from the complete current script, then split into multi-shot segments, one video prompt/node per segment, using assets directly for multi-reference generation. Before asset prompts read [Asset Image Rules](../script/references/assetGuide.md); before video prompts read [Segment Production Guide](../script/references/productionGuide.md). Do not replace the facial close-up and complete front/side/back views with a generic story image.

Links are relative to this document. Locate cross-skill `script` references through actual `available_skills` locations. If missing, explain the dependency and continue only independent structural operations rather than inventing rules from a description.

Examples mean a direct tool call with its parameter object. Do not wrap tools in `{ name, args }`; only `nodeTools` itself uses `name` and `args`.

## Read the canvas

All five read tools accept optional `canvasId` to verify the active canvas, not read an inactive one. Each response is limited to 64 KiB; there is no whole-canvas snapshot.

| Tool | Parameters and results |
| --- | --- |
| `getCanvas` | Defaults to `id`, node/edge/selection counts, and `viewport`. `include: ["canvases"]` returns `{ id, name }`; `include: ["nodeTypes"]` returns `availableNodeTypes` entries `{ type, label }`. Both lists share pagination: `limit` default 30, maximum 100. |
| `findCanvasNodes` | Filter by `query` (ID/full name), `types` (up to 20), or `selectedOnly`; without filters, list pages. Returns summaries in `nodes`, names previewed up to 512 characters. `limit` default 30, maximum 100. |
| `getCanvasNodes` | `nodeIds`: 1–20 unique IDs. `fields` defaults to `label/type/position`; optionally select `ports/data/outputs`. `dataKeys` selects up to 20 own properties. Returns projected `nodes`. |
| `getCanvasEdges` | Optional `nodeIds`, maximum 20. `direction`: `incoming/outgoing/both`, default `both`; omit IDs to traverse all edges. `limit` default 100, maximum 200. Returns `edges`. |
| `getNodeTools` | 1–20 unique `nodeIds`; optional `names` selects up to 20 exact function names. Returns `nodeTools` with `nodeId/name/description/parameters`. `limit` default 20, maximum 50. Schemas are not truncated; oversized entries cause explicit errors. |

For `hasMore/nextCursor`, retain all original query arguments and replace only `cursor`. Node filtering and edge reads scan at most 2000 items per page: empty results with `hasMore: true` are not completion. `totalNodes/totalEdges` are whole-canvas counts, not matches. Do not parse or construct cursors; restart invalid queries. Selection filtering reflects each page's live selection, not a frozen snapshot.

Individual nodes may be large. `getCanvasNodes.path`, e.g. `["data","promptModel"]` or `["outputs","text","value"]`, returns the selected `value`. The first segment is one of six projection fields; `ports` maps to `data.handles`. Objects/arrays use `valueOffset/valueLimit`, default 0/30, maximum 100. Strings use `textOffset/textLimit`, default 0/1000, maximum 4000 characters. Positive offsets require `path`. Only own properties are readable.

Paths allow at most 64 segments, 256 characters per segment including empty JSON keys, and 2048 JSON UTF-8 bytes. `pathDepthLimit/pathBytesLimit` means incomplete expansion; `keyTooLong` supplies `nextOffset` to continue after the skipped key.

Top-level cursors continue nodes. A node's `truncated` describes unread values. For each truncation, query only its owning node and use the returned path/offset without the original cursor:

- `text`: use `nextOffset` as `textOffset`; `entries`: use it as `valueOffset`. No `nextOffset` means the path ended; a marker may remain because only its latter portion was returned.
- `depth/budget`: start a narrower detail query at that path, without the old cursor.
- `pathDepthLimit/pathBytesLimit/keyTooLong/circular`: full expansion is unavailable. A long key may be skipped via `nextOffset`, but its value remains unread. Repeating hard-limit queries will not recover it.

Read needed fields first, then complete truncated paths instead of expanding the whole canvas. Use file tools for known text files; whole-text review includes initial and continued portions. Whole-canvas work retains only the current batch, accumulated summary, and cursor. Add/delete operations may invalidate traversal; rediscover and compare processed IDs/results to avoid duplicates. Rediscover relevant functions after adding/deleting nodes or switching canvases.

## Canvas management

| Tool | Parameters | Behavior |
| --- | --- | --- |
| `addCanvas` | `{ name? }` | Creates/switches to a blank canvas; an omitted name uses an available automatically numbered name. Returns the active overview. |
| `switchCanvas` | `{ canvasId }` | Waits for pending saves, switches, and returns the new active overview. |
| `renameCanvas` | `{ canvasId?, name }` | Defaults to active canvas; also renames its JSON file. Returns the resulting active overview. |

Names must be legal filenames of 1–120 trimmed characters, without `.json`, separators, illegal/control characters, trailing dots, or system-reserved names. Existing files are not overwritten. Canvas IDs depend on filenames: use returned IDs after renaming. Renaming an inactive canvas does not switch to it. After successful creation/switching, subsequent calls target the newly active canvas.

## Nodes and connections

| Tool | Parameters | Behavior |
| --- | --- | --- |
| `addNode` | `{ type, position: { x, y }, label? }` | Adds/returns a node; discover functions separately. Defaults label to the type label. |
| `moveNodes` | `{ moves: [{ nodeId, position: { x, y } }] }` | Batch move, returns `nodes`; immovable nodes reject it. |
| `renameNodes` | `{ renames: [{ nodeId, label }] }` | Updates display labels, returns `nodes`, preserves IDs. |
| `deleteNodes` | `{ nodeIds: [...] }` | Removes nodes/edges; returns `nodeIds`, `removedEdgeCount`, up to 100 `removedEdgeIds`, and `truncated`. |
| `connectNodes` | `{ connections: [{ source, sourceHandle, target, targetHandle }] }` | Connects ports; returns `{ edges }`, reusing identical existing edges. |
| `deleteEdges` | `{ edgeIds: [...] }` | Removes edges; returns `edgeIds` and related `nodes`. |
| `selectNodes` | `{ nodeIds: [...] }` | Replaces selection; returns `selectedCount`, up to 100 `selectedNodeIds`, and `truncated`. Empty clears selection. |
| `arrangeCanvas` | `{}` | Arranges all top-level nodes left-to-right using real sizes/edges; children move with parents; fits viewport. Returns `arrangedCount`, up to 100 `arrangedNodeIds`, `truncated`, and `viewport`. Preserves content/connections/selection and triggers no generation. |
| `fitCanvas` | `{ nodeIds?: [...] }` | Fits all or selected targets; returns `fitted`, `viewport`, `nodeCount`, `truncated`, and up to 100 `nodeIds` when supplied. |

Truncated operation receipts abbreviate IDs, not execution. Do not repeat mutations to obtain complete receipts; verify affected scope with reads.

### Constraints

- `position` uses canvas coordinates, not screen pixels, with finite numbers. Grid snapping may round positions; returned positions govern.
- Node labels contain 1–200 trimmed characters.
- `addNode` accepts only current `availableNodeTypes`, no arbitrary `data` or custom ID. Use registered functions for content/settings.
- Batch moves/renames/deletions/connections contain 1–64 items, even for a single item. Validation failure prevents the batch, but runtime exceptions do not automatically undo side effects; reread before recovery.
- Top-level tool objects reject undeclared fields. `nodeTools.args` must also match the function schema.
- Node, canvas, and edge IDs are distinct; labels never substitute for IDs.

### Connection rules

Read both endpoints with `getCanvasNodes({nodeIds:[...],fields:["ports"]})`. Each port has `id/type/dataType` and possibly `label`. `source/target` are node IDs; handles are their own port IDs.

- Connect only `type:"source"` outputs to `type:"target"` inputs. Use actual port IDs, never guessed display text; verify ownership even when IDs match across nodes.
- Canvas/target validation may reject otherwise matching types. Inspect current ports/functions after refusal; never force connections through JSON.
- Scripts/storyboards are planning text, not direct generator inputs. Confirm assets and convert every shot of the current segment into one dedicated video prompt. Connections carry actual used media only.
- Verify the target's real reference order after connecting media, then write `{{ref N}}`, asset names, and responsibilities with `node:setPrompt`. Connection success does not establish prompt binding; see [Production Conversion](references/videoProduction.md).
- Respect restrictions on connection/selection/movement/deletion. Delete children before parents or in the same approved batch. Do not expand deletion to unrequested content.

## Invoke node functions

Use `nodeTools({nodeId,name,args})`. Node ID and name must come from the same listing entry, preserving the complete `node:` prefix. Construct arguments from its full JSON Schema, including `{}` for no-argument calls. Do not assume all nodes support the same prompt/import/generation functions.

Discover the real `node:getConfig` schema before configuration work. Default reads show current settings/selected-model capabilities. Request `{includeModels:true}` only for selection/alternatives when supported; older plugins follow their schema. Empty `selectedModel` means unknown capability. After `node:setConfig`, verify the result. Setting changes do not generate media; retain already approved valid settings.

Before image/video generation, show actual model, objects/counts, settings, prompts, references, and price, then obtain explicit approval for compute consumption; mark unknown prices. Samples, single images, additions, regeneration, and potentially charged retries remain subject to scope; a concrete batch can be approved once. Use available `askUser` or wait for an explicit chat reply. For unspecified image models, prefer available gpt-image as required by the host; node defaults are not user selection. Confirm alternatives if unavailable.

Return values depend on the function; no return is `null`. The five read tools' 64 KiB limit does not apply to node-function business results. Function execution success is not media-generation success: inspect results/status. Newly returned node IDs can be used immediately for discovery/invocation without ending the turn.

## Common tasks

- **Convert a production plan:** Read [Video Production Conversion](references/videoProduction.md) for text nodes, asset reuse, real dependencies, and generation completion. General parameters still follow current schemas.
- **Create a canvas:** Call `addCanvas({name:"Storyboard Draft"})`, discover `availableNodeTypes`, add the requested type at e.g. `{x:120,y:160}`, retain its returned ID, discover/write content, then fit.
- **Connect existing nodes:** Find by requested names/selection unless IDs are known. Resolve duplicate-name ambiguity. Read ports, fill actual IDs/handles into `connections`, verify returned endpoints, and optionally fit both nodes.
- **Read a segment such as G51:** Find with `findCanvasNodes({query:"G51",limit:20})`; replace TARGET_ID below with its actual ID. Read `getCanvasNodes({nodeIds:["TARGET_ID"],fields:["label","data","outputs"],dataKeys:["prompt","referenceOrder"]})`. Omitted fields are not empty. For long prompts use `path:["data","prompt"],textLimit:4000` and returned offsets rather than inferred lengths. Query incoming edges with `direction:"incoming",limit:100`; discover functions with `limit:20`.
- **Arrange:** Only for an explicit whole-canvas request, call `arrangeCanvas({})` once. It accepts no local scope. Unmeasured/immovable nodes cause explicit errors; do not guess sizes/bypass restrictions. Empty canvases return no IDs and perform no fit/layout. For local work, read actual positions and use `moveNodes`, then optionally scoped `fitCanvas`. Viewing alone requires fitting, not rearrangement. Never delete/recreate nodes instead of moving them.

## Failure handling

Rediscover disabled types, missing ports, and unregistered functions through their respective tools rather than guessing alternatives. After closure, manual project/canvas switching, or invalid context, stop using old IDs and ask for a request from the target canvas. Timeouts, cancellation, or save failure do not prove rollback; if context remains valid, reread for already-created nodes/edges/canvases before retrying. Tools await necessary saves; do not write JSON separately. There is no generic delete-canvas, arbitrary-data-write, or arbitrary-viewport-setting interface.
