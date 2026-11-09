import { createRenderer } from "../../src/client/hud/GameRenderer";

it("registers touch controls when the lazy game renderer loads", () => {
  expect(createRenderer).toBeTypeOf("function");
  const Controls = customElements.get("mobile-controls");
  expect(Controls).toBeDefined();
  expect(Controls?.prototype.init).toBeTypeOf("function");
  expect(Controls?.prototype.hide).toBeTypeOf("function");
});
