---
name: workflow
description: Use to turn an idea, novel, or script into video, or continue and revise an existing project. Produce scripts, character and scene assets, and video clips in Infinite Canvas, reusing existing media. Prefer the dedicated skills for pet commerce shorts, videos over 30 seconds, or episodic projects. Text-only requests or skill discussions do not start production.
metadata:
  version: "2.7.6"
  displayName: Turn Ideas and Scripts into Video
  author: Infinite Canvas
  github: https://github.com/HBAI-Ltd/Toonflow-app
---

# Turn Ideas and Scripts into Video

Use English for explanations and newly created text unless the user requests another language. Preserve supplied dialogue, exact reference handles, tool parameters, and model-required fixed syntax. Supporting source material does not override the selected output language.

Continue from existing user material and save results in the current project. Organize production around the actual script and media without requiring an entire production-document package first. This package contains its methods and does not depend on the former multi-role skill group.

**Long-video automatic mode:** When called by `longVideoWorkflow` with explicit automatic-mode scope, the initially approved model or ordered candidates are A0 inputs. Finalize planned content independently and use this task's successful, verifiable outputs downstream without stage approvals or per-segment adoption. See Confirmation and Execution. This exception applies to PART A and execution-reference confirmation wording; factual and reference verification still applies.

## Choose the starting point

Preserve known deliverables, inputs, duration, style, ratio, language, version, and explicit limits. Ask only consequential gaps that cannot be inferred.

| Input and intent | Action |
| --- | --- |
| Idea or one sentence | Develop goal, obstacle, outcome, reviewable story, and complete current script |
| Novel/story/source excerpt | Confirm adaptation coverage, preserve source, trace events/characters/lines/unknowns, and adapt into audiovisual script |
| Final script/timeline plus produce/generate/continue/revise video | Immediately enter embedded **SEEDANCE EPISODE DIRECTOR · PART A**, even without model/prompt keywords. If no version is specified, latch the route and ask once: Seedance 2.0 or 2.5? This must not detour into canvas configuration/assets/other prompt methods |
| Final script/timeline plus assets, reading, diagnosis, or other non-video work only | Handle only that explicit scope without automatically writing video prompts |
| Seedance task without version | Confirm 2.0/2.5 once as A0 input. Preserve the same execution state through the reply and configuration questions |
| Specified Seedance version | Execute PART A directly: 2.0 → A9.1; 2.5 → A9.2 |
| Continuation or existing production | Read specified history, actual nodes, and adoption records; resume within current scope |
| One segment/asset/revision | Handle only that scope and actually affected dependencies |

Seedance rules are embedded here, not a separate skill invocation. At the approved-script → segmented Seedance prompt stage, this **PART A** is the sole directing source, based on the user-supplied episode-director A0–A12 plus subsequent explicit continuity/stability requirements. It overrides other workflow paragraphs, method/storyboard references, and older guidance. Do not weaken or replace fidelity, model confirmation, segmentation/timing, reference binding, templates, validation, or single-pass polish. Only `longVideoWorkflow` segment continuity uses the tail-frame exceptions in A1.2/A5.

### Route latch and isolation

An executable script/timeline/story segment or video continuation, together with intent to produce/generate/continue/revise/prepare/configure video, automatically latches Seedance execution. No keyword is required.

- Enter PART A before canvas discovery/configuration. A0 model selection precedes `getCanvas/findCanvasNodes/getCanvasNodes/getCanvasEdges/getNodeTools`, `node:getConfig`, provider/resolution/ratio/mode questions, generic storyboards, and other prompt methods.
- Unless initially authorized long-video candidates already specify it, ask once for 2.0/2.5. Keep the route latched before/after asking. Explicit selection is reused without another question.
- Later ratio/resolution/audio/reference/provider answers supplement the same task. Short replies such as 16:9, 1080p, native audio, or 2.5 do not reset it. Discussing possible settings does not cancel it. Only an explicit change to non-video-only work releases it.
- If real nodes cannot execute the chosen model, report the exact conflict and return to the affected PART A item; never substitute a node default silently.
- From entry until final prompts, execute **only embedded PART A**. Do not read/apply `references/sourceAndScript.md`, `references/methods/*`, old storyboards, or teaching references for alternative timing, shots, blocking, performance, camera, sound, continuity, binding, templates, or QA.
- Existing user script/timeline/asset definitions and actual asset handles remain valid inputs. The sole conditional exception is missing-reference/design work explicitly required by A1.2/A4: read `references/assets.md`, `references/methods/visualDesign.md`, or `references/methods/colorAndLight.md` only for appearance/space/material/light, then return immediately. Import no directing/timing rules from them.
- After A11/A12 finalize prompts, an explicit request to connect media, configure generators, generate, or inspect output opens the execution layer in `canvasExecution.md/stateAndDelivery.md`. It transports final prompts, real references, and actual settings without rewriting directing decisions. For long-video continuity, approve templates specifying pending prior tails, then fill only actual handles and verify. Real initial-state conflicts return to PART A.

Before a script is final, [Source and Script](references/sourceAndScript.md) may guide actual creation/adaptation. That pointer stops applying during Seedance isolation.

# SEEDANCE EPISODE DIRECTOR · PART A

Execute this section directly; do not load another episode-director skill. It takes precedence over the rest of this workflow.

## A0. Determine inputs

Infer what is available; ask no more than two questions unless omissions would fundamentally change the film.

1. Model: 2.0 allows at most 15 seconds per segment; 2.5 at most 30. If neither specified nor included in authorized automatic candidates, ask once for the version before proceeding, preserving the latch.
2. Total duration: distinguish strict totals from references/unspecified length. Strict totals require A3 budgeting; otherwise estimate the full story naturally.
3. Scale: scene, short episode, or 2–3 minutes or longer. Plan the whole film before batches; batches manage delivery capacity, not story deletion/resegmentation.
4. Existing timecodes: treat them as story rhythm/reference timing unless explicitly locked; they are not automatically generation boundaries.
5. Actual asset library: reuse supplied character/scene/prop references under A1.2. Without one, extract only assets actually appearing. For 2.5 identity locks, A1.2 permits necessary reference creation.
6. Visible text: distinguish post-production overlays from physical scene/product lettering under A1.3.

Preserve complete story, source order, naturally executable speech/action/reactions, and global segment numbering across batches. Never minimize segment count at their expense.

### A0.1 Story fidelity lock — highest priority throughout

**Direct, do not rewrite.** Permitted: split/combine/time/stage/shoot existing events and describe directly entailed visible physical/camera detail. Forbidden: add/remove/replace/reorder events, change actors/recipients, prop origin/use, unspecified backstory/causality, or ambiguous identities.

#### A0.1.1 Source priority

Latest explicit user correction → current original story/script/timeline → explicitly supplied asset definitions → earlier AI prompts/summaries. AI additions never become source facts through repetition. An invented retrieval before using a prop must not persist as continuity in the next revision.

#### A0.1.2 Five forbidden changes

Do not add absent opening/retrieval/standing/handoff/turning/packaging actions; delete supplied actions/speech/reactions/pauses/empty shots; replace an event with a more plausible one; assign a generic parent/adult to a specific identity or alter who speaks/acts/holds/receives; or reorder actions/add prerequisites for product logic, continuity, or visual polish.

#### A0.1.3 Specificity boundary

Extra detail must be physically contained in the existing action, add no decision/state/relationship, leave facts unchanged if removed, and reveal no new information. Wiping a hand may specify palm/finger contact, not retrieving/opening a container and taking a new wipe. Camera/composition/framing/focus/visible light and effects of existing impacts are execution detail only while creating no story facts.

#### A0.1.4 Established initial states

If a beat starts with a held prop or a character already at a location, begin there. Do not reconstruct how it got there without source action. Continuity maintains defined states, not invented history.

#### A0.1.5 Preserve ambiguity

Generic parent/adult/staff/person remains generic in identity/gender/count. An unspecified hand stays unspecified unless execution needs a neutral choice without later story consequences. Holding does not imply freshly retrieving; use does not imply repetition/consumption count. Beside does not imply meaningful precise geography unless neutral execution coordinates are needed.

#### A0.1.6 Gaps and conflicts

Use HARD CUT/new time block/new segment to the next known state instead of invented bridges. Apply latest explicit corrections to conflicts; otherwise mark Source Text Conflict in the overview. Add segments or disclose a duration conflict instead of changing story to meet a strict length.

## A1. Output language and asset names

### A1.1 Language

Use English for prompts, inventories, blocking, performance, timelines, and overview in this English version unless the user explicitly requests another output language. Preserve user dialogue verbatim in its original language. Preserve handles, numbers/units such as `15s/30s/24fps/4K/2–3mm/180°`, optical angles, timecodes, and technical identifiers such as `HARD CUT`. Seedance 2.5 always uses the exact A9.2 field names; field contents follow the selected language. Reference-document language does not override this rule.

### A1.2 Asset naming and tags

With an established library, preserve exact supplied tags, punctuation, and complete handles such as `@HERO1V2`. They identify actual character/scene/prop references. Ordinary workflow segments do not depend on prior tails for blocking; rebuild absolute coordinates. In `longVideoWorkflow`, segment two onward plans the preceding current-attempt tail as its first frame, then binds/verifies the actual output. Before existence, record it as pending, not an invented handle.

Without a library, use plain asset names without `@`, identify character/scene/prop categories, and distinguish same-type assets by meaningful names. Do not fabricate tags.

For Seedance 2.5 without a library/images but requiring identity locks, necessary reference images may be generated using Infinite Canvas asset methods: character four-view board, scene master, and prop 2×2 board. Lock only explicit/unambiguous identity dimensions: face/hair/apparent age/build/clothing, scene structure/materials, prop color/shape/opening. Mark generated appearance as a design proposal. It grants no extra blocking/light/camera/story control and introduces no events, origins, relationships, world rules, or incidental people/props/text from the image.

### A1.2.1 Seedance 2.5 reference binding

Bind actual supplied relevant character/scene/product/prop/blocking/action images in every segment that needs them. Preserve complete IDs/handles exactly, e.g. `{{node/image-xxxx}}`; never abbreviate/rename/invent. Every segment is self-contained: repeat needed recurring assets, never Same as above. Include only this segment's necessary references.

Extract actual reference needs from its story/shots/actions/visible content. Each line is `actual handle: concise identity or responsibility`, not an essay about controls. Preserve explicit only-position/only-clothing/only-product limitations. Internally respect each image's limited authority; character imagery does not dictate blocking, blocking does not replace identity, and scenes introduce no incidental actors/props/text. Latest explicit user text governs conflicts under A0.1.1; conflicting images retain their assigned responsibilities rather than being fused into a new setting. Omit the entire binding section without actual references. Example-shaped IDs are format examples, never actual evidence.

### A1.3 Overlay text versus physical lettering

Default generated footage has no subtitles, titles, cards, stickers, UI overlays, watermarks, or added screen text; required overlays belong in post-production. Existing packaging/sign/letter/book/phone text is different: preserve reference appearance without adding/rewriting/redrawing lettering. Without reference evidence, require exact readable text only when story-critical and explicitly requested, preserving exact words while identifying generation risk. No added overlays does not mean removing existing physical lettering.

## A2. Complete beats and source order

### A2.1 Atomic beats and source ledger

Register **every** dialogue, action, reaction, information reveal, and explicitly supplied transition/empty shot/ambience/pause. Ordinary non-climactic beats also remain. In original order assign `E01/E02/...`, recording actor/speaker, exact action/words, recipient/prop, order, and explicit time/location/count/hand/origin facts. Every final Timeline sentence changing story state maps to `E##`. Only camera/composition/focus/visible lighting/direct physical detail or effects without new facts may lack a source beat. Unmapped changes to character/prop/location/count/relationship/information/causality are AI-added story and must be removed.

### A2.2 Importance tags

Tag reversals, emotional peaks, information increments, decisions, and effective silence. Tags can overlap and do not gate inclusion. Preserve untagged beats. Plot the emotional curve in source order; it is analysis, not a re-edit instruction. If no peak exists, invent none and plan complete action/speech/reaction units in order.

### A2.3 Minimum timing

Minimum beat time = natural speech + necessary pauses + necessarily serial action/reaction. Natural simultaneous small action/speech can overlap; sequential causes add. Estimate long lines from actual text/delivery, not a fixed 3–3.5 seconds. When uncertain allow roughly 10–20% breathing room. Preserve important pauses, turns, movement, and reactions rather than letting speech consume them.

### A2.4 Beats → shots → generation segments

Combine adjacent beats only. Combining changes containment, never E## content/actor/recipient/order/count. A beat may span shots without becoming another event. One to four beats per segment is guidance, not a cap. Combine only within model length, natural speech, complete causal actions, adequate reaction/breathing, manageable cutting, and a clear restatable ending. Split early for nearly exhausted speech budget, competing interactions, phase/objective changes, scene/time changes, loss of independent generatability, or required rushed speech/teleportation/omitted reactions.

### A2.5 Batches

Plan all global segments first, then deliver at most six 2.0 segments or three 2.5 segments per batch. A 180-second 2.0 film has a theoretical minimum of 12 but may require 13–15 or more for natural content. Fix G01/G02/... globally before assigning batches. Batch boundaries change neither order, numbering, nor continuity.

## A3. Segmentation and timing

### A3.0 Theoretical versus actual count

Hard segment limits: 2.0 ≤15s; 2.5 ≤30s. `ceil(total/segmentLimit)` is only the theoretical minimum. For strict 55s on 2.0, both 15+15+15+10 and a denser-story 12+11+11+11+10 may work. Balance overload and fragmentation instead of forcing the smallest count.

### A3.1 Determine actual segments

Budget every A2 beat, combine forward, check speech/action/reactions near the limit, split early when unnatural, fix whole-film actual count, then batch under A3.4. Never choose a required count first and force the story into it.

### A3.2 Dialogue gate

Every line must fit its actual window naturally, including scripted pauses/stammers/breaths/hesitation. Parallel small movement may overlap; necessary before/after action requires time. Never accelerate unnaturally, change words, or swallow endings. For impossible strict totals, first remove only AI-added empty shots/uninformative pauses/redundant camera work, not supplied pauses/negative space. If still impossible disclose Duration Constraint Conflict without editing dialogue/story.

### A3.3 Timelines

Reset local codes to `00:00` in each independent segment; include global intervals in the overview. Local intervals must agree. Explicitly mark simultaneous action; serial action cannot occupy impossible identical seconds.

### A3.4 Batch capacity

Maximum six 2.0 or three 2.5 segments per delivery, not per film. Maintain continuous global numbers across any number of batches. Call remaining material Next batch pending, not deleted content. Do not recompute prior numbering.

### A3.5 Shot density

Typical 2.0 segments use 1–2 main shots, exceptionally 3 for light content; 2.5 typically 2–4. These are recommendations, not caps. Persistent rapid HARD CUTs suggest splitting rather than packing more shots.

### A3.6 Defaults and text

Default to no dissolves, white flashes, whip pans, unjustified speed changes, invented voiceover/narration/dialogue, automatic BGM/emotional cues, new actors/props/story actions, or generated post-production overlays/watermarks. Physical text follows A1.3: preserve actual reference lettering rather than demanding newly accurate generated packaging text.

## A4. Asset and visibility planning

Plan changing visibility shot by shot, not one contradictory whole-segment status. Missing necessary appearance/light may use visualDesign/colorAndLight as explicitly marked design proposals, never new facts, origins, relationships, or world rules. If unnecessary, preserve abstraction.

2.0 outputs an explicit asset-identification block before each prompt. 2.5 maps this information into `Reference binding/Immutable locks/Timeline/Preserve`, with no duplicate inventory unless requested.

### A4.1 Visibility vocabulary

On-screen speaking; on-screen silent; partial face; hands only; over-shoulder only; back only; feet only; fully off-screen with synchronous voice only; fully off-screen silent. Multiple states require a timeline.

### A4.2 Character entries

Include identity/appearance anchors, per-shot visibility, world and screen coordinates, changing persistent conditions, principal performance with 3–5 visible requirements as applicable, and exact synchronous dialogue. Use only available/source-supported information.

### A4.3 Scene entries

Include scene anchors; camera location/orientation/height; foreground/midground/background; character/landmark relationships and axis.

### A4.4 Prop entries

Include starting absolute location/user/state; who moves it when/how; ending state; and relevant prohibitions/lettering preservation under A1.3. Do not trace unspecified origins.

### A4.5 Limits

Keep only segment-relevant anchors rather than whole biographies, absent assets, repeated full plots, or contradictory visibility summaries. Reference assets, not generated exact packaging text, establish appearance.

## A5. World and screen coordinates — self-contained

Ordinary segments do not rely on prior tails. `longVideoWorkflow` alone uses the preceding current-attempt verified tail as the next first frame from segment two. Keep absolute planned states, verify actual initial imagery before generation, and pause for script/approved-plan conflict. Identify its first-frame responsibility in existing reference fields without changing A9 structure.

### A5.1 Five blocks per segment

World positions/landmarks/axis independent of camera; current-camera screen positions/depth/occlusion; world and screen light directions under genuinely continuous lighting; absolute prop locations/states/paths; and explicit ending state restated as the next absolute initial state, never Continue previous.

### A5.2 Continuous state chain

Previous ending → explicitly restated next start → source action → ending. Carry world position/orientation, prop location/owner/count/liquid/stains/wear, injury/clothing/wetness/blood/smoke, and key-light direction/temperature/environment when continuous.

### A5.3 Source-driven movement

Preserve explicitly written standing/walking/arrival, not teleportation. If the next beat directly establishes already at the door without a transition, cut to that initial state; invent no standing/walking bridge. Do not swap world positions for composition. Legal camera changes may change screen sides without moving characters.

### A5.4 Axis

Maintain the established 180° dialogue axis by default. Requested/necessary reverses or axis changes use neutral views, a visible crossing move, or an establishing shot. Avoid unexplained jumps; axis preservation does not freeze camera position.

### A5.5 Re-anchor changes

At a new scene/time/weather/key-light condition, rebuild world/screen positions, axis, and light instead of inheriting previous camera/light blindly. Clothing/injury/carried props persist according to story time, enabling long multi-scene episodes.

## A6. Performance

### A6.1–A6.5 Source-supported behavior

Emotion appears through visible deviations in existing behavior, not abstract labels. Give an actionable target only when the source establishes it; infer no hidden motive/relationship. Preserve complete causal pickup/put-down/pour/open/handoff/sit/stand/movement processes. Microexpressions require an existing reaction plus a source trigger; a close-up alone authorizes no frown, lip press, blush, swallow, or smile. Mask/crack may organize supplied surface state/reaction only; add no pretense or reaction, stack no unnecessary cracks, and allow none.

### A6.6 Visible channels

Face: gaze/tiny changes; hands: grip/rhythm/contact; back: weight/shoulders/breathing; feet: gait/weight transfer; distant full body: posture/space. Write only visible channels.

### A6.7–A6.9 Rhythm and restraint

A reaction may begin before another line ends only with a specified trigger; neither always-before nor always-after is universal. Restraint reduces AI-added decoration or amplitude, never removes/replaces/delays supplied events. Typical source-existing microreaction ceilings are 1–2 for ≤15s and 2–3 for 16–30s, not quotas. Zero is valid; no facial acting when the face is unseen.

## A7. Camera and segment transitions

### A7.1–A7.2 Emotion and camera

Map low → pressure → peak → release in source order, not a new order. Internal, informational, and external-action peaks do not automatically demand a push-in or extreme close-up. User style governs.

### A7.3 Sole cross-segment shot-change rule

Compare only segment N's last shot and N+1's first. Categories: subject (two-person/single/detail/empty/group), size (wide/medium/close/close-up/extreme close-up), angle (front/side/back/over-shoulder/high/low). Default independent-generation boundaries need at least one: different subject category; at least two framing-size steps; or ≥90° angle difference. If absent, adjust only next opening subject/framing/angle/composition, not its source event, positions, actions, props, or words.

Useful changes include two-person medium → single/detail close-up or empty; single medium → two-person medium; detail/empty → two-person medium; side medium → frontal close-up. Same subject/size/similar angle or a hand-action hard join across independent clips is risky. There is no separate absolute ban on detail → detail when these criteria provide adequate difference.

### A7.4 Match on action

Prefer unfinished action → HARD CUT → continuation within one generation segment. Across independent segments, prefer finishing the action and starting from a stable completed state without inventing/deleting source events.

### A7.5 Style

Restrained: mainly fixed camera, behavior deviations, natural low-contrast light, ambience. Suspense: stable views/necessary reverse, information asymmetry/delayed source reactions, hard side/back shadows, effective silence. Comedy: fixed/wide holds, sincere acting and contrast, ordinary even light, ambience. Explicit user style always wins.

## A8. Continuity — classify before inheriting

A7.3 alone governs cross-segment shot-type changes. A8 concerns people, props, environment, and persistent state, not forcing every adjacent segment into one continuous space.

### A8.1 Relationship classes

1. Continuous: same place/time or explicitly continuing conversation/action, with next start dependent on prior end.
2. Partial persistent state: new scene/time but explicitly persistent carried props, clothing damage, injuries, wetness/stains/product quantity. Carry those only, not prior positions/camera/screen sides.
3. Unrelated/re-anchor: new unit without positional/prop-state dependence. Check its own start/actions/end and rebuild spatial/light setup.

Use latest instructions, source, and confirmed states only; invent no relationship. A directly supplied new state may start after a HARD CUT without invented history.

### A8.2 Character chain

For actual continuity track absolute start/posture → source action → absolute end → next absolute start. Verify landmark/world positions; interpersonal sides/distances/barriers; posture/orientation/target; occupied hands; visibility versus real existence; and movement backed by E## or a directly established new state. Do not specify a hand unnecessarily, but once established preserve it until an actual handoff. Legal screen-side changes do not permit moving people to maintain permanent screen sides.

### A8.3 Prop chain

Track owner/established hand/absolute location/visibility/count/opening/contents/liquid/wear/stains/wetness/action/end. A held pen cannot disappear without a source event. Cropping/occlusion hides it without changing world state. If the same occupied hand remains visible, the prop remains. Put-down props do not return without action; handed-off props cannot duplicate across owners. Shape/color/size/count/opening/liquid/wear cannot change or reset causelessly. Leaving the frame is not itself a state change.

### A8.4 Environment

For continuous/partially related states, verify doors/windows, moved furniture/tableware, water/stains/damage/smoke/remaining food, time/weather/light switches, and consistent reflections without duplicate people/props. Avoid unsupported clipping through walls/tables/closed barriers.

### A8.5 Repair boundaries

Repair coordinate wording, visibility/occlusion, prop ownership/state locks, camera coverage/framing/cut points, or segmentation at existing E## boundaries. Add no bridges such as setting down/retrieving a pen, moving sides, or obtaining another object. Mark source conflicts rather than rewriting them. Restate inherited absolute starts explicitly; unrelated segments remain independently anchored.

## A9. Final segment templates

A9 defines delivery structure, not alternative A2–A8/A11–A12 logic. Execution rules win over template wording.

### A9.1 Seedance 2.0 — asset identification plus formal prompt

```text
G0N | Batch X / Segment N | Model: Seedance 2.0 | Duration: Xs | Global time: MM:SS–MM:SS

## Asset identification
### Characters
Name | per-shot visibility and speaking timeline
Identity/appearance; world/screen positions; persistent state; principal performance and visible requirements; exact dialogue.
### Scenes
Name/time; scene anchor; camera position/orientation/height; foreground/midground/background; spatial relationships.
### Key props
Absolute start; source timeline actions; end; relevant limits and lettering rules.

## Formal prompt
Generate a live-action film clip of exactly Xs.
Visual style, camera overview, and real light overview.

## Spatial relationships
Self-contained world and screen coordinates.

## Shot N-1 | 00:00–00:XX | XXs | Subject + framing + angle
Camera/composition:
First-frame lock:
Action timeline:
Performance:
Physics:

## 00:XX | HARD CUT
## Shot N-2 | 00:XX–00:XX | XXs | Subject + framing + angle
Complete corresponding content.

## Lighting
World/screen key-light direction, exposure, and applicable continuity.
## Sound
Real ambience and verbatim synchronous dialogue; BGM only as requested.
## Positive locks
Absolute positions, prop ownership, gaze, persistent states, and absent characters.
## Text locks
No subtitles, extra screen text, or overlays. Preserve existing physical reference lettering without additions, rewriting, or redrawing.
```

### A9.2 Seedance 2.5 — Objective structure

#### A9.2.0 Mandatory final format gate

Other than the segment header, the only allowed top-level fields are `Objective`, conditional `Reference binding`, `Immutable locks`, `Target duration`, `Timeline`, `Visual direction`, `Audio direction`, `Preserve`, and `Avoid`. No extra analysis, numbered-shot main structure, intermediate planning shell, older three-part shell, or 2.0 template is deliverable. Convert upstream structures through A0–A8/A11 into this whitelist in the same turn. A4 inventory information is incorporated into fields, not duplicated beforehand.

```text
G0N | Batch X / Segment N | Model: Seedance 2.5 | Duration: Xs | Global time: MM:SS–MM:SS

Objective:
One or two sentences: this segment's episode position, duration/ratio/overall treatment, and dramatic objective; do not repeat the full timeline.

Reference binding:
- Actual complete handle: concise asset identity or explicitly limited responsibility.
- Repeat all real references actually required here, even if used previously.
- Omit this entire field when no real references exist.

Immutable locks:
Only generation-critical identity/clothing, world positions/sides, continuous light, prop/product structure/state, exact dialogue/lip-sync, and off-screen constraints. Restate inherited ending states as absolute starts. Do not repeat the whole plot.

Target duration: X seconds

Timeline:
【0:00-0:XX】A continuous English paragraph of the actually visible setting/blocking, visibility, framing/cuts, ordered source actions, source reactions, dialogue, prop changes, and necessary physics. No camera/action/performance/dialogue subheadings.

【0:XX-0:XX】Continue naturally; use as many blocks as the story needs.

Visual direction:
One compact paragraph of consequential photographic treatment, light, color temperature, depth, subject/product relationships, and physical texture.

Audio direction:
Actual physical/ambient sound and dialogue voices. Music only when explicitly requested; otherwise no background music, only real synchronous sound and ambience.

Preserve:
A short line/paragraph of essential appearance, scene anchors, product/prop state, spatial and action logic.

Avoid:
A short line/paragraph of likely errors specific to this segment, not a generic negative-tag dump.
```

#### A9.2.1 Timeline

Use `【0:00-0:XX】` time blocks plus continuous natural-language visible-film descriptions, normally one paragraph per block. No fixed block count or independent shot-number system. Embed necessary cuts naturally. State only consequential positions/sides/off-screen/continuity without repeating locks. Keep exact dialogue at its action point, not repeated afterward. Include relevant liquid/fabric/wetness/weight/impact detail only. Prefer one readable action chain without filling every second. Every state-changing event maps to E##. Add no retrieval, opening, extraction, handoff, standing, movement, turn, repetition, or consumption for supposed completeness. Start directly from established states and preserve generic identities.

#### A9.2.2 Reference binding

Extract only actually required real segment assets, list each complete supplied handle unchanged plus concise identity/use, preserve explicit only-position/only-clothing/only-product limits, and repeat needed references per segment. Images cannot seize other responsibilities or introduce incidental content. Never invent tags, nodes, IDs, or assets; omit the field with no actual references.

#### A9.2.3–A9.2.5 Locks, sound, preservation

Lock only non-drifting facts such as clothing, absolute world/screen relationships, product structure, off-screen state, exact words, and continuous light/props. Changing actions belong in Timeline. Music/emotional cues default absent unless requested, regardless of examples. Keep Preserve/Avoid short and segment-specific.

## A10. Whole-film output

Distinguish whole-film planning from current-batch delivery. The English overview includes: model; strict/reference/unspecified total; segment hard limit; theoretical minimum and actual count; all global segments with duration/global interval/core beats; batch assignments; current batch; next pending segments or none; asset inventory; actual 2.5 reference inventory with unchanged handles/responsibilities when supplied; scene/time changes; world axes per continuous scene; source-order emotional curve and beat tags; style/camera rhythm; duration conflicts or none; fidelity status and source gaps/conflicts without invented bridges.

Then deliver current segments using A9.1 or A9.2. Plan future segments even when delivering only Batch 1 to prevent inconsistent resegmentation. Overview explains why; individual 2.5 prompts explain what to generate without duplicating the overview.

## A11. Structural validation — before A12 only

### A11.1 Required checks

Check the source ledger and source priority; every final state-changing action maps to an included E## with unchanged content/actor/recipient/count/order/words; all atomic beats remain; no invented identities/history/origins; emotion does not reorder; minimum count is only a lower bound; every segment meets its model limit; strict totals fit or conflicts are disclosed; natural complete dialogue, serial action, reactions, and pauses fit; the whole-film table precedes batches; A4 visibility matches final text; every adjacent pair is classified; actual continuity preserves positions/relationships/posture/orientation/occupied hands; prop ownership/location/count/state/visibility and environment/light persist appropriately; high-risk interactions/camera/occlusion/reference conflicts are mitigated; correct A9 template/whitelist/time-block prose is used; real references repeat unchanged with concise limited responsibilities; no duplicate A4 inventory in 2.5; absolute coordinates are self-contained; scenes re-anchor; A7.3 boundaries and within-segment action matching are respected; speech is verbatim; overlays/physical text follow A1.3; generated references remain scoped design proposals.

### A11.2 One structural correction pass

Collect failed checks together, make **one** concentrated correction pass, then recheck affected items/direct continuity only. Adjust boundaries, coverage, budgets, camera expression, and locks, never E## events/actors/objects/count/order/dialogue. Continue through A11.3/A11.4 to A12. Do not recurse A11 ↔ A12. Preserve unresolved mutually impossible user requirements and disclose the hard conflict instead of endless recalculation.

### A11.3 Fidelity audit

Read E01→E02→... against final segments, verifying every event/actor/recipient/word/order. Reverse-scan final state-changing actions and remove unmapped AI additions. Camera/composition/framing/focus/direct physics/effects may be unnumbered without new facts. If removal leaves an origin question, begin at the user-defined initial state rather than adding history. Preserve source gaps/conflicts in the overview. The objective is the same story, not smoother invented causality. Do not expose the internal ledger.

### A11.4 Generation stability preflight

This reduces risk; it does not guarantee artifact-free output. Do not delete story for stability. Flag: three or more moving/occluding/contacting subjects; fine multi-hand small-prop/handoff/fastener/pour/wipe work plus complex camera; large body actions plus close hand detail; mirrors/glass/reflections/transparency/multiple shadows; accurate small lettering/fingers/liquid/mechanics plus fast rotation; shallow focus plus occlusion/fast camera/contact/ensemble acting; many conflicting references; mutually exclusive movement/hand-state instructions.

Reduce in order until no overload:

1. Remove irrelevant camera jargon/negative tags/material detail/references, not events.
2. Simplify camera first: fixed or one smooth movement during contact, not simultaneous push/pull/orbit/pan/focus complexity.
3. Keep crucial hands/props/contact visible, not fully cropped/occluded at contact.
4. Keep both contact surfaces legible instead of extreme blur.
5. Separate competing complexities only at existing E## boundaries when the source permits; preserve explicitly simultaneous actions while reducing camera/background/irrelevant acting.
6. Keep necessary references with clear scopes and source-priority conflict handling, not invented fusion.
7. Add targeted Avoid for actual risks such as extra limbs/fingers, merging, face drift, prop duplication/disappearance, clipping, melting, or extra mirrored actors; do not paste irrelevant negatives.
8. Resplit coverage/segments only if still overloaded, at existing beats, without deletion/addition/reordering or altered simultaneity.

Before A12, verify one clear viewing task per shot; readable people/limbs/props/causality; consistent camera instructions; no unnecessary duplicating reflections; noncompeting binding; appropriate identity/clothing/product/prop locks; and focused Avoid.

## A12. Final polish — exactly once

No second storyboard, count recalculation, beat recutting, or A11 rollback. Fix expression/executability within existing structure; handle hard conflicts under A12.19 without recursion.

### A12.1 First-frame locks

State applicable people/no-people, posture, screen sides, relative distance, orientation, source-backed initial gaze or neutral noninformational gaze, held objects, prop positions, camera distance/height, and foreground/midground/background. Invent no inapplicable details or new interests/hostility/romance.

### A12.2 Per-shot visibility

Follow A4 even without a separate 2.5 inventory. Encode necessary off-screen locks in Timeline/Immutable locks, including no face/body/shoulder/hand/reflection/shadow/blurred silhouette as applicable and voice only for off-screen synchronous speech. Prevent invented partners in POV/details/over-shoulder/single views.

### A12.3 Optics

Describe visible perspective, natural facial proportions, and background softness rather than relying solely on lens labels such as 85mm f/1.4. Lens labels may supplement visible results.

### A12.4 Camera consistency

One principal movement logic per shot. Fixed cannot simultaneously truck; fixed camera with one slow focus change is coherent.

### A12.5 Restrained photography

Only for restrained/subtle style, consider hands/props/floor edges, over-shoulder/partial occlusion/soft foreground, two-person medium, or fixed wide. Do not impose avoidance on action, broad comedy, or product experiments.

### A12.6 Visible performance

Render existing reactions as concrete behavior, e.g. an already raised cup pausing then continuing, not abstract sadness. Gaze/grip/cup/lip/breath/weight changes require source support, not new acting events.

### A12.7 Microexpression density

Typically 0–2 clear events per character/shot, never a quota. No facial reaction without a visible face.

### A12.8 Gaze targets

Specify targets only when the source supplies them. Eyes-first/head-follows may realize an existing look, not add one or create meaningful attention.

### A12.9 Natural two-person rhythm

Slightly offset existing parallel actions only when exact synchronization is unspecified and order/causality remain intact. Add no actions, delay no key events, and preserve explicit simultaneity.

### A12.10 Action causality

Make existing beat chains readable. Preserve every actual action even with multiple per shot; remove AI decoration instead of deleting source events to enforce one-action coverage.

### A12.11 Prop continuity

Check owner, established hand, absolute position, visibility/occlusion, count, orientation, opening, contents/liquid, wear/stains/wetness, and destination through start→source actions→end, plus related cross-segment A8.3 chains. Held props do not disappear; cropping is not disappearance; visible occupied hands remain occupied without a source change. No return to hand after put-down, duplicate owners after handoff, unsupported hand switches, replenished liquid/consumables, restored stains/damage, or doors closing without action. Do not lock unspecified hands unnecessarily.

### A12.12 Physics

Check liquid inertia, fabric, hand/prop contact, weight, table vibration, impacts, glass refraction/reflection.

### A12.13 Light

Continuous scenes preserve key direction/temperature/exposure. New scenes/time re-anchor under A5.5. Dramatic importance alone adds no rim light, catchlight, or exposure change unless requested style supports it.

### A12.14 Sound

Default to real synchronous dialogue/ambience/action effects. BGM/music/emotional cues require a user request.

### A12.15 Exact speech and time

Copy dialogue without word changes, rephrasing, fillers, repetition, or improvisation. A12 cannot accelerate speech to fix a structural timing issue; A11 handles those. Only nonstructural pause-wording refinements are allowed.

### A12.16 Positive locks

Prefer executable positions/ownership/off-screen states, then necessary prohibitions.

### A12.17 Text

Default no subtitles, added screen text, titles/cards/UI/watermarks. Preserve referenced physical lettering without additions/rewriting/redrawing; only explicitly required readable text receives exact wording.

### A12.17.1 Reference integrity

Check completeness and clear responsibility only. Do not change/delete/merge/add references during polish. Repeat each needed real handle; preserve only-position scope; import no character-reference backgrounds/strangers/props; invent no packaging copy.

### A12.18 Relevant constraints

As needed, limit added people/props/dialogue/events, unsupported axis/world-position changes, music-video cutting, unjustified advertising light/retouching, extreme depth, or unnatural slow motion. Do not paste unrelated restrictions.

### A12.18.1 Final one-way continuity/artifact-risk audit

Before output, snapshot each start/end: world positions/posture/orientation/visibility/occupied hands; prop owner/location/count/state; persistent doors/furniture/stains/light. Compare only continuous/partially related pairs. Inspect unsupported teleportation/side changes/posture transitions/duplicate people/visibility conflicts; prop disappearance/duplication/hand switches/return/count/opening/liquid/damage resets, especially an unchanged visible hand suddenly empty; moved furniture/doors/clipping/scale/reflection duplicates; and A11.4 mitigations. Repair AI wording/locks/coverage only without invented bridges or changed story. Mark source contradictions. This is prompt-side risk review, not actual generated-video acceptance; real extra limbs/identity drift/prop flashes/clipping/reflection errors require readable-media review.

### A12.19 Boundaries and stopping

Do not change exact dialogue, any E## action/reaction/count/actor/recipient/prop/information/causality, ambiguous identity level, core intent, approved order, actual segment count/durations/global numbering/batches, key asset identity, or established world-coordinate logic. Only clarify execution, fill first-frame/visibility locks, reduce overacting, improve physics/light/sound/continuity wording, and resolve contradictory AI phrasing to A11-confirmed states. Preserve source contradictions and mark them rather than rewriting them.

Finish one A12 pass, then final-check fidelity/coverage/order and absence of invented history/identities; first-frame/visibility/camera/visible acting/gaze; props/physics/light; correctly classified continuity; no unsupported resets/disappearances/duplication; space/reflection/clipping risks and targeted stability mitigation; verbatim words; no overlays; preserved physical lettering; correct 2.5 whitelist and time-block prose; scoped design-proposal references; and no structural rollback/loop. Output the final version without returning to A11 or running A12 again.

# Continue on the canvas

Actual production normally appears in the current canvas, but Seedance routing precedes discovery/configuration. Executable story plus video intent completes PART A prompt planning/finalization first, then reads [Canvas Execution](references/canvasExecution.md) for actual overview/targets/edges/models/ports/functions. Configuration forms or resolution/ratio/mode needs do not bypass PART A. Before video production, ordinary canvas discovery applies. Script/asset planning still uses text nodes without media generation unless the user explicitly asks for chat-only/advice/no canvas. Use the host's current workspace; without an open canvas explain the condition and complete independent text.

| Stage | Current result | Reference |
| --- | --- | --- |
| Content/scope | Source/script nodes, necessary brief | [Source and Script](references/sourceAndScript.md) |
| Assets | Current character/scene/prop inventory and adopted images | [Assets](references/assets.md) |
| Seedance prompts | Whole-film plan, segments, final prompts | Embedded PART A only; no storyboard/methods |
| Generate/adopt | Current generators, real outputs, feedback/adoption | [Canvas Execution](references/canvasExecution.md), [State and Delivery](references/stateAndDelivery.md) |
| Deliver/continue | Effective script/media/clip index, completed scope/next steps | [State and Delivery](references/stateAndDelivery.md) |

Create nodes only for the reached stage. One story segment may contain multiple shots but normally has one full prompt/video node, not automatically one keyframe per shot. Edges transmit media, not approvals/scheduling. Formal production assets derive from the current approved complete script. Standalone asset design uses approved design needs/media without requiring a script. Joint script/asset requests may produce an inventory/design draft in the same turn, explicitly dependent on the pending script and not generation authorization. Voice-only characters need no unused portraits. Put style/performance/action/continuity into actual production decisions rather than compulsory separate reports or empty fight/prop documents.

## Read methods only for the current creative problem

Use [Story Development](references/methods/storyDevelopment.md) for ideas/character causality/outlines/continuation; [Screen Adaptation](references/methods/screenAdaptation.md) for audiovisual scenes/psychology/dialogue/estimates; [Visual Design](references/methods/visualDesign.md) for appearance/space/props/variants; [Color and Light](references/methods/colorAndLight.md) for style/material/light/grade; and execution/state references only after final prompts. They support pre-Seedance creation/design or post-prompt execution, never a second directing source during isolation. PART A alone handles final-script segmentation and prompts. Method examples, genre rhythms, and style options do not become project facts automatically.

`subAgent` may handle independent long-source fact extraction/organization before Seedance only when handoff/merge is cheaper than independent analysis. No subagent independently drafts/rewrites/optimizes segment prompts during isolation: one execution chain owns A0–A12. Do small text/inventories/connections/layout directly without fixed staffing or extra review rounds. Delegation changes no approval/generation/adoption rules; dependent generation still waits for actual prior outputs.

## Confirmation and execution

Only explicitly authorized automatic mode called by `longVideoWorkflow` covers planned content finalization/generation without stage/per-segment adoption. Initially approved model/candidates are A0 input; select a real authorized version before its PART A plan. Verifiable current successes may feed planned dependencies without claiming human review. All other tasks retain normal confirmation and format/fidelity/reference requirements.

- Present substantive stage results and ask about changes, reusing already approved content/continuous scope. Do not turn every tool/internal/unneeded substep into a question.
- Record content approval, compute-consumption authority, and adoption separately. Interactive approval shows objects/counts, actual model, full prompts/references/settings/call counts. Use compute consumption and mark it unknown when not queryable.
- Obtain interactive authority through host `askUser` or explicit reply. Reuse the same approved plan/batch; check coverage for additions, plan changes, or retries. Ordinary Continue, silence, and failed forms are not new generation authority.
- A0 alone chooses the Seedance version. Ask once when neither specified nor in authorized automatic candidates. Keep the latch; real canvas configuration only verifies executability after model selection/entry into PART A. Node/host/history defaults, forms, and configuration answers cannot override A0.
- Dialogue does not automatically require an external voice sample. PART A controls prompt sound; execution references only verify native sound/audio inputs, not rewrite its words/sound rules.

## Completion and recovery

Save text through node functions and obtain actual paths from `data.textPath`. Use a concise status ledger and overview across turns, reusing existing records rather than demanding template rework. Pending/adopted text needs fixed version evidence; generation retains prompts/settings/references/old outputs. Recheck actual nodes after confirmation for edits made during waiting. Prefer fixed asset nodes for adopted media and separate revision candidates; see state/delivery.

A native node's `generating` means started, not completed. Without actual status/wait tools, finish authorized independent starts/text, record status, and ask for a reply after completion so nodes can be reread. Invent no automatic wake-up/background polling. Later continuous segments wait for prior adoption and actual boundary state except the automatic-mode exception; planning may anticipate states, and independent assets/clips may follow an approved batch.

A path proves no visual review. Verify only through actual media-reading capabilities; otherwise ask the user for playback feedback/boundary/adoption and disclose unverified parts. Distinguish generated clips, adopted clips, composed films, and collected copies; without a corresponding tool, deliver actual outputs and identify missing work.
