---
name: videoPromptAdapter
description: Adapt an existing video concept or segment plan into prompts for an exact model version and input mode. Supports Infinite Canvas short and long videos and pet commerce planning references; does not generate media.
metadata:
  version: "1.1.2"
  displayName: Video Model Prompt Adapter
  author: Infinite Canvas
---

# Video Model Prompt Adapter

Use English for explanations and newly created text unless the user requests another language. Preserve supplied dialogue, exact reference handles, tool parameters, and model-required fixed syntax. Supporting source material does not override the selected output language.

Accept an established creative plan, exact model/version, provider, input mode, duration, actual reference responsibilities, and sound goals. Return one complete prompt or one per segment, with settings separately. This skill handles text only: no canvas operations, generation, model substitutions, or extra authorization. Preserve approved story, exact dialogue, pet identity, product facts, sequence, and user requirements; formatting must not remove or change them.

## Model routing

Verify the exact version and mode, then use this skill's actual name and scope to read the corresponding reference:

| Target | Reference | Evidence |
| --- | --- | --- |
| Kling VIDEO 3.0 (excluding Omni) | `references/klingVideo30.md` | Official VIDEO 3.0 guide reviewed; actual inputs and switches still depend on the node |
| Veo 3.1 | `references/veo31.md` | Google Veo prompting guide reviewed; the provider must verify version and inputs |
| Wan 3.0 | `references/wan30.md` | No verifiable official or corresponding third-party 3.0 guide found; use generic guidance marked unverified |

Prefer readable official guidance above that matches the exact version and mode. If unavailable or it does not cover the input mode, look for an exact match in the third-party `videoPrompting` skill below. **Similar model names do not establish the same version.** Verify mode coverage before use; otherwise use the generic method and mark model-specific optimization unverified.

| Exact target | Third-party `videoPrompting` path |
| --- | --- |
| Ovi | `references/models/ovi/prompting.md` |
| Veo 3 or 3.1 | `references/models/veo3/prompting.md` |
| Wan 2.2 | `references/models/wan22/prompting.md` |
| Wan Animate 2 | `references/models/wanAnimate2/prompting.md` |
| Seedance 2.0 | `references/models/seedance2/prompting.md` |
| MiniMax H3 | `references/models/minimaxH3/prompting.md` |
| LTX-2, LTX-2.3, LTX-2.5 | `references/models/ltx2/prompting.md`, `references/models/ltx23/prompting.md`, `references/models/ltx25/prompting.md`, respectively |

For third-party routing, find the real `videoPrompting` with `skillOperator(action=list, scope=global)`, then read its main document, `sourceInfo.md`, and selected path using the returned name and `scope=global`. Without `skillOperator`, use the actual global location in this turn's catalog. Read examples with the same name/scope and their relative paths. If the skill, provenance, guide, or matching mode is unavailable, identify the missing source and use the generic method marked unverified; do not borrow an adjacent version. Third-party advice does not prove provider or Infinite Canvas capabilities. Deliver sources and unresolved verification boundaries.

Third-party rules only organize prompts for their models. This skill, the caller, and approved story, exact dialogue, real references/sound, duration, authorization, and settings take precedence. If upstream single-line, default-duration, audio, or reference conventions conflict, preserve the user's goals and workflow requirements rather than dropping speech/references/shots or changing models. The workflow maps real references; sample tags such as `<Picture 1>` are not already bound.

`petCommercePromptSd25` finalizes Seedance 2.5 pet shorts and long-video segments; `sd25-pe` finalizes ordinary Seedance 2.5 long-video segments; the caller's `workflow` PART A finalizes Seedance 2.0 long-video prompts. Do not rewrite those final prompts here. Model changes require the calling workflow to re-adapt affected segments and verify authorization.

## Generic method

Describe actual inputs. Text-to-video establishes subject, scene, and starting state. Image-to-video identifies the image's responsibility and emphasizes action, visible change, camera, and ending without redesigning established appearance. Describe first/last frames and multiple references only when supplied and supported. Order action and sound chronologically. Every line identifies speaker, exact words, language, delivery, and on/off-screen source. Include only necessary continuity, contact, and light constraints. Separate settings, prompt, and pending bindings; unavailable media, unset controls, and model quality are not facts.

Deliver the creative objective, reference sources/responsibilities, complete copyable prompts, actual settings, and unverified items. The caller maps tags such as `{{ref N}}` through real connections. Pending media require identities and binding rules, not invented numbers. Return explicitly unsupported necessary inputs to the workflow instead of dropping them, changing models, or silencing speech. Preserve unknown speech/lip-sync/timing goals as unverified for authorized attempts.

For whole-film and long-video pet commerce planning, read `references/petCommercePlanning.md`. It provides creative input; the dedicated pet skill finalizes each Seedance 2.5 segment within actual model and skill duration limits. Sources, licenses, and verification boundaries are documented in the references and project knowledge base.
