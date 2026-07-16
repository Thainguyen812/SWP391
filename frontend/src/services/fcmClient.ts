import { apiClient } from '../api/apiClient';

type FirebaseWebConfig = {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  vapidKey?: string;
};

type FcmRegistrationResult = {
  ok: boolean;
  status:
    | 'registered'
    | 'unsupported'
    | 'permission-denied'
    | 'missing-config'
    | 'missing-token'
    | 'failed';
  message: string;
  token?: string;
};

const FIREBASE_APP_URL = 'https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js';
const FIREBASE_MESSAGING_URL = 'https://www.gstatic.com/firebasejs/10.12.5/firebase-messaging.js';

const env = ((import.meta as any).env || {}) as Record<string, string | undefined>;

const fromEnv = (): FirebaseWebConfig => ({
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
  vapidKey: env.VITE_FIREBASE_VAPID_KEY
});

const hasConfig = (config: FirebaseWebConfig) =>
  Boolean(config.apiKey && config.projectId && config.messagingSenderId && config.appId && config.vapidKey);

const loadFirebaseConfig = async (): Promise<FirebaseWebConfig> => {
  const envConfig = fromEnv();
  if (hasConfig(envConfig)) return envConfig;

  try {
    const response = await fetch('/firebase-config.json', { cache: 'no-store' });
    if (!response.ok) return envConfig;
    const fileConfig = await response.json();
    return { ...envConfig, ...(fileConfig.firebase || fileConfig) };
  } catch (error) {
    console.warn('[FCM_CLIENT] Cannot load firebase-config.json', error);
    return envConfig;
  }
};

export const registerDriverFcmToken = async (): Promise<FcmRegistrationResult> => {
  if (!('Notification' in window) || !('serviceWorker' in navigator)) {
    return {
      ok: false,
      status: 'unsupported',
      message: 'Trinh duyet khong ho tro Web Push Notification.'
    };
  }

  const permission =
    Notification.permission === 'granted'
      ? 'granted'
      : await Notification.requestPermission();

  if (permission !== 'granted') {
    return {
      ok: false,
      status: 'permission-denied',
      message: 'Driver chua cho phep nhan thong bao tren trinh duyet.'
    };
  }

  const firebaseConfig = await loadFirebaseConfig();
  if (!hasConfig(firebaseConfig)) {
    return {
      ok: false,
      status: 'missing-config',
      message: 'Thieu Firebase web config hoac VAPID key.'
    };
  }

  try {
    const [{ initializeApp, getApps }, { getMessaging, getToken, onMessage, isSupported }] =
      await Promise.all([
        import(/* @vite-ignore */ FIREBASE_APP_URL),
        import(/* @vite-ignore */ FIREBASE_MESSAGING_URL)
      ]);

    if (!(await isSupported())) {
      return {
        ok: false,
        status: 'unsupported',
        message: 'Trinh duyet hien tai khong ho tro Firebase Messaging.'
      };
    }

    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
    const messaging = getMessaging(app);
    const token = await getToken(messaging, {
      vapidKey: firebaseConfig.vapidKey,
      serviceWorkerRegistration: registration
    });

    if (!token) {
      return {
        ok: false,
        status: 'missing-token',
        message: 'Firebase khong tra ve FCM token.'
      };
    }

    await apiClient.put('/v1/driver/fcm-token', { fcmToken: token });
    localStorage.setItem('urbanpark_driver_fcm_token', token);

    onMessage(messaging, (payload: any) => {
      const title = payload.notification?.title || payload.data?.title || 'UrbanPark';
      const body = payload.notification?.body || payload.data?.body || '';
      if (Notification.permission === 'granted') {
        new Notification(title, {
          body,
          icon: '/favicon.svg',
          badge: '/favicon.svg'
        });
      }
    });

    return {
      ok: true,
      status: 'registered',
      message: 'Da dang ky thiet bi nhan thong bao FCM.',
      token
    };
  } catch (error) {
    console.error('[FCM_CLIENT] FCM registration failed', error);
    return {
      ok: false,
      status: 'failed',
      message: error instanceof Error ? error.message : 'Dang ky FCM that bai.'
    };
  }
};
