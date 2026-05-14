import joblib
import os
from pathlib import Path

print("🔍 Checking model artifacts...\n")

model_dir = Path("model_artifacts")
required_files = [
    "best_irrigation_model.pkl",
    "scaler.pkl",
    "label_encoders.pkl",
    "feature_cols.pkl",
    "target_mapping.pkl"
]

# Check if all files exist
print("📁 Files found:")
all_exist = True
for file in required_files:
    file_path = model_dir / file
    if file_path.exists():
        size = file_path.stat().st_size
        print(f"✅ {file} - {size:,} bytes")
    else:
        print(f"❌ {file} - MISSING!")
        all_exist = False

print("\n" + "="*50)

if all_exist:
    print("\n📦 Attempting to load files...")
    try:
        model = joblib.load(model_dir / "best_irrigation_model.pkl")
        scaler = joblib.load(model_dir / "scaler.pkl")
        label_encoders = joblib.load(model_dir / "label_encoders.pkl")
        feature_cols = joblib.load(model_dir / "feature_cols.pkl")
        target_mapping = joblib.load(model_dir / "target_mapping.pkl")
        
        print("✅ All files loaded successfully!\n")
        
        # Show some basic info about each artifact
        print("📊 Model type:", type(model).__name__)
        print("🔢 Number of features:", len(feature_cols))
        print("🎯 Target mapping:", target_mapping)
        print("🏷️ Categorical columns:", list(label_encoders.keys()))
        
    except Exception as e:
        print(f"❌ Error loading files: {e}")
else:
    print("\n❌ Missing files! Please add all required .pkl files to model_artifacts/")