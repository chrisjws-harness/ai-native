from ..extensions import db
from ..models import StrategyEntry, UserResponse


# Map composite actions to the primary action the player should choose
PRIMARY_ACTION = {
    "H": "H",
    "S": "S",
    "D": "D",
    "Ds": "D",
    "P": "P",
    "Ph": "P",
    "Rh": "R",
    "Rs": "R",
    "Rp": "R",
}


def check_answer(user_id, ruleset_id, hand_type, player_value, dealer_upcard, user_action):
    entry = StrategyEntry.query.filter_by(
        ruleset_id=ruleset_id,
        hand_type=hand_type,
        player_value=player_value,
        dealer_upcard=dealer_upcard,
    ).first()

    if not entry:
        return None, "Hand combination not found"

    correct_primary = PRIMARY_ACTION.get(entry.correct_action, entry.correct_action)
    is_correct = user_action == correct_primary

    response = UserResponse(
        user_id=user_id,
        ruleset_id=ruleset_id,
        hand_type=hand_type,
        player_value=player_value,
        dealer_upcard=dealer_upcard,
        user_action=user_action,
        correct_action=entry.correct_action,
        is_correct=is_correct,
    )
    db.session.add(response)
    db.session.commit()

    return {
        "correct": is_correct,
        "correct_action": entry.correct_action,
        "correct_primary": correct_primary,
        "user_action": user_action,
    }, None
