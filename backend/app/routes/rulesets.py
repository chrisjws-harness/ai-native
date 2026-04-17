from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from ..models import Ruleset, StrategyEntry

rulesets_bp = Blueprint("rulesets", __name__)


@rulesets_bp.route("/", methods=["GET"])
@jwt_required()
def list_rulesets():
    rulesets = Ruleset.query.order_by(Ruleset.id).all()
    return jsonify([
        {
            "id": r.id,
            "name": r.name,
            "deck_count": r.deck_count,
            "dealer_hits_s17": r.dealer_hits_s17,
            "das_allowed": r.das_allowed,
            "surrender": r.surrender,
            "description": r.description,
        }
        for r in rulesets
    ])


@rulesets_bp.route("/<int:ruleset_id>/strategy", methods=["GET"])
@jwt_required()
def get_strategy(ruleset_id):
    ruleset = Ruleset.query.get(ruleset_id)
    if not ruleset:
        return jsonify({"error": "Ruleset not found"}), 404

    entries = StrategyEntry.query.filter_by(ruleset_id=ruleset_id).all()

    strategy = {"hard": {}, "soft": {}, "pair": {}}
    for e in entries:
        if e.player_value not in strategy[e.hand_type]:
            strategy[e.hand_type][e.player_value] = {}
        strategy[e.hand_type][e.player_value][e.dealer_upcard] = e.correct_action

    return jsonify({
        "ruleset": {
            "id": ruleset.id,
            "name": ruleset.name,
            "surrender": ruleset.surrender,
        },
        "strategy": strategy,
    })
