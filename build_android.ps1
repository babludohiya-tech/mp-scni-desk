# Set Environment Variables
# Use Android Studio's bundled JDK 21 (jbr) which is compatible with Gradle 8.14.3
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
$env:ANDROID_HOME = "C:\Users\Reena\AppData\Local\Android\Sdk"
$env:PATH = "C:\Program Files\nodejs;C:\Program Files\Android\Android Studio\jbr\bin;C:\Users\Reena\AppData\Local\Android\Sdk\platform-tools;C:\Users\Reena\AppData\Local\Android\Sdk\tools\bin;" + $env:PATH

Write-Output "--- SYSTEM VERIFICATION ---"
java -version
node -v
npm -v
Write-Output "JAVA_HOME: $env:JAVA_HOME"
Write-Output "ANDROID_HOME: $env:ANDROID_HOME"

# Ensure we are in the correct directory
cd C:\Users\Reena\.gemini\antigravity\scratch\mp-scni-desk

# 1. Initialize npm project if package.json doesn't exist
if (-not (Test-Path "package.json")) {
    Write-Output "Initializing npm project..."
    npm init -y
}

# 2. Install Capacitor Core + CLI
Write-Output "Installing Capacitor Core and CLI..."
npm install @capacitor/core@latest @capacitor/cli@latest

# 3. Create www folder and copy web files
Write-Output "Preparing www directory..."
if (-not (Test-Path "www")) {
    New-Item -ItemType Directory -Path "www" -Force
}
# Copy only files that belong to the web app
Copy-Item "index.html" "www\" -Force
Copy-Item "app.js" "www\" -Force
Copy-Item "index.css" "www\" -Force
Copy-Item "manifest.json" "www\" -Force
Copy-Item "sw.js" "www\" -Force
Copy-Item "icon-192.png" "www\" -Force
Copy-Item "icon-512.png" "www\" -Force

# 4. Install Capacitor Android platform
Write-Output "Installing Capacitor Android platform..."
npm install @capacitor/android@latest

# 5. Add the Android platform (re-create if directory is corrupted)
if (Test-Path "android") {
    Write-Output "Removing old Android native folder..."
    Remove-Item -Recurse -Force "android" -ErrorAction SilentlyContinue
}
Write-Output "Adding Android native platform..."
npx cap add android

# 6. Copy web assets to Android project
Write-Output "Syncing web assets to native project..."
npx cap sync android

# 7. Build APK using Gradle
Write-Output "Building APK using Gradle..."
cd android
.\gradlew.bat assembleDebug

Write-Output "--- BUILD COMPLETED ---"
if (Test-Path "app\build\outputs\apk\debug\app-debug.apk") {
    Write-Output "APK successfully created at android\app\build\outputs\apk\debug\app-debug.apk"
} else {
    Write-Error "Failed to build APK. Check the errors above."
}
