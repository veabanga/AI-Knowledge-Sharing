from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import List, Literal
import uuid
from datetime import datetime, timezone

app = FastAPI(title='Nexus Knowledge AI Service')

class KnowledgeExtractionRequest(BaseModel):
    source_type: Literal['jira', 'document', 'email', 'url', 'note']
    title: str
    content: str
    project: str = 'Automotive Sensor Development'
    department: str = 'Mechanical Engineering'

class KnowledgeFact(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    knowledge_type: str
    description: str
    department: str
    project: str
    related_issues: List[str] = []
    source_references: List[str] = []
    confidence_score: float = 0.91
    validation_status: Literal['validated', 'review pending', 'draft'] = 'validated'
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

@app.get('/health')
def health():
    return {'status': 'ok'}

@app.post('/extract-knowledge')
def extract_knowledge(payload: KnowledgeExtractionRequest):
    if not payload.content.strip():
        raise HTTPException(status_code=400, detail='Content cannot be empty')

    ideas = [
        {'title': 'Thermal housing redesign as design response', 'knowledge_type': 'Decision', 'description': 'Mechanical redesign reduced operating variance and stabilized thermal behavior for the sensor assembly.', 'department': payload.department, 'project': payload.project, 'related_issues': ['ENG-2049', 'ENG-2110'], 'source_references': [payload.title], 'confidence_score': 0.92},
        {'title': 'Sensor drift linked to thermal envelope', 'knowledge_type': 'Problem', 'description': 'Variability in the thermal envelope caused calibration drift in the low-noise operating mode.', 'department': 'Software Engineering', 'project': 'Embedded Sensor Software', 'related_issues': ['ENG-1172'], 'source_references': [payload.title], 'confidence_score': 0.9},
        {'title': 'Inline validation gate added for production readiness', 'knowledge_type': 'Process', 'description': 'The manufacturing team required a burn-in stage before complete packaging to reduce latent defects.', 'department': 'Manufacturing Engineering', 'project': 'Sensor Manufacturing Integration', 'related_issues': ['MFG-330'], 'source_references': [payload.title], 'confidence_score': 0.93}
    ]

    return {
        'status': 'success',
        'facts': [KnowledgeFact(**item).model_dump(mode='json') for item in ideas],
        'source': payload.source_type,
        'generated_at': datetime.now(timezone.utc).isoformat()
    }
