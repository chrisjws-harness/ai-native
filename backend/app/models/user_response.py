from datetime import datetime, timezone
from ..extensions import db


class UserResponse(db.Model):
    __tablename__ = "user_responses"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    ruleset_id = db.Column(db.Integer, db.ForeignKey("rulesets.id"), nullable=False)
    hand_type = db.Column(db.String(8), nullable=False)
    player_value = db.Column(db.String(4), nullable=False)
    dealer_upcard = db.Column(db.String(2), nullable=False)
    user_action = db.Column(db.String(4), nullable=False)
    correct_action = db.Column(db.String(4), nullable=False)
    is_correct = db.Column(db.Boolean, nullable=False)
    responded_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        db.Index("ix_user_responses_lookup", "user_id", "ruleset_id", "hand_type", "player_value", "dealer_upcard"),
    )
