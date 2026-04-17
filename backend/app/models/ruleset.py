from datetime import datetime, timezone
from ..extensions import db


class Ruleset(db.Model):
    __tablename__ = "rulesets"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(128), unique=True, nullable=False)
    deck_count = db.Column(db.Integer, nullable=False, default=6)
    dealer_hits_s17 = db.Column(db.Boolean, nullable=False, default=False)
    das_allowed = db.Column(db.Boolean, nullable=False, default=True)
    surrender = db.Column(db.String(16), nullable=False, default="none")
    description = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    entries = db.relationship("StrategyEntry", backref="ruleset", cascade="all, delete-orphan")
