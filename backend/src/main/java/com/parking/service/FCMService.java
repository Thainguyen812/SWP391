package com.parking.service;
 
import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import org.springframework.stereotype.Service;
 
import jakarta.annotation.PostConstruct;
import java.io.InputStream;
 
@Service
public class FCMService {
 
    private boolean isFirebaseInitialized = false;
 
    @PostConstruct
    public void init() {
        try {
            if (!FirebaseApp.getApps().isEmpty()) {
                isFirebaseInitialized = true;
                return;
            }
 
            InputStream serviceAccount = getClass().getClassLoader()
                    .getResourceAsStream("firebase-service-account.json");
 
            if (serviceAccount == null) {
                System.out.println("[FCM_INIT] Warning: firebase-service-account.json not found in resources. Operating in fallback/mock mode.");
                return;
            }
 
            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .build();
 
            FirebaseApp.initializeApp(options);
            isFirebaseInitialized = true;
            System.out.println("[FCM_INIT] Firebase Admin SDK initialized successfully.");
        } catch (Exception e) {
            System.err.println("[FCM_INIT] Error initializing Firebase: " + e.getMessage() + ". Operating in fallback/mock mode.");
        }
    }
 
    public void sendPushNotification(String token, String title, String body) {
        if (token == null || token.trim().isEmpty()) {
            System.out.println("[FCM_SEND] Skipped: Registration token is empty.");
            return;
        }
 
        if (!isFirebaseInitialized) {
            System.out.println("[MOCK_FCM_PUSH] Fallback Mode - Target Token: " + token + 
                               " | Title: " + title + " | Body: " + body);
            return;
        }
 
        try {
            Message message = Message.builder()
                    .setToken(token)
                    .setNotification(Notification.builder()
                            .setTitle(title)
                            .setBody(body)
                            .build())
                    .build();
 
            String response = FirebaseMessaging.getInstance().send(message);
            System.out.println("[FCM_SEND] Push notification sent successfully: " + response);
        } catch (Exception e) {
            System.err.println("[FCM_SEND] Error sending push notification: " + e.getMessage());
            // Safe fallback: Log to console as mock if actual API call fails (e.g. invalid token during development)
            System.out.println("[MOCK_FCM_PUSH] Backup Log - Token: " + token + 
                               " | Title: " + title + " | Body: " + body);
        }
    }
}
