import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';

import firebaseConfig from 'firebase-blueprint.json';

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

console.warn('Firebase initialized successfully'); // Fixed the incomplete console.warn statement

export { app, analytics };