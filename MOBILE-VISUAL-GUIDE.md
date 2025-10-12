# Mobile QR Code Scanning - Visual Guide

## 📱 Complete Student Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    LECTURER'S COMPUTER                       │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Attendance Session Dashboard                         │  │
│  │  ┌─────────────────┐  ┌─────────────────┐            │  │
│  │  │   QR CODE       │  │  Session Code   │            │  │
│  │  │   ███████       │  │                 │            │  │
│  │  │   ███████       │  │    ABC123       │            │  │
│  │  │   ███████       │  │                 │            │  │
│  │  └─────────────────┘  └─────────────────┘            │  │
│  │                                                       │  │
│  │  URL: http://192.168.1.100:9002/attendance/xyz123    │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ Student scans QR code
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    STUDENT'S PHONE                           │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  📷 Camera App                                        │  │
│  │  ┌─────────────────────────────────────────────────┐ │  │
│  │  │                                                   │ │  │
│  │  │        [QR Code detected]                        │ │  │
│  │  │                                                   │ │  │
│  │  │   🔗 Open "attendance.system.com"                │ │  │
│  │  │                                                   │ │  │
│  │  └─────────────────────────────────────────────────┘ │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ Tap notification
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    MOBILE BROWSER                            │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Mark Your Attendance                                 │  │
│  │  ─────────────────────────────────────────────────    │  │
│  │                                                       │  │
│  │  📍 Location Permission Required                     │  │
│  │  ┌─────────────────────────────────────────────────┐ │  │
│  │  │ Allow "Browser" to access your location?        │ │  │
│  │  │                                                  │ │  │
│  │  │  [Don't Allow]  [Allow While Using App]         │ │  │
│  │  └─────────────────────────────────────────────────┘ │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ Allow location
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    ATTENDANCE PAGE                           │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  ✅ Attendance Marked Successfully!                   │  │
│  │  ─────────────────────────────────────────────────    │  │
│  │                                                       │  │
│  │  Course: Computer Science 101                        │  │
│  │  Session: ABC123                                     │  │
│  │  Time: 10:30 AM                                      │  │
│  │                                                       │  │
│  │  ✓ Location verified                                 │  │
│  │  ✓ No VPN detected                                   │  │
│  │  ✓ Within geofence (25m from venue)                 │  │
│  │                                                       │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🖥️ Setup Flow (Administrator)

```
┌─────────────────────────────────────────────────────────────┐
│  STEP 1: Find Your Computer's IP Address                    │
│  ─────────────────────────────────────────────────────────  │
│                                                              │
│  Windows Command Prompt:                                    │
│  C:\> ipconfig                                              │
│                                                              │
│  Ethernet adapter:                                          │
│    IPv4 Address. . . . . . : 192.168.1.100  ← Use this!    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 2: Update .env File                                   │
│  ─────────────────────────────────────────────────────────  │
│                                                              │
│  NEXT_PUBLIC_BASE_URL="http://192.168.1.100:9002"          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 3: Configure Firewall (Windows)                       │
│  ─────────────────────────────────────────────────────────  │
│                                                              │
│  Windows Defender Firewall → Advanced Settings              │
│  → Inbound Rules → New Rule                                 │
│  → Port: 9002 → Allow Connection                            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 4: Restart Server                                     │
│  ─────────────────────────────────────────────────────────  │
│                                                              │
│  C:\attendance-system> npm run dev                          │
│                                                              │
│  ✓ Ready on http://0.0.0.0:9002                            │
│  ✓ Network: http://192.168.1.100:9002                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 5: Test from Phone                                    │
│  ─────────────────────────────────────────────────────────  │
│                                                              │
│  📱 Phone Browser: http://192.168.1.100:9002               │
│                                                              │
│  ✅ Success! System loads on mobile                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 👨‍🏫 Lecturer Workflow

```
┌──────────────────────┐
│  1. Login            │
│  lecturer@msu.com    │
└──────────────────────┘
           │
           ▼
┌──────────────────────┐
│  2. Select Course    │
│  Computer Science    │
└──────────────────────┘
           │
           ▼
┌──────────────────────┐
│  3. Create Session   │
│  • Duration: 30 min  │
│  • Location: ON      │
│  • Radius: 100m      │
└──────────────────────┘
           │
           ▼
┌──────────────────────┐
│  4. Display QR Code  │
│  • Project on screen │
│  • Show session code │
│  • Keep visible      │
└──────────────────────┘
           │
           ▼
┌──────────────────────┐
│  5. Monitor Live     │
│  • See check-ins     │
│  • Real-time count   │
│  • Verify students   │
└──────────────────────┘
           │
           ▼
┌──────────────────────┐
│  6. Close Session    │
│  • Export report     │
│  • Review flagged    │
│  • Save records      │
└──────────────────────┘
```

---

## 👨‍🎓 Student Workflow

```
┌──────────────────────┐
│  1. Enter Classroom  │
│  Physical presence   │
└──────────────────────┘
           │
           ▼
┌──────────────────────┐
│  2. Open Camera      │
│  📷 Phone camera app │
└──────────────────────┘
           │
           ▼
┌──────────────────────┐
│  3. Scan QR Code     │
│  Point at screen     │
└──────────────────────┘
           │
           ▼
┌──────────────────────┐
│  4. Tap Notification │
│  🔗 Open link        │
└──────────────────────┘
           │
           ▼
┌──────────────────────┐
│  5. Allow Location   │
│  📍 Grant permission │
└──────────────────────┘
           │
           ▼
┌──────────────────────┐
│  6. Verify Checks    │
│  • Location ✓        │
│  • VPN ✓             │
│  • Enrollment ✓      │
└──────────────────────┘
           │
           ▼
┌──────────────────────┐
│  7. Success!         │
│  ✅ Attendance marked│
└──────────────────────┘
```

---

## 🔒 Security Checks Flow

```
Student Scans QR Code
         │
         ▼
┌─────────────────────┐
│ 1. Session Valid?   │
│ • Code exists?      │
│ • Not expired?      │
└─────────────────────┘
         │
         ├─ NO → ❌ "Invalid session"
         │
         ▼ YES
┌─────────────────────┐
│ 2. Student Enrolled?│
│ • In this course?   │
│ • Active student?   │
└─────────────────────┘
         │
         ├─ NO → ❌ "Not enrolled"
         │
         ▼ YES
┌─────────────────────┐
│ 3. Already Marked?  │
│ • Duplicate check   │
└─────────────────────┘
         │
         ├─ YES → ❌ "Already marked"
         │
         ▼ NO
┌─────────────────────┐
│ 4. VPN Detected?    │
│ • IP analysis       │
│ • Proxy check       │
└─────────────────────┘
         │
         ├─ YES → ❌ "VPN detected"
         │
         ▼ NO
┌─────────────────────┐
│ 5. Location Valid?  │
│ • Within geofence?  │
│ • Distance check    │
└─────────────────────┘
         │
         ├─ NO → ⚠️ "Flagged for review"
         │
         ▼ YES
┌─────────────────────┐
│ ✅ ATTENDANCE MARKED│
│ All checks passed   │
└─────────────────────┘
```

---

## 📡 Network Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    WIFI ROUTER                               │
│                  192.168.1.1                                 │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Lecturer   │  │   Student    │  │   Student    │     │
│  │   Computer   │  │   Phone 1    │  │   Phone 2    │     │
│  │              │  │              │  │              │     │
│  │ .100:9002    │  │  .101        │  │  .102        │     │
│  │              │  │              │  │              │     │
│  │ [SERVER]     │  │ [CLIENT]     │  │ [CLIENT]     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│         │                 │                 │               │
│         └─────────────────┴─────────────────┘               │
│              Same WiFi Network Required                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🌐 URL Structure

```
Base URL: http://192.168.1.100:9002
                │         │      │
                │         │      └─ Port (9002)
                │         └──────── Local IP Address
                └────────────────── Protocol (http)

Session URL: http://192.168.1.100:9002/attendance/abc123xyz
                                        │           │
                                        │           └─ Session ID
                                        └───────────── Route

QR Code Contains: Full session URL
Students Scan: QR Code → Opens URL → Marks Attendance
```

---

## 📱 Mobile Browser Detection Flow

```
Student Opens URL
         │
         ▼
┌─────────────────────┐
│ Detect Device Type  │
│ • Mobile? ✓         │
│ • Browser? Safari   │
│ • OS? iOS 16        │
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│ Load Mobile UI      │
│ • Responsive layout │
│ • Touch-friendly    │
│ • Optimized size    │
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│ Request Permissions │
│ • Location access   │
│ • Camera (if needed)│
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│ Process Attendance  │
│ • Verify location   │
│ • Check VPN         │
│ • Mark attendance   │
└─────────────────────┘
```

---

## 🎯 Geofence Visualization

```
                    Classroom Building
                    ┌─────────────┐
                    │             │
                    │   Lecturer  │
                    │   Computer  │
                    │      📍     │
                    │             │
                    └─────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        │    100m Radius Geofence          │
        │                 │                 │
        │    ┌───┐   ┌───┐   ┌───┐        │
        │    │📱 │   │📱 │   │📱 │        │
        │    └───┘   └───┘   └───┘        │
        │   Student Student Student        │
        │   ✅ OK   ✅ OK   ✅ OK          │
        │                                  │
        └──────────────────────────────────┘
                          │
                          │ Outside geofence
                          ▼
                        ┌───┐
                        │📱 │
                        └───┘
                       Student
                       ❌ Too far
```

---

## 🔄 Real-Time Updates

```
┌─────────────────────────────────────────────────────────────┐
│  LECTURER'S SCREEN (Live Dashboard)                         │
│  ─────────────────────────────────────────────────────────  │
│                                                              │
│  Session: ABC123          Status: Active (25 min left)      │
│                                                              │
│  Students Present: 45 / 50                                  │
│  ████████████████████████████████░░░░░░░ 90%               │
│                                                              │
│  Recent Check-ins:                                          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ 10:32 AM  John Doe        ✅ Verified                  │ │
│  │ 10:32 AM  Jane Smith      ✅ Verified                  │ │
│  │ 10:31 AM  Bob Johnson     ⚠️  Flagged (distance)      │ │
│  │ 10:31 AM  Alice Brown     ✅ Verified                  │ │
│  │ 10:30 AM  Charlie Davis   ✅ Verified                  │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  [Export Report]  [Close Session]                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Success Indicators

```
✅ SETUP COMPLETE WHEN:
┌─────────────────────────────────────┐
│ ✓ Server accessible from phone      │
│ ✓ QR code generates correctly       │
│ ✓ QR code scans successfully        │
│ ✓ Location permission granted       │
│ ✓ Attendance marked successfully    │
│ ✓ No VPN/proxy errors               │
│ ✓ Geofence verification works       │
│ ✓ Real-time updates visible         │
└─────────────────────────────────────┘
```

---

## 🎓 Classroom Setup Example

```
                    CLASSROOM LAYOUT
    ┌─────────────────────────────────────────────┐
    │                                             │
    │  [PROJECTOR SCREEN]                        │
    │  ┌─────────────────────────────────────┐   │
    │  │                                     │   │
    │  │   QR CODE        Session: ABC123   │   │
    │  │   ███████                           │   │
    │  │   ███████        Scan to mark      │   │
    │  │   ███████        attendance        │   │
    │  │                                     │   │
    │  └─────────────────────────────────────┘   │
    │                                             │
    │  [LECTURER DESK]                           │
    │  💻 Computer running server                │
    │  📊 Live dashboard visible                 │
    │                                             │
    │  [STUDENT DESKS]                           │
    │  📱 📱 📱 📱 📱                            │
    │  Students scanning with phones             │
    │                                             │
    └─────────────────────────────────────────────┘
```

---

## 📝 Quick Reference Card

```
╔═══════════════════════════════════════════════════════════╗
║              MOBILE ACCESS QUICK REFERENCE                ║
╠═══════════════════════════════════════════════════════════╣
║                                                           ║
║  SETUP (One-time):                                       ║
║  1. ipconfig → Get IP (e.g., 192.168.1.100)             ║
║  2. Update .env: NEXT_PUBLIC_BASE_URL="http://IP:9002"  ║
║  3. Configure firewall: Allow port 9002                  ║
║  4. npm run dev                                          ║
║                                                           ║
║  USAGE (Every class):                                    ║
║  1. Create session                                       ║
║  2. Display QR code                                      ║
║  3. Students scan                                        ║
║  4. Monitor check-ins                                    ║
║                                                           ║
║  TROUBLESHOOTING:                                        ║
║  • Can't access? → Check WiFi + Firewall               ║
║  • QR fails? → Use manual code                          ║
║  • Location error? → Check permissions                  ║
║  • VPN error? → Disable VPN                             ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
```

---

**Visual Guide Complete!**
For detailed instructions, see `MOBILE-SETUP-QUICK-START.md`
