from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from ..services.auth_service import register_user, authenticate_user
from ..models import User

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    username = data.get("username", "").strip()
    password = data.get("password", "")
    invite_key = data.get("invite_key", "").strip()

    if not username or not password or not invite_key:
        return jsonify({"error": "Username, password, and invite key are required"}), 400

    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400

    user, error = register_user(username, password, invite_key)
    if error:
        return jsonify({"error": error}), 400

    token = create_access_token(identity=str(user.id))
    return jsonify({"token": token, "user": {"id": user.id, "username": user.username}}), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username", "").strip()
    password = data.get("password", "")

    user = authenticate_user(username, password)
    if not user:
        return jsonify({"error": "Invalid username or password"}), 401

    token = create_access_token(identity=str(user.id))
    return jsonify({"token": token, "user": {"id": user.id, "username": user.username}})


@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def me():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify({"id": user.id, "username": user.username})
