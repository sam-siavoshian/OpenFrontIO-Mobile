import { vi, it, expect, afterEach } from "vitest";
import { SettingsModal } from "../../src/client/hud/layers/SettingsModal";
import { showInGameConfirm } from "../../src/client/InGameModal";
import type { GameView } from "../../src/client/view";

vi.mock("../../src/client/InGameModal", () => ({ showInGameConfirm: vi.fn() }));
vi.mock("../../src/client/Utils", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../src/client/Utils")>()),
  homeHref: () => "#exit-confirmed",
}));
afterEach(() => {
  vi.clearAllMocks();
  history.replaceState({}, "", "/");
});
function menu(spawning = false) {
  const view = new SettingsModal();
  view.game = {
    myPlayer: () => ({ isAlive: () => !spawning }),
    inSpawnPhase: () => spawning,
  } as unknown as GameView;
  return view;
}
it.each([false, true])(
  "keeps the session when Exit is cancelled (spawning: %s)",
  async (spawning) => {
    vi.mocked(showInGameConfirm).mockResolvedValue(false);
    await menu(spawning)["onExitButtonClick"]();
    expect(showInGameConfirm).toHaveBeenCalledOnce();
    expect(location.hash).toBe("");
  },
);
it("leaves only after an explicit confirmation", async () => {
  vi.mocked(showInGameConfirm).mockResolvedValue(true);
  await menu()["onExitButtonClick"]();
  expect(location.hash).toBe("#exit-confirmed");
});
it("does not stack confirmations on repeated taps", async () => {
  let finish!: (value: boolean) => void;
  vi.mocked(showInGameConfirm).mockImplementation(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  const view = menu();
  const first = view["onExitButtonClick"]();
  await view["onExitButtonClick"]();
  expect(showInGameConfirm).toHaveBeenCalledOnce();
  finish(false);
  await first;
  expect(location.hash).toBe("");
});
