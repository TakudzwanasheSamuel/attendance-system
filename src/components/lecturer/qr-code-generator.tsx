"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface QRCodeGeneratorProps {
  url: string;
  sessionCode: string;
}

export function QRCodeGenerator({ url, sessionCode }: QRCodeGeneratorProps) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const generateQRCode = async () => {
      try {
        // Dynamically import qrcode library
        const QRCode = (await import('qrcode')).default;
        
        // Generate QR code as data URL
        const dataUrl = await QRCode.toDataURL(url, {
          width: 256,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        
        setQrCodeDataUrl(dataUrl);
      } catch (error) {
        console.error('Error generating QR code:', error);
      } finally {
        setIsLoading(false);
      }
    };

    generateQRCode();
  }, [url]);

  if (isLoading) {
    return (
      <Card className="w-64 h-64 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Generating QR Code...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-64 h-64 flex flex-col items-center justify-center p-4">
      <CardContent className="flex flex-col items-center justify-center h-full">
        {qrCodeDataUrl ? (
          <>
            <img 
              src={qrCodeDataUrl} 
              alt={`QR Code for session ${sessionCode}`}
              className="w-48 h-48 object-contain"
            />
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Session: {sessionCode}
            </p>
          </>
        ) : (
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Failed to generate QR code</p>
            <p className="text-xs text-muted-foreground mt-1">Session: {sessionCode}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
