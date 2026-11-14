---
name: lengyi-seedance25-prompt
description: Use to expand a novel excerpt, one-line plot, or theme into a Seedance 2.5 multi-shot short-video prompt, normally 20–30 seconds and at most 30 seconds. Design subject and scene reference image prompts first, then one complete video prompt with shot timing, actions, and camera moves. Text only; does not generate assets or video.
metadata:
  displayName: Turn Stories into Multi-Shot Prompts (Seedance 2.5)
---

# Turn Stories into Multi-Shot Prompts (Seedance 2.5)

Expand the input into a continuous 20–30 second shot sequence and deliver one video prompt. Anchor subjects, scenes, and sound in its header, followed by numbered shots. Use English unless the user specifies another language; preserve verbatim dialogue, reference handles, and required model syntax. Supporting references retain their original language and do not override this delivery language.

## Required foundations

- Prepare text-to-image prompts for every subject and scene before the video prompt. Header names refer to those assets.
- Use this single soundtrack instruction: `Music: Do not generate background music; generate only corresponding sound effects.` Shot bodies describe visuals only, leaving sound matching to the model.
- Keep narrative purpose and explanations in the script overview, outside the submission prompt.
- Adapt a novel excerpt by extracting its visual beats; expand a one-sentence plot into cause, consequence, and a turn; develop theme words into a short narrative before designing shots.
- State total duration, shot count, and every shot's time interval. Respect the requested duration/count; cap duration at 30 seconds and briefly disclose a longer request's adjustment.

## 1. Develop the story

Identify a causal sequence of visible beats, subjects and props, locations and scene changes, time, weather, spatial layout, tone, and genre. Fill unspecified visual details conservatively. Explain narrative planning only in the script overview.

## 2. Derive shots from beats

Choose total duration, lay out beats, choose a shot type for each, assign durations, then reconcile the sum. Do not derive the shot count by dividing duration by an average. There is no fixed shot-count tier or cap.

Default to 20–24 seconds for simple material and 25–30 seconds for a complete short narrative. Use these planning ranges:

| Shot type | Typical duration |
| --- | --- |
| Close-up or fast shot | 2–3 seconds |
| Medium or narrative shot | 3–6 seconds |
| Wide or fixed shot | 6–7 seconds |

The original delivery checklist also allows close/fast shots of 1–3 seconds, narrative shots of 3–5 seconds, and wide/establishing shots of 5–7 seconds. Match duration to the actual action rather than forcing every shot to the same length. A 30-second film often has 8–14 shots and a 20-second film 7–10; these are references, not quotas.

Every cut needs a narrative reason: a change of space, time, viewpoint, information, or emotion. Prefer camera movement and evolving action when one shot can carry the same beat. Alternate longer and shorter shots; use fast cuts as a group, then settle with a medium or wide shot. A long establishing shot should contain layered movement rather than an empty hold.

Suggested rhythm: 6–7 second establishing shot, medium narrative development, a cluster of 2–3 second close-ups for the climax, and a closing shot of at least 3 seconds. The hard arithmetic rule is that shot durations sum exactly to the total, which never exceeds 30 seconds. Label continuous intervals such as `0.0–6.5s`; the last endpoint equals the total.

## 3. Lock subject and scene assets

Give every subject a short asset name and an invariant description: age, hair, eyes, facial shape, clothing/material, and identifying props. Keep the wording unchanged. For each scene, lock place, time, lighting/color, weather, and layout. List relationships, entrance order, and which subjects appear in each shot.

Use short asset names in the video header and shots. Fixed appearance belongs in the asset prompts, not repeated shot by shot. Choose one consistent visual style; state it in the asset section and only once in video Shot 1.

## 4. Write asset image prompts

Always supply both subject and scene prompts before the video prompt:

- Subjects: repeat the anchor description verbatim, then pose/view, a clear full or half body, consistent style, detail, and soft studio light. Use a plain, white, or softly blurred background so the subject is isolated from narrative scenery.
- Scenes: show the representative full environment, with the locked layout, lighting, and style. Exclude people and temporary props.
- Use the actual number of assets, typically 1–3 subjects and 1–2 scenes. Do not invent extra assets to fill a quota.

## 5. Write moving shots

Each `Shot N` occupies one line and includes:

- A time interval immediately after its number.
- The current scene name when scenes change; in a single location, Shot 1 may establish it.
- Present subjects identified by short name plus only their changing state.
- Shot size and camera movement with direction/speed. A 6–7 second establishing shot needs phases, such as a low push followed by an upward tilt; a 2–3 second close-up needs one clean move.
- Strong verbs describing action progression. Shots longer than 3 seconds need at least two evolving actions; a 2–3 second shot should complete one action.
- A change over time in light, fabric, leaves, expression, or color temperature.
- Composition and foreground/background relationships.

Each shot must contain a strong action verb, a camera movement, and an environmental or lighting change. Rewrite any shot that reads like a still-image caption. Show narrative progression through visible action and shot design. Include no sound effects, narrative-purpose labels, or explanations inside shot lines.

For example: `The traveler strides toward the camera; wind lifts the coat hem as the camera tilts slowly from the ground into a wide shot and the sun sinks behind the ridge.`

## 6. Control length

Keep the combined asset prompts and video prompt at or below 4,000 characters, excluding explanatory headings. Budget at most 1,000 characters for assets and roughly `3000 / shot count` per shot. Compress repeated environment/style, then merge secondary shots; preserve camera direction and evolving action.

## 7. Deliver and review

Use the structure in `references/templates.md`, translating labels and prose into the delivery language. Its original examples and vocabulary remain source material. Deliver:

1. Script overview: total duration, shot count and beat-based reasoning, shot types/duration sequence, style, subject profiles, and scene anchors.
2. Asset image prompts: all subject and scene assets.
3. One copyable video prompt using the exact English structure below.
4. The measured combined character count, at most 4,000.

```text
Subjects: Subject 1, Subject 2
Scene: Scene name
Music: Do not generate background music; generate only corresponding sound effects.
Shot 1 | time interval; visual action, camera movement, environmental change
Shot 2 | time interval; visual action, camera movement, environmental change
```

Before delivery confirm timing sums, varied rhythm, motivated cuts, all asset prompts, stable anchors and short names, correct participants/scene per shot, one unified style, visual-only shot bodies, the three motion elements, and the character limit. The fixed music line is the sole soundtrack instruction. Prompt design itself does not submit a generation task.
