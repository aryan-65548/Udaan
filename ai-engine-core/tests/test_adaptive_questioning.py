"""
Tests for adaptive questioning, multilingual question banks, and interview progression.
"""

from ai_engine_core.services.context_builder import ContextBuilder
from ai_engine_core.interview.question_bank import QuestionBank
from ai_engine_core.interview.question_engine import QuestionEngine
from fastapi.testclient import TestClient
from ai_engine_core.app import app

client = TestClient(app)


def test_question_bank_multilingual():
    # English
    q_en = QuestionBank.get_question("has_shop", language="en")
    assert q_en is not None
    assert "shop/room" in q_en.text
    assert q_en.options[0].label == "Yes, I have a shop/space"

    # Hindi
    q_hi = QuestionBank.get_question("has_shop", language="hi")
    assert q_hi is not None
    assert "दुकान या कमरा" in q_hi.text
    assert q_hi.options[0].label == "हाँ, मेरे पास दुकान/स्थान है"

    # Gujarati
    q_gu = QuestionBank.get_question("has_shop", language="gu")
    assert q_gu is not None
    assert "દુકાન કે ઓરડો" in q_gu.text
    assert q_gu.options[0].label == "હા, મારી પાસે દુકાન/જગ્યા છે"


def test_question_engine_selection_prioritizes_gaps(mock_minimal_payload):
    context = ContextBuilder.build_context(mock_minimal_payload)
    
    # First question should be selected for dairy category (e.g. water supply or own contribution)
    next_q = QuestionEngine.select_next_question(context, asked_keys=[])
    assert next_q is not None
    assert next_q.key in ("has_shop", "own_contribution", "has_water_supply", "previous_experience")


def test_question_engine_stops_after_max_questions(mock_minimal_payload):
    context = ContextBuilder.build_context(mock_minimal_payload)
    # 5 questions already asked
    asked_5 = ["has_shop", "own_contribution", "previous_experience", "has_known_customers", "has_supplier_access"]
    next_q = QuestionEngine.select_next_question(context, asked_keys=asked_5)
    assert next_q is None


def test_api_session_interview_flow(mock_minimal_payload):
    # 1. Start Session
    start_res = client.post("/internal/ai/session/start", json={"context": mock_minimal_payload})
    assert start_res.status_code == 200
    start_data = start_res.json()
    assert start_data["status"] == "QUESTIONING"
    assert "question" in start_data
    first_q_key = start_data["question"]["key"]

    # 2. Answer first question via message endpoint
    updated_payload = dict(mock_minimal_payload)
    updated_payload["answers"] = {first_q_key: True}

    msg_res = client.post("/internal/ai/session/message", json={
        "sessionId": start_data["sessionId"],
        "assessmentId": mock_minimal_payload["assessmentId"],
        "answer": {"key": first_q_key, "value": True},
        "context": updated_payload
    })
    assert msg_res.status_code == 200
    msg_data = msg_res.json()
    assert msg_data["status"] in ("QUESTIONING", "COMPLETED")
