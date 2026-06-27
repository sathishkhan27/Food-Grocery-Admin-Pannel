# PingZo - Mobile Codebase (Flutter Conversion)

This subdirectory contains the complete, production-grade **Flutter Mobile Codebase** conversion of your application. It matches 100% of the live functionality, including the **Category-Based Product Stock Handling**, **Delivery Partner Onboarding**, and **Admin / Operations Control Panel**.

## 📱 Mobile Architecture & Codebase Files

The codebase is written in highly idiomatic **Dart** with a clean modular structure:

1.  **`/flutter_app/lib/main.dart`**: The main entry point of the Flutter application. It bootstraps the application, registers a global `AppState` manager (using standard `ChangeNotifier`), and handles screen routing across Customer, Driver, and Admin roles.
2.  **`/flutter_app/lib/customer_app.dart`**: The Customer panel featuring a high-density Zepto-style grocery layout. It includes category filters ("Vegetables", "Fruits", "Pantry", "Food"), search capabilities, out-of-stock visual overlays, and instant cart totals.
3.  **`/flutter_app/lib/driver_onboarding.dart`**: The multi-step Delivery Partner Onboarding screen. This wizard guides applicants through registration, vehicle selection, document uploads, and a real-time status tracker that tells them they are "Awaiting Fleet Manager Manual Approval".
4.  **`/flutter_app/lib/admin_dashboard.dart`**: The robust Admin Dashboard. It includes subviews for managing category stocks in real-time and an "Onboarding Approvals Queue" where managers can approve registered riders with a single tap.

## 🛠️ How to Compile & Run the Flutter App

To run this mobile code on your local development machine:

### 1. Prerequisites
*   Install **Flutter SDK** (v3.0.0 or higher) from [flutter.dev](https://flutter.dev).
*   Install **VS Code** or **Android Studio** with the Flutter & Dart extensions.
*   Connect an Android Emulator, iOS Simulator, or a physical mobile device.

### 2. Dependency Setup
Navigate to the `flutter_app` folder in your terminal and fetch the required dependencies:
```bash
cd flutter_app
flutter pub get
```

The app uses minimal standard dependencies defined in the code:
*   `provider`: For light-weight, reactive state management.
*   `google_fonts`: For beautiful "Inter" and "Space Grotesk" typography.

### 3. Running the App
Start the development server with hot reload:
```bash
flutter run
```

### 4. Build Production Packages
To compile final release builds for deployment:
*   **Android (APK):** `flutter build apk --release`
*   **iOS (ipa):** `flutter build ipa --release`
