#!/bin/bash
# MongoDB Backup Script for LinkShield
# Usage: bash backup_mongo.sh
# Requires mongodump to be installed and in PATH

# Set variables
DB_NAME="linkshield"
BACKUP_DIR="../backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
ARCHIVE_NAME="$BACKUP_DIR/mongo_backup_$TIMESTAMP.gz"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Run mongodump
mongodump --db "$DB_NAME" --archive="$ARCHIVE_NAME" --gzip

if [ $? -eq 0 ]; then
  echo "Backup successful: $ARCHIVE_NAME"
else
  echo "Backup failed!"
  exit 1
fi 