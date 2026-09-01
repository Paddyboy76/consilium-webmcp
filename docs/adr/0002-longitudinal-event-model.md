# ADR 0002: Append-oriented longitudinal evidence

Status: accepted, 2026-09-01.

The authoritative timeline is `events`: immutable timestamped observations, decisions, responses, outcomes, constraints, adaptations, and transitions with actor, provenance, payload, and optional `supersedes_event_id`. Projects/goals/commitments/recommendations/actions have durable identity tables, while transitions and feedback remain append-only events. Derived patterns are versioned assertions linked to supporting and contradictory events, time window, confidence, algorithm version, and supersession.

This prevents corrections from erasing history and makes temporal change, counterevidence, and recommendation outcomes first-class reasoning inputs.

