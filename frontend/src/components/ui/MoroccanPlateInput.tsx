import React, { useState, useEffect } from "react";
import { Input, Select } from "antd";
import { parseMoroccanPlate } from "../../lib/moroccanPlate";

export const MOROCCAN_PLATE_LETTERS = [
  { value: "أ", label: "أ — Série A" },
  { value: "ب", label: "ب — Série B" },
  { value: "د", label: "د — Série D" },
  { value: "ه", label: "ه — Série H" },
  { value: "و", label: "و — Série W" },
  { value: "ز", label: "ز — Série Z" },
  { value: "ح", label: "ح — Série H" },
  { value: "ط", label: "ط — Série T" },
  { value: "ي", label: "ي — Série Y" },
  { value: "ك", label: "ك — Série K" },
  { value: "ل", label: "ل — Série L" },
  { value: "م", label: "م — Série M" },
  { value: "ن", label: "ن — Série N" },
  { value: "ص", label: "ص — Série S" },
  { value: "ع", label: "ع — Série E" },
  { value: "ف", label: "ف — Série F" },
  { value: "ق", label: "ق — Série Q" },
  { value: "ر", label: "ر — Série R" },
  { value: "ش", label: "ش — Série CH" },
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
  const parseValue = (val: string) => {
    const parsed = parseMoroccanPlate(val);
    return {
      num: parsed.numeroImmatriculation,
      letter: parsed.serieImmatriculation || "أ",
      region: parsed.codeRegion || "1",
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
    const formatted = `${n} | ${l || "أ"} | ${r}`;
    if (onChange) {
      onChange(formatted);
    }
  };

  const handleNumChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 7);
    setNumPart(val);
    updatePlate(val, letterPart, regionPart);
  };

  const handleLetterChange = (val: string) => {
    setLetterPart(val);
    updatePlate(numPart, val, regionPart);
  };

  const handleRegionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 2);
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
            maxLength={7}
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

        {/* Case 3: Code Région (1 à 2 chiffres) */}
        <div className="col-span-3">
          <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">
            3. Région (1–2)
          </label>
          <Input
            placeholder="1"
            maxLength={2}
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
          <span>{letterPart || "أ"}</span>
          <span className="text-secondary font-black">|</span>
          <span>{regionPart || "1"}</span>
        </div>
        <span className="text-[9px] font-black text-slate-400">RABAT</span>
      </div>
    </div>
  );
};
