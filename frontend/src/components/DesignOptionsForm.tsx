"use client";

import { useQrCodeCreator } from "@/hooks/use-qrcode-creator";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";
import { useCallback, useEffect, useState } from "react";
import { debounce } from "lodash";
import { DesignOptions } from "@/types";

const DesignOptionsForm = () => {
  const { designOptions, setDesignOptions } = useQrCodeCreator();
  const [logoPreview] = useState<string | null>(null);

  const debouncedSetDesignOptions = useCallback(
    debounce((update: Partial<DesignOptions>) => {
      setDesignOptions(prev => ({ ...prev, ...update }));
    }, 100),
    []
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setDesignOptions(prev => ({
        ...prev,
        logo: e.target.files![0],
        logoSize: prev.logoSize || 20
      }));
    } else {
      setDesignOptions(prev => ({ ...prev, logo: null }));
    }
  };

  const handleColorChange = (type: 'fg' | 'bg') => (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSetDesignOptions({ [`${type}Color`]: e.target.value });
  };

  const handleLogoSizeChange = ([value]: number[]) => {
    setDesignOptions(prev => ({ ...prev, logoSize: value }));
  };

  useEffect(() => {
    return () => {
      if (logoPreview) URL.revokeObjectURL(logoPreview);
    };
  }, [logoPreview]);

  return (
    <div className="space-y-8 p-8 bg-gray-700/20 border border-slate-700 rounded-2xl shadow-sm">
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Color Scheme</h3>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Code Color</Label>
            <div className="flex items-center gap-4">
              <input
                type="color"
                defaultValue={designOptions.fgColor}
                onChange={handleColorChange('fg')}
                className="size-14 rounded-lg border-2 border-slate-200 cursor-pointer"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Background</Label>
            <div className="flex items-center gap-4">
              <input
                type="color"
                defaultValue={designOptions.bgColor}
                onChange={handleColorChange('bg')}
                className="size-14 rounded-lg border-2 border-slate-200 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-slate-800">Branding</h3>
        <div className="space-y-4">
          <div>
            <Label className="mb-2 block">Company Logo</Label>
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl p-6 cursor-pointer hover:border-slate-300 transition-colors">
              <input 
                type="file" 
                onChange={handleFileChange} 
                accept="image/*"
                className="hidden"
              />
              <span className="text-slate-500">Drag & drop or click to upload</span>
            </label>
          </div>
          {designOptions.logo && (
            <div className="space-y-4">
              <Label className="text-slate-600 block">Logo Scale</Label>
              <Slider
                value={[designOptions.logoSize || 20]}
                onValueChange={handleLogoSizeChange}
                min={10}
                max={40}
                step={5}
                className="[&_.slider-track]:bg-slate-100 [&_.slider-range]:bg-slate-900"
              />
              <span className="text-sm text-slate-500 block text-center">
                {designOptions.logoSize}% of QR code
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DesignOptionsForm;