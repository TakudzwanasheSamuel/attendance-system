# Deployment Checklist

## Pre-Deployment Setup

### Database Configuration
- [ ] MySQL server installed and running
- [ ] Database created (`attendance_system`)
- [ ] Database credentials configured in `.env`
- [ ] Prisma schema pushed (`npx prisma db push`)
- [ ] Database seeded with initial data (`npm run seed`)
- [ ] Test accounts created and verified

### Environment Configuration
- [ ] `.env` file created from `env.example`
- [ ] `DATABASE_URL` configured correctly
- [ ] `JWT_SECRET` set to secure random string
- [ ] `NEXTAUTH_SECRET` set to secure random string
- [ ] `NEXT_PUBLIC_BASE_URL` configured (see below)
- [ ] `GOOGLE_GENAI_API_KEY` added (optional, for AI reports)
- [ ] `IPQUALITYSCORE_API_KEY` added (optional, for VPN detection)

### Dependencies
- [ ] Node.js 18+ installed
- [ ] Dependencies installed (`npm install --legacy-peer-deps`)
- [ ] No critical vulnerabilities (`npm audit`)
- [ ] Build succeeds (`npm run build`)

---

## Mobile Access Setup

### Local Development (Same WiFi Network)

- [ ] **Step 1:** Find computer's IP address
  ```bash
  ipconfig  # Windows
  ifconfig  # Mac/Linux
  ```
  IP Address: `_________________` (e.g., 192.168.1.100)

- [ ] **Step 2:** Update `.env` file
  ```env
  NEXT_PUBLIC_BASE_URL="http://YOUR_IP:9002"
  ```

- [ ] **Step 3:** Configure firewall (Windows only)
  - [ ] Windows Defender Firewall opened
  - [ ] Advanced settings accessed
  - [ ] Inbound rule created for port 9002
  - [ ] Rule set to "Allow the connection"
  - [ ] All profiles checked (Domain, Private, Public)

- [ ] **Step 4:** Test server binding
  ```bash
  npm run dev
  ```
  - [ ] Server starts successfully
  - [ ] Accessible from computer browser
  - [ ] No error messages in console

- [ ] **Step 5:** Test mobile access
  - [ ] Phone connected to same WiFi
  - [ ] Browser opened on phone
  - [ ] URL accessed: `http://YOUR_IP:9002`
  - [ ] System loads correctly on phone
  - [ ] UI is responsive and readable

### Production Deployment (Internet Access)

- [ ] **Hosting platform selected:**
  - [ ] Vercel (recommended for Next.js)
  - [ ] Railway
  - [ ] DigitalOcean
  - [ ] AWS/Azure/GCP
  - [ ] Other: `_________________`

- [ ] **Domain configured:**
  - [ ] Domain purchased/available
  - [ ] DNS records configured
  - [ ] SSL certificate installed (HTTPS)
  - [ ] Domain verified and accessible

- [ ] **Environment variables set on hosting:**
  - [ ] `DATABASE_URL`
  - [ ] `JWT_SECRET`
  - [ ] `NEXTAUTH_URL` (production URL)
  - [ ] `NEXTAUTH_SECRET`
  - [ ] `NEXT_PUBLIC_BASE_URL` (production URL)
  - [ ] `GOOGLE_GENAI_API_KEY` (optional)
  - [ ] `IPQUALITYSCORE_API_KEY` (optional)

- [ ] **Production database:**
  - [ ] Production MySQL instance created
  - [ ] Database credentials secured
  - [ ] Connection tested
  - [ ] Schema deployed
  - [ ] Initial data seeded

- [ ] **Deployment verified:**
  - [ ] Application builds successfully
  - [ ] Application deploys without errors
  - [ ] Production URL accessible
  - [ ] HTTPS working correctly
  - [ ] All pages load correctly

---

## VPN Detection Setup

### Basic Setup (Free Tier)

- [ ] **Step 1:** Create IPQualityScore account
  - [ ] Visit: https://www.ipqualityscore.com/create-account
  - [ ] Account created
  - [ ] Email verified
  - [ ] Dashboard accessible

- [ ] **Step 2:** Get API key
  - [ ] API key copied from dashboard
  - [ ] Free tier confirmed (5,000 requests/month)

- [ ] **Step 3:** Configure environment
  - [ ] API key added to `.env`
  ```env
  IPQUALITYSCORE_API_KEY="your_actual_key_here"
  ```

- [ ] **Step 4:** Test VPN detection
  - [ ] Server restarted
  - [ ] VPN enabled on test device
  - [ ] Attendance marking attempted
  - [ ] VPN detected and blocked
  - [ ] Error message displayed correctly

- [ ] **Step 5:** Test without VPN
  - [ ] VPN disabled
  - [ ] Attendance marking attempted
  - [ ] Attendance marked successfully
  - [ ] No VPN error shown

### Without API Key (Fallback Mode)

- [ ] VPN detection works with reduced accuracy
- [ ] Fallback methods active (IP-API, heuristics)
- [ ] Basic VPN providers detected
- [ ] System logs show fallback usage

---

## Feature Testing

### Core Functionality

- [ ] **Authentication:**
  - [ ] Admin login works
  - [ ] Lecturer login works
  - [ ] Student login works
  - [ ] Logout works
  - [ ] Session persistence works
  - [ ] Invalid credentials rejected

- [ ] **User Management (Admin):**
  - [ ] View all users
  - [ ] Create new user
  - [ ] Edit user details
  - [ ] Delete user
  - [ ] Search users
  - [ ] Filter by role

- [ ] **Course Management (Admin):**
  - [ ] View all courses
  - [ ] Create new course
  - [ ] Edit course details
  - [ ] Delete course
  - [ ] Assign lecturer
  - [ ] Manage enrollments

- [ ] **Session Management (Lecturer):**
  - [ ] Create attendance session
  - [ ] View active sessions
  - [ ] View session details
  - [ ] Close session
  - [ ] Generate QR code
  - [ ] View session code

### Mobile Features

- [ ] **QR Code Generation:**
  - [ ] QR code displays correctly
  - [ ] QR code contains correct URL
  - [ ] QR code is scannable
  - [ ] URL format is correct

- [ ] **QR Code Scanning (iOS):**
  - [ ] Camera app recognizes QR code
  - [ ] Notification appears
  - [ ] Tapping opens Safari
  - [ ] Attendance page loads
  - [ ] UI is mobile-responsive

- [ ] **QR Code Scanning (Android):**
  - [ ] Camera app recognizes QR code
  - [ ] Link appears
  - [ ] Tapping opens Chrome
  - [ ] Attendance page loads
  - [ ] UI is mobile-responsive

- [ ] **Mobile Attendance Marking:**
  - [ ] Form displays correctly
  - [ ] Location permission requested
  - [ ] Location detected
  - [ ] Attendance submitted
  - [ ] Success message shown
  - [ ] Error handling works

### Security Features

- [ ] **VPN Detection:**
  - [ ] VPN detected when enabled
  - [ ] Attendance blocked with VPN
  - [ ] Clear error message shown
  - [ ] Detection logged in database
  - [ ] Works without VPN

- [ ] **Geofence Verification:**
  - [ ] Location permission requested
  - [ ] Location detected accurately
  - [ ] Distance calculated correctly
  - [ ] Within geofence: Approved
  - [ ] Outside geofence: Flagged
  - [ ] Distance shown in results

- [ ] **Session Validation:**
  - [ ] Valid session code accepted
  - [ ] Invalid session code rejected
  - [ ] Expired session rejected
  - [ ] Duplicate attendance prevented
  - [ ] Enrollment verified

### Real-time Features

- [ ] **Live Dashboard:**
  - [ ] Attendance updates in real-time
  - [ ] Student count updates
  - [ ] Recent check-ins displayed
  - [ ] Statistics accurate
  - [ ] No lag or delay

### AI Features (Optional)

- [ ] **AI Reports:**
  - [ ] Report generation works
  - [ ] AI analysis included
  - [ ] Insights are relevant
  - [ ] Export functionality works
  - [ ] Fallback works without API key

---

## Performance Testing

### Load Testing

- [ ] **Concurrent Users:**
  - [ ] 10 students: ✓
  - [ ] 50 students: ✓
  - [ ] 100 students: ✓
  - [ ] System remains responsive

- [ ] **QR Code Scanning:**
  - [ ] Multiple simultaneous scans handled
  - [ ] No race conditions
  - [ ] Database handles load
  - [ ] No duplicate entries

### Mobile Performance

- [ ] Page loads in < 3 seconds on 4G
- [ ] Images optimized
- [ ] JavaScript bundle size acceptable
- [ ] No console errors on mobile
- [ ] Smooth scrolling and interactions

---

## Security Audit

### Authentication & Authorization

- [ ] Passwords hashed (bcrypt)
- [ ] JWT tokens secure
- [ ] Session management secure
- [ ] Role-based access enforced
- [ ] No unauthorized access possible

### Data Protection

- [ ] SQL injection prevented (Prisma ORM)
- [ ] XSS attacks prevented
- [ ] CSRF protection enabled
- [ ] Sensitive data encrypted
- [ ] API keys not exposed

### Network Security

- [ ] HTTPS enabled (production)
- [ ] CORS configured correctly
- [ ] Rate limiting considered
- [ ] Firewall configured
- [ ] Ports secured

---

## Documentation Review

- [ ] **README.md** updated with new features
- [ ] **SETUP-INSTRUCTIONS.md** accurate
- [ ] **MOBILE-SETUP-QUICK-START.md** tested
- [ ] **VPN-DETECTION-SUMMARY.md** complete
- [ ] **MOBILE-ACCESS.md** comprehensive
- [ ] **VPN-DETECTION.md** detailed
- [ ] **MOBILE-VISUAL-GUIDE.md** helpful
- [ ] **COMPLETE-SETUP-SUMMARY.md** accurate
- [ ] All links working
- [ ] Code examples tested

---

## User Training

### Administrators

- [ ] System overview provided
- [ ] User management explained
- [ ] Course management explained
- [ ] Report generation demonstrated
- [ ] Troubleshooting guide reviewed

### Lecturers

- [ ] Login process explained
- [ ] Session creation demonstrated
- [ ] QR code display explained
- [ ] Live monitoring shown
- [ ] Report generation taught
- [ ] Common issues covered

### Students

- [ ] QR code scanning demonstrated
- [ ] Location permission explained
- [ ] VPN requirement explained
- [ ] Manual code entry shown
- [ ] Troubleshooting steps provided

---

## Backup & Recovery

- [ ] **Database Backup:**
  - [ ] Backup strategy defined
  - [ ] Automated backups configured
  - [ ] Backup restoration tested
  - [ ] Backup location secured

- [ ] **Code Backup:**
  - [ ] Git repository configured
  - [ ] Code pushed to remote
  - [ ] Version control active
  - [ ] Deployment pipeline documented

---

## Monitoring & Maintenance

### Logging

- [ ] Application logs configured
- [ ] Error logging active
- [ ] VPN detection logged
- [ ] Attendance attempts logged
- [ ] Log rotation configured

### Monitoring

- [ ] Server uptime monitored
- [ ] Database performance monitored
- [ ] API usage tracked (IPQualityScore)
- [ ] Error rates monitored
- [ ] User activity tracked

### Maintenance Plan

- [ ] Update schedule defined
- [ ] Security patches planned
- [ ] Database maintenance scheduled
- [ ] Backup verification scheduled
- [ ] Performance review planned

---

## Go-Live Checklist

### Final Verification

- [ ] All tests passed
- [ ] All features working
- [ ] Documentation complete
- [ ] Users trained
- [ ] Backup configured
- [ ] Monitoring active

### Communication

- [ ] Lecturers notified
- [ ] Students informed
- [ ] Support contact provided
- [ ] Training materials distributed
- [ ] FAQ published

### Launch

- [ ] Production deployment complete
- [ ] DNS propagated
- [ ] SSL certificate active
- [ ] System accessible
- [ ] No critical errors

### Post-Launch

- [ ] Monitor for issues (first 24 hours)
- [ ] Respond to user feedback
- [ ] Address any bugs quickly
- [ ] Collect usage statistics
- [ ] Plan improvements

---

## Support & Troubleshooting

### Support Channels

- [ ] Support email configured: `_________________`
- [ ] Support hours defined: `_________________`
- [ ] Escalation process documented
- [ ] FAQ created and published
- [ ] Troubleshooting guide available

### Common Issues Documented

- [ ] Mobile access problems
- [ ] VPN detection issues
- [ ] Location permission problems
- [ ] QR code scanning failures
- [ ] Login issues

---

## Success Metrics

### Define Success Criteria

- [ ] **Adoption Rate:**
  - Target: `_____%` of students using system
  - Actual: `_____%`

- [ ] **Accuracy Rate:**
  - Target: `_____%` accurate attendance
  - Actual: `_____%`

- [ ] **Performance:**
  - Target: `<3s` page load time
  - Actual: `____s`

- [ ] **Security:**
  - Target: `0` security incidents
  - Actual: `____`

- [ ] **User Satisfaction:**
  - Target: `____/5` rating
  - Actual: `____/5`

---

## Sign-Off

### Deployment Approval

- [ ] **Technical Lead:** `_________________` Date: `_______`
- [ ] **System Administrator:** `_________________` Date: `_______`
- [ ] **Project Manager:** `_________________` Date: `_______`

### Notes

```
Additional notes or concerns:
_____________________________________________________________
_____________________________________________________________
_____________________________________________________________
```

---

## Quick Reference

**System URL (Local):** `http://YOUR_IP:9002`
**System URL (Production):** `https://YOUR_DOMAIN.com`
**Database:** `attendance_system`
**Server Port:** `9002`
**Support Email:** `_________________`

---

**Checklist Complete!** ✅

Date: `_________________`
Completed by: `_________________`
