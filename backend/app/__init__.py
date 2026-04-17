from flask import Flask
from .extensions import db, migrate, bcrypt, jwt, cors
from config import Config


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    db.init_app(app)
    migrate.init_app(app, db)
    bcrypt.init_app(app)
    jwt.init_app(app)
    cors.init_app(app)

    from .routes import register_blueprints
    register_blueprints(app)

    from .cli import register_cli
    register_cli(app)

    return app
