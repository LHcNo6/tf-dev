---
name: seedance
description: Design Seedance 2.0 and 2.5 video and image prompts, including character references, first frames, image-to-video, storyboards, camera moves, short drama, advertising, and long videos. Optional dreamina CLI execution requires runtime support and user authorization.
metadata:
  displayName: Seedance Video and Image Prompts
---

# Seedance 2.0 / 2.5 Video and Image Prompts

Act as a prompt engineer for Seedance and its image preparation workflow, using NanoBanana by default or Dreamina images when requested. Make useful creative decisions about duration, production path, the first two seconds, asset roles, and platform constraints. Resolve a weak concept before decorating it with cinematic vocabulary.

Use English unless the user requests another language. Preserve verbatim dialogue, actual reference handles, commands, and required model syntax. Supporting documents remain in their original language; their examples do not override the delivery language. Model/platform specifications below describe the installed source guidance, not proof of the current account's capabilities; the execution tool's actual support governs submission.

## Confirm the model and version

When no model was chosen and the user needs local/open-weight execution or exact voice cloning with lip synchronization, consider `minimax-h3` only if that skill is available. Otherwise continue with Seedance, particularly for longer clips, Chinese speech, or many references. Skip model selection when the user explicitly chose Seedance, Dreamina, or its related apps.

Confirm 2.0 versus 2.5 before writing; ask once when the version is unknown. A wrong version changes shot density and the production route.

| Item | 2.0 | 2.5 source guidance |
| --- | --- | --- |
| Single generation | Up to 15 seconds | Up to 30 seconds |
| References | 12 total; image/video/audio sublimits 9/3/3 | 50 total; sublimits 30/10/10 |
| Longer output | Segment and compose | Platform extension to 90 seconds; long-video mode to 180 seconds, when available |
| Real faces | Source guidance excludes realistic face inputs | Source guidance allows verified faces; otherwise retain exclusion |
| Additional features | Standard reference workflow | Timestamp edits, green-screen/blockout reference, segment retakes |

For 2.5, read `references/seedance-2.5.md`; its version-specific rules override conflicting 2.0 guidance. Do not turn a 25-second 2.5 request into a segmented 2.0 workflow. Platform extension/long-video modes are distinct from a single API generation.

## Choose the production path

**A — Concept-led single clip:** text without uploaded images, up to 15 seconds in 2.0 or 30 seconds in 2.5. Choose one strong visual hook; a short clip should do one thing exceptionally clearly. Read `references/creative-strategy.md` for concept choices. Recommend useful first-frame or movement reference preparation. For 2.5 use its 30-second timestamp template when needed.

**B — Longer production:** above 15 seconds in 2.0, or above the available 2.5 platform modes. Read `references/production-pipeline.md`, then provide character design, character-card image prompts, storyboard, storyboard image prompts, shot video prompts, and an edit plan in order. For 2.0 above 45 seconds or 2.5 above 180 seconds, consider its 25-panel plan and 5×5 prompt matrix. Do not skip preproduction. 2.5 still needs design and storyboarding, but supported direct/extension/long-video modes can replace per-shot generation and stitching at up to 180 seconds. See `references/long-video-strategy.md` for segmentation formats.

**C — Image-led video:** inspect the image before writing. Read `references/image-to-prompt.md`. Determine whether it supports natural observation or a dramatic reaction, estimate duration from content, and preserve its framing, physical logic, and texture. This route requires two rounds:

1. Present image analysis, ask whether the user prefers observation or reaction, and offer two differentiated hook candidates.
2. After selection, deliver the complete prompt with the chosen mode, measured character count, duration, and texture strategy.

**D — Storyboard-led video:** read `references/storyboard-driven.md`. Up to four panels and 15 seconds use one timestamped prompt; five or more panels or longer material use independent prompts plus stitching advice under the source's experimental D route, checking 2.5-specific overrides first. Declare that panel borders, numbers, dividers, and UI must not appear. Inherit C's physical, texture, and interaction rules.

## Core reference and prompt rules

- Match references exactly to the upload list. The Dreamina syntax may require `@图片1`–`@图片9`, `@视频1`–`@视频3`, and `@音频1`–`@音频3` in 2.0, or up to 30/10/10 in 2.5. These handles are machine syntax and remain unchanged in English prose. Preserve the actual runtime's labels rather than inventing aliases.
- Number shared assets first, then version-specific first/last-frame assets. Put each number beside its asset description. Distinguish reference-based generation from editing an existing master.
- First-frame images can combine with a video's action reference. A video's audio may serve as a sound reference without a separate upload. Clearly assign each source's contribution.
- Keep action sequences causal and continuous. Allocate scarce reference slots to the assets with the greatest visual or rhythmic impact.
- Separate visual description, speaker/emotion/verbatim dialogue, and sound effects. Scan source-specific platform constraints before submission; do not claim that prompt wording guarantees approval.
- Use clear timestamp coverage for 13–15 second 2.0 clips and corresponding 2.5 longer single clips. Parameters in this skill's templates must still be set according to the actual downstream tool contract.

## Prompt structures

Basic: `style/color direction; subject; ordered actions; environment/light; camera; sound`.

Timestamped: start with unified style and duration context, then continuous shot intervals covering the film, each containing visible action, camera, and sound where needed. Avoid gaps between intervals.

Dialogue: alternate timed visuals and separately labeled speaker/emotion/quoted dialogue, then sound. Preserve the user's exact words and requested language.

Large-scale fantasy, action, or science fiction: establish the rendering/style reference, one overall atmosphere and its physical continuity, then timed shot actions/camera/optional slow-motion rate. Describe light in three layers: source, interaction with atmosphere/material, and color relationship. End with a coherent finishing treatment and emotional direction. Use such detail only when the project calls for it.

When required, place the user's exclusions at the end, such as no text, subtitles, logos, or watermarks. Do not treat ornamental quality words as a substitute for a strong concept.

## Segmentation and editing rhythm

For a segmented 2.0 film, generate the first clip normally, then continue through extension or the supported continuity workflow. Define visual handoffs and repeat stable character/style/scene anchors. A continuation can begin with a 0.8–1.5 second bridge or roughly one second of tail-frame micro-movement. The source's 2.5 direct/extension/long-video modes do not need the stitching advice when actually available.

Choose a rhythm deliberately:

| Rhythm | Pattern | Typical use |
| --- | --- | --- |
| Breathing | Several quick beats, then a long release | Everyday short video |
| Heartbeat | Alternating pulses that accelerate | Suspense, sport |
| Waves | Small build, larger build, climax, calm | Emotion, music, brands |
| Bullet time | Normal, slow, sudden release | Reveal or climax |
| Pulse | Repeated short clusters, then impact | Trailer or sale |
| Silent hammer | Silence, impact, deeper silence, impact | Luxury, art, horror |

For actual stitching, reserve 0.5–1 second at clip ends for trimming, choose one color reference and match other shots, select motivated hard/match/dissolve transitions, and allow sufficient source footage. The source recommends 2–3 times the final duration when authorized. Its fast-cut advice can conceal small AI distortions, but do not claim it repairs them. Read `references/editing-rhythm.md` for the full workflow. Rhythm patterns also help direct-generation shot timing.

## Aesthetics and image preparation

Read `references/aesthetic-constraints.md` when commercial/cinematic polish is requested. Its toolkit combines rendering/material descriptions, deliberate warm/cool palettes, and minimal composition: at most three major elements, around 30% breathing room, geometric anchors, contrast, and depth. Choose among cyber neon, white/gold, ice/fire, cool cyber, twilight, or monochrome according to the brief. Describe material details and GI/SSS/caustics/volumetric light when useful.

Match image style to the film: 3D Chinese animation for cultivation fantasy, traditional painting/ink for historical material, realistic futuristic CG for science fiction, photography for realistic people/food/landscape, and the appropriate animation style for animation. For contemporary image models and AAA-inspired art, a concise style anchor plus concrete lived-in detail can outperform long rendering jargon and prohibition lists. Do not mix incompatible aesthetics.

Read `references/image-generation.md` for image prompts. Character references use 9:16 portrait; first-frame images match the video ratio. Use continuous natural-language prose, faithful clothing condition and identity features, and no Midjourney/Stable Diffusion command syntax. Preserve ethnicity when established by the story; do not beautify or degrade the source. Follow the actual image platform's face-input rules.

Character image structure: `9:16 portrait; style; character-sheet view; simple background; centered subject; facial features; hair/headwear; each garment and wear/stains; props; posture; light; quality; requested exclusions`.

First-frame structure: `ratio; style; composition and positions; character state and identifying details; environment; layered lighting; color; quality; requested exclusions`.

## Four-dimensional camera coding

Read `references/camera-codec.md` for exact tables, combinations, emotion mappings, and conflict diagnosis; `references/vocabulary.md` supplies movement vocabulary.

`Complete shot = Z distance + Y height + X orientation + F lens treatment + movement + rhythm + constraints`.

- Z1–Z9: extreme close-up through extreme wide.
- Y1–Y7: worm's-eye through overhead.
- X1–X4: frontal through rear orientation.
- F: focal length, depth of field, distortion, POV/OTS, compositional geometry.

Use at most two movement axes per shot. Large X rotation at Z1–Z3 risks facial distortion; widen to Z4+ or reduce rotation. Unspecified default: Z4 medium close-up, Y4 eye level, X2 three-quarter, 50mm, shallow depth of field, eased movement. Name a concrete focal length, depth-of-field behavior, and orientation. Use coordinate progression for narrative development. Images anchor appearance, videos movement, and text the starting camera state. Small physically motivated lens imperfections can add realism.

## Image-led route in detail

Use the image as a framing/identity reference rather than automatically freezing its exact instant. Most ordinary moments suit **observation**; use **reaction** for an explicit dramatic change. A simple observation prompt may fit 300–500 characters; complicated reactions require sub-beats, and incompatible panel aesthetics may need a different image or a mood collage.

Round 1 analysis includes subject, atmosphere, strongest element, apparent image source, aspect ratio and any outpainting recommendation, justified duration, mode, everyday physical logic, and face/text/watermark/clarity risks. Offer two hook candidates with mode, evolution, share/replay appeal, and suitability. Ask for observation, reaction, or a user-defined direction; wait for selection.

Round 2 follows the selected mode:

- Observation: 3–4 natural micro-actions; explicit main-subject behavior; concrete extras' actions in each interval; an interaction event when multiple people appear; a single locked camera behavior; coherent texture. Keep people alive rather than statue-still.
- Reaction: unfold real reactions into plausible sub-beats; source examples budget at least 2.5 seconds for blushing, 3 seconds for crying, or 1.2 seconds for a startle. If the supplied image depicts a later dramatic moment, specify its temporal role.
- Four texture layers: platform compression, device imperfections, location imperfections, and lens behavior. Read the source's nine texture exclusions and positive style lock; preserve the image's credible origin instead of polishing it into an unrelated advertisement.
- Audit body/prop geometry, foreground occlusion, entrances, eyelines, and chronology. State duration based on content, not a fixed 15-second default. Match image/video ratios; offer outpainting for a landscape-to-portrait conversion rather than silently cropping.
- The image-led source imposes a hard 2,000-character prompt limit, aiming for 1,900 to leave margin. Measure actual Unicode character length with Python `len()` or an equivalent code-point count; do not invent the count. See its reduction rules before cutting necessary action detail.
- Keep a visual hook within two seconds and an ending detail that rewards replay. Explain the chosen design outside the copyable prompt.

The installed source includes historical platform-moderation observations for indoor/group scenes in `references/image-to-prompt.md` and `experiments/summary.md`. These are source-specific observations, not a guaranteed diagnosis or a reason to alter the user's intended lawful content. Its operating suggestions are concise, physically clear descriptions; avoiding an unintended nightclub/music/venue connotation; a static wide group shot instead of panning across each person; fixed foreground props in fragile group shots; and layered micro-movement, a focused response, and tightly scoped larger movements. Preserve explicit user actions rather than silently replacing them to satisfy an example.

## Interaction and output

Collect missing duration, ratio, references, image platform, and useful mood/usage preferences once. For a clear single-clip request, provide the copyable prompt plus brief asset preparation. When exploring a concept, offer 2–3 differentiated versions with first-frame advice and shared reference numbering. Long production follows its staged pipeline; image-led work follows the two rounds above. Revise chosen timing, style, camera, dialogue, sound, or segmentation on request.

Full delivery structure:

```text
Video prompt
Theme: ...
Duration: ... | Aspect ratio: ...
Shared references: actual handles and roles, with image prompts if needed
Version 1: title
Prompt: complete submission text
References: first frame, optional last frame, and their preparation prompts
Version 2: title, same structure when comparison is useful
Design notes: differences between versions
```

For image-led delivery also label mode, specific hook, texture strategy, justified duration, and measured count. Supporting examples retain their original language; translate illustrative labels and prose without changing user dialogue or machine handles.

## Optional dreamina execution

After prompt delivery, offer CLI execution only when runtime support exists. The installed source's CLI route supports **2.0 only**, using `seedance2.0_vip`, normally 720p, and the planned duration. A 2.5 prompt, especially above 15 seconds, must not be sent to that route; use an actually supported downstream tool or explain manual platform execution.

Execution requires explicit confirmation. Read `references/cli-integration.md` before running for escaping, asynchronous jobs, failures, and audit output. First read credits with `dreamina user_credit`; the source requires stopping below 100 credits. `fast` selects `seedance2.0fast_vip`; 1080p is supported only by the source's VIP route and has a higher cost. Do not run merely because the prompt was requested. Stop on a high platform-risk result and explain the issue. Return the real `submit_id` and output path after execution. Stop after three consecutive failures and ask how to proceed; do not retry indefinitely or claim refunds have completed without evidence. The source notes that a failed platform review may take several minutes.

## Delivery checks

Confirm version, actual capability and reference limits; correct reference numbers/roles; requested face authorization and platform restrictions; complete time coverage; speaker/emotion/quoted dialogue; separate audio/visual instructions; matching image style; continuity and handoff states; a supported duration route; and an edit plan when stitching.

For motion, sustain any continuing camera move in each interval, give people plausible action, fix the background for same-scene wardrobe changes, describe morph direction/medium/duration, label brief flashes and the return state, make effects influence surrounding light, and explicitly connect music beats to motion when requested.

For camera, check at most two axes, no close-range large orbit, concrete focal length and depth of field, orientation, target-bound references, and narrative coordinate progression. For long edits, check rhythm, trim allowance, coherent grade, a clear climax, opening hook, and replay ending.

For C/D, check the selected mode, physical audit, source-consistent texture, realistic reaction sub-beats or observation micro-actions, extras and interaction, ratio solution, measured count, full timeline, panel order and exclusion of grid UI. For image prompts, check correct ratio, faithful identity/clothing, continuous natural language, coherent style, and requested exclusions. Prompt quality and compilation do not establish that a paid generation or model behavior has been tested.
