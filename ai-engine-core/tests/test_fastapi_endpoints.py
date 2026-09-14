"""
FastAPI integration tests verifying HTTP contracts consumed by Node.js backend.
"""

from fastapi.testclient import TestClient
from ai_engine_core.app import app

client = TestClient(app)


def test_health_endpoint():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "HEALTHY"


def test_start_session_endpoint(mock_minimal_payload):
    res = client.post(
        "/internal/ai/session/start",
        json={"context": mock_minimal_payload}
    )
    assert res.status_code == 200
    data = res.json()
    assert "sessionId" in data
    assert data["status"] == "QUESTIONING"
    assert "question" in data
    assert "contextQuality" in data


def test_session_message_endpoint(mock_minimal_payload):
    res = client.post(
        "/internal/ai/session/message",
        json={
            "assessmentId": mock_minimal_payload["assessmentId"],
            "sessionId": "session_test_01",
            "message": "I have 5 years of dairy experience",
            "answer": {
                "key": "previous_experience",
                "value": "5 years of dairy experience"
            },
            "context": mock_minimal_payload
        }
    )
    assert res.status_code == 200
    data = res.json()
    assert data["sessionId"] == "session_test_01"
    assert data["status"] in ("QUESTIONING", "COMPLETED")


def test_report_endpoint(mock_backend_payload):
    res = client.post(
        "/internal/ai/report",
        json={
            "assessmentId": mock_backend_payload["assessmentId"],
            "context": mock_backend_payload
        }
    )
    assert res.status_code == 200
    data = res.json()
    assert "reportId" in data
    assert "businessSummary" in data
    assert "canonicalContext" in data
    assert data["assessmentId"] == mock_backend_payload["assessmentId"]
