# CareFlow Style Guide: Overview

**Full style guide (web page):** https://aloiferm-cmu-s26.github.io/careflow-mvp/style-guide/
**Source:** `style-guide/index.html`, `src/pages/style-guide/components.css`, `src/pages/app/app.css`

## Purpose

The style guide defines the look of the CareFlow MVP, a tablet app that helps emergency room nurses chart while they talk to patients. It lists every common UI element with a live example and its CSS, so the team builds new screens the same way.

## Design principles

- **Calm:** soft off-white background, few colors, one dark sidebar. Night shifts are long.
- **Safe:** warnings use warm colors and always have words, never color alone.
- **Nurse in control:** nothing reaches the chart until the nurse confirms it.
- **Glanceable:** status dots and counts show the shift's state in a second.

## Foundations

| Element | Definition |
| --- | --- |
| Logo | White cross on a 20px teal tile (5px corners) + "CareFlow" in Inter 15/600. Shows "Patient record" inside a patient. |
| Color | Background #fbfaf5, cards #ffffff, text #0b1f1c, sidebar #0b1f1b, brand teal #00695e, mint #d5f0e4 (success), peach #fdebdd (warnings). Status: coral #cf4318 waiting, teal in progress, amber #9a6410 awaiting review, green #0b7f71 done. All colors are CSS tokens. |
| Typography | Inter (variable). Sizes 26, 20, 18, 16, 14, 13.5 (body), 13, 12. Weights 400 for reading, 500 for titles and buttons. |
| Layout | iPad landscape 1194 x 834 (min 1024px). 64px top bar, 196px left rail, main content, optional 328px right column. |
| Spacing | Steps of 4: 4, 8, 12, 16, 20, 24px. Radius 8px buttons, 10px cards, 14px dialogs. |

## UI elements

- **Buttons:** primary (dark, one per area), secondary (outlined), disabled, floating (Ask Companion), text link. 40px tall minimum.
- **Icons:** 16 and 20px line icons from the Figma file. Status dots (8px) for patient state. Count badge on the bell.
- **Tags:** allergy tag (red on peach) in the patient header; verified tag (teal on mint).
- **Cards and banners:** white cards with a hairline border; draft cards have a darker border; mint banner when something is saved; peach alert panel for drug interactions.
- **Tables:** patient list as a real table, 64px rows, with filter chips above it that show counts.
- **Menus:** dark workspace rail (main menu); notifications dropdown under the bell.
- **Forms:** question input, chart card editor (teal border while editing), record checkboxes. Every field has a label.
- **Dialogs:** modal "Review before saving", Companion side sheet (non-modal), toast, popover. All close with Escape.

## Design patterns

1. **Persistent sidebar navigation** (navigation pattern): workspace rail on every screen. Ref: Material Design 3, Navigation drawer.
2. **Filter chips over a data table:** My patients dashboard. Ref: Material Design 3, Chips.
3. **Side sheet assistant:** Nurse Companion. Ref: Material Design 3, Side sheets.
4. **Review before saving (modal confirmation):** Patient History and Live Chart. Ref: Nielsen Norman Group, Modal and Nonmodal Dialogs.
5. **Notification toast with badge:** physician reply. Ref: Material Design 3, Badges and Snackbar.
6. **Empty state with one clear action:** Patient History before records arrive. Ref: Nielsen Norman Group, Designing Empty States.
7. **Draft, confirm or edit (human in the loop):** Live Chart cards. Ref: Material Design 3, Cards.

## Accessibility

Text contrast passes WCAG AA (main text 16.4:1, secondary 6.4:1, allergy tag 4.8:1). Known issue: the lightest gray (#8a9a94, table headers and counts) is 2.8:1; changing it to #66766f (4.6:1) fixes it. Touch targets are 40px or more. Focus is always visible.
