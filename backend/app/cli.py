import uuid
import click
from .extensions import db
from .models import InviteKey


def register_cli(app):
    @app.cli.command("seed-db")
    def seed_db():
        """Seed rulesets and strategy data (idempotent)."""
        from .seed.seed_rulesets import seed_all
        print("Seeding database...")
        seed_all()
        print("Done.")

    @app.cli.command("generate-key")
    @click.option("-n", "--count", default=1, help="Number of keys to generate")
    def generate_key(count):
        """Generate invite key(s) for user registration."""
        for _ in range(count):
            key = str(uuid.uuid4())
            db.session.add(InviteKey(key=key))
            db.session.commit()
            print(key)
