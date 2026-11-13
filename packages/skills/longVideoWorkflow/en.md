---
name: longVideoWorkflow
description: Produce general videos longer than 30 seconds on the current Infinite Canvas canvas, generating segments within actual model capabilities and composing them in sequence. Use for production, continuation, or revision; respect explicitly chosen alternative workflows.
metadata:
  version: "1.3.1"
  displayName: Long Video Workflow
  author: Infinite Canvas
---

# Long Video Workflow

Use English for explanations and newly created text unless the user requests another language. Preserve supplied dialogue, exact reference handles, tool parameters, and model-required fixed syntax. Supporting source material does not override the selected output language.

Turn an idea, story, or script into multiple clips and one composed video. For text/planning-only requests, deliver that content without canvas operations or generation. Respect an explicitly different workflow and explain conflicting duration/requirements.

## Mode and initial authorization

Ask for interactive or automatic mode unless already selected. Interactive mode approves the concrete plan below. In automatic mode, confirm together: goal; video duration/ratio/resolution/sound and necessary image settings; image/video providers and models or ordered candidates; total generation-call cap including initial attempts/retries; and per-object failed-attempt retry cap, possibly zero. Explain that creative details and complete prompts follow authorization and that compute consumption is unknown without a queryable price. Obtain explicit approval for that scope and automatic generation, collecting missing details together. Silence, skips, and cancellation grant no authority. Scope applies only to this task.

Within scope, finalize scripts, prompts, and actual node plans without stage approvals. Select the first available candidate meeting all specifications/reference capabilities. Before generation, verify the plan against authorization and reserve enough remaining calls for all initial attempts; record each object/attempt. Before each call, recheck model, settings, prompt, actual references, remaining total, and per-object retries. Every generation attempt, including explicit failures, counts. Retry only a definite current-attempt failure with sufficient total cap, object retries, and reserved initial calls for unstarted objects. Never retry a running/cancelled task, expired wait, uncertain start, or unknown status. Pause and preserve results for overruns, missing assets, unsupported capabilities, or unverifiable dependencies. Mid-task edits do not extend authority; pause for uncertain content/dependencies or scope. Readable successful outputs may feed planned downstream steps without claiming human review/adoption. Keep the canvas open; continuation after closing/switching is not guaranteed.

## 1. Whole-film and segment planning

Establish existing content, whether total duration is strict, style, ratio, and necessary assets. Preserve story facts, order, and explicit constraints. Ask only consequential, non-inferable gaps. Plan the entire story before segmenting at natural beats. The segment table includes global number, story coverage, estimated length, initial/final states, actual required references, sound, and prompts. A segment may contain multiple shots; keep character/scene/prop information self-contained across segments.

For pet commerce, first discover `videoPromptAdapter` and its actual scope through `skillOperator(action=list)`, then read its main document and `references/petCommercePlanning.md`. Establish the whole-film host, product facts, verbatim speech, shot performance, and continuity. Do not impose commerce or pets on ordinary films. Without `skillOperator`, use this turn's actual catalog; pause dependent planning when required material is unreadable.

For Seedance 2.5, complete the whole-film script, asset inventory, and segment table first; then write each segment's full prompt within actual supported duration/resolution. Pet commerce uses `petCommercePromptSd25` plus `references/shotGuide.md`, discovered by actual name/scope. Ordinary long videos use the globally installed official `sd25-pe`: discover with `action=list, scope=global` and read using returned name plus `scope=global`, avoiding a same-name workspace override. Without the operator, use actual catalog locations. Follow official skill update/failure behavior: when networked npx execution is unavailable, report update failure and continue with its existing version as directed; claim no execution/update and install no substitute. Pause dependent finalization if the necessary skill is truly unreadable. Supply whole-film context, this segment's story/verbatim lines/local timing, starting/ending state, voice persona, and actual asset responsibilities. Optimize only this segment, preserving story/speech without repeated intros/endings. List settings separately; node prompts contain only submittable content. This route does not read or execute `workflow` PART A, A9, or its prompt restrictions.

Before later-segment tail frames exist, interactive mode shows complete prompt templates before authorization, identifying the preceding segment's current-attempt tail frame, other assets, sources, responsibilities, and binding rules. Automatic mode records templates and verifies initial authority. Once a real tail frame exists, fill only authorized bindings; invent no reference numbers. Stop for actual frame/plan conflicts or out-of-scope edits and handle them according to mode.

Seedance 2.0 retains `workflow` PART A, long-video first/tail-frame exceptions, A9 format, and execution boundaries.

For other models, select the actual model/version/mode, discover/read `videoPromptAdapter`, and let it choose official, third-party `videoPrompting`, or generic guidance. Follow actual-scope/guide requirements. Adapt each established segment while preserving story, exact lines, asset identity, and authorization; mark generic fallback unverified. Pause dependent finalization if the adapter main file is unreadable. Model changes require re-adaptation and authorization checks, not silent substitutions or extra calls.

Unknown speech, animal lip-sync, or shot-timing quality is not lack of support: preserve goals, mark unverified, and attempt within authorization. Treat only explicitly unsupported necessary sound/media/execution as a conflict; never silently use silence or narration instead.

Thirty seconds defines this workflow's entry, not model capability. Query real `durationResolutionMap`, ratios, sound, reference types/counts/modes and choose supported combinations. If a strict total cannot be met exactly, show feasible combinations or an executable trim plan and wait for a choice rather than shortening story or trimming silently. For non-strict totals, explain expected/actual differences.

## 2. Canvas and assets

Seedance 2.5 execution/delivery uses sections 2–5 here, without `workflow` execution references or PART A; live schemas govern calls. Other models still read `workflow`'s `references/stateAndDelivery.md`; Seedance 2.0 also reads `references/canvasExecution.md` after prompt finalization. Discover actual workflow name/scope and read with that same scope; verify/retry missing references. Inspect the current canvas and ledger first. Continuation reuses actual nodes/settings/results, not name-based assumptions about success/adoption.

Discover node types with `getCanvas`, ports/outputs/necessary fields with `getCanvasNodes`, paginated connections with `getCanvasEdges`, and functions with `getNodeTools`. Operate through `addNode`, `connectNodes`, and `nodeTools` using actual schemas/IDs/types/ports. Continue cursors/truncation as specified. Preserve existing nodes; never edit canvas JSON directly.

For `{{ref N}}`, read source outputs from actual target incoming edges. Sort each corresponding port by target `referenceOrder`, whose key is `encodeURIComponent(JSON.stringify([source,sourceHandle]))`; unlisted edges follow in existing incoming order. Connections without outputs still occupy slots and block generation. Pause when actual references/provider mapping cannot be verified; never guess.

Outside existing content, create whole-film/segment-table text nodes, one video generator per segment, and a composition node, using returned types/ports/functions. Write text through text-node tools and prompts through generators' `node:setPrompt`; do not connect text and duplicate prompt content. Reuse assets first and create only necessary missing image generators. Connect references only after real outputs exist and verify types/order/files. Names are not media.

From segment two, continue sequentially from the immediate preceding segment's verified current-attempt tail frame. With other Seedance 2.5 assets, connect the tail plus required character/pet/product images; bind `node:waitLastFrame`'s actual node/port/path/video URL/attempt through `node:setContinuityReferenceBinding({binding:{source,sourceHandle,path,videoNodeId,videoUrl,attemptId}})`. `node:getConfig` must read back the identical origin/video/attempt, a multi-reference mode accepting all assets, a real `continuityReferenceIndex`, and no `continuityReferenceError`. The corresponding `{{ref N}}` explicitly controls the starting image while other references control identity/product/scene. Reference continuity is not a hard first frame; disclose possible first-frame differences in plan and delivery. Binding and generation revalidate origin/files; stop on invalidity without dropping other references or reusing old tails.

For Seedance 2.5 with no other references and supported first-frame mode, and for Seedance 2.0/other models, use `node:setFirstFrameBinding`: read back identical binding, `endFrameOptional`, identical `firstFrame.path`, and no `firstFrameError`. Seedance 2.5 with only multi-reference support may use the reference binding even without other assets, disclosing no hard-first-frame guarantee. Preserve assets and report incompatible modes/inputs; neither a `startFrameOptional` single image nor an ordinary reference proves a verified hard first frame.

## 3. Plan and authorization

Discover `node:getConfig` through `getNodeTools`. For selection/alternatives use `{includeModels:true}` when supported, otherwise the real older schema. Routine checks use empty arguments for `config`, `selectedModel`, and `matchingModes`; verify older-plugin catalogs. Pause if the selected model is absent.

Query and configure each node's actual provider, model, duration, resolution, ratio, mode, and sound. Recheck modes after connecting real references. Explain missing capabilities and preserve results instead of silently changing models or dropping assets.

Before interactive media generation, show every pending asset and segment's full prompt/model/settings, reference source/responsibility, counts, and reliable queryable prices, otherwise unknown cost. Pending references identify designated nodes' current-attempt successful outputs. Obtain explicit approval, then reread nodes/settings/prompts/connections/pre-call outputs. Show consequential differences and reauthorize affected calls. No authority means no generation. Automatic mode records the full concrete plan and verifies initial scope before calls; it requires no separate approval of final prompts.

## 4. Generate and verify

Use actual `node:generateImage`, `node:generateVideo`, and status tools, generating missing assets first and video segments sequentially. Retain `attemptId` and `startedAt`; call the real `node:waitGeneration({attemptId})`. Internal combined waits check image call records once at minute 5 then wait up to 2.5 more minutes, and video records once at minute 10 then up to 5 more. Return immediately on success/failure, without model requests every 30 seconds. For `waitBudgetExceeded`, report still running with waiting limit reached, preserve the task, and stop dependent work without automatically waiting again/cancelling/regenerating. On continuation query the original task first. Older plugins follow their real wait contract, with limitations stated.

After a segment's current-attempt `succeeded`, call `node:waitLastFrame`. Connect/bind the next segment only after tail success, matching attempt ID, matching current video URL, and readable returned node/image. For pending/running tails, continue waits of at most 30 seconds each, up to 10 minutes total, then report pending continuation. Pause for failure/cancellation, missing or mismatched sources, or visible conflict with the approved plan. With the user's choice, retry extraction through `node:extractLastFrame` on the current video without regenerating the video. If no wait tool exists, read status and ask for later continuation; assume no background wake-up. Keep the canvas open. Cancelled/unknown/unmounted states stop dependencies and preserve results. Definite generation failures stop interactive work; automatic retries obey initial caps.

Record each attempt's nodes, prompts, settings, references, pre-call outputs, authorization, and terminal state. Only current-attempt `succeeded` plus readable output is this task's result. Stop adoption for manual replacement or unverifiable ownership. On later continuation, rediscover canvas/status and verify before starting anything to avoid duplicates.

## 5. Ordered composition and delivery

After every planned clip is valid, connect actual VIDEO outputs to composition and paginate incoming-edge checks. Discover actual functions. Read all connections/clips through `node:getComposeState`, then apply the segment table using `node:setClipOrder({sources:[{source,sourceHandle}, ...]})`. Include every connected source exactly once, each with output. Resolve uploads, gaps, duplicates, and invalid sources and reread rather than guessing order.

For a chosen strict-duration trim plan, ask the user to set each clip's in/out times in the composition node, then reread/verify; claim no automatic trimming. Match read-back order, sources, paths, and trims to the segment table and successful attempts. Call `node:startCompose({clips:[{source,sourceHandle,path,start,end}, ...]})` with complete ordered read-back clips, then `node:waitCompose({attemptId})` using its returned attempt. Each wait is at most 30 seconds; continue running states up to 10 minutes total, then report pending continuation. Stop and preserve clips/older output for changed inputs, failure, cancellation, uncertain ownership, or absent tools. Only matching-attempt succeeded, `inputsMatchAttempt: true`, a plan-matching snapshot, and readable output establish this task's final film.

Deliver segment/composition nodes, actual output paths, and verifiable actual duration. Distinguish generation success, adoption, and review. Mark uninspected images, sound, seams, or timing and ask the user to play the film. Current composition re-encodes/normalizes video and sound and may letterbox; it adds no automatic transitions or background music. Report failures, unfinished work, and recovery steps without claiming continuation after canvas closure.
