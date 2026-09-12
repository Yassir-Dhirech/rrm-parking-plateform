import React, { useState, useEffect } from "react";
import { Input, Select } from "antd";

export const MOROCCAN_PLATE_LETTERS = [
  { value: "أ (A)", label: "أ — Series A" },
  { value: "ب (B)", label: "ب — Series B" },
  { value: "د (D)", label: "د — Series D" },
  { value: "هـ (H)", label: "هـ — Series H" },
  { value: "و (W)", label: "و — Series W" },
  { value: "ز (Z)", label: "ز — Series Z" },
  { value: "ح (H)", label: "ح — Series H" },
  { value: "ط (T)", label: "ط — Series T" },
  { value: "ي (Y)", label: "ي — Series Y" },
  { value: "ك (K)", label: "ك — Series K" },
  { value: "ل (L)", label: "ل — Series L" },
  { value: "م (M)", label: "م — Series M" },
  { value: "ن (N)", label: "ن — Series N" },
  { value: "ص (S)", label: "ص — Series S" },
  { value: "ع (E)", label: "ع — Series E" },
  { value: "ف (F)", label: "ف — Series F" },
  { value: "ق (Q)", label: "ق — Series Q" },
  { value: "ر (R)", label: "ر — Series R" },
  { value: "ش (CH)", label: "ش — Series CH" },
];

interface MoroccanPlateInputProps {
  value?: string;
  onChange?: (val: string) => void;
  disabled?: boolean;
}

export const MoroccanPlateInput: React.FC<MoroccanPlateInputProps> = ({
  value = "",
  onChange,
  disabled = false,
}) => {
  // Parse initial value "12345 | أ (A) | 1" or "12345 | A | 1"
  const parseValue = (val: string) => {
    if (!val) return { num: "", letter: "أ (A)", region: "1" };
    const parts = val.split("|").map((s) => s.trim());
    return {
      num: parts[0] || "",
      letter: parts[1] || "أ (A)",
      region: parts[2] || "1",
    };
  };

  const initial = parseValue(value);
  const [numPart, setNumPart] = useState(initial.num);
  const [letterPart, setLetterPart] = useState(initial.letter);
  const [regionPart, setRegionPart] = useState(initial.region);

  useEffect(() => {
    const parsed = parseValue(value);
    setNumPart(parsed.num);
    if (parsed.letter) setLetterPart(parsed.letter);
    if (parsed.region) setRegionPart(parsed.region);
  }, [value]);

  const updatePlate = (n: string, l: string, r: string) => {
    const formatted = `${n || "12345"} | ${l || "أ (A)"} | ${r || "1"}`;
    if (onChange) {
      onChange(formatted);
    }
  };

  const handleNumChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, ""); // digits only
    setNumPart(val);
    updatePlate(val, letterPart, regionPart);
  };

  const handleLetterChange = (val: string) => {
    setLetterPart(val);
    updatePlate(numPart, val, regionPart);
  };

  const handleRegionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 3); // max 3 digits
    setRegionPart(val);
    updatePlate(numPart, letterPart, val);
  };

  return (
    <div className="space-y-2">
      {/* 3 Input Cases Container */}
      <div className="grid grid-cols-12 gap-2 items-center bg-slate-50 p-2 rounded-xl border border-slate-200">
        {/* Case 1: Chiffres Principaux (au moins 3 chiffres) */}
        <div className="col-span-5">
          <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">
            1. Chiffres (&ge; 3)
          </label>
          <Input
            placeholder="Ex: 12345"
            maxLength={6}
            value={numPart}
            onChange={handleNumChange}
            disabled={disabled}
            className="font-mono font-bold text-center rounded-lg"
          />
        </div>

        {/* Case 2: Série Lettre (أ / A, ب / B...) */}
        <div className="col-span-4">
          <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">
            2. Lettre Série
          </label>
          <Select
            value={letterPart}
            onChange={handleLetterChange}
            disabled={disabled}
            options={MOROCCAN_PLATE_LETTERS}
            className="w-full font-bold text-center"
          />
        </div>

        {/* Case 3: Code Région (Max 3 chiffres) */}
        <div className="col-span-3">
          <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">
            3. Région (&le; 3)
          </label>
          <Input
            placeholder="1"
            maxLength={3}
            value={regionPart}
            onChange={handleRegionChange}
            disabled={disabled}
            className="font-mono font-bold text-center rounded-lg"
          />
        </div>
      </div>

      {/* Visual Moroccan License Plate Badge Preview */}
      <div className="flex items-center justify-between px-3 py-1.5 rounded-lg border-2 border-slate-800 bg-gradient-to-r from-slate-100 via-white to-slate-100 font-mono text-slate-900 shadow-2xs">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-red-600 inline-block" />
          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">MA</span>
        </div>
        <div className="font-extrabold text-sm tracking-widest space-x-2 text-slate-900">
          <span>{numPart || "12345"}</span>
          <span className="text-secondary font-black">|</span>
          <span>{letterPart || "أ (A)"}</span>
          <span className="text-secondary font-black">|</span>
          <span>{regionPart || "1"}</span>
        </div>
        <span className="text-[9px] font-black text-slate-400">RABAT</span>
      </div>
    </div>
  );
};
