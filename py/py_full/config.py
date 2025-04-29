# config.py
import os

basedir = os.path.abspath(os.path.dirname(__file__))

class Config:
    # Application Configuration
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'a-hard-to-guess-string' # Needed for session, flash, etc.
    DEBUG = os.environ.get('FLASK_DEBUG', 'false').lower() == 'true'

    # Database Configuration
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        'sqlite:///' + os.path.join(basedir, 'items.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Logging Configuration
    LOG_FILE = os.environ.get('LOG_FILE') or os.path.join(basedir, 'app.log')
    LOG_LEVEL = 'DEBUG' if DEBUG else 'INFO'

    # Auth Configuration
    # Use environment variable for API key in production!
    EXPECTED_API_KEY = os.environ.get('API_KEY') or "your_super_secret_api_key" # CHANGE THIS!
