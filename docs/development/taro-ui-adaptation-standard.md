# Taro Mobile UI Adaptation Standard

Version: 1.0 · Date: 2026-10-14 · Repository: `ursazoo/animal-island-ui`

Source baseline: `79810934ee9d08c22044d34e06f8bba40391207b`. This document specifies future work; it does not claim that Taro components, a preview site, or device verification already exist.

## 1. Goal and scope

Modify the forked UI library itself so Taro + React WeChat mini-programs can install and use it, preserving the island visual language while adopting mobile interactions. Deliver an interactive browser preview and a WeChat preview project alongside the library.

- Deliver changes in library component source, styles, exports, types, builds, documentation, and the Skill.
- Preview projects consume library components rather than implementing a separate display-only component set.
- Migrate 38 of the 39 existing component modules; `Cursor` is not applicable to mini-programs. Section 5 contains the full inventory.
- Preserve the Web entry by default for existing consumption, regression checks, and visual comparison. This is the current technical choice, not an explicit user requirement to support both platforms.
- New public capabilities such as ActionSheet, TabBar, pull-to-refresh, and multiple Select are outside the existing-component migration count; describe additions separately. Internal Picker or overlay hosts may support implementation without being presented as existing public components.

## 2. Sources and conflicts

Current explicit user requirements take precedence. Otherwise follow repository `AGENTS.md`: component source, styles, and configuration outrank documentation. Source establishes existing behavior; it does not prevent the mobile interaction changes explicitly required here.

| Source                                                                                                     | Responsibility                                                                     |
| ---------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `src/components/<Name>/` and observed rendering                                                            | Existing appearance, variants, states, and behavior                                |
| `src/styles/variables.less`, `src/styles/themes/default.less`                                              | Compile-time design values and runtime theme mapping                               |
| [Design rules](../design-system/design-rules.md), [component specifications](../design-system/components/) | Visual intent and exact implementation references; check source when they disagree |
| `skills/animal-island-ui-style/SKILL.md` and component references                                          | Existing Web usage, visual constraints, and API guidance                           |
| This standard                                                                                              | Taro migration, mobile interaction, previews, package consumption, and acceptance  |

**Inherited requirements:** visual language, design variables, component variants, font/icon sources, and actual APIs as authority.

**Requirements added for this migration:** Taro exports/builds, touch interaction, comparison previews, real package consumption, WeChat verification, and difference records.

Handle the observed baseline discrepancies as follows:

- Mint is part of the primary palette, but the current primary Button uses cream. Do not recolor every primary button mint to comply with a style summary.
- `50px` describes pill radius, not control height. Button sizes have radius overrides; use the source for the corresponding size.
- Modal supports rounded `default` and organic `game` variants. The function defaults to `game`, while its prop comment says `default`. Establish the baseline from runtime behavior and correct related comments/docs when adapting Modal.
- Some Drawer motion descriptions differ from the general motion rule. Inspect its source and animation instead of replacing every effect with one generic duration.
- Explicit Input shadows, error/warning states, and the Switch inset shadow each have their own rules. Do not reduce them to “no shadows outside primary buttons.”

Record each conflict's source file, baseline value, mobile treatment, and reason. Synchronize related English/Chinese documentation when handling that component rather than rewriting all upstream documentation in this task.

## 3. Visual consistency

### 3.1 Establish the baseline before migration

Before adapting each component, read its source, styles, types, and design specification; run the original and capture applicable variants/states. Keep a short recording or reproducible steps for motion.

Record source commit, component/props, viewport, font-loading result, and screenshot/recording location. Source inspection is not evidence of a completed rendered baseline.

### 3.2 Preserve visual identity

- Preserve each component's warm backgrounds, brown text, and color relationships; retain status colors, decorative palettes, and existing dark scenes according to their own baseline.
- Preserve rounded controls, ribbon titles, each Modal variant's silhouette, and recognizable card patterns.
- Preserve component-specific borders, shadow allocation, typography, weight, and icon proportions. Cards have no default shadow; apply stacked primary-button and soft other-button shadows according to the actual variant.
- Target the original Nunito + Noto Sans SC fonts. Keep icon/illustration shapes, colors, and licensing information.
- Preserve component-specific motion rhythm and press feedback. Replace hover-dependent touch actions while retaining applicable keyboard focus and accessibility on H5.

Read exact values from original definitions rather than maintaining a second numeric table here. New mobile containers, Picker highlights, and action bars use the same design variables and existing components.

### 3.3 Platform adaptation boundaries

- Layout direction, popup position, content scrolling, density, and effective touch area may change for finger operation; record these separately from visual changes.
- This project targets an effective hit area of at least 44 × 44 logical pixels for small controls. Expand the hit region without mechanically enlarging the visible icon.
- Set the sizing baseline and conversion strategy before styling. Inspect consumer `designWidth`, stylesheet transforms, and inline sizing to avoid double conversion; verify rendered dimensions.
- Font/icon loading or rendering techniques may change while retaining the visual target. System fonts may provide failure fallback, but fallback is not proof of visual fidelity.
- For SVG, organic clipping, or motion that cannot be reused directly, verify an equivalent implementation first. Expose unavoidable differences in the preview/record and mark them “visual confirmation pending.”
- Do not silently substitute another library's theme, emoji, generic rounded dialogs, or a new decorative style. Present concrete comparisons when a significant change to confirmed appearance is necessary; proceed autonomously with routine equivalent adaptations.

## 4. Mobile interaction contracts

### 4.1 Select and Picker

For ordinary short-label single selection, use the original-style trigger → bottom Drawer → PickerView → confirmation. Preserve existing `{ key, label }`, controlled `value`, and `onChange(key)` semantics. New props must match actual declarations.

The wheel is operated by touch scrolling, without visible previous/next controls or redundant confirmation hints. Use the original warm-white background token for the Picker, with a matching mask and a pale mint selection strip; keep the outer drawer cream.

1. Initialize a draft from the latest external value on every open. Locate valid values; for empty/invalid values show the placeholder and highlight the first valid drawer option if present. Opening alone never commits.
2. Scrolling changes only the draft. Confirm the currently displayed valid key with one `onChange` per confirmation, including confirmation without scrolling.
3. While inertia is unsettled, wait for a settled value or temporarily disable confirmation; never submit a stale value. Verify event availability in the selected Taro version. H5 must also settle wheel/trackpad scrolling, align the displayed row to the indicator center, and synchronize its key before confirmation.
4. Cancel, allowed mask dismissal, and dismissal gestures discard the draft without changing the value. Reopening uses the latest external value. Page unmount never implies confirmation.
5. When options change, preserve a still-valid draft by key; otherwise select a valid position and repair indexes. External value changes take precedence and reset the draft. Empty lists show an empty state and disable confirmation.
6. Show the trigger's clear action directly when a value exists and the control is enabled. Preserve `onChange('')` followed by `onClear`, preventing accidental opening. Disabled controls do not open, clear, or submit.
7. Search mode uses a list inside the drawer; the keyboard opens on explicit search focus by default. Preserve filtering/onSearch semantics, including clearing a nonempty query on close. If a list mode commits immediately, make that difference explicit in the UI and contract.
8. Keep long labels/lists readable and scrollable rather than shrinking text. Multiple selection is an addition, not part of single-select migration.

### 4.2 Drawers, dialogs, and input

- Lay out two footer actions at equal widths across the available row; a single action fills it. Paired buttons must align in visible contours as well as layout boxes: use equal soft shadows with no vertical hover/press offset in that row; retain original depth for a single action. Make the close graphic clearly visible within a touch target of at least 44px.
- Bottom Drawer height stays within 40%–75% of the viewport; keyboard space may reduce this bound. Reserve space inside scroll boundaries for external focus rings, including the first control. The fixed footer has an opaque surface, top padding, and a soft upward shadow separating it from scrolling content.
- Handle masks, stacking, content scroll, background scroll locking, safe areas, and restoration. Only the topmost nested overlay responds to dismissal; background scrolling must not unlock prematurely.
- Keep actions reachable with long content. The active field and necessary actions remain visible with the keyboard open. Restore appropriate focus/page position without unexpectedly reopening the keyboard.
- Swipe-to-dismiss is not mandatory for the first batch. If provided, use an explicit gesture region and resolve conflicts with content scrolling and Picker gestures.
- Keep the corresponding Modal visual variant for ordinary confirmations. Callers may choose a Drawer or full page for complex content; do not silently turn every Modal into a sheet.
- Tooltip uses a discoverable tap target; essential content is not available only in a tooltip. Buttons, switches, checks, radio controls, and ratings expose pressed/disabled feedback.
- Preserve accessible names, labels, states, and appropriate control semantics. Do not replace all Taro Buttons with generic Views merely to remove default styling.

### 4.3 Data and platform behavior

- Preserve date/time value formats, clearing semantics, precision, steps, and validity constraints. Do not silently reduce `disabledDate` to min/max bounds. Use a touch-appropriate calendar for ranges.
- Preserve Form field state, validation, and submission meaning while adapting input events explicitly. Retain Table comparison, column configuration, and actions rather than automatically replacing it with application-specific cards.
- Implement Upload, Image, CodeBlock, BackTop, and similar components through appropriate mini-program capabilities; preserve callback/error meaning and document type differences.
- Handle empty/loading/error states, repeated actions, unmount, and background transitions; clean up timers and temporary resources.

## 5. Complete component coverage

Status here means migration status only. No Taro implementation exists when this standard is created. Link implementation/preview records as work proceeds, tracking platform verification separately.

| Group              | Component    | Migration focus                                         | Status         |
| ------------------ | ------------ | ------------------------------------------------------- | -------------- |
| Forms/actions      | Button       | Taro control, visual variants, press, loading, disabled | Pending        |
| Forms/actions      | Input        | Input events, clearing, keyboard, focus                 | Pending        |
| Forms/actions      | Switch       | Toggle, hit region, state feedback                      | Pending        |
| Forms/actions      | Checkbox     | Groups, row targets, selection marks                    | Pending        |
| Forms/actions      | Radio        | Groups, row targets, selection marks                    | Pending        |
| Forms/actions      | Rate         | Tap rating, clearing, read-only state                   | Pending        |
| Forms/actions      | Select       | Bottom drawer, Picker, search, clearing                 | Pending        |
| Forms/actions      | DatePicker   | Date/month wheels, range calendar, disabled dates       | Pending        |
| Forms/actions      | TimePicker   | Hour/minute/second wheels, steps, confirm/cancel        | Pending        |
| Forms/actions      | Form         | Fields, validation, submission, error location          | Pending        |
| Overlays/feedback  | Drawer       | Overlay host, safe areas, scrolling, dismissal          | Pending        |
| Overlays/feedback  | Modal        | Both variants, content, actions, dismissal              | Pending        |
| Overlays/feedback  | Tooltip      | Tap hints, placement, dismissal                         | Pending        |
| Overlays/feedback  | Notification | Host, imperative calls, placement, destruction          | Pending        |
| Navigation/content | Tabs         | Switching, label scrolling, visible selection           | Pending        |
| Navigation/content | Collapse     | Expansion, measurement, animation                       | Pending        |
| Navigation/content | Carousel     | Swipe, autoplay, indicators                             | Pending        |
| Navigation/content | Table        | Small layouts, horizontal scroll, column/row actions    | Pending        |
| Navigation/content | Pagination   | Paging, page-size selection, boundaries                 | Pending        |
| Navigation/content | BackTop      | Page/container scrolling, floating position             | Pending        |
| Media/tools        | Image        | Loading, preview, zoom, switching                       | Pending        |
| Media/tools        | Upload       | File selection, upload, retry, removal                  | Pending        |
| Media/tools        | CodeBlock    | Code rendering, horizontal scroll, copying              | Pending        |
| Display/decoration | Card         | Container, palette, pattern variants                    | Pending        |
| Display/decoration | Title        | Ribbon outline, text, folded corners                    | Pending        |
| Display/decoration | Divider      | Lines, decoration, dimensions                           | Pending        |
| Display/decoration | Tag          | Variants, colors, states                                | Pending        |
| Display/decoration | Badge        | Position, numbers, animation                            | Pending        |
| Display/decoration | Avatar       | Images, placeholders, groups                            | Pending        |
| Display/decoration | Progress     | Progress, scene assets, measurement                     | Pending        |
| Display/decoration | Skeleton     | Placeholder shapes, animation                           | Pending        |
| Display/decoration | Loading      | Fullscreen effects, snow, stacking, timers              | Pending        |
| Display/decoration | Countdown    | Timing, digits, lifecycle                               | Pending        |
| Display/decoration | CountUp      | Number growth, celebration, timing                      | Pending        |
| Display/decoration | Time         | Clock, date, periodic updates                           | Pending        |
| Display/decoration | Typewriter   | Character reveal, replay, cleanup                       | Pending        |
| Display/decoration | Background   | Patterns, scene images, coverage                        | Pending        |
| Display/decoration | Footer       | Typography and container                                | Pending        |
| Desktop-only       | Cursor       | No mouse cursor in mini-programs; retain Web behavior   | Not applicable |

FormItem, useForm, AvatarGroup, SkeletonButton, SkeletonInput, and SkeletonAvatar migrate with their parent module and are not counted again. Document unsupported original props with reasons, alternatives, and status rather than accepting ineffective props as apparent compatibility.

## 6. Library structure and artifact contract

- Add an explicit Taro entry inside the same library. `animal-island-ui/taro` and a corresponding style entry are proposed targets, not existing APIs; finalize paths through artifact consumption verification.
- Taro renderers may live beside original components. Extract platform-independent logic when actually shared, avoiding unnecessary Web refactoring.
- Taro runtime and declaration dependency graphs must not pull in the Web barrel, ReactDOM overlays, or Web-only icon implementations. Adapt types to Taro rather than hiding differences with `any` or fabricated DOM events.
- Share design sources while handling mini-program theme scope, selectors, fonts, assets, and sizing separately. Preserve existing Web build contracts.
- Synchronize package exports, type resolution, files, peers, style side-effect metadata, and build scripts. Verify dependency/JSX output strategy in the selected Taro version rather than directly implementing consultant suggestions.
- Generate a real package with `npm pack`, install it in an independent consumer, and verify exports, types, styles, assets, and component recognition. Source aliases/workspace links alone are insufficient delivery evidence.
- Record and pin the verified Taro, React, builder, WeChat base-library, and renderer versions for the first batch. Do not infer support for every Taro version, H5 browser, or mini-program renderer.

## 7. Preview requirements

Keep preview projects in the fork: Taro H5 for the browser and a weapp build for WeChat. Local linking may aid development; acceptance must use the real installed artifact from section 6.

- Cover every module in section 5 in the preview catalog, with honest pending states. Implemented entries must open and work.
- Show applicable normal, pressed, selected, disabled, loading, error, empty, and long-content states; explain inapplicable states.
- Provide original references beside adapted components. Match content, props, and scale for control-level comparisons; identify intentional mobile-layout differences for complete flows.
- Provide phone viewport switching and check at least 320, 375, and 414 CSS px. These define this project's H5 checks, not device coverage.
- Compose a complete form from library components to exercise open/select/confirm/cancel/clear/validate/submit. Identify fixture data as demo data.
- Ordinary single selection must expose an operable Picker inside a drawer. If H5/WeChat require different internals, keep both inside the library with a shared value/event contract, not a preview-only substitute.
- Display library version/commit and separate H5, WeChat DevTools, iOS, and Android verification states. Keep technical details in preview notes rather than normal demo-form copy.
- Provide a usable URL or startup instructions and the WeChat project entry for every batch. Screenshots, prose, or a successful build alone do not deliver a preview.

## 8. Implementation sequence and acceptance

### 8.1 Sequence

1. Establish original visual baselines, platform differences, and Taro artifact consumption.
2. Implement Button, Card, Input, mobile bottom Drawer behavior, and Select as the first batch, alongside the interactive preview.
3. Expand forms, date/time, feedback, navigation, media, and display components. Update coverage/verification per batch; the first batch does not replace the 38-module goal.
4. Synchronize implemented APIs, interactions, and actual installation instructions into the original Skill's Taro route and English/Chinese docs. Keep unimplemented capabilities marked unsupported rather than presenting usable examples.

### 8.2 Verification layers

| Check                               | Evidence provided                                                 | Does not replace                      |
| ----------------------------------- | ----------------------------------------------------------------- | ------------------------------------- |
| Source, types, documentation        | API, dependency boundaries, references, consistency               | Rendering or gestures                 |
| Relevant state tests                | Confirm/cancel, clearing, dynamic options, validation             | Inertia or platform behavior          |
| Library build, pack, consumer build | Actual package resolves/compiles; styles/assets reach output      | Error-free runtime or visual fidelity |
| H5 interaction and comparisons      | Browser layout, states, operations                                | WeChat behavior                       |
| WeChat DevTools                     | Basic mini-program runtime, layout, state flow                    | Device keyboard, inertia, performance |
| iOS and Android devices             | Fonts, scrolling, keyboard, safe areas, motion in exercised cases | Untested devices/cases                |

Follow existing repository-required checks. Add meaningful tests for new state contracts; do not add tests merely to count coverage for documentation or low-impact visual changes. Mark unexecuted checks “unverified”; passing another layer does not replace them.

### 8.3 Per-component completion

- [ ] Implementation, exports, types, styles, and necessary assets belong to the library and work from its installed package.
- [ ] Applicable existing APIs are migrated, with explicit differences and no silent capability loss.
- [ ] Applicable variants/states have original and mobile references; no unexplained changes to fonts, shapes, colors, or shadows remain.
- [ ] Mobile contracts pass, with verification for empty/disabled states, repeated actions, and cleanup.
- [ ] Preview opens and works; the composed page uses the same library implementation.
- [ ] Relevant automated checks pass; record H5, DevTools, iOS, and Android separately. A component lacking device verification is only “implemented, device verification pending.”
- [ ] Documentation, Skill, and Chinese mirrors match actual APIs; significant visual differences remain “visual confirmation pending.”

Use these verification fields: component/variant/props; source/package version; platform/device/viewport; steps; expected/actual; screenshots/recordings; known differences; result/date.

Overall completion requires all 38 applicable modules and their associated exports to satisfy these criteria, Cursor explicitly marked not applicable, and previews/docs synchronized. Report commit, push, package publication, and deployment separately; documentation completion or a local build implies none of them.
