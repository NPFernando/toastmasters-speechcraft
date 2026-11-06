# Meeting workflow update — 3.10.0

## Educational Presenter / Keynote

A dedicated selectable role reuses the existing `keynote` agenda assignment. It shares topic, objectives, introduction, materials reference and target duration with the Toastmaster. Queueing creates a labelled Timer entry with individual limits; keynote timer entries are excluded from prepared-speech award candidates. Timing remains controlled by the Timer. Existing agenda assignments remain valid.

## General Evaluator and actions

GE observations snapshot the agenda item, role, assigned name, author and observation time. Deleted agenda items do not erase the observation text. Each observation can become a follow-up action. Actions have an owner, target meeting date and open/done status and remain across new meetings; they appear for GE and Coordinator (After), in GE reports and meeting backups. They are shared data, not private speech feedback.

GE checklist and free-text fields now merge independently using field timestamps. Different fields edited on two devices are retained. Competing edits to the same field use timestamp order and a deterministic value tie-break; this is not collaborative text editing. Upgrade all connected devices to 3.10.0. Older clients still use whole-object GE merging.

## Person-based ballots

Select your participant ID on each device. Roster members keep their existing member ID, and guests can register a reusable ID with a distinguishing label. Each ID has one ballot per award in each round. Participants select their own identity.

Older name and device ballots remain in the meeting record. The General Evaluator can use **Start new voting round** to collect ID-based ballots separately. Starting a new round asks everyone to vote again.

## Handovers

Each role can send an explicit handover to an eligible meeting controller or session leader. Assigned recipients accept the floor. Requests include who sent them, time and current agenda item. Senders can cancel pending requests. Accepting does not stop timers or advance the agenda; the Toastmaster keeps those controls. Handovers reset with the meeting.

## Offline pack

Role guides offer a single self-contained HTML download with embedded logos, original portal role summaries, generation date, version and official source links. The pack can be opened without the portal or internet and printed with the browser. External reference links need internet. Official manuals are not redistributed in the pack; obtain permitted personal copies from their publisher. The pack contains no meeting notes or member feedback.

## Validation

Build freshness, syntax and whitespace checks, focused field-merge and ballot tests, plus browser regression coverage for presenter timing, agenda-linked observations, persistent actions, accepted handovers, offline download, concurrent GE edits and two-device ballot editing.
