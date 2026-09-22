# 09 — The build-deck skill

**What to build:** A project skill that loads when Zachary hands over a source markdown file and converts it into a talk. It carries the style rules (from presentation-style.md and the README writing rules), the layout reference with one example per layout, the source format, the conversion steps (scaffold, map slides to layouts, write data and figure scripts, move Spoken into notes, run check, fix failures, report warnings and escape-hatch uses), and the rule against invented numbers. See DESIGN_PLAN.md §4 and §7.

**Blocked by:** 02, 04, 05, 06, 07, 08

**Status:** ready-for-agent

- [ ] The demo talk passes `check` with zero warnings
- [ ] Converting a short sample source file with the skill produces a talk that passes `check`
