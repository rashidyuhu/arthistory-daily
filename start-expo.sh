#!/bin/bash
# Start Expo with increased file limit

# Increase file limit for this session
ulimit -n 10240

# Start Expo
npm start
