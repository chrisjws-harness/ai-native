from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..extensions import db
from ..models import UserResponse

stats_bp = Blueprint("stats", __name__)


def _timed_filter(query):
    """Apply timed/untimed filter from query param."""
    timed = request.args.get("timed")
    if timed == "true":
        query = query.filter(UserResponse.is_timed == True)
    elif timed == "false":
        query = query.filter(UserResponse.is_timed == False)
    return query


@stats_bp.route("/missed", methods=["GET"])
@jwt_required()
def most_missed():
    user_id = int(get_jwt_identity())
    ruleset_id = request.args.get("ruleset_id", type=int)

    query = db.session.query(
        UserResponse.ruleset_id,
        UserResponse.hand_type,
        UserResponse.player_value,
        UserResponse.dealer_upcard,
        UserResponse.correct_action,
        db.func.count().label("total"),
        db.func.sum(db.case((UserResponse.is_correct == False, 1), else_=0)).label("missed"),
        db.func.avg(UserResponse.response_ms).label("avg_ms"),
    ).filter(
        UserResponse.user_id == user_id,
    ).group_by(
        UserResponse.ruleset_id,
        UserResponse.hand_type,
        UserResponse.player_value,
        UserResponse.dealer_upcard,
        UserResponse.correct_action,
    )

    if ruleset_id:
        query = query.filter(UserResponse.ruleset_id == ruleset_id)

    query = _timed_filter(query)

    rows = query.all()

    combos = []
    total_correct = 0
    total_attempts = 0
    all_avg_ms = []
    for r in rows:
        missed = int(r.missed)
        total = int(r.total)
        correct = total - missed
        total_correct += correct
        total_attempts += total
        avg_ms = round(float(r.avg_ms)) if r.avg_ms is not None else None
        if avg_ms is not None:
            all_avg_ms.append((avg_ms, total))
        if missed > 0:
            combos.append({
                "ruleset_id": r.ruleset_id,
                "hand_type": r.hand_type,
                "player_value": r.player_value,
                "dealer_upcard": r.dealer_upcard,
                "correct_action": r.correct_action,
                "total": total,
                "missed": missed,
                "accuracy": round(correct / total * 100, 1) if total > 0 else 0,
                "avg_ms": avg_ms,
            })

    combos.sort(key=lambda c: (-c["missed"], c["accuracy"]))

    # Weighted average response time
    overall_avg_ms = None
    if all_avg_ms:
        total_weight = sum(t for _, t in all_avg_ms)
        overall_avg_ms = round(sum(ms * t for ms, t in all_avg_ms) / total_weight) if total_weight > 0 else None

    return jsonify({
        "summary": {
            "total_attempts": total_attempts,
            "total_correct": total_correct,
            "overall_accuracy": round(total_correct / total_attempts * 100, 1) if total_attempts > 0 else 0,
            "unique_combos_missed": len(combos),
            "avg_response_ms": overall_avg_ms,
        },
        "most_missed": combos[:50],
    })


@stats_bp.route("/weights", methods=["GET"])
@jwt_required()
def weights():
    """Return per-combo weights for adaptive drilling."""
    user_id = int(get_jwt_identity())
    ruleset_id = request.args.get("ruleset_id", type=int)

    if not ruleset_id:
        return jsonify({"error": "ruleset_id is required"}), 400

    MIN_ATTEMPTS = 500

    total_attempts = db.session.query(
        db.func.count()
    ).filter(
        UserResponse.user_id == user_id,
        UserResponse.ruleset_id == ruleset_id,
    ).scalar() or 0

    if total_attempts < MIN_ATTEMPTS:
        return jsonify({
            "weights": [],
            "total_attempts": total_attempts,
            "min_required": MIN_ATTEMPTS,
        })

    rows = db.session.query(
        UserResponse.hand_type,
        UserResponse.player_value,
        UserResponse.dealer_upcard,
        db.func.count().label("total"),
        db.func.sum(db.case((UserResponse.is_correct == False, 1), else_=0)).label("missed"),
    ).filter(
        UserResponse.user_id == user_id,
        UserResponse.ruleset_id == ruleset_id,
    ).group_by(
        UserResponse.hand_type,
        UserResponse.player_value,
        UserResponse.dealer_upcard,
    ).all()

    weights = []
    for r in rows:
        missed = int(r.missed)
        total = int(r.total)
        if missed == 0:
            continue
        miss_rate = missed / total
        confidence = 1 - (1 / (1 + total))
        weight = round(miss_rate * confidence, 4)
        weights.append({
            "hand_type": r.hand_type,
            "player_value": r.player_value,
            "dealer_upcard": r.dealer_upcard,
            "weight": weight,
            "total": total,
            "missed": missed,
        })

    weights.sort(key=lambda w: -w["weight"])

    return jsonify({"weights": weights})
