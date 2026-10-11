# SpeakEasy — illustrated edition

Created with the built-in Imagegen tool. Images are stored in the project, optimized as WebP, and require no external image service at runtime. Original generated PNGs remain in the Codex generated-images folder.

## Saved assets

| File | Use |
| --- | --- |
| `public/art/emmy-world.webp` | Emmy, the home hero, profile and learning illustrations |
| `public/art/conversation-worlds.webp` | Six topic scenes: café, travel, culture, daily life, ideas and work |
| `public/art/everyday-worlds.webp` | Six topic scenes: pets, sport, books, games, nature and city |
| `public/art/word-play.webp` | Vocabulary games, Spark shop, achievements and dialogs |

## Generation prompts

### Emmy world

Use case: stylized-concept. Asset type: landscape hero illustration for SpeakEasy English learning app. Create an exquisite playful 3D clay-and-paper diorama of a tiny friendly sky-blue rounded conversation companion with small eyes and smile, wearing coral headphones, sitting on an open cream book. Surround with floating speech bubbles, a small globe, peach stars, curved mint plants, blue clouds. Premium polished editorial app illustration, tactile matte ceramic, soft studio shadows, detailed but calm, sophisticated friendly youthful design. Composition landscape 3:2, central subject fully contained with generous edges. Background solid very pale sky blue #eaf4ff. Palette sky blue cobalt coral butter yellow mint lavender. No text, letters, UI or watermark.

### Conversation worlds

Use case: illustration-story. Asset type: six-panel illustration atlas for English conversation topic cards. One landscape image divided into an EXACT seamless 3-column 2-row grid of six equal rectangular panels, no gutters or borders, each scene contained inside its panel with generous margins. Consistent beautiful premium 3D clay miniature editorial style, matte ceramic, soft shadows, vivid pastel sky blue coral mint lilac butter yellow. Top left: cozy little cafe with coral espresso cup, croissant and mint chair on peach background. Top middle: travel adventure with sky-blue suitcase, small airplane, globe and clouds on light blue background. Top right: culture with lavender headphones, vinyl record and little cinema clapper on lilac background. Bottom left: daily life with cute mint plant, sun, comfy yellow chair and blue book on pale mint background. Bottom middle: ideas and learning with blue telescope, glowing yellow star and little pink planet on pale butter yellow background. Bottom right: work and aspirations with coral desk lamp, blue laptop and miniature rocket on pale rose background. No words no text no watermark. All six panels equally sized and carefully separated by their different solid pastel backgrounds.

### Word play

Use case: stylized-concept. Asset type: landscape illustration for vocabulary games and rewards in English learning app. Premium playful 3D matte clay editorial diorama: open lavender and sky-blue word cards with abstract speech-bubble symbols (no letters), golden spark token, coral game controller, mint puzzle pieces and a small blue rounded friendly creature peeking from behind a book. Rich tactile materials, polished soft studio lighting, lively composition with floating tiny stars, pale lavender background. Sophisticated friendly app illustration, landscape 3:2 with subjects fully within frame and generous margins. Palette cobalt sky blue coral butter yellow mint lavender. No text, numbers, typography, UI or watermark.

### Everyday worlds

Use case: illustration-story. Asset type: six-panel illustration atlas for English learning app conversation cards. One landscape image divided into EXACT 3 columns and 2 rows, six perfectly equal square panels, no gutters no borders, clean aligned grid. Consistent premium 3D matte clay editorial miniature style, soft studio shadows, sophisticated playful look with vibrant pastel sky blue coral lavender mint butter yellow. Top left: adorable small corgi dog and fluffy cat beside a blue pet bowl, soft peach background. Top middle: mint tennis racket, coral basketball, blue sneakers and tiny water bottle, light blue background. Top right: open book with miniature fantasy castle and little stars floating above, lavender background. Bottom left: coral game controller, pastel handheld game console and floating yellow pixel-like star, mint background. Bottom middle: leafy miniature green landscape with tree, tiny bicycle and sunny clouds, pale butter yellow background. Bottom right: picturesque tiny colorful city with coral and blue houses, mint trees and little bus, pale rose background. Each scene fully contained in its own square cell with margins. No writing letters numbers typography UI or watermark.

## Interface system

## Emmy companion (October 11)

`public/art/emmy-poses.webp` is a transparent 3 × 2 atlas: idle, wave, celebrate, think, blink and hug. Generated with ImageGen using `emmy-world.webp` as the identity reference, then resized to 1200 × 800 and encoded as WebP (quality 90, alpha quality 100). CSS animates each pose; all text and controls are accessible HTML. The companion can rest, respects reduced motion and hides during voice sessions and dialogs.

Prompt: Use case: stylized-concept. Asset type: transparent mascot expression sheet for the existing SpeakEasy English-learning PWA. Reference image: use ONLY the sky-blue rounded companion wearing coral headphones as the identity/style reference. Create six full-body versions of THAT SAME Emmy character, as a perfectly aligned sprite atlas: EXACT 3 columns by 2 rows, equal square cells, landscape 3:2. Genuinely transparent background with alpha, no colored backdrop, no labels, no text, no grid lines. Each character centered at the same position and scale within its square cell, approximately 70 percent of the cell height, generous clear margins, no overlap across cells. Preserve the same round sky-blue soft plush body, tiny black shiny eyes, small curved smile, rosy cheeks, coral over-ear headphones, tiny rounded hands and feet. Soft tactile plush fabric and gentle dimensional studio lighting, premium friendly app character. Top left: idle, standing relaxed, eyes open, gentle smile. Top middle: waving hello with one raised hand and happy eyes. Top right: celebrating, both hands raised, big smile and eyes joyful. Bottom left: thinking, one hand to chin, curious expression. Bottom middle: peaceful blink, eyes softly closed, small smile. Bottom right: hugging a small golden yellow star, warm happy expression. No books, plants, scenery, floor plane, other characters, letters, numbers, logos or watermark. Not a bird; preserve Emmy from the reference.

Sky blue is the base, with coral, peach, mint, lilac and butter-yellow accents. The layout uses rounded tactile surfaces, clear dark headings, soft shadows, category illustrations, restrained hover feedback and a reduced-motion fallback. The existing purchased themes remain supported. Illustrations are decorative: labels and controls remain real accessible HTML text.
