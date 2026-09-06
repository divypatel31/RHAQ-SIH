import React, { useEffect, useRef, useState } from "react";
import api from "../../utils/api";
import { Input } from "./index";

export default function PatientSearch({ onSelect, selected, onClear }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await api.get("/patients/search", { params: { query: query.trim() } });
        setResults(res.data.patients);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 350);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  if (selected) {
    return (
      <div className="flex items-center justify-between border border-teal-500 rounded-md px-3.5 py-2.5 mb-4">
        <div>
          <p className="text-sm font-medium text-ink">{selected.name}</p>
          <p className="text-xs text-ink/50">{selected.phone}</p>
        </div>
        <button type="button" onClick={onClear} className="text-xs font-medium text-rose-500 hover:text-rose-600">
          Change
        </button>
      </div>
    );
  }

  return (
    <div className="mb-4 relative">
      <Input placeholder="Search patient by name or phone number" value={query} onChange={(e) => setQuery(e.target.value)} />
      {loading && <p className="text-xs text-ink/40 mt-1.5">Searching…</p>}
      {results.length > 0 && (
        <div className="absolute z-10 w-full bg-white border border-line rounded-md mt-1 max-h-56 overflow-y-auto shadow-sm">
          {results.map((p) => (
            <button
              type="button"
              key={p.user_id}
              onClick={() => {
                onSelect(p);
                setQuery("");
                setResults([]);
              }}
              className="w-full text-left px-3.5 py-2.5 hover:bg-ink/[0.03] border-b border-line last:border-0"
            >
              <p className="text-sm font-medium text-ink">{p.name}</p>
              <p className="text-xs text-ink/50">{p.phone} {p.facility_name ? `· ${p.facility_name}` : ""}</p>
            </button>
          ))}
        </div>
      )}
      {!loading && query.trim().length >= 2 && results.length === 0 && (
        <p className="text-xs text-ink/40 mt-1.5">No matching patient found.</p>
      )}
    </div>
  );
}
