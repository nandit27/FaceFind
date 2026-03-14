#!/bin/bash
mkdir -p public/models
cd public/models

BASE_URL="https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights"
FILES=(
  "ssd_mobilenetv1_model-weights_manifest.json"
  "ssd_mobilenetv1_model-shard1"
  "ssd_mobilenetv1_model-shard2"
  "face_landmark_68_model-weights_manifest.json"
  "face_landmark_68_model-shard1"
  "face_recognition_model-weights_manifest.json"
  "face_recognition_model-shard1"
  "face_recognition_model-shard2"
)

for file in "${FILES[@]}"; do
  if [ ! -f "$file" ]; then
    echo "Downloading $file..."
    curl -sS -O "$BASE_URL/$file"
  else
    echo "$file already exists."
  fi
done

echo "Models downloaded."
