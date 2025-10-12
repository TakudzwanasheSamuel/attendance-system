# VPN Detection for Attendance System

## Overview

The attendance system now includes comprehensive VPN and proxy detection to prevent students from marking attendance using VPNs or other location-spoofing methods. This ensures the integrity of geofence-based attendance verification.

## How It Works

The system uses a **multi-layered detection approach** combining three methods:

### 1. **IPQualityScore API** (Primary - Highest Accuracy)
- Professional IP reputation and VPN detection service
- Detects VPNs, proxies, Tor nodes, and datacenter IPs
- Provides fraud scores and detailed IP analysis
- **Requires API key** (free tier: 5,000 requests/month)

### 2. **IP-API** (Fallback - Medium Accuracy)
- Free IP geolocation and hosting detection
- Identifies datacenter/hosting IPs commonly used by VPNs
- Checks ISP/organization names for VPN keywords
- No API key required

### 3. **Heuristic Analysis** (Additional Layer)
- Detects private/localhost IP addresses
- Analyzes user agent strings for suspicious patterns
- Identifies automated tools and bots

## Detection Confidence Levels

- **High Confidence**: Multiple indicators or professional API detection
- **Medium Confidence**: Single strong indicator or hosting provider detection
- **Low Confidence**: Weak indicators or detection unavailable

## Blocking Behavior

### Strict Mode (Default - Enabled)
- Blocks attendance marking on **any VPN detection**
- Recommended for maximum security
- Students see: *"VPN or proxy detected. Please disable your VPN and try again."*

### Permissive Mode (Optional)
- Only blocks on **high confidence** detections
- Allows medium/low confidence attempts with verification notes
- Can be enabled by changing `shouldBlockAttendance(vpnDetection, false)` in `actions.ts`

## Setup Instructions

### 1. Get IPQualityScore API Key (Recommended)

1. Visit: https://www.ipqualityscore.com/create-account
2. Sign up for a free account
3. Navigate to your dashboard to get your API key
4. Free tier includes 5,000 requests/month

### 2. Configure Environment Variable

Add to your `.env` file:

```env
IPQUALITYSCORE_API_KEY="your_actual_api_key_here"
```

### 3. Restart Your Application

```bash
npm run dev
```

## Without API Key

The system will still work without the IPQualityScore API key, but with reduced accuracy:

- Uses IP-API for basic hosting/datacenter detection
- Applies heuristic checks
- Lower confidence in VPN detection
- May have more false negatives (VPNs not detected)

## What Gets Detected

✅ **Detected VPN/Proxy Types:**
- Commercial VPN services (NordVPN, ExpressVPN, etc.)
- Proxy servers (HTTP, SOCKS, transparent)
- Tor network nodes
- Datacenter/hosting IPs
- Known VPN provider IP ranges
- Anonymous proxies

✅ **Detection Indicators:**
- IP reputation databases
- Hosting provider analysis
- ISP/organization name matching
- Fraud score analysis
- Recent abuse history
- Private/localhost IPs

## Verification Notes

When VPN is detected, the system logs:
- Detection confidence level
- Specific reasons for detection
- IP address details
- Provider information
- Timestamp

These notes are stored in the `verificationNotes` field of attendance records for audit purposes.

## Testing VPN Detection

### Test with VPN Enabled
1. Connect to any VPN service
2. Try to mark attendance
3. Should see: *"VPN or proxy detected..."*

### Test without VPN
1. Disconnect from VPN
2. Use your regular internet connection
3. Attendance marking should work normally

### Check Detection Logs
Attendance records include `verificationNotes` showing:
- VPN detection results
- Confidence levels
- Detection reasons

## API Rate Limits

### IPQualityScore Free Tier
- **5,000 requests/month**
- Approximately 166 requests/day
- Sufficient for small to medium institutions
- Upgrade available for higher volumes

### IP-API (Fallback)
- **45 requests/minute**
- No monthly limit
- Automatically used when IPQualityScore unavailable

## Privacy Considerations

The system collects and stores:
- IP addresses (for VPN detection)
- User agent strings (for heuristic analysis)
- Location coordinates (for geofence verification)

This data is used solely for attendance verification and fraud prevention. Ensure compliance with your institution's privacy policies.

## Troubleshooting

### False Positives (Legitimate Users Blocked)

**Symptoms:** Students on legitimate connections blocked

**Solutions:**
1. Switch to permissive mode (only block high confidence)
2. Check if institution uses VPN/proxy for internet access
3. Whitelist specific IP ranges if needed
4. Review detection logs for patterns

### False Negatives (VPNs Not Detected)

**Symptoms:** VPN users able to mark attendance

**Solutions:**
1. Ensure IPQualityScore API key is configured
2. Verify API key is valid and has remaining quota
3. Check application logs for API errors
4. Consider upgrading to paid tier for better detection

### API Errors

**Symptoms:** Detection not working, errors in logs

**Solutions:**
1. Verify API key is correct in `.env` file
2. Check API quota hasn't been exceeded
3. Ensure server has internet access
4. Review IPQualityScore dashboard for issues

## Security Best Practices

1. **Keep API Key Secret**: Never commit API keys to version control
2. **Monitor Usage**: Check API quota regularly
3. **Review Logs**: Periodically audit detection results
4. **Update Detection**: Keep detection logic updated
5. **Combine Methods**: Use VPN detection with geofence verification

## Technical Details

### Files Modified/Created

- **`src/lib/vpn-detection.ts`**: Core VPN detection logic
- **`src/app/student/actions.ts`**: Integration with attendance marking
- **`env.example`**: Environment configuration template
- **`docs/VPN-DETECTION.md`**: This documentation

### Detection Flow

```
Student marks attendance
    ↓
Extract IP address from request headers
    ↓
Run VPN detection (parallel):
  - IPQualityScore API check
  - IP-API check
  - Heuristic analysis
    ↓
Combine results & determine confidence
    ↓
Check if should block (strict/permissive mode)
    ↓
Block or allow with verification notes
```

## Future Enhancements

Potential improvements:
- Device fingerprinting
- Behavioral analysis
- Machine learning-based detection
- Custom IP whitelist/blacklist
- Real-time threat intelligence feeds
- WebRTC leak detection

## Support

For issues or questions:
1. Check application logs for errors
2. Review this documentation
3. Verify environment configuration
4. Test with and without VPN
5. Contact system administrator

## References

- IPQualityScore API: https://www.ipqualityscore.com/documentation/overview
- IP-API Documentation: https://ip-api.com/docs
- VPN Detection Best Practices: https://www.ipqualityscore.com/articles/vpn-detection
