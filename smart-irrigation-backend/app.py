"""
app.py — Smart Irrigation System Backend
Flask API with:
  - JWT authentication (signup / login / me / logout)
  - Prediction endpoint (ML model or rule-based fallback)
  - Prediction history per user
  - Health check
Follows PEP 8: 4-space indent, snake_case, docstrings on all public functions.
"""

import os
import json
import logging
import traceback
from datetime import datetime, timedelta
from functools import wraps
from pathlib import Path

import numpy as np
import pandas as pd
from flask import Flask, request, jsonify, g
from flask_cors import CORS
from dotenv import load_dotenv

# ── Optional heavy deps (graceful fallback if missing) ──────────────────────
try:
    import joblib
    JOBLIB_AVAILABLE = True
except ImportError:
    JOBLIB_AVAILABLE = False

try:
    import jwt as pyjwt
    JWT_AVAILABLE = True
except ImportError:
    JWT_AVAILABLE = False

try:
    from werkzeug.security import generate_password_hash, check_password_hash
    WERKZEUG_AVAILABLE = True
except ImportError:
    WERKZEUG_AVAILABLE = False

# ── Bootstrap ────────────────────────────────────────────────────────────────
load_dotenv()

logging.basicConfig(
    level=getattr(logging, os.getenv('LOG_LEVEL', 'INFO')),
    format='%(asctime)s %(levelname)s %(name)s — %(message)s',
)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Secret key for JWT — override via environment variable in production
JWT_SECRET = os.getenv('JWT_SECRET', 'smart-irrigation-dev-secret-change-in-prod')
JWT_EXPIRY_HOURS = int(os.getenv('JWT_EXPIRY_HOURS', 24))

CORS(app, origins='*')


# ── Custom JSON encoder (handles numpy types) ────────────────────────────────
class NumpyEncoder(json.JSONEncoder):
    """Serialize numpy numeric types so jsonify() never raises TypeError."""

    def default(self, obj):
        if isinstance(obj, np.integer):
            return int(obj)
        if isinstance(obj, np.floating):
            return float(obj)
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        return super().default(obj)


app.json_encoder = NumpyEncoder


# ── In-memory stores (replace with a real DB in production) ─────────────────
# users  → { email: { id, name, email, password_hash, farm_name, region,
#                      primary_crop, created_at } }
# history → { user_id: [ {input, result, timestamp}, ... ] }
USERS = {}
HISTORY = {}

# Blacklisted JWT tokens (logout support)
TOKEN_BLACKLIST = set()


# ── Model artifacts ──────────────────────────────────────────────────────────
MODEL_DIR = Path(os.getenv('MODEL_DIR', 'model_artifacts'))
model = None
scaler = None
label_encoders = None
feature_cols = None
target_mapping = None
scaler_features = None

WATER_MAP = {'High': '35L/m²', 'Medium': '20L/m²', 'Low': '10L/m²'}
TIME_MAP  = {'High': '6 AM – 8 AM', 'Medium': '7 AM – 9 AM', 'Low': 'Evening'}

REQUIRED_FIELDS = [
    'Soil_Moisture', 'Temperature_C', 'Humidity', 'Rainfall_mm',
    'Sunlight_Hours', 'Previous_Irrigation_mm', 'Soil_Type',
    'Crop_Type', 'Crop_Growth_Stage', 'Season', 'Region',
]

FIELD_RULES = {
    'Soil_Moisture':          {'min': 0,   'max': 100, 'type': 'number'},
    'Temperature_C':          {'min': 0,   'max': 50,  'type': 'number'},
    'Humidity':               {'min': 0,   'max': 100, 'type': 'number'},
    'Rainfall_mm':            {'min': 0,   'max': 300, 'type': 'number'},
    'Sunlight_Hours':         {'min': 0,   'max': 14,  'type': 'number'},
    'Previous_Irrigation_mm': {'min': 0,   'max': 200, 'type': 'number'},
    'Soil_Type':         {'allowed': ['Clay', 'Sandy', 'Loamy', 'Silty', 'Peaty'], 'type': 'string'},
    'Crop_Type':         {'allowed': ['Wheat', 'Rice', 'Maize', 'Sugarcane', 'Cotton',
                                      'Soybean', 'Barley', 'Potato', 'Tomato', 'Sorghum'], 'type': 'string'},
    'Crop_Growth_Stage': {'allowed': ['Seedling', 'Vegetative', 'Flowering', 'Fruiting', 'Maturity'], 'type': 'string'},
    'Season':            {'allowed': ['Summer', 'Winter', 'Spring', 'Autumn'], 'type': 'string'},
    'Region':            {'allowed': ['North', 'South', 'East', 'West', 'Central'], 'type': 'string'},
}


# ── Helper utilities ─────────────────────────────────────────────────────────

def hash_password(password: str) -> str:
    """Return a bcrypt-style hash of the password."""
    if WERKZEUG_AVAILABLE:
        return generate_password_hash(password)
    # Fallback — NOT for production use
    import hashlib
    return hashlib.sha256(password.encode()).hexdigest()


def verify_password(password: str, password_hash: str) -> bool:
    """Verify a plaintext password against its stored hash."""
    if WERKZEUG_AVAILABLE:
        return check_password_hash(password_hash, password)
    import hashlib
    return hashlib.sha256(password.encode()).hexdigest() == password_hash


def create_token(user_id: str) -> str:
    """Create a signed JWT for the given user_id."""
    payload = {
        'sub': user_id,
        'iat': datetime.utcnow(),
        'exp': datetime.utcnow() + timedelta(hours=JWT_EXPIRY_HOURS),
    }
    if JWT_AVAILABLE:
        return pyjwt.encode(payload, JWT_SECRET, algorithm='HS256')
    # Fallback: simple base64 token (NOT cryptographically secure)
    import base64
    raw = json.dumps({'sub': user_id, 'exp': (datetime.utcnow() + timedelta(hours=JWT_EXPIRY_HOURS)).isoformat()})
    return base64.urlsafe_b64encode(raw.encode()).decode()


def decode_token(token: str) -> dict | None:
    """Decode and verify a JWT. Returns the payload or None on failure."""
    if JWT_AVAILABLE:
        try:
            return pyjwt.decode(token, JWT_SECRET, algorithms=['HS256'])
        except Exception:
            return None
    # Fallback
    try:
        import base64
        raw = base64.urlsafe_b64decode(token.encode()).decode()
        payload = json.loads(raw)
        exp = datetime.fromisoformat(payload['exp'])
        if datetime.utcnow() > exp:
            return None
        return payload
    except Exception:
        return None


def require_auth(f):
    """Decorator that validates the Bearer token and sets g.user_id."""
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Missing or invalid Authorization header'}), 401
        token = auth_header[7:]
        if token in TOKEN_BLACKLIST:
            return jsonify({'error': 'Token has been invalidated. Please log in again.'}), 401
        payload = decode_token(token)
        if not payload:
            return jsonify({'error': 'Invalid or expired token'}), 401
        g.user_id = payload['sub']
        g.token = token
        return f(*args, **kwargs)
    return decorated


def get_user_by_email(email: str) -> dict | None:
    """Look up a user by email (case-insensitive)."""
    return USERS.get(email.lower())


def get_user_by_id(user_id: str) -> dict | None:
    """Look up a user by their unique ID."""
    for user in USERS.values():
        if user['id'] == user_id:
            return user
    return None


def safe_user(user: dict) -> dict:
    """Return a user dict with the password hash removed (safe for API responses)."""
    return {k: v for k, v in user.items() if k != 'password_hash'}


# ── Model loading & inference ────────────────────────────────────────────────

def load_model_artifacts() -> bool:
    """Load ML model and preprocessing artifacts from disk. Returns True on success."""
    global model, scaler, label_encoders, feature_cols, target_mapping, scaler_features
    if not JOBLIB_AVAILABLE:
        logger.warning('joblib not available — using rule-based fallback predictor.')
        return False
    try:
        model          = joblib.load(MODEL_DIR / 'best_irrigation_model.pkl')
        scaler         = joblib.load(MODEL_DIR / 'scaler.pkl')
        label_encoders = joblib.load(MODEL_DIR / 'label_encoders.pkl')
        feature_cols   = joblib.load(MODEL_DIR / 'feature_cols.pkl')
        target_mapping = joblib.load(MODEL_DIR / 'target_mapping.pkl')
        if hasattr(scaler, 'feature_names_in_'):
            scaler_features = list(scaler.feature_names_in_)
        logger.info('✅ All model artifacts loaded successfully.')
        return True
    except Exception as exc:
        logger.warning(f'Could not load model artifacts: {exc}. Using rule-based fallback.')
        return False


def rule_based_predict(data: dict) -> dict:
    """
    Simple rule-based irrigation predictor used when the ML model is unavailable.
    Implements the same Strategy interface as the ML model path.
    """
    sm   = float(data.get('Soil_Moisture', 50))
    rain = float(data.get('Rainfall_mm', 10))
    temp = float(data.get('Temperature_C', 25))

    if sm < 30 and rain < 5 and temp > 32:
        level, conf = 'High', 0.92
    elif sm < 50 and rain < 20:
        level, conf = 'Medium', 0.78
    else:
        level, conf = 'Low', 0.85

    spread = (1 - conf) / 2
    probs = {k: round(spread, 4) for k in ['Low', 'Medium', 'High']}
    probs[level] = round(conf, 4)

    return {
        'prediction':  level,
        'confidence':  conf,
        'probabilities': probs,
        'water_amount': WATER_MAP[level],
        'best_time':    TIME_MAP[level],
        'warning': None,
    }


def resolve_label(raw) -> str:
    """Map a raw model output (int or string) to a human-readable label."""
    if isinstance(raw, str):
        return raw
    numeric = int(raw)
    if target_mapping:
        inv = target_mapping.get('inverse', target_mapping)
        label = inv.get(numeric) or inv.get(str(numeric))
        if label:
            return str(label)
        # try forward-map inversion
        inverted = {int(v): k for k, v in target_mapping.items() if isinstance(v, (int, float))}
        if numeric in inverted:
            return inverted[numeric]
    return {0: 'Low', 1: 'Medium', 2: 'High'}.get(numeric, str(raw))


def ml_predict(data: dict) -> dict:
    """Run the loaded ML model on the given input data dict."""
    df = pd.DataFrame([data])

    # Feature engineering
    df['Moisture_Humidity_Interaction'] = df['Soil_Moisture'] * df['Humidity'] / 100
    df['Water_Stress_Index'] = df['Temperature_C'] / (df['Soil_Moisture'] + 1)
    df['Effective_Rainfall'] = df['Rainfall_mm'] - df['Previous_Irrigation_mm']
    df['Soil_Moisture_Category'] = pd.cut(
        df['Soil_Moisture'], bins=[-1, 20, 40, 60, 100],
        labels=['Very Low', 'Low', 'Medium', 'High'],
    )
    df['Temp_Category'] = pd.cut(
        df['Temperature_C'], bins=[-1, 15, 25, 35, 50],
        labels=['Cool', 'Moderate', 'Warm', 'Hot'],
    )

    # Encode categoricals
    df_enc = df.copy()
    for col, enc in label_encoders.items():
        if col in df_enc.columns:
            try:
                df_enc[col] = enc.transform([df_enc[col].iloc[0]])[0]
            except Exception:
                df_enc[col] = 0

    # Align features
    for feat in feature_cols:
        if feat not in df_enc.columns:
            df_enc[feat] = 0
    df_model = df_enc[list(feature_cols)].copy()

    # Scale
    if scaler and scaler_features:
        try:
            sub = pd.DataFrame({f: df_model[f].values for f in scaler_features if f in df_model.columns})
            scaled = scaler.transform(sub)
            for i, f in enumerate(scaler_features):
                if f in df_model.columns:
                    df_model.loc[:, f] = scaled[:, i]
        except Exception as exc:
            logger.warning(f'Scaling failed: {exc}')

    raw = model.predict(df_model)[0]
    label = resolve_label(raw)

    if hasattr(model, 'predict_proba'):
        proba = model.predict_proba(df_model)[0]
    else:
        n = len(model.classes_) if hasattr(model, 'classes_') else 3
        proba = np.array([1.0 if i == int(raw) else 0.0 for i in range(n)])

    prob_sum = float(np.sum(proba))
    if not np.isclose(prob_sum, 1.0) and prob_sum > 0:
        proba = proba / prob_sum

    prob_dict = {'Low': 0.0, 'Medium': 0.0, 'High': 0.0}
    if hasattr(model, 'classes_'):
        for i, cls in enumerate(model.classes_):
            prob_dict[resolve_label(cls)] = round(float(proba[i]), 4)
    else:
        for i, k in enumerate(['Low', 'Medium', 'High']):
            if i < len(proba):
                prob_dict[k] = round(float(proba[i]), 4)

    confidence = float(np.max(proba))
    water  = WATER_MAP.get(label, WATER_MAP['Medium'])
    t_best = TIME_MAP.get(label, TIME_MAP['Medium'])
    warning = 'Low confidence — verify sensor readings.' if confidence < 0.70 else None

    return {
        'prediction':    label,
        'confidence':    round(confidence, 4),
        'probabilities': prob_dict,
        'water_amount':  water,
        'best_time':     t_best,
        'warning':       warning,
    }


def validate_input(data) -> tuple:
    """
    Validate prediction request payload.
    Returns (is_valid: bool, error_body: dict, status_code: int).
    """
    if not data:
        return False, {'error': {'code': 'EMPTY_BODY', 'message': 'Request body is empty.'}}, 400
    missing = [f for f in REQUIRED_FIELDS if f not in data]
    if missing:
        return False, {'error': {'code': 'MISSING_FIELDS', 'message': f'Missing fields: {missing}'}}, 400
    for field, rules in FIELD_RULES.items():
        value = data.get(field)
        if value is None:
            continue
        if rules['type'] == 'number':
            try:
                val = float(value)
            except (TypeError, ValueError):
                return False, {'error': {'code': 'INVALID_TYPE', 'message': f'{field} must be a number.'}}, 422
            if not (rules['min'] <= val <= rules['max']):
                return False, {'error': {'code': 'OUT_OF_RANGE',
                                         'message': f'{field} must be between {rules["min"]} and {rules["max"]}.'}}, 422
        elif rules['type'] == 'string':
            if value not in rules['allowed']:
                return False, {'error': {'code': 'INVALID_VALUE',
                                         'message': f'{field} must be one of {rules["allowed"]}.'}}, 422
    return True, {}, 200


# ── Auth routes ───────────────────────────────────────────────────────────────

@app.route('/api/auth/signup', methods=['POST'])
def signup():
    """Register a new user account."""
    data = request.get_json(silent=True) or {}
    name     = (data.get('name') or '').strip()
    email    = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''

    if not name:
        return jsonify({'error': 'Name is required.'}), 400
    if not email or '@' not in email:
        return jsonify({'error': 'A valid email address is required.'}), 400
    if len(password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters.'}), 400
    if email in USERS:
        return jsonify({'error': 'An account with this email already exists.'}), 409

    user_id = f'usr_{len(USERS) + 1}_{int(datetime.utcnow().timestamp())}'
    USERS[email] = {
        'id':            user_id,
        'name':          name,
        'email':         email,
        'password_hash': hash_password(password),
        'farm_name':     (data.get('farm_name') or '').strip(),
        'region':        data.get('region', 'North'),
        'primary_crop':  data.get('primary_crop', 'Maize'),
        'created_at':    datetime.utcnow().isoformat(),
    }
    HISTORY[user_id] = []
    token = create_token(user_id)
    logger.info(f'New user registered: {email}')
    return jsonify({'token': token, 'user': safe_user(USERS[email])}), 201


@app.route('/api/auth/login', methods=['POST'])
def login():
    """Authenticate an existing user and return a JWT."""
    data     = request.get_json(silent=True) or {}
    email    = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''

    user = get_user_by_email(email)
    if not user or not verify_password(password, user['password_hash']):
        return jsonify({'error': 'Incorrect email or password.'}), 401

    token = create_token(user['id'])
    logger.info(f'User logged in: {email}')
    return jsonify({'token': token, 'user': safe_user(user)}), 200


@app.route('/api/auth/me', methods=['GET'])
@require_auth
def me():
    """Return the currently authenticated user's profile."""
    user = get_user_by_id(g.user_id)
    if not user:
        return jsonify({'error': 'User not found.'}), 404
    return jsonify({'user': safe_user(user)}), 200


@app.route('/api/auth/logout', methods=['POST'])
@require_auth
def logout():
    """
    Invalidate the current JWT by adding it to the server-side blacklist.
    The frontend should also clear the token from localStorage.
    """
    TOKEN_BLACKLIST.add(g.token)
    logger.info(f'User {g.user_id} logged out — token blacklisted.')
    return jsonify({'message': 'Logged out successfully.'}), 200


# ── Prediction route ─────────────────────────────────────────────────────────

@app.route('/api/predict', methods=['POST'])
def predict():
    """
    Accept farm sensor data and return an irrigation recommendation.
    Works for both authenticated users and unauthenticated (trial) users.
    """
    try:
        data = request.get_json(silent=True)
        is_valid, error_body, status_code = validate_input(data)
        if not is_valid:
            return jsonify(error_body), status_code

        # Choose strategy: ML model if loaded, else rule-based
        if model is not None:
            result = ml_predict(data)
        else:
            result = rule_based_predict(data)

        return jsonify(result), 200

    except Exception as exc:
        logger.error(f'Prediction error: {exc}\n{traceback.format_exc()}')
        return jsonify({'error': {'code': 'SERVER_ERROR', 'message': str(exc)}}), 500


# ── History routes ────────────────────────────────────────────────────────────

@app.route('/api/history', methods=['GET'])
@require_auth
def get_history():
    """Return the authenticated user's prediction history (most recent first)."""
    records = HISTORY.get(g.user_id, [])
    return jsonify({'history': list(reversed(records))}), 200


@app.route('/api/history', methods=['POST'])
@require_auth
def save_history():
    """Append a prediction record to the authenticated user's history."""
    entry = request.get_json(silent=True) or {}
    record = {
        'input':     entry.get('input', {}),
        'result':    entry.get('result', {}),
        'timestamp': datetime.utcnow().isoformat(),
    }
    HISTORY.setdefault(g.user_id, []).append(record)
    return jsonify({'message': 'Saved.'}), 201


# ── Health check ──────────────────────────────────────────────────────────────

@app.route('/api/health', methods=['GET'])
def health():
    """Return the current status of the API and model."""
    return jsonify({
        'status':       'online',
        'model':        'ml' if model is not None else 'rule-based-fallback',
        'users_count':  len(USERS),
        'timestamp':    datetime.utcnow().isoformat(),
    }), 200


# ── Entry point ───────────────────────────────────────────────────────────────

# Load model at startup (non-fatal if missing)
load_model_artifacts()

if __name__ == '__main__':
    port  = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_ENV') == 'development'
    app.run(host='0.0.0.0', port=port, debug=debug)
