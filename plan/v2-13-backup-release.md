# Part 13 – Backup & release v2

**Goal:** progress and parent words can't be lost, and v2 ships cleanly.

← [Back to plan](../PLAN.md)

## Tasks

### Backup
- [ ] Export: one JSON file (profile, progress, parent items, dragons) via the share sheet → save to Files/iCloud.
- [ ] Import: pick the JSON → preview → replace or merge.
- [ ] Reminder in the parent panel when the last backup is older than 14 days.
- [ ] Show the storage state: persisted yes/no.

### Release
- [ ] Migration test: v1 data on the phone → update to v2 → nothing lost.
- [ ] Full iPad + iPhone test pass (same checklist as Part 8 + all parent flows).
- [ ] Run `/impeccable audit` on the parent panel.
- [ ] Deploy to Forge, update on the phone, make a first backup.

## Done when
Delete the app → reinstall → import the backup → everything is back.
