from datetime import datetime, timezone
from ..extensions import db, bcrypt
from ..models import User, InviteKey


def register_user(username, password, invite_key_str):
    invite = InviteKey.query.filter_by(key=invite_key_str, used_by=None).first()
    if not invite:
        return None, "Invalid or already used invite key"

    if User.query.filter_by(username=username).first():
        return None, "Username already taken"

    pw_hash = bcrypt.generate_password_hash(password).decode("utf-8")
    user = User(username=username, password_hash=pw_hash)
    db.session.add(user)
    db.session.flush()

    invite.used_by = user.id
    invite.used_at = datetime.now(timezone.utc)
    db.session.commit()

    return user, None


def authenticate_user(username, password):
    user = User.query.filter_by(username=username).first()
    if not user or not bcrypt.check_password_hash(user.password_hash, password):
        return None
    return user
