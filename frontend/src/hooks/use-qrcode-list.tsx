"use client";

import { api } from "@/lib/endpoint-builder";
import { QRCode, ResultType } from "@/types";
import { createContext, useContext, useEffect, useState } from "react"

type QrCodeListContextType = {
  qrCodes: QRCode[],
  setQrCodes: React.Dispatch<React.SetStateAction<QRCode[]>>,
  isLoading: boolean,
  error: string | null,
  refreshQrCodesList: () => Promise<void>,
  result: ResultType,
  setResult: React.Dispatch<React.SetStateAction<ResultType>>,
};

export const QrCodeListContext = createContext<QrCodeListContextType>(null!);

export function QrCodeListProvider({ children }: { children: React.ReactNode }) {
  const [qrCodes, setQrCodes] = useState<QRCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ResultType>({ success: false, message: null, body: null });

  async function fetchQrCodes() {
    try {
      setIsLoading(true);
      const res: ResultType = await fetch(api.qrcodes.findAll.toString(), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }).then((res) => res.json());

      if (!res.success) throw new Error("Failed to fetch QR codes");

      setQrCodes(res.body);
    } catch (err) {
      console.log(err);
      setError("Failed to load QR codes");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQrCodes();
  }, []);

  return (
    <QrCodeListContext.Provider value={{
      qrCodes, 
      setQrCodes, 
      isLoading, 
      error, 
      refreshQrCodesList: fetchQrCodes,
      result, setResult,
    }}>
      {children}
    </QrCodeListContext.Provider>
  );
}

export function useQrCodeList() {
  return useContext(QrCodeListContext);
}