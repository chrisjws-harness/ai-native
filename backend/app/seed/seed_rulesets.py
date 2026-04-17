from ..extensions import db
from ..models import Ruleset, StrategyEntry
from . import vegas_strip_s17, modern_vegas_h17


ALL_RULESETS = [vegas_strip_s17, modern_vegas_h17]


def seed_all():
    for module in ALL_RULESETS:
        meta = module.RULESET_META
        existing = Ruleset.query.filter_by(name=meta["name"]).first()
        if existing:
            continue

        ruleset = Ruleset(
            name=meta["name"],
            deck_count=meta["deck_count"],
            dealer_hits_s17=meta["dealer_hits_s17"],
            das_allowed=meta["das_allowed"],
            surrender=meta["surrender"],
            description=meta.get("description", ""),
        )
        db.session.add(ruleset)
        db.session.flush()  # get the id

        dealer_cards = module.DEALER_CARDS
        for hand_type, hands in module.STRATEGY.items():
            for player_value, actions in hands.items():
                for i, action in enumerate(actions):
                    entry = StrategyEntry(
                        ruleset_id=ruleset.id,
                        hand_type=hand_type,
                        player_value=player_value,
                        dealer_upcard=dealer_cards[i],
                        correct_action=action,
                    )
                    db.session.add(entry)

        db.session.commit()
        print(f"  Seeded ruleset: {meta['name']}")
