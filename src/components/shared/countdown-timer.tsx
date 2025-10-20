"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar } from 'lucide-react';

interface CountdownTimerProps {
  expiresAt: Date;
  className?: string;
  showCurrentTime?: boolean;
}

export function CountdownTimer({ expiresAt, className = "", showCurrentTime = true }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
    total: number;
  }>({ hours: 0, minutes: 0, seconds: 0, total: 0 });
  
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Set mounted state to prevent hydration mismatch
    setIsMounted(true);
    
    const updateTimer = () => {
      const now = new Date();
      const expiry = new Date(expiresAt);
      const difference = expiry.getTime() - now.getTime();

      setCurrentTime(now);

      if (difference > 0) {
        const hours = Math.floor(difference / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ hours, minutes, seconds, total: difference });
        setIsExpired(false);
      } else {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, total: 0 });
        setIsExpired(true);
      }
    };

    // Update immediately
    updateTimer();

    // Update every second
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  const formatTime = (value: number) => value.toString().padStart(2, '0');

  // Format date consistently for both server and client
  const formatDate = (date: Date) => {
    if (!isMounted) return 'Loading...';
    
    // Use UTC and fixed format to ensure consistency
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: 'UTC'
    };
    
    return new Date(date).toLocaleString('en-GB', options);
  };

  // Don't render time-dependent content until mounted to prevent hydration mismatch
  if (!isMounted) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Current Date and Time */}
            {showCurrentTime && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Loading...</span>
              </div>
            )}

            {/* Countdown Timer */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock className="h-5 w-5" />
                <span className="text-sm font-medium">Loading...</span>
              </div>
              
              <div className="flex items-center justify-center gap-2">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">--</div>
                  <div className="text-xs text-muted-foreground">HRS</div>
                </div>
                <div className="text-2xl font-bold text-muted-foreground">:</div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">--</div>
                  <div className="text-xs text-muted-foreground">MIN</div>
                </div>
                <div className="text-2xl font-bold text-muted-foreground">:</div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">--</div>
                  <div className="text-xs text-muted-foreground">SEC</div>
                </div>
              </div>
            </div>

            {/* Session Info */}
            <div className="text-center text-sm text-muted-foreground">
              <div>Session expires: {formatDate(expiresAt)}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Current Date and Time */}
          {showCurrentTime && currentTime && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(currentTime)}</span>
            </div>
          )}

          {/* Countdown Timer */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Clock className="h-5 w-5" />
              <span className="text-sm font-medium">
                {isExpired ? 'Session Expired' : 'Time Remaining'}
              </span>
            </div>
            
            {isExpired ? (
              <Badge variant="destructive" className="text-lg px-4 py-2">
                EXPIRED
              </Badge>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {formatTime(timeLeft.hours)}
                  </div>
                  <div className="text-xs text-muted-foreground">HRS</div>
                </div>
                <div className="text-2xl font-bold text-muted-foreground">:</div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {formatTime(timeLeft.minutes)}
                  </div>
                  <div className="text-xs text-muted-foreground">MIN</div>
                </div>
                <div className="text-2xl font-bold text-muted-foreground">:</div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {formatTime(timeLeft.seconds)}
                  </div>
                  <div className="text-xs text-muted-foreground">SEC</div>
                </div>
              </div>
            )}
          </div>

          {/* Session Info */}
          <div className="text-center text-sm text-muted-foreground">
            <div>Session expires: {formatDate(expiresAt)}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
