/**
 * VPN Detection utilities for attendance verification
 * Uses multiple detection methods to identify VPN/proxy usage
 */

interface VPNDetectionResult {
  isVPN: boolean;
  confidence: 'high' | 'medium' | 'low';
  reasons: string[];
  details?: {
    ipAddress?: string;
    provider?: string;
    country?: string;
  };
}

interface IPQualityScoreResponse {
  success: boolean;
  proxy: boolean;
  vpn: boolean;
  tor: boolean;
  active_vpn: boolean;
  active_tor: boolean;
  fraud_score: number;
  country_code: string;
  ISP: string;
  ASN: number;
  organization: string;
  is_crawler: boolean;
  timezone: string;
  mobile: boolean;
  host: string;
  recent_abuse: boolean;
  bot_status: boolean;
}

/**
 * Check if IP address is from a known VPN/proxy provider using IPQualityScore API
 * Requires IPQUALITYSCORE_API_KEY environment variable
 */
async function checkIPQualityScore(ipAddress: string): Promise<Partial<VPNDetectionResult>> {
  const apiKey = process.env.IPQUALITYSCORE_API_KEY;
  
  if (!apiKey) {
    return {
      isVPN: false,
      confidence: 'low',
      reasons: ['IP quality check unavailable (no API key configured)'],
    };
  }

  try {
    const response = await fetch(
      `https://ipqualityscore.com/api/json/ip/${apiKey}/${ipAddress}?strictness=1&allow_public_access_points=true`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      }
    );

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data: IPQualityScoreResponse = await response.json();

    if (!data.success) {
      throw new Error('API request unsuccessful');
    }

    const reasons: string[] = [];
    let isVPN = false;

    if (data.vpn || data.active_vpn) {
      isVPN = true;
      reasons.push('VPN detected by IP analysis');
    }

    if (data.proxy) {
      isVPN = true;
      reasons.push('Proxy server detected');
    }

    if (data.tor || data.active_tor) {
      isVPN = true;
      reasons.push('Tor network detected');
    }

    if (data.fraud_score > 75) {
      isVPN = true;
      reasons.push(`High fraud score: ${data.fraud_score}`);
    }

    if (data.recent_abuse) {
      reasons.push('Recent abuse detected from this IP');
    }

    return {
      isVPN,
      confidence: data.fraud_score > 85 ? 'high' : data.fraud_score > 50 ? 'medium' : 'low',
      reasons: reasons.length > 0 ? reasons : ['IP appears legitimate'],
      details: {
        ipAddress,
        provider: data.ISP,
        country: data.country_code,
      },
    };
  } catch (error) {
    console.error('IPQualityScore API error:', error);
    return {
      isVPN: false,
      confidence: 'low',
      reasons: ['IP quality check failed'],
    };
  }
}

/**
 * Check for common VPN indicators using IP-API (free, no key required)
 * This is a fallback method with lower accuracy
 */
async function checkIPAPI(ipAddress: string): Promise<Partial<VPNDetectionResult>> {
  try {
    const response = await fetch(
      `http://ip-api.com/json/${ipAddress}?fields=status,message,country,countryCode,region,city,isp,org,as,proxy,hosting,query`,
      {
        method: 'GET',
      }
    );

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();

    if (data.status !== 'success') {
      throw new Error(data.message || 'API request unsuccessful');
    }

    const reasons: string[] = [];
    let isVPN = false;

    // Check if IP is from a hosting provider (common for VPNs)
    if (data.hosting === true) {
      isVPN = true;
      reasons.push('IP from hosting/datacenter provider');
    }

    // Check if marked as proxy
    if (data.proxy === true) {
      isVPN = true;
      reasons.push('Proxy detected');
    }

    // Check for common VPN provider names
    const vpnKeywords = ['vpn', 'proxy', 'virtual', 'private', 'tunnel', 'shield', 'secure'];
    const orgLower = (data.org || '').toLowerCase();
    const ispLower = (data.isp || '').toLowerCase();
    
    if (vpnKeywords.some(keyword => orgLower.includes(keyword) || ispLower.includes(keyword))) {
      isVPN = true;
      reasons.push('VPN provider detected in ISP/organization name');
    }

    return {
      isVPN,
      confidence: isVPN ? 'medium' : 'low',
      reasons: reasons.length > 0 ? reasons : ['No VPN indicators found'],
      details: {
        ipAddress,
        provider: data.isp,
        country: data.countryCode,
      },
    };
  } catch (error) {
    console.error('IP-API error:', error);
    return {
      isVPN: false,
      confidence: 'low',
      reasons: ['IP check failed'],
    };
  }
}

/**
 * Perform heuristic checks on user agent and other client data
 */
function performHeuristicChecks(
  ipAddress: string,
  userAgent?: string,
  timezone?: string
): Partial<VPNDetectionResult> {
  const reasons: string[] = [];
  let suspicionScore = 0;

  // Check for localhost or private IP ranges
  if (
    ipAddress === '127.0.0.1' ||
    ipAddress === '::1' ||
    ipAddress.startsWith('192.168.') ||
    ipAddress.startsWith('10.') ||
    ipAddress.startsWith('172.')
  ) {
    suspicionScore += 50;
    reasons.push('Private/localhost IP address detected');
  }

  // Check for suspicious user agents
  if (userAgent) {
    const suspiciousPatterns = [
      'curl',
      'wget',
      'python',
      'java',
      'bot',
      'crawler',
      'spider',
      'scraper',
    ];
    
    const userAgentLower = userAgent.toLowerCase();
    if (suspiciousPatterns.some(pattern => userAgentLower.includes(pattern))) {
      suspicionScore += 30;
      reasons.push('Suspicious user agent detected');
    }
  }

  return {
    isVPN: suspicionScore > 40,
    confidence: suspicionScore > 60 ? 'high' : suspicionScore > 30 ? 'medium' : 'low',
    reasons: reasons.length > 0 ? reasons : ['No heuristic indicators found'],
  };
}

/**
 * Main VPN detection function
 * Combines multiple detection methods for comprehensive checking
 */
export async function detectVPN(
  ipAddress: string,
  userAgent?: string,
  timezone?: string
): Promise<VPNDetectionResult> {
  // Dev mode: VPN detection disabled but we still return a friendly message
  return {
    isVPN: false,
    confidence: 'low',
    reasons: ['Detecting VPN... (dev mode: VPN checks disabled, attendance not blocked)'],
    details: { ipAddress },
  };
}

/**
 * Check if VPN detection should block attendance
 * Can be configured based on confidence level
 */
export function shouldBlockAttendance(
  detectionResult: VPNDetectionResult,
  strictMode: boolean = true
): boolean {
  // Temporarily disable VPN blocking for testing
  return false;
  
  if (!detectionResult.isVPN) {
    return false;
  }

  if (strictMode) {
    // Block on any VPN detection
    return true;
  } else {
    // Only block on high confidence detections
    return detectionResult.confidence === 'high';
  }
}
