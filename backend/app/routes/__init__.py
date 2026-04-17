from .auth import auth_bp
from .rulesets import rulesets_bp
from .training import training_bp
from .stats import stats_bp


def register_blueprints(app):
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(rulesets_bp, url_prefix="/api/rulesets")
    app.register_blueprint(training_bp, url_prefix="/api/training")
    app.register_blueprint(stats_bp, url_prefix="/api/stats")
