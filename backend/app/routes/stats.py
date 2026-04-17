from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..extensions import db
from ..models import UserResponse

stats_bp = Blueprint("stats", __name__)


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

    rows = query.all()

    combos = []
    total_correct = 0
    total_attempts = 0
    for r in rows:
        missed = int(r.missed)
        total = int(r.total)
        correct = total - missed
        total_correct += correct
        total_attempts += total
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
            })

    combos.sort(key=lambda c: (-c["missed"], c["accuracy"]))

    return jsonify({
        "summary": {
            "total_attempts": total_attempts,
            "total_correct": total_correct,
            "overall_accuracy": round(total_correct / total_attempts * 100, 1) if total_attempts > 0 else 0,
            "unique_combos_missed": len(combos),
        },
        "most_missed": combos[:50],
    })
