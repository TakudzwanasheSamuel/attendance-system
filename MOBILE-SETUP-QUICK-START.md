# Mobile Access - Quick Start Guide

## Enable Mobile QR Code Scanning in 5 Minutes

### Step 1: Find Your Computer's IP Address

**Windows:**
```bash
ipconfig
```
Look for "IPv4 Address" (e.g., `192.168.1.100`)

**Mac/Linux:**
```bash
ifconfig
```
Look for your local IP (e.g., `192.168.1.100`)

### Step 2: Update Your .env File

Open `.env` and add/update:

```env
NEXT_PUBLIC_BASE_URL="http://192.168.1.100:9002"
```

Replace `192.168.1.100` with YOUR actual IP address from Step 1.

### Step 3: Allow Firewall Access (Windows Only)

**Windows:**
1. Search for "Windows Defender Firewall"
2. Click "Advanced settings"
3. Click "Inbound Rules" → "New Rule"
4. Select "Port" → Next
5. Enter port `9002` → Next
6. Select "Allow the connection" → Next
7. Check all profiles → Next
8. Name it "Attendance System" → Finish

**Mac/Linux:** Usually no configuration needed.

### Step 4: Restart Your Server

```bash
npm run dev
```

### Step 5: Test It!

1. **On your phone**, connect to the **same WiFi** as your computer
2. Open your phone's browser
3. Go to: `http://YOUR_IP:9002` (use your IP from Step 1)
4. You should see the attendance system!

### Step 6: Use QR Codes

1. Log in as a lecturer
2. Create an attendance session
3. The QR code will now work on mobile phones!
4. Students scan the QR code with their phone camera
5. The attendance page opens automatically

---

## How Students Use It

### Scanning QR Code

**iPhone:**
1. Open Camera app
2. Point at QR code
3. Tap the notification
4. Safari opens the page

**Android:**
1. Open Camera app
2. Point at QR code
3. Tap the link
4. Chrome opens the page

### Marking Attendance

1. Scan QR code (or manually enter URL)
2. Allow location permission when prompted
3. Attendance is marked automatically
4. Done!

---

## Troubleshooting

### Phone Can't Access the System

**Check:**
- ✅ Phone and computer on **same WiFi**
- ✅ `.env` has correct IP address
- ✅ Firewall allows port 9002
- ✅ Server is running (`npm run dev`)

**Test:** Try accessing `http://YOUR_IP:9002` in phone browser

### QR Code Doesn't Scan

**Solutions:**
- Improve lighting
- Hold phone steady
- Move closer/further from screen
- Use manual session code entry instead

### Location Not Working

**iOS:** Settings → Privacy → Location Services → Safari → "While Using"
**Android:** Settings → Apps → Chrome → Permissions → Location → Allow

### VPN Blocking

If you see "VPN detected" error:
- Disable any VPN apps on your phone
- Use WiFi instead of mobile data
- Disable proxy settings

---

## Important Notes

### For Local Development (Same WiFi)

✅ **Works:** Students on same WiFi network
❌ **Doesn't Work:** Students on mobile data or different WiFi

### For Production (Internet Access)

Deploy to a hosting service (Vercel, Railway, etc.) to allow access from anywhere.

---

## Network Configuration

### Your Current Setup

- **Server Port:** 9002
- **Server IP:** Find with `ipconfig` or `ifconfig`
- **Access URL:** `http://YOUR_IP:9002`
- **QR Code URL:** Same as access URL

### Requirements

- Computer and phones on **same WiFi network**
- Port 9002 accessible (firewall configured)
- Server running (`npm run dev`)

---

## Testing Checklist

Before your first class:

- [ ] Found your computer's IP address
- [ ] Updated `.env` with `NEXT_PUBLIC_BASE_URL`
- [ ] Configured firewall (Windows)
- [ ] Restarted server
- [ ] Tested access from your phone
- [ ] Created test session
- [ ] Scanned QR code with phone
- [ ] Verified location detection works
- [ ] Marked test attendance successfully

---

## Quick Commands Reference

```bash
# Find IP address
ipconfig                    # Windows
ifconfig                    # Mac/Linux

# Start server
npm run dev

# Check if server is accessible
# On your phone browser, go to:
http://YOUR_IP:9002
```

---

## Full Documentation

For detailed information, see:
- **Complete Guide:** `docs/MOBILE-ACCESS.md`
- **VPN Detection:** `docs/VPN-DETECTION.md`
- **Setup Instructions:** `docs/SETUP-INSTRUCTIONS.md`

---

## Support

**Common Issues:**
1. **Can't access from phone** → Check WiFi and firewall
2. **QR code doesn't work** → Use manual session code
3. **Location not detected** → Check browser permissions
4. **VPN error** → Disable VPN on phone

**Need Help?**
Check the full documentation in `docs/MOBILE-ACCESS.md`

---

**Status:** ✅ Ready for mobile access
**Time to Setup:** ~5 minutes
**Difficulty:** Easy
