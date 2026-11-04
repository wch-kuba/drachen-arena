# Part 8 – Test & release v1

**Goal:** v1 is solid on the kid's real iPad (main device) and iPhone and the first session goes well.

← [Back to plan](../PLAN.md)

## Tasks

### Screen fit (prep)
- [x] Every game screen (Home stage, five exercises, reward, hatch beats, welcome/name entry, collection header) fits the dynamic viewport incl. safe areas, no page scroll, on iPhone portrait, iPad portrait and landscape. Only the lands list and the collection grid scroll, inside their own pane.
- [x] Keyboard and gold main button always fully visible; on short heights free room, then the picture, then spacing give way (the exercise pile was removed instead of shrunk).
- [x] Zoom off: viewport meta + iOS standalone guards (touch-action, no double-tap zoom, no body rubber-band, text-size-adjust).
- [x] Checked in Playwright WebKit at 375×667, 390×844, 820×1180, 1180×820, 1024×768 (every screen, hint panes open, name keyboard).

### Test on iPad and iPhone
- [ ] Fresh install from Safari → home screen.
- [ ] Airplane mode: full round in every exercise.
- [ ] Audio works offline (German voice present).
- [ ] Custom keyboard: no system keyboard appears, all keys reachable with small fingers.
- [ ] Safe areas: nothing under the notch or home bar.
- [ ] Close the app mid-round → progress kept.
- [ ] Deploy an update → prompt shows → update applies without losing progress.
- [ ] Low Power Mode / small iPhone screen (SE size) look OK.
- [ ] iPad portrait and landscape, incl. rotating mid-exercise; install PWA on the iPad.
- [ ] Run `/impeccable audit` + `/impeccable polish` once.

### First session
- [ ] Parent sets the child's name.
- [ ] Watch the kid play one round: note confusions and too-hard words.
- [ ] Fix the top issues and redeploy.

## Done when
The kid plays a full round alone without help and wants another one.
