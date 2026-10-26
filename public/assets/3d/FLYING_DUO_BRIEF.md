# Flying Duo — 3D Asset Brief

## References

- `references/male-floating-reference.png`
- `references/female-floating-reference.png`

## Requested result

Two editable 3D characters for a scroll-driven portfolio hero. Both characters need a usable humanoid rig, independently movable hands and legs, secondary cloth controls, a readable airborne pose, and hologram props that can be animated separately.

## Retained design

- Young male and female characters with semi-realistic stylized proportions.
- Dark navy, warm ivory, black, and antique-gold palette.
- Flowing Renaissance-inspired clothing with large sleeves and trailing fabric.
- Dark wavy hair and luminous futuristic hologram panels.

## Construction

- Separate character collections and armatures.
- Humanoid bone chains for root, torso, head, arms, hands, legs, and feet.
- Three cape controls and three skirt/coat-tail controls per character.
- Hologram panels parented to the hand bones and kept as distinct emissive meshes.
- One scroll-scrubbable 1–100 frame flight animation per character.

## Outputs

- `flying-duo-rigged.blend` — editable source and presentation scene.
- `male-floating-rigged.glb` — centred male character with animation.
- `female-floating-rigged.glb` — centred female character with animation.
- `male-preview.png`, `female-preview.png`, `flying-duo-preview.png` — inspected renders.

## Assumptions and known limits

Only one three-quarter reference is available for each character, so back construction and hidden anatomy are inferred conservatively. The generated meshes are a clean stylized production blockout with semantic parts and controls, not a scan-quality likeness. Cloth is bone-driven for deterministic web playback; it is intentionally not a baked physics simulation.

