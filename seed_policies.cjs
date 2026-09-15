const admin = require('firebase-admin');
const fs = require('fs');

const serviceAccount = require('./firebase-applet-config.json');

// We can't easily seed using admin SDK unless we have the service account.
// But we don't have a service account JSON, we just have the config.
