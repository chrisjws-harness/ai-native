from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..services.training_service import check_answer

training_bp = Blueprint("training", __name__)


@training_bp.route("/check", methods=["POST"])
@jwt_required()
def check():
    user_id = int(get_jwt_identity())
    data = request.get_json()

    required = ["ruleset_id", "hand_type", "player_value", "dealer_upcard", "user_action"]
    for field in required:
        if field not in data:
            return jsonify({"error": f"Missing field: {field}"}), 400

    result, error = check_answer(
        user_id=user_id,
        ruleset_id=data["ruleset_id"],
        hand_type=data["hand_type"],
        player_value=data["player_value"],
        dealer_upcard=data["dealer_upcard"],
        user_action=data["user_action"],
    )

    if error:
        return jsonify({"error": error}), 400

    return jsonify(result)
