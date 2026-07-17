# Iron Discipline Background Prompt

Built-in image generation was used to create the first background draft.

```text
Use case: stylized-concept
Asset type: adaptive Codex desktop wallpaper for Codex Dream Skin
Primary request: Create one new standalone 2560x1440, 16:9 desktop wallpaper as edge-to-edge continuous artwork. Generate only the underlying hardcore strength gym scene that will sit beneath a real application interface.

Reference handling: Generate a completely new image from scratch. No input references are used. Do not create a software screenshot, app mockup, poster, brand ad, or interface.

Scene/backdrop: A dark industrial strength-training room at night with matte black rubber flooring, gunmetal wall panels, a heavy power rack, Olympic barbell plates, dumbbell silhouettes, chalk dust in the air, and low red training lights. Concentrate the strongest detail and recognizable equipment between x=62% and x=88%. Continue the same gym environment through x=0% to x=52% as calm low-detail charcoal metal, soft shadow gradients, faint rubber floor texture, and subtle atmospheric haze. The left side must be usable under translucent application controls and must not look like an empty rectangle or UI panel.

Style/medium: cinematic photoreal editorial environment, premium dark sports aesthetic, realistic gym materials, polished but gritty.
Composition/framing: Primary focal point x=70% to x=78%, y=28% to y=55%. Keep every essential object within x=62% to x=88% and y=16% to y=72%, at least 8% from every edge. One continuous perspective, no vertical seam, no split-screen effect. Avoid placing high-contrast highlights near the bottom center where an app composer may appear.
Materials/detail: brushed black steel, matte rubber flooring, worn knurled barbell texture, powder-coated rack uprights, stacked iron plates, faint chalk particles, soft red LED reflections on metal edges.
Lighting/mood: low-key gym lighting, narrow overhead strip lights, restrained red rim light from the right rear, lifted shadows, controlled midtones, readable dark atmosphere, disciplined and focused mood.
Color palette: carbon black, graphite gray, gunmetal, deep oxblood red, muted lava red accents, small warm white highlights. Keep highlights restrained and local.
Invariants: Pure wallpaper only. One physical environment, one perspective, continuous depth, no people, no interface, no readable text, no logo, no watermark. Return only the opaque edge-to-edge wallpaper.
Avoid: screenshot, UI, UX, GUI, software window, browser, mockup, title bar, menu bar, sidebar, navigation, dashboard, panel, card, rounded rectangle, button, icon, input box, composer, chat panel, code editor, terminal, cursor, device frame, poster layout, typography, letters, words, Chinese text, numbers, brand logo, label, watermark, border, split screen, collage, blank panel, person, face, hands, bodybuilder, celebrity, copyrighted character, excessive neon, pure red flood, unreadable high contrast noise on the left side.
```

Source output: `/Users/baojian/.codex/generated_images/019f6def-3fa5-7100-a44f-d0d89a1d41bf/call_yFFw2DACP7A4n0NaoP0QQIIh.png`

Export command:

```bash
sips -z 1440 2560 -s format jpeg -s formatOptions 90 source.png --out background.jpg
```
