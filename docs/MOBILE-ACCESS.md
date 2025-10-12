# Mobile Access Setup Guide

## Overview

The attendance system is fully mobile-responsive and can be accessed from smartphones when students scan QR codes. This guide explains how to set up mobile access for your local network or production environment.

## Quick Start

### For Students (Using the System)

1. **Scan QR Code**: Use your phone's camera app to scan the QR code displayed by your lecturer
2. **Open Link**: Tap the notification/link that appears
3. **Mark Attendance**: The attendance page will open in your mobile browser
4. **Allow Location**: Grant location permission when prompted (if required by session)
5. **Submit**: Your attendance will be marked automatically

That's it! The system works on any modern smartphone browser.

---

## For Administrators (Setting Up Mobile Access)

### Option 1: Local Network Access (Development/Testing)

This allows students on the same WiFi network to access the system from their phones.

#### Step 1: Find Your Computer's IP Address

**Windows:**
```bash
ipconfig
```
Look for "IPv4 Address" under your active network adapter (e.g., `192.168.1.100`)

**Mac/Linux:**
```bash
ifconfig
# or
ip addr show
```
Look for your local IP (e.g., `192.168.1.100`)

#### Step 2: Update Environment Configuration

Edit your `.env` file:

```env
NEXT_PUBLIC_BASE_URL="http://192.168.1.100:9002"
```

Replace `192.168.1.100` with your actual IP address.

#### Step 3: Configure Next.js to Accept Network Connections

Update `package.json` dev script (already configured):

```json
"scripts": {
  "dev": "next dev --turbopack -p 9002"
}
```

Or to explicitly bind to all network interfaces:

```json
"scripts": {
  "dev": "next dev --turbopack -H 0.0.0.0 -p 9002"
}
```

#### Step 4: Configure Firewall

**Windows Firewall:**
1. Open Windows Defender Firewall
2. Click "Advanced settings"
3. Click "Inbound Rules" → "New Rule"
4. Select "Port" → Next
5. Select "TCP" and enter port `9002` → Next
6. Select "Allow the connection" → Next
7. Check all profiles → Next
8. Name it "Attendance System" → Finish

**Mac Firewall:**
```bash
# Usually no configuration needed, but if firewall is strict:
# System Preferences → Security & Privacy → Firewall → Firewall Options
# Add Node.js and allow incoming connections
```

**Linux (UFW):**
```bash
sudo ufw allow 9002/tcp
```

#### Step 5: Restart the Development Server

```bash
npm run dev
```

#### Step 6: Test Mobile Access

1. Connect your phone to the **same WiFi network** as your computer
2. Open your phone's browser
3. Navigate to: `http://192.168.1.100:9002` (use your actual IP)
4. You should see the attendance system

#### Step 7: Generate QR Codes

1. Log in as a lecturer
2. Create an attendance session
3. The QR code will automatically use your configured `NEXT_PUBLIC_BASE_URL`
4. Students can now scan the QR code with their phones

---

### Option 2: Production Deployment

For production use, deploy to a hosting service with a public domain.

#### Recommended Hosting Options

**1. Vercel (Easiest for Next.js)**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Set environment variables in Vercel dashboard:
- `DATABASE_URL`
- `JWT_SECRET`
- `NEXT_PUBLIC_BASE_URL` (e.g., `https://attendance.yourdomain.com`)
- `IPQUALITYSCORE_API_KEY` (optional)

**2. Railway**
- Connect GitHub repository
- Add environment variables
- Deploy automatically

**3. DigitalOcean App Platform**
- Connect repository
- Configure build settings
- Add environment variables

**4. AWS/Azure/GCP**
- Deploy using Docker or serverless
- Configure environment variables
- Set up domain and SSL

#### Production Environment Variables

```env
# Production .env
DATABASE_URL="mysql://user:password@production-db:3306/attendance"
JWT_SECRET="your_secure_random_string_here"
NEXT_PUBLIC_BASE_URL="https://attendance.yourdomain.com"
IPQUALITYSCORE_API_KEY="your_api_key"
```

---

## Mobile Browser Compatibility

### Supported Browsers

✅ **iOS (iPhone/iPad)**
- Safari 14+
- Chrome 90+
- Firefox 90+
- Edge 90+

✅ **Android**
- Chrome 90+
- Firefox 90+
- Samsung Internet 14+
- Edge 90+

### Required Features

The system uses these mobile browser features:
- **Geolocation API** - For location verification
- **Camera API** - For QR code scanning (via camera app)
- **LocalStorage** - For session management
- **Fetch API** - For server communication

All modern smartphones support these features.

---

## QR Code Scanning

### How Students Scan QR Codes

**iOS (iPhone/iPad):**
1. Open the Camera app
2. Point at the QR code
3. Tap the notification that appears
4. Safari will open the attendance page

**Android:**
1. Open the Camera app (or Google Lens)
2. Point at the QR code
3. Tap the link that appears
4. Chrome will open the attendance page

**Alternative (Any Phone):**
- Install a QR code scanner app
- Scan the code
- Open the link

### QR Code Best Practices

**For Lecturers:**
- Display QR code on a large screen (projector/TV)
- Ensure good lighting
- Keep QR code visible throughout the session
- Provide session code as backup

**For Students:**
- Hold phone steady when scanning
- Ensure good lighting
- If QR scan fails, manually enter the session code
- Allow location permission when prompted

---

## Troubleshooting

### Students Can't Access from Mobile

**Problem:** QR code opens but page doesn't load

**Solutions:**
1. **Check WiFi**: Ensure phone is on the same network as server
2. **Check IP**: Verify `NEXT_PUBLIC_BASE_URL` matches server IP
3. **Check Firewall**: Ensure port 9002 is open
4. **Check Server**: Verify dev server is running
5. **Try Direct URL**: Manually type the URL in mobile browser

### Location Permission Issues

**Problem:** Location permission denied or not working

**Solutions:**

**iOS:**
1. Settings → Privacy → Location Services
2. Enable Location Services
3. Find Safari → Select "While Using the App"

**Android:**
1. Settings → Apps → Chrome (or your browser)
2. Permissions → Location
3. Select "Allow only while using the app"

### QR Code Not Scanning

**Problem:** Camera doesn't recognize QR code

**Solutions:**
1. **Improve Lighting**: Ensure good lighting on QR code
2. **Clean Camera**: Clean phone camera lens
3. **Distance**: Move phone closer or further from QR code
4. **Update App**: Update camera app or install QR scanner
5. **Manual Entry**: Use session code instead

### VPN Blocking Attendance

**Problem:** "VPN or proxy detected" error on mobile

**Solutions:**
1. **Disable VPN**: Turn off any VPN apps on phone
2. **Check Proxy**: Disable any proxy settings
3. **Use WiFi**: Switch from mobile data to WiFi
4. **Contact Admin**: If issue persists, contact system administrator

### Slow Loading on Mobile

**Problem:** Pages load slowly on mobile devices

**Solutions:**
1. **Check Connection**: Ensure strong WiFi signal
2. **Clear Cache**: Clear browser cache and cookies
3. **Close Apps**: Close other apps to free memory
4. **Update Browser**: Update to latest browser version
5. **Check Server**: Verify server isn't overloaded

---

## Network Requirements

### For Local Development

- **Same Network**: All devices must be on the same WiFi
- **Port Access**: Port 9002 must be accessible
- **Firewall**: Firewall must allow incoming connections
- **IP Stability**: Use static IP or update `.env` if IP changes

### For Production

- **HTTPS**: Use SSL certificate for secure connections
- **Domain**: Use a proper domain name
- **CDN**: Consider CDN for faster loading
- **Bandwidth**: Ensure adequate bandwidth for concurrent users

---

## Security Considerations

### Local Network

- Only use on trusted networks (school/office WiFi)
- Don't expose to public internet without security
- Change default JWT secret
- Use strong database passwords

### Production

- **Always use HTTPS** (SSL/TLS)
- Configure CORS properly
- Use environment variables for secrets
- Enable rate limiting
- Regular security updates
- Monitor for suspicious activity

---

## Testing Mobile Access

### Test Checklist

- [ ] QR code generates with correct URL
- [ ] QR code scans successfully on iOS
- [ ] QR code scans successfully on Android
- [ ] Attendance page loads on mobile
- [ ] Location permission prompt appears
- [ ] Location is detected correctly
- [ ] Attendance can be marked successfully
- [ ] VPN detection works on mobile
- [ ] Error messages display properly
- [ ] UI is responsive on different screen sizes

### Test Devices

Test on various devices:
- iPhone (iOS)
- Android phone
- iPad/Tablet
- Different browsers (Safari, Chrome, Firefox)

---

## Performance Optimization

### For Better Mobile Experience

1. **Enable Compression**: Gzip/Brotli compression
2. **Optimize Images**: Compress images in `/public`
3. **Cache Static Assets**: Configure caching headers
4. **Minimize JavaScript**: Next.js does this automatically
5. **Use CDN**: For production deployments

### Next.js Optimizations (Already Configured)

- Automatic code splitting
- Image optimization
- Font optimization
- Turbopack for faster builds

---

## Progressive Web App (PWA)

The system includes PWA support for an app-like experience.

### Features

- **Install to Home Screen**: Add app icon to phone home screen
- **Offline Support**: Basic offline functionality (future enhancement)
- **Full Screen**: Runs in standalone mode
- **Fast Loading**: Optimized for mobile

### How to Install (Students)

**iOS:**
1. Open site in Safari
2. Tap Share button
3. Tap "Add to Home Screen"
4. Tap "Add"

**Android:**
1. Open site in Chrome
2. Tap menu (three dots)
3. Tap "Add to Home Screen"
4. Tap "Add"

---

## Advanced Configuration

### Custom Port

To use a different port:

```json
// package.json
"dev": "next dev --turbopack -p 3000"
```

Update `.env`:
```env
NEXT_PUBLIC_BASE_URL="http://192.168.1.100:3000"
```

### Multiple Network Interfaces

If your computer has multiple network adapters:

```bash
# List all network interfaces
ipconfig /all  # Windows
ifconfig       # Mac/Linux

# Use the IP of the interface connected to your WiFi
```

### Dynamic DNS (For Changing IPs)

If your IP changes frequently, consider:
- Using a dynamic DNS service (e.g., No-IP, DuckDNS)
- Setting up a static IP on your router
- Using a local DNS server

---

## Support

### Common Questions

**Q: Do students need to install an app?**
A: No, it works in any mobile browser. Optional PWA install available.

**Q: Does it work on mobile data?**
A: For local development, no (same WiFi required). For production, yes.

**Q: Can students mark attendance from anywhere?**
A: Geofence verification ensures students are physically present.

**Q: What if QR code doesn't work?**
A: Students can manually enter the session code.

**Q: Is internet required?**
A: Yes, the system requires internet connection to work.

---

## Quick Reference

### Student Flow
1. Scan QR code → 2. Open link → 3. Allow location → 4. Mark attendance

### Lecturer Flow
1. Create session → 2. Display QR code → 3. Monitor attendance → 4. Close session

### Admin Setup
1. Find IP → 2. Update `.env` → 3. Configure firewall → 4. Restart server → 5. Test

---

## Additional Resources

- **Next.js Deployment**: https://nextjs.org/docs/deployment
- **Vercel Hosting**: https://vercel.com/docs
- **PWA Guide**: https://web.dev/progressive-web-apps/
- **Mobile Testing**: https://developers.google.com/web/tools/chrome-devtools/device-mode

---

**Status**: ✅ Fully configured for mobile access
**Compatibility**: iOS 14+, Android 8+
**Browser Support**: All modern mobile browsers
