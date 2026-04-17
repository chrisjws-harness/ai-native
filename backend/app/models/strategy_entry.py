from ..extensions import db


class StrategyEntry(db.Model):
    __tablename__ = "strategy_entries"

    id = db.Column(db.Integer, primary_key=True)
    ruleset_id = db.Column(db.Integer, db.ForeignKey("rulesets.id", ondelete="CASCADE"), nullable=False)
    hand_type = db.Column(db.String(8), nullable=False)  # 'hard', 'soft', 'pair'
    player_value = db.Column(db.String(4), nullable=False)
    dealer_upcard = db.Column(db.String(2), nullable=False)
    correct_action = db.Column(db.String(4), nullable=False)

    __table_args__ = (
        db.UniqueConstraint("ruleset_id", "hand_type", "player_value", "dealer_upcard"),
    )
