// Right-click menu with "Mark as unread". Opened as a popup with props
// { kind: "agent", terminal } or { kind: "tab", tab, space, terminals: [addresses] }.
// Unread marks live in shared("unread"): { [terminal address]: true }. The agents
// and tabs mods show them as "done" and clear them when you come back to the agent.

import { View, div, svg } from "gpui-kit";
import { v_flex, h_flex } from "gpui-base";
import { run, props, closeOverlay, theme, shared, setShared } from "herdr";

function items(p) {
  const unread = shared("unread") ?? {};
  const addrs = p.kind === "tab" ? p.terminals ?? [] : [p.terminal];
  const marked = addrs.length > 0 && addrs.every((a) => unread[a]);
  const toggle = [marked ? "Mark as read" : "Mark as unread", () => {
    const next = { ...unread };
    for (const a of addrs) marked ? delete next[a] : (next[a] = true);
    setShared("unread", next);
  }, addrs.length > 0];
  if (p.kind !== "tab") return [toggle];
  return [
    toggle,
    ["Rename", () => run("tab.rename", { id: p.tab }), true],
    ["New tab", () => run("tab.new", { space: p.space }), true],
    ["Close", () => run("tab.close", { id: p.tab }), true],
  ];
}

export default class UnreadMenu extends View {
  render() {
    const t = theme();
    const list = items(props() ?? {});
    return v_flex().w_full().p(5).bg(t.popover).text_size(12.8).children(
      list.map(([label, act, enabled], i) =>
        h_flex().id(`um-${i}`).h(31).px(8).rounded(7).items_center()
          .text_color(enabled ? t.foreground : t.dim)
          .when(enabled, (el) => el.hover((s) => s.bg(t.hover)).on_click(() => { closeOverlay(props()?.overlay); act(); }))
          .child(div().flex_1().child(label))));
  }
}
