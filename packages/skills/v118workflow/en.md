---
name: v118workflow
description: Use to adapt a novel or script into episodes, produce them stage by stage, or continue an existing series. Create episode outlines, scripts, character and scene assets, storyboards, and videos, organized in shared script and asset canvases plus a production canvas per episode. Follows the v1.1.8 stage-confirmation workflow. Text-only requests or skill discussions do not start production.
metadata:
  version: "1.1.3"
  displayName: Adapt Novels and Produce Episodic Videos
  author: Infinite Canvas
  github: https://github.com/HBAI-Ltd/Toonflow-app
---

# Adapt Novels and Produce Episodic Videos

Use English for explanations and newly created text unless the user requests another language. Preserve supplied dialogue, exact reference handles, tool parameters, and model-required fixed syntax. Supporting source material does not override the selected output language.

Translate the historical writing pipeline, production pipeline, and video workbench into current Infinite Canvas operations. Every stage follows **read approved inputs → complete this stage → save to its canvas → read back and verify → present → wait for user confirmation**. Chat summaries do not substitute for saved work; task starts do not establish media success.

This skill contains stage procedures and the knowledge they require. Read the current-stage reference, then its required `references/knowledge/` methods and selected genre/style. A few table summaries are not stage completion. Do not apply every genre/style at once. See [Source Mapping](references/sourceMap.md) for provenance and migration choices. Do not call old database/XML/subagent-only interfaces or automatically inherit another workflow's model routing.

Review content, quantities, provenance, and status against [Stage Output Contracts](references/sourceMap.md). Preserve historical core outputs and both production routes; canvas persistence, stage approvals, and media verification are migration requirements. Identical stage names or created files do not prove equivalent outputs, and separate AI runs are not guaranteed identical words/frames.

## Establish progress and canvases

1. Confirm project, current goal, inputs, and approved work. For a complete final script, first save it verbatim in the formal script canvas following initialization, then proceed to assets or the target episode. Invent no novel/events/skeleton retrospectively. Continue from the first unconfirmed stage.
2. Read [Project Setup](references/projectSetup.md) and [Canvas Execution](references/canvasOperations.md); verify tools, files, and current nodes. Reuse approved settings and ask only consequential gaps.
3. All canvases belong in the **user-selected project workspace**, not the skill installation. Default structure below may use already approved folders/names, but retain one script master, one asset master, and one production canvas per episode.

```text
Project Workspace/
  Canvases/
    Script.json
    Assets.json
    Episodes/
      Episode001.json
      Episode002.json
```

| Canvas | Sole authoritative content |
| --- | --- |
| Script | Settings, source index, chapter events, story skeleton/episode outline, adaptation strategy, final episode scripts, canvas path index |
| Assets | Base/derived assets, parent relationships, visual definitions, prompts, adopted images, episode usage |
| Episode N | Script provenance/working snapshot, direction, storyboard table, media reference nodes, storyboard images, video, adoption/delivery records |

Episode images are local references to the same asset files, not another authoritative asset library. Cross-canvas edges are unavailable: switch/read real asset outputs, then create local reference nodes. Keep generated files at host-returned locations; canvas-folder organization must not move media in `assets/`.

`addCanvas` has no directory argument. Follow [Canvas Creation and Filing](references/canvasOperations.md), move files through the tree, rediscover real paths/IDs, then write production content. Leaving every canvas at the workspace root is not completed filing.

## Stages and confirmation gates

Each row is a separate stage. Read its reference and required knowledge before execution. Reuse explicitly approved outputs with provenance. Skipping requires an applicable reason and explicit user choice. For projects without source adaptation, shorten/skip events, skeleton, or strategy according to actual inputs rather than inventing history.

| Step | Procedure | Output and current confirmation |
| --- | --- | --- |
| 0 | [Project Setup](references/projectSetup.md) | Script canvas: settings, scope, folders, canvas index |
| 1 | [Sources and Events](references/sourceEvents.md) | Script canvas: actual chapters/events; source coverage/facts |
| 2 | [Story Skeleton](references/storySkeleton.md) | Script canvas: premise, arcs, episode outline, deletion log; episode plan |
| 3 | [Adaptation Strategy](references/adaptationStrategy.md) | Script canvas: principles/boundaries; choices |
| 4 | [Episode Script](references/episodeScript.md) | Script canvas: complete current script; approve one episode before choosing the next |
| 5 | [Base Assets](references/baseAssets.md) | Asset canvas: characters/scenes/props and episode usage; reuse/new/design choices |
| 6 | [Asset Images](references/generateAssets.md) | Asset canvas: base prompts/images; generation approval, then image adoption |
| 7 | [Direction](references/directorPlan.md) | Episode canvas: scenes, dialogue counts, emotion, transitions, cautions |
| 8 | [Derived Assets](references/deriveAssets.md) | Asset canvas: variants and parents; all/partial/adjust/skip decision |
| 9 | [Asset Images](references/generateAssets.md) | Asset canvas: adopted variants; explicitly record no-variant skip |
| 10 | [Storyboard Table](references/storyboardTable.md) | Episode canvas: scene → segment → shot, actual asset mapping, checks |
| 11 | [Storyboard Panel](references/storyboardPanel.md) | Episode canvas: actual-mode text/reference/image/video nodes; quantities/durations/connections |
| 12 | [Storyboard Images](references/storyboardImages.md) | Episode canvas: first-frame images; record the reason when text/multi-reference mode skips them |
| 13 | [Video and Delivery](references/videoProduction.md) | Episode canvas: prompt/settings → generated output → adoption/delivery, three separate gates |

Repeat steps 7–13 per episode. After finishing one, let the user choose the next; one episode is not the whole series. Base assets may be completed in approved-script batches but remain in the same master asset canvas.

## Apply knowledge within stages

| Work | Required knowledge | Concrete output |
| --- | --- | --- |
| Skeleton/adaptation/scripts | [Screenwriting](references/knowledge/scriptCraft.md) and selected [Narrative Genre](references/knowledge/narrativeGenres.md) | Script canvas: desires/obstacles, arcs, emotional/information progression, twists/foreshadowing, adaptation choices |
| Base/derived asset design/prompts | [Asset Design](references/knowledge/assetDesign.md) and selected [Art Style](references/knowledge/visualStyles.md) | Asset canvas: identity anchors, space/light/color, prop structure, variants, executable prompts, adopted versions |
| Direction/storyboards | [Shot Craft](references/knowledge/shotCraft.md), project genre, and selected style for visual expression | Episode canvas: intent, visible information, blocking/eyelines, rhythm, continuity in actual shots |
| Storyboard images/review | [Image Prompts](references/knowledge/imagePromptCraft.md) and selected style | Episode canvas: first-frame state, framing/orientation, actual references, adapted prompts/checks |
| Video prompts/review | [Video Prompts](references/knowledge/videoPromptCraft.md) and the style's video methods | Episode canvas: mode-specific timing/action/sound, actual bindings, dynamic continuity, segment review |

Genre organizes information/emotion/shots; style governs shape/material/color/light. Choose independently: suspense is not an art style and clay is not a narrative genre. Reuse explicit choices; otherwise propose reasoned options and record confirmed settings.

Knowledge grants no extra story authority. During approved adaptation, use structural/twist methods within scope. After script approval, genre methods only present established events: add no red herrings, changed endings, reordered events, or extra scenes. Style examples must not override identity, world, or references.

When generic methods, genre exceptions, and historical templates conflict, prioritize approved content and real tool capabilities, then fitting methods. Do not impose historical linear pacing, fixed shot lengths, or skin/height templates universally. Consult the knowledge files for commercial drama, ensembles, restraint, and special variants.

Write only adopted methods and resulting decisions into the canvas: which clue is hidden, why a character stays in profile, where key light originates, or which parent-image traits remain. Do not copy the entire knowledge book or merely note that a skill was consulted.

## Confirm each stage

- Save the complete reviewable stage output, read back to verify, and fit the current results. Split long formal text by chapter/episode/scene rather than truncating it.
- Maintain a Stage Record text node with stage/episode, input version, output node IDs, checks, status, and pending decisions. Distinguish draft, awaiting confirmation, confirmed, generating, failed, awaiting review, and skipped.
- Present canvas name/relative path, results, concrete questions, and next stage. Use available `askUser` for proceed/change/redo or ask in chat and wait. Stop at this stage until the answer; do not pre-create next-stage nodes or generate media.
- Record the answer, change only requested items, read back, and reconfirm. Passing checks, cancelled/skipped questions, timeouts, or silence are not approval. Continue advances only the currently pending next stage.
- Reuse existing approved settings/assets/concrete batches without repeated permission. Explicit multi-episode same-stage approval may be executed and presented together; absent it, confirm episode by episode. The overall project goal is not unrestricted pipeline approval.
- Generation plans include actual model/mode, objects/counts, full prompts, references, duration/ratio/resolution, and known/unknown cost. Call only within confirmed batch scope. Verify actual state after failure; extra candidates, changed models, and charged retries need covered authority.

## Continuation, revision, and failure

Continue from canvas content and recorded decisions, not chat memory alone. Present existing unconfirmed outputs for approval instead of regenerating them. Mark only genuinely affected downstream work after upstream changes: episode direction/storyboards/videos after script edits, or dependent shots/videos after asset-version changes. Preserve original outputs/adoption records and unaffected approvals; do not remake the whole series.

For missing sources, unfiled canvases, absent tools, or write failures, identify unfinished work and recovery. Chat text, empty nodes, invented paths, old outputs, and task starts do not establish completion. Stay within the current request; discussing/editing this skill does not start a production project.
