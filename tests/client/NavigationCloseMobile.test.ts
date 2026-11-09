import { closeMobileSidebar } from "../../src/client/Navigation";

it("removes modal semantics and restores the menu trigger when closing the drawer", () => {
  document.body.innerHTML =
    '<button id="hamburger-btn" aria-expanded="true"></button><aside id="sidebar-menu" class="open" aria-modal="true"></aside><div id="mobile-menu-backdrop" class="open"></div>';
  document.documentElement.classList.add("overflow-hidden");
  closeMobileSidebar();
  expect(
    document.getElementById("sidebar-menu")?.getAttribute("aria-hidden"),
  ).toBe("true");
  expect(
    document.getElementById("sidebar-menu")?.hasAttribute("aria-modal"),
  ).toBe(false);
  expect(
    document.getElementById("mobile-menu-backdrop")?.classList.contains("open"),
  ).toBe(false);
  expect(
    document.getElementById("hamburger-btn")?.getAttribute("aria-expanded"),
  ).toBe("false");
  expect(document.documentElement.classList.contains("overflow-hidden")).toBe(
    false,
  );
});
