import os
import logging
import joblib
import numpy as np
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from pathlib import Path
from datetime import datetime
import traceback

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=getattr(logging, os.getenv('LOG_LEVEL', 'INFO')),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)

# Custom JSON encoder — converts numpy int64/float64 so jsonify() never crashes
import json as _json

class NumpyEncoder(_json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, np.integer):
            return int(obj)
        if isinstance(obj, np.floating):
            return float(obj)
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        return super().default(obj)

app.json_encoder = NumpyEncoder

# Configure CORS — allow all origins so local HTML files (file://) can connect
CORS(app, origins="*")

# Global variables for model artifacts
model = None
scaler = None
label_encoders = None
feature_cols = None
target_mapping = None
scaler_features = None

# Model directory
MODEL_DIR = Path(os.getenv('MODEL_DIR', 'model_artifacts'))
CONFIDENCE_THRESHOLD = float(os.getenv('CONFIDENCE_THRESHOLD', 0.70))

# Required fields from the specification
REQUIRED_FIELDS = [
    'Soil_Moisture', 'Temperature_C', 'Humidity', 'Rainfall_mm',
    'Sunlight_Hours', 'Previous_Irrigation_mm', 'Soil_Type',
    'Crop_Type', 'Crop_Growth_Stage', 'Season', 'Region'
]

# Field validation rules
FIELD_RULES = {
    'Soil_Moisture': {'min': 0, 'max': 100, 'type': 'number'},
    'Temperature_C': {'min': 0, 'max': 50, 'type': 'number'},
    'Humidity': {'min': 0, 'max': 100, 'type': 'number'},
    'Rainfall_mm': {'min': 0, 'max': 300, 'type': 'number'},
    'Sunlight_Hours': {'min': 0, 'max': 14, 'type': 'number'},
    'Previous_Irrigation_mm': {'min': 0, 'max': 200, 'type': 'number'},
    'Soil_Type': {
        'allowed': ['Clay', 'Sandy', 'Loamy', 'Silty', 'Peaty'],
        'type': 'string'
    },
    'Crop_Type': {
        'allowed': ['Wheat', 'Rice', 'Maize', 'Sugarcane', 'Cotton',
                   'Soybean', 'Barley', 'Potato', 'Tomato', 'Sorghum'],
        'type': 'string'
    },
    'Crop_Growth_Stage': {
        'allowed': ['Seedling', 'Vegetative', 'Flowering', 'Fruiting', 'Maturity'],
        'type': 'string'
    },
    'Season': {
        'allowed': ['Summer', 'Winter', 'Spring', 'Autumn'],
        'type': 'string'
    },
    'Region': {
        'allowed': ['North', 'South', 'East', 'West', 'Central'],
        'type': 'string'
    }
}

# Water amount and best time mappings
WATER_AMOUNT_MAP = {
    'High': '35L/m2',
    'Medium': '20L/m2',
    'Low': '10L/m2'
}

BEST_TIME_MAP = {
    'High': '6 AM - 8 AM',
    'Medium': '7 AM - 9 AM',
    'Low': 'Evening'
}


def resolve_label(raw_prediction):
    """
    Safely resolve the numeric (or string) model output to a human-readable label.
    Handles all known target_mapping structures:
      - None / missing
      - {'inverse': {0: 'Low', 1: 'Medium', 2: 'High'}}
      - {0: 'Low', 1: 'Medium', 2: 'High'}
      - {'Low': 0, 'Medium': 1, 'High': 2}  (forward-only, auto-inverted)
      - plain string output directly from the model
    """
    global target_mapping

    # If the model already returns a string label, use it directly
    if isinstance(raw_prediction, str):
        return raw_prediction

    numeric_key = int(raw_prediction)

    if target_mapping is None:
        logger.warning("target_mapping is None – using index-based fallback")
        fallback = {0: 'Low', 1: 'Medium', 2: 'High'}
        return fallback.get(numeric_key, str(raw_prediction))

    if not isinstance(target_mapping, dict):
        logger.warning(f"Unexpected target_mapping type: {type(target_mapping)}")
        return str(raw_prediction)

    # Structure: {'inverse': {0: 'Low', ...}}
    if 'inverse' in target_mapping:
        inverse = target_mapping['inverse']
        if numeric_key in inverse:
            return inverse[numeric_key]
        if str(numeric_key) in inverse:
            return inverse[str(numeric_key)]

    # Structure: {0: 'Low', 1: 'Medium', 2: 'High'}
    if numeric_key in target_mapping:
        return str(target_mapping[numeric_key])
    if str(numeric_key) in target_mapping:
        return str(target_mapping[str(numeric_key)])

    # Structure: {'Low': 0, 'Medium': 1, 'High': 2} – auto-invert
    inverted = {int(v): k for k, v in target_mapping.items()
                if isinstance(v, (int, float))}
    if numeric_key in inverted:
        return str(inverted[numeric_key])

    logger.warning(
        f"Could not map prediction '{raw_prediction}' using target_mapping {target_mapping}. "
        "Falling back to index-based mapping."
    )
    fallback = {0: 'Low', 1: 'Medium', 2: 'High'}
    return fallback.get(numeric_key, str(raw_prediction))


def build_prob_dict(probabilities):
    """
    Build {label: probability} using the model's actual class order (model.classes_).
    Falls back to index-based [Low, Medium, High] if classes_ is unavailable.
    """
    global model

    prob_dict = {'Low': 0.0, 'Medium': 0.0, 'High': 0.0}

    if hasattr(model, 'classes_'):
        classes = list(model.classes_)
        logger.info(f"Model classes order: {classes}")
        for i, cls in enumerate(classes):
            if i >= len(probabilities):
                break
            label = resolve_label(cls)
            prob_dict[label] = round(float(probabilities[i]), 4)
    else:
        fallback_labels = ['Low', 'Medium', 'High']
        for i, label in enumerate(fallback_labels):
            if i < len(probabilities):
                prob_dict[label] = round(float(probabilities[i]), 4)

    return prob_dict


def load_model_artifacts():
    """Load all model artifacts at startup"""
    global model, scaler, label_encoders, feature_cols, target_mapping, scaler_features

    try:
        logger.info("=" * 80)
        logger.info("LOADING MODEL ARTIFACTS...")
        logger.info("=" * 80)

        model = joblib.load(MODEL_DIR / "best_irrigation_model.pkl")
        logger.info(f"✅ Model loaded: {type(model).__name__}")

        scaler = joblib.load(MODEL_DIR / "scaler.pkl")
        logger.info(f"✅ Scaler loaded: {type(scaler).__name__}")

        label_encoders = joblib.load(MODEL_DIR / "label_encoders.pkl")
        logger.info(f"✅ Label encoders loaded for: {list(label_encoders.keys())}")

        feature_cols = joblib.load(MODEL_DIR / "feature_cols.pkl")
        logger.info(f"✅ Feature columns loaded: {len(feature_cols)} features")

        # Load and fully inspect target_mapping
        target_mapping = joblib.load(MODEL_DIR / "target_mapping.pkl")
        logger.info(f"✅ target_mapping type  : {type(target_mapping).__name__}")
        logger.info(f"✅ target_mapping value : {target_mapping}")

        # Verify round-trip label resolution at startup
        if hasattr(model, 'classes_'):
            logger.info(f"✅ model.classes_: {list(model.classes_)}")
            for cls in model.classes_:
                label = resolve_label(cls)
                logger.info(f"   class {cls!r} → label '{label}'")

        # Scaler feature list
        if hasattr(scaler, 'feature_names_in_'):
            scaler_features = list(scaler.feature_names_in_)
            logger.info(f"✅ Scaler expects {len(scaler_features)} features")

            with open('scaler_features_complete.txt', 'w') as f:
                f.write(f"SCALER EXPECTS {len(scaler_features)} FEATURES:\n")
                f.write("=" * 50 + "\n")
                for i, feat in enumerate(scaler_features):
                    f.write(f"{i+1:3d}: {feat}\n")
            logger.info("✅ Complete scaler feature list written to scaler_features_complete.txt")

        return True

    except Exception as e:
        logger.error(f"❌ Failed to load model artifacts: {e}")
        logger.error(traceback.format_exc())
        return False


def validate_input(data):
    """
    Validate all required fields are present and within ranges.
    Returns: (is_valid, error_response, status_code)
    """
    if not data:
        return False, {
            "error": {"code": "BAD_REQUEST", "message": "No JSON data provided"}
        }, 400

    missing_fields = [f for f in REQUIRED_FIELDS if f not in data]
    if missing_fields:
        field = missing_fields[0]
        return False, {
            "error": {
                "code": "VALIDATION_ERROR",
                "message": f"{field} is required",
                "field": field
            }
        }, 400

    for field, value in data.items():
        if field not in FIELD_RULES:
            continue
        rules = FIELD_RULES[field]

        if rules['type'] == 'number':
            try:
                if isinstance(value, str):
                    value = float(value)
                elif not isinstance(value, (int, float)):
                    return False, {
                        "error": {
                            "code": "VALIDATION_ERROR",
                            "message": f"{field} must be a number. Received: {type(value).__name__}",
                            "field": field
                        }
                    }, 400
                if value < rules['min'] or value > rules['max']:
                    return False, {
                        "error": {
                            "code": "VALIDATION_ERROR",
                            "message": (f"{field} must be between {rules['min']} and "
                                        f"{rules['max']}. Received: {value}"),
                            "field": field
                        }
                    }, 400
            except (ValueError, TypeError):
                return False, {
                    "error": {
                        "code": "VALIDATION_ERROR",
                        "message": f"{field} must be a valid number. Received: {value}",
                        "field": field
                    }
                }, 400

        elif rules['type'] == 'string':
            if not isinstance(value, str):
                return False, {
                    "error": {
                        "code": "VALIDATION_ERROR",
                        "message": f"{field} must be a string. Received: {type(value).__name__}",
                        "field": field
                    }
                }, 400
            if 'allowed' in rules and value not in rules['allowed']:
                return False, {
                    "error": {
                        "code": "VALIDATION_ERROR",
                        "message": (f"{field} must be one of: {', '.join(rules['allowed'])}. "
                                    f"Received: {value}"),
                        "field": field
                    }
                }, 400

    return True, None, 200


def engineer_features(df):
    """Apply all feature engineering steps"""
    logger.info("Applying feature engineering...")

    df['Water_Stress_Index'] = (
        ((100 - df['Soil_Moisture']) / 100) * 0.4 +
        (df['Temperature_C'] / 42) * 0.3 +
        (1 - (df['Humidity'] / 100)) * 0.2 +
        (df['Sunlight_Hours'] / 12) * 0.1
    )

    df['ET_Proxy'] = (
        0.0023 *
        (df['Temperature_C'] + 17.8) *
        np.sqrt(np.abs(df['Temperature_C'] - 10)) *
        df['Sunlight_Hours']
    )

    df['Effective_Moisture'] = df['Soil_Moisture'] + (df['Rainfall_mm'] * 0.5)

    df['Irrigation_Deficit'] = np.maximum(
        0,
        df['ET_Proxy'] - (df['Effective_Moisture'] * 0.1)
    )

    df['Temp_Humidity_Interaction'] = df['Temperature_C'] * df['Humidity'] / 100
    df['Moisture_Deficit'] = np.maximum(0, 50 - df['Soil_Moisture'])
    df['Rain_Sun_Product'] = df['Rainfall_mm'] * df['Sunlight_Hours']
    df['Irrigation_to_Rainfall'] = df['Previous_Irrigation_mm'] / (df['Rainfall_mm'] + 1)
    df['Moisture_per_Temp'] = df['Soil_Moisture'] / (df['Temperature_C'] + 1)

    df['Rainfall_Category'] = pd.cut(
        df['Rainfall_mm'],
        bins=[-1, 2.5, 7.5, 15, 300],
        labels=['Low', 'Medium', 'High', 'Very High']
    )

    df['Soil_Moisture_Category'] = pd.cut(
        df['Soil_Moisture'],
        bins=[-1, 20, 40, 60, 100],
        labels=['Very Low', 'Low', 'Medium', 'High']
    )

    df['Temp_Category'] = pd.cut(
        df['Temperature_C'],
        bins=[-1, 15, 25, 35, 50],
        labels=['Cool', 'Moderate', 'Warm', 'Hot']
    )

    logger.info(f"Feature engineering complete. Total columns: {len(df.columns)}")
    return df


def encode_categorical(df):
    """Apply saved label encoders to all categorical columns"""
    df_encoded = df.copy()
    logger.info(f"Applying label encoders for: {list(label_encoders.keys())}")

    for col, encoder in label_encoders.items():
        if col in df_encoded.columns:
            try:
                original_value = df_encoded[col].iloc[0]
                encoded_value = encoder.transform([original_value])[0]
                df_encoded[col] = encoded_value
                logger.info(f"  ✅ {col}: '{original_value}' → {encoded_value}")
            except Exception as e:
                logger.error(f"  ❌ Encoding error for {col}: {e}. Setting to 0.")
                df_encoded[col] = 0
        else:
            logger.warning(f"  ⚠️ Column '{col}' not in DataFrame. Setting to 0.")
            df_encoded[col] = 0

    logger.info(f"Encoding complete. Total columns: {len(df_encoded.columns)}")
    return df_encoded


def log_prediction(input_data, prediction, confidence):
    """Log prediction for monitoring"""
    logger.info({
        "timestamp": datetime.now().isoformat(),
        "inputs": input_data,
        "prediction": prediction,
        "confidence": confidence
    })


# ---------------------------------------------------------------------------
# Load model artifacts at startup
# ---------------------------------------------------------------------------
if not load_model_artifacts():
    logger.error("Server cannot start without model artifacts!")


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    if model is None:
        return jsonify({
            "status": "degraded",
            "model": "not loaded",
            "message": "Model artifacts not loaded"
        }), 503

    return jsonify({
        "status": "online",
        "model": "loaded",
        "model_type": type(model).__name__,
        "features_count": len(feature_cols) if feature_cols else 0,
        "target_mapping_type": type(target_mapping).__name__,
        "model_classes": [str(c) for c in model.classes_] if hasattr(model, 'classes_') else "N/A"
    })


@app.route('/api/predict', methods=['POST'])
def predict():
    """Main prediction endpoint"""
    logger.info("=" * 80)
    logger.info("PREDICTION ENDPOINT CALLED")
    logger.info("=" * 80)

    try:
        start_time = datetime.now()

        # Parse JSON
        data = request.get_json()
        logger.info(f"Input data: {data}")

        # Validate input
        is_valid, error_response, status_code = validate_input(data)
        if not is_valid:
            return jsonify(error_response), status_code
        logger.info("✅ Validation passed")

        # Build DataFrame
        df = pd.DataFrame([data])

        # Feature engineering
        df = engineer_features(df)

        # Encode categoricals
        df = encode_categorical(df)

        # ----------------------------------------------------------------
        # Align to model's expected feature set
        # ----------------------------------------------------------------
        model_features = list(feature_cols)

        missing = set(model_features) - set(df.columns)
        if missing:
            logger.warning(f"⚠️ Adding {len(missing)} missing features as 0: {sorted(missing)}")
            for feat in missing:
                df[feat] = 0

        extra = set(df.columns) - set(model_features)
        if extra:
            logger.info(f"Dropping {len(extra)} extra features: {sorted(extra)}")

        df_model = df[model_features].copy()
        logger.info(f"✅ Feature matrix ready: {df_model.shape}")

        # ----------------------------------------------------------------
        # Scale numerical features (only those the scaler was trained on)
        # ----------------------------------------------------------------
        if scaler and scaler_features:
            try:
                df_scaler = pd.DataFrame(index=df_model.index)
                for feat in scaler_features:
                    df_scaler[feat] = df_model[feat].values if feat in df_model.columns else 0

                scaled_array = scaler.transform(df_scaler)

                # Write scaled values back
                for i, feat in enumerate(scaler_features):
                    if feat in df_model.columns:
                        df_model.loc[:, feat] = scaled_array[:, i]

                logger.info("✅ Scaling applied")
            except Exception as e:
                logger.warning(f"⚠️ Scaling failed – proceeding unscaled: {e}")

        # ----------------------------------------------------------------
        # Predict
        # ----------------------------------------------------------------
        raw_prediction = model.predict(df_model)[0]
        logger.info(f"Raw prediction: {raw_prediction!r} (type: {type(raw_prediction).__name__})")

        if hasattr(model, 'predict_proba'):
            probabilities = model.predict_proba(df_model)[0]
        else:
            n_classes = len(model.classes_) if hasattr(model, 'classes_') else 3
            probabilities = np.array(
                [1.0 if i == int(raw_prediction) else 0.0 for i in range(n_classes)]
            )

        logger.info(f"Raw probabilities: {probabilities}")

        # Normalize (guard against floating-point drift)
        prob_sum = float(np.sum(probabilities))
        if not np.isclose(prob_sum, 1.0) and prob_sum > 0:
            probabilities = probabilities / prob_sum

        # ----------------------------------------------------------------
        # Resolve label and build response
        # ----------------------------------------------------------------
        prediction_label = resolve_label(raw_prediction)
        logger.info(f"Resolved label: '{prediction_label}'")

        confidence = float(np.max(probabilities))
        prob_dict = build_prob_dict(probabilities)
        logger.info(f"Probability dict: {prob_dict}")

        # Safety net: if label is unrecognised, default to 'Medium'
        water_amount = WATER_AMOUNT_MAP.get(prediction_label)
        best_time = BEST_TIME_MAP.get(prediction_label)

        if water_amount is None or best_time is None:
            logger.error(
                f"Label '{prediction_label}' not in WATER_AMOUNT_MAP/BEST_TIME_MAP. "
                "Defaulting to 'Medium'."
            )
            prediction_label = 'Medium'
            water_amount = WATER_AMOUNT_MAP['Medium']
            best_time = BEST_TIME_MAP['Medium']

        warning = None
        if confidence < CONFIDENCE_THRESHOLD:
            warning = "Low confidence prediction. Consider verifying sensor readings."

        log_prediction(data, prediction_label, confidence)

        response = {
            "prediction": prediction_label,
            "confidence": round(confidence, 4),
            "probabilities": prob_dict,
            "water_amount": water_amount,
            "best_time": best_time,
            "warning": warning
        }

        elapsed = (datetime.now() - start_time).total_seconds()
        logger.info(f"✅ Done in {elapsed:.2f}s → {response}")
        logger.info("=" * 80)

        return jsonify(response), 200

    except Exception as e:
        logger.error(f"❌ UNEXPECTED ERROR: {e}")
        logger.error(traceback.format_exc())
        return jsonify({
            "error": {
                "code": "SERVER_ERROR",
                "message": f"Internal server error: {str(e)}"
            }
        }), 500


if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_ENV') == 'development'
    app.run(host='0.0.0.0', port=port, debug=debug)


