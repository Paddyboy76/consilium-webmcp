from dataclasses import asdict, dataclass
from typing import Any


@dataclass(frozen=True)
class EvidenceItem:
    source_id: str
    title: str
    excerpt: str
    kind: str


@dataclass
class AdvisorReport:
    advisor_id: str
    advisor_name: str
    question_interpreted: str
    relevant_personal_context_ids: list[str]
    evidence_items: list[dict[str, Any]]
    claims: list[str]
    recommendation: str
    confidence: float
    uncertainty: str
    abstained: bool = False
    abstention_reason: str = ""

    def dict(self):
        return asdict(self)

