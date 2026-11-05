# Meeting workflow update — 3.10.0

## Educational Presenter / Keynote

A dedicated selectable role reuses the existing `keynote` agenda assignment. It shares topic, objectives, introduction, materials reference and target duration with the Toastmaster. Queueing creates a labelled Timer entry with individual limits; keynote timer entries are excluded from prepared-speech award candidates. Timing remains controlled by the Timer. Existing agenda assignments remain valid.

## General Evaluator and actions

GE observations snapshot the agenda item, role, assigned name, author and observation time. Deleted agenda items do not erase the observation text. Each observation can become a follow-up action. Actions have an owner, target meeting date and open/done status and remain across new meetings; they appear for GE and Coordinator (After), in GE reports and meeting backups. They are shared data, not private speech feedback.

GE checklist and free-text fields now merge independently using field timestamps. Different fields edited on two devices are retained. Competing edits to the same field use timestamp order and a deterministic value tie-break; this is not collaborative text editing. Upgrade all connected devices to 3.10.0. Older clients still use whole-object GE merging.

## Person-based ballots

One ballot per category uses a normalized full voting name across devices. Names are self-declared, not authenticated. People with the same name need distinct agreed voting names. Use the same name on each device. This reduces accidental duplicate voting but is not suitable for elections requiring verified identity or secret ballots. Changing a voting name creates a different identity.

Old device ballots stay readable. When a device casts a new ballot, its own old ballot for that category is removed. Other historical device ballots cannot be safely attributed to names and are retained; start a new meeting before using the new voting system for a fresh vote. Existing ballots have not been silently assigned to guessed identities.

## Handovers

Each role can send an explicit handover to an eligible meeting controller or session leader. Assigned recipients accept the floor. Requests include who sent them, time and current agenda item. Senders can cancel pending requests. Accepting does not stop timers or advance the agenda; the Toastmaster keeps those controls. Handovers reset with the meeting.

## Offline pack

Role guides offer a single self-contained HTML download with embedded logos, original portal role summaries, generation date, version and official source links. The pack can be opened without the portal or internet and printed with the browser. External reference links need internet. Official manuals are not redistributed in the pack; obtain permitted personal copies from their publisher. The pack contains no meeting notes or member feedback.

## Validation

Build freshness, syntax and whitespace checks, focused field-merge and ballot tests, plus browser regression coverage for presenter timing, agenda-linked observations, persistent actions, accepted handovers, offline download, concurrent GE edits and two-device ballot editing.
