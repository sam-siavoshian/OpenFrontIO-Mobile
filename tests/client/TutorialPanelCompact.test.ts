import { EventBus } from "@openfront/shared/EventBus";
import { TutorialPanel } from "../../src/client/hud/layers/TutorialPanel";
import { UserSettings } from "../../src/client/UserSettings";
import type { GameView } from "../../src/client/view";

it("expands and collapses touch hints without dismissing or skipping their content", async () => {
  const panel = new TutorialPanel();
  panel.game = {
    myPlayer: () => null,
    markedPlayers: () => null,
  } as unknown as GameView;
  panel.eventBus = new EventBus();
  panel.userSettings = new UserSettings();
  Object.assign(panel, { active: true });
  document.body.append(panel);
  await panel.updateComplete;
  const toggle = panel.querySelector<HTMLButtonElement>(
    ".mobile-tutorial-summary button",
  )!;
  const detail = panel.querySelector(".tutorial-detail")!;
  const content = detail.textContent;
  expect(toggle.getAttribute("aria-expanded")).toBe("false");
  toggle.click();
  await panel.updateComplete;
  expect(toggle.getAttribute("aria-expanded")).toBe("true");
  expect(detail.classList.contains("is-expanded")).toBe(true);
  toggle.click();
  await panel.updateComplete;
  expect(detail.classList.contains("is-expanded")).toBe(false);
  expect(detail.textContent).toBe(content);
  panel.remove();
});
