# Regulatory data model

The production schema models regulator → framework → framework version → domain hierarchy → control → evidence expectation. Every framework version can carry issue/effective/superseded dates, official URL/document, status, and last verification time. Requirement text has an explicit verification flag; demo or unverified content must never be presented as authoritative.

Applicability rules are structured expressions with outcome, priority, bilingual rationale, and source. Organization overrides are persisted with actor, timestamp, classification, and required justification.

Canonical controls normalize reusable capabilities. Versioned mappings connect canonical controls to framework controls with mapping type, source, confidence, reviewer, and approval state. AI-suggested/unverified mappings remain unapproved; only approved mappings contribute to evidence coverage.

Assessment scoring uses methodology `weighted-status-v1`: N/A is excluded, not-assessed affects completeness rather than readiness, partial compliance earns half weight, and mandatory failures apply an explicit capped penalty. The response explains every component.
