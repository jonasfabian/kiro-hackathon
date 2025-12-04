# Halloween Avatar Collection 🎃👻

A collection of 12 cute, pixel-art style Halloween-themed avatars for the multiplayer drawing game.

## Avatars

1. **skeleton-happy.svg** - Cheerful skeleton with a bow tie
2. **pumpkin-spooky.svg** - Angry jack-o'-lantern with jagged teeth
3. **pumpkin-happy.svg** - Friendly smiling pumpkin
4. **spider-cute.svg** - Adorable purple spider with big eyes
5. **ghost-shy.svg** - Bashful ghost with closed eyes and blush
6. **ghost-cute.svg** - Happy ghost with rosy cheeks
7. **vampire-cute.svg** - Friendly vampire with fangs and cape
8. **mummy-wrapped.svg** - Bandaged mummy with visible eyes
9. **bat-flying.svg** - Purple bat with spread wings
10. **candy-corn.svg** - Personified candy corn character
11. **witch-hat.svg** - Witch with pointy hat and orange hair
12. **cat-black.svg** - Classic black cat with golden eyes

## Design Specs

- **Format:** SVG (Scalable Vector Graphics)
- **Size:** 64x64 pixels (optimized for small displays)
- **Style:** Pixel-art aesthetic with clean, geometric shapes
- **Color Palette:**
  - Dark Violet: `#5D3FD3`
  - Orange: `#FF8C00`
  - Black: `#000000`
  - Complementary colors for variety

## Usage

Avatars are automatically assigned to players when they join a game room. The assignment is handled by the `AvatarService` on the server side.

### Server Side
```typescript
import { AvatarService } from '../services/AvatarService';

const avatar = AvatarService.assignRandomAvatar();
```

### Client Side
```html
<img [src]="'assets/avatars/' + player.avatar" 
     [alt]="player.name + ' avatar'"
     class="w-full h-full object-contain" />
```

## Demo

Open `demo.html` in a browser to see all avatars displayed in a gallery view.

## Features

- ✅ Unique and expressive characters
- ✅ Readable at small sizes (32x32 to 64x64 pixels)
- ✅ Scalable vector format (looks crisp at any size)
- ✅ Halloween theme with cute, cartoonish style
- ✅ Consistent color palette
- ✅ Perfect for multiplayer game UI
