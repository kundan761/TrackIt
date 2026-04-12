#!/bin/bash

# Base path (adjust if needed)
BASE_PATH="apps/server/module"

# Ask for module name
read -p "Enter module name: " MODULE_NAME

# Trim spaces
MODULE_NAME=$(echo "$MODULE_NAME" | xargs)

# Check empty
if [ -z "$MODULE_NAME" ]; then
  echo "❌ Module name cannot be empty."
  exit 1
fi

# Convert to kebab-case (basic)
KEBAB_NAME=$(echo "$MODULE_NAME" \
  | sed 's/[A-Z]/-&/g' \
  | tr '[:upper:]' '[:lower:]' \
  | sed 's/^-//' \
  | sed 's/ /-/g')

MODULE_PATH="$BASE_PATH/$KEBAB_NAME"

# Check if module already exists
if [ -d "$MODULE_PATH" ]; then
  echo "❌ Module \"$KEBAB_NAME\" already exists."
  exit 1
fi

# Create directories
mkdir -p "$MODULE_PATH/internal/store"
mkdir -p "$MODULE_PATH/rest-api"

# Root files
touch "$MODULE_PATH/$KEBAB_NAME-service.ts"
touch "$MODULE_PATH/index.ts"
touch "$MODULE_PATH/type.ts"

# Internal files
touch "$MODULE_PATH/internal/$KEBAB_NAME-reader.ts"
touch "$MODULE_PATH/internal/$KEBAB_NAME-writer.ts"

touch "$MODULE_PATH/internal/store/$KEBAB_NAME-schema.ts"
touch "$MODULE_PATH/internal/store/$KEBAB_NAME-repository.ts"

# REST API files
touch "$MODULE_PATH/rest-api/$KEBAB_NAME-controller.ts"
touch "$MODULE_PATH/rest-api/$KEBAB_NAME-router.ts"
touch "$MODULE_PATH/rest-api/$KEBAB_NAME-server.ts"
touch "$MODULE_PATH/rest-api/$KEBAB_NAME-serializer.ts"

echo "✅ Module \"$KEBAB_NAME\" created successfully."