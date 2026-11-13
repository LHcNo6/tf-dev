---
name: petCommercePromptSd25
description: Write or optimize Seedance 2.5 pet commerce scripts, asset images, and shot-by-shot video prompts featuring an anthropomorphic pet host, product demonstrations, and speech. Creative text only.
metadata:
  version: "1.1.1"
  displayName: Pet Commerce Prompts (Seedance 2.5)
  author: Infinite Canvas
---

# Pet Commerce Prompts (Seedance 2.5)

Use English for explanations and newly created text unless the user requests another language. Preserve supplied dialogue, exact reference handles, tool parameters, and model-required fixed syntax. Supporting source material does not override the selected output language.

Turn an idea, product information, or existing script into one complete short-video prompt for Seedance 2.5. Used independently, deliver text only; a workflow receives the script, necessary asset prompts, and video prompt. The caller handles generation, canvas, model settings, authorization, and budget. This skill invokes no generation tools.

This is the sole directing and prompt rule source for Seedance 2.5 pet commerce. It follows the official Volcengine Ark guide and incorporates pet commerce methods. Do not invoke/update external `sd25-pe` at runtime or combine this with general pet, Lengyi, or `workflow` templates. Respect an explicitly different target model and use its corresponding creative rules.

## 1. Confirm content and facts

Preserve the pet, product, story, lines, media, style, and constraints. For commerce without a specified performance style, default to a pet imitating a human host through seated posture, gaze, front-paw gestures, and natural speaking movements. Preserve species, face, coat, and paw anatomy. Respect natural-animal, narration, silent, or stronger anthropomorphic choices. Revise supplied scripts only within scope; when original sales dialogue is requested, write complete lines grounded in known facts.

Use only supplied or verifiable brands, models, prices, offers, purchase destinations, materials, features, and effects. Invent no reviews, sales, or efficacy claims. Mark missing product facts and provide the achievable creative structure. If no product is wanted, omit sales content. Actual product images anchor appearance; unseen backs and generated packaging lettering are not factual evidence.

Confirm model, mode, and available inputs. Without a model selection, a Seedance 2.5 draft may mark settings unresolved. Actual node/provider capabilities and authorization govern execution; a model name does not guarantee sound, lip sync, multiple shots, or specific references. Explicitly unsupported necessary inputs are conflicts. Unknown performance quality may be attempted within the caller's authorization and marked unverified.

## 2. Create the script and assets

Default to 20–30 seconds unless a duration is supplied. A single generation prompt is limited to 30 seconds and to actual node support. For standalone shorts, arrange the opening, product reveal, demonstration, and ending as needed; combine or omit irrelevant beats. For a long-video segment, accept the whole-film context, segment number, duration/story/exact lines, adjacent states, actual references, and voice persona. Optimize only that segment, preserving story and dialogue; do not repeat an opening or sales ending in every segment. The whole film may exceed 30 seconds; the limit applies to this segment. Write naturally speakable lines with pauses before allocating stages. Do not silently shorten approved dialogue.

Design persona and demonstration purpose around audience and product facts. Prefer frontal, unobstructed muzzle views for short lines. Product contact may precede or follow a line while preserving requested on-camera speech and demonstrations. Every selling point requires evidence or a visible demonstration, not a creative assumption presented as fact.

Establish starting posture, gaze, paw/product positions, main action, contact points, and visible ending before deciding framing, camera, light, and movement. Focus each stage on one principal state change. If action, speech, and interaction overcrowd it, reduce secondary action, allocate time, or propose splitting. Preserve core demonstrations. Static cameras and stable environments are valid; no fixed shot count or mandatory motion.

Reuse pet/product/scene assets first; write complete image prompts for necessary missing media. Identify actual sources and responsibilities: identity, appearance, space, action, sound, or words. Separate pet/product references require explicit spatial and paw-contact relationships. Never claim unavailable references were read or generated. Preserve the user's reference mapping when responsibility is uncertain; do not infer identity from filenames.

## 3. Assemble the Seedance 2.5 prompt

Start with a concise creative objective and reference responsibilities, then continuous shots or event stages, followed by only necessary continuity and sound instructions. For each stage include visible initial state, key action, filmable ending, gaze/contact, and suitable framing/camera. For each line include speaker, language, exact words, delivery, pauses, and related actions. Be complete and concrete; generic claims of cuteness or cinematic quality do not substitute for detail. Avoid repeating appearance already established by references.

Use stages to establish sequence. When key reveals, handoffs, speech rhythm, or cuts need timing, use continuous, non-overlapping integer-second intervals or shot numbers. Timing is a target budget, not a guarantee of precise cuts, lip sync, or frame accuracy; do not use timestamps to prescribe high-frequency motion. Preserve user-specified fractional timing as a creative requirement while marking precision unverified. List total duration, resolution, ratio, and sound switches separately as node settings. Event timing belongs in creative content; prompt text cannot configure controls.

Distinguish on-screen generated speech from narration. For on-screen lines, specify exact spoken words and coordinated mouth movement; narration does not drive the mouth. Audio references may control voice only or contain actual words: preserve sources and responsibilities and avoid duplicate dialogue. Separate dialogue, ambience, contact effects, music, and subtitles. Add background music and subtitles only when requested; natural ambience and dialogue may remain. Natural language or the official guide's dialogue/effect/music/subtitle delimiters are acceptable, not mandatory syntax. A no-subtitles request can be stated but is not guaranteed.

Bind assets with the actual provider/node reference syntax. When Infinite Canvas video nodes use `{{ref N}}`, map actual incoming edges and `referenceOrder`, not node names, plans, or media types. Before assets exist, the review plan identifies the designated node, expected current output, responsibility, and binding rule. Once outputs and connections exist, fill only those bindings. Pause generation when real references or outputs cannot be verified. Preserve user-specified reference semantics. If numbering changes, show affected authorization differences in interactive mode; automatic mode continues only within established scope and dependencies.

## 4. Deliver and review

As requested, deliver the script overview/stages, necessary image prompts, reference sources/responsibilities, **one complete video prompt**, settings recommendations, and review priorities. Deliver only the requested subset when appropriate. Make dialogue, action, references, and requirements fully visible; do not replace content with placeholders or references to previous text. Read [Shot Example](references/shotGuide.md) when writing a complete video prompt.

Review product facts, cross-shot pet/product state, executable speech/action timing, sound sources, actual media mapping, target length, and interface constraints. Mark drafts whose media/interface remains unresolved. Do not claim to have reviewed unseen/unheard media. Packaging lettering, spoken delivery, animal lip sync, and second-by-second cuts depend on models and inputs and cannot be guaranteed.
