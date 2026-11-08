# Playing OpenFront on a touch screen

OpenFrontIO-Mobile keeps the full game on the map in portrait and landscape.
Touch controls remain available on wide tablets and folding screens.

1. Choose **Solo** or a lobby. Tap unclaimed land to spawn.
2. Drag to pan. Pinch to zoom, or use **+ / −**. The crosshair returns to your territory.
3. Tap nearby land, then tap the central sword to attack. Adjust the bottom slider to choose the troop percentage.
4. Swipe the build bar to find a unit. Hold an icon to inspect its cost. Tap an available building, position its preview, and tap the preview again to confirm. Drag the preview to adjust its position.
5. Tap another player's land for diplomacy, donations, chat, emoji, and other available actions.
6. Tap a ship and then water to move it. Hold and drag for a group, or use the flag button to select all warships.
7. Tap **?** for the touch guide. Settings, pause/speed (where permitted), sharing, and exit remain in the top bar.

The interface accounts for safe areas, dynamic viewport height, touch input,
small-screen scrolling, keyboard focus, and reduced motion. Map gestures are
separate from scrollable panels. Build buttons have accessible names and states.
On short screens the camera buttons form a horizontal strip to stay clear of
the tutorial and resource controls.

## Verification

Browser touch emulation: 320×568, 390×844, 844×390, 768×1024, and 1280×800.
Checks include screen rotation, horizontal overflow, reachable Help, 48×44 build
buttons, scrollable actions, native guide dismissal, touch spawning, attacking,
building, and pinch zoom. A live attack increased territory from 52 to 747 tiles;
a touch placement increased the city count from 0 to 1.

Regression tests cover proportional pinch scaling, lifting either finger and
continuing to pan, cancellation, avoiding unintended attacks/builds, toolbar
commands, custom-element registration, and existing HUD interactions.

Run `npm run typecheck`, `npm run build-prod`, and the relevant Vitest files:
`InputHandler`, `InputHandlerMobileGestures`, `InputHandlerGestureZoom`,
`MobileControls`, `MobileControlsRegistration`, `UnitDisplay`,
`ControlPanelAttackRatio`, `ControlPanelTick`, `BuildMenuCost`,
`HelpModal.mobile`, and `GameRightSidebar`.

The game requires WebGL2. Browser emulation verifies responsive behavior and
input routing; it does not replace testing on physical iOS and Android devices.
