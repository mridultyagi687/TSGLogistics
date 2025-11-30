"use client";

import { useState, useTransition } from "react";
import { SwiggyButton, SwiggyInput } from "../../components/swiggy-ui";

interface CapabilitiesData {
  fleetTypes?: string[];
  maxPayloadKg?: number;
  routeCoverage?: string[];
  operatingHours?: string;
  notes?: string;
  researchData?: string;
  documents?: string[];
  [key: string]: unknown;
}

function parseCapabilities(json: string): CapabilitiesData {
  try {
    return JSON.parse(json) as CapabilitiesData;
  } catch {
    return {};
  }
}

function formatCapabilities(data: CapabilitiesData): string {
  return JSON.stringify(data, null, 2);
}

export function CapabilitiesFormClient({
  action,
  initialJson
}: {
  action: (formData: FormData) => Promise<void>;
  initialJson: string;
}) {
  const initialData = parseCapabilities(initialJson);
  const [fleetTypes, setFleetTypes] = useState(
    initialData.fleetTypes?.join(", ") || ""
  );
  const [maxPayloadKg, setMaxPayloadKg] = useState(
    initialData.maxPayloadKg?.toString() || ""
  );
  const [routeCoverage, setRouteCoverage] = useState(
    initialData.routeCoverage?.join(", ") || ""
  );
  const [operatingHours, setOperatingHours] = useState(
    initialData.operatingHours || ""
  );
  const [notes, setNotes] = useState(initialData.notes || "");
  const [researchData, setResearchData] = useState(initialData.researchData || "");
  const [documents, setDocuments] = useState<File[]>([]);
  const [existingDocuments, setExistingDocuments] = useState<string[]>(
    Array.isArray(initialData.documents) ? initialData.documents : []
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const capabilities: CapabilitiesData = {};

    if (fleetTypes.trim()) {
      capabilities.fleetTypes = fleetTypes
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }

    if (maxPayloadKg.trim()) {
      const payload = Number.parseFloat(maxPayloadKg);
      if (!Number.isNaN(payload) && payload > 0) {
        capabilities.maxPayloadKg = payload;
      }
    }

    if (routeCoverage.trim()) {
      capabilities.routeCoverage = routeCoverage
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }

    if (operatingHours.trim()) {
      capabilities.operatingHours = operatingHours.trim();
    }

    if (notes.trim()) {
      capabilities.notes = notes.trim();
    }

    if (researchData.trim()) {
      capabilities.researchData = researchData.trim();
    }

    // Handle documents - keep existing ones and add new ones
    if (documents.length > 0 || existingDocuments.length > 0) {
      capabilities.documents = [
        ...existingDocuments,
        ...documents.map((file) => file.name)
      ];
    }

    // Preserve any other fields from initial data
    Object.keys(initialData).forEach((key) => {
      if (
        !["fleetTypes", "maxPayloadKg", "routeCoverage", "operatingHours", "notes", "researchData", "documents"].includes(
          key
        )
      ) {
        capabilities[key] = initialData[key];
      }
    });

    const formData = new FormData();
    formData.set("capabilities", formatCapabilities(capabilities));
    
    // Append new document files
    documents.forEach((file, index) => {
      formData.append(`document_${index}`, file);
    });

    startTransition(async () => {
      try {
        await action(formData);
        // Clear uploaded files after successful submission
        setDocuments([]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update capabilities");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-900 mb-1">
          Vendor Capabilities
        </h3>
        <p className="text-sm text-gray-600">
          Configure the vendor’s operational capabilities and constraints
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Fleet Types
          </label>
          <p className="mb-2 text-xs text-gray-500">
            Comma-separated list (e.g., “32FT, TAURUS, CONTAINER”)
          </p>
          <SwiggyInput
            name="fleetTypes"
            value={fleetTypes}
            onChange={(e) => setFleetTypes(e.target.value)}
            placeholder="32FT, TAURUS"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Max Payload (kg)
          </label>
          <p className="mb-2 text-xs text-gray-500">
            Maximum weight capacity in kilograms
          </p>
          <SwiggyInput
            name="maxPayloadKg"
            type="number"
            min="0"
            step="1"
            value={maxPayloadKg}
            onChange={(e) => setMaxPayloadKg(e.target.value)}
            placeholder="28000"
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Route Coverage
          </label>
          <p className="mb-2 text-xs text-gray-500">
            Comma-separated routes (e.g., “DELHI-MUMBAI, DELHI-PUNE”)
          </p>
          <SwiggyInput
            name="routeCoverage"
            value={routeCoverage}
            onChange={(e) => setRouteCoverage(e.target.value)}
            placeholder="DELHI-MUMBAI, DELHI-PUNE"
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Operating Hours
          </label>
          <p className="mb-2 text-xs text-gray-500">
            Operating schedule (e.g., “24/7” or “Mon-Fri 9AM-6PM”)
          </p>
          <SwiggyInput
            name="operatingHours"
            value={operatingHours}
            onChange={(e) => setOperatingHours(e.target.value)}
            placeholder="24/7"
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Research Data
          </label>
          <p className="mb-2 text-xs text-gray-500">
            Research findings, market analysis, or additional data
          </p>
          <textarea
            name="researchData"
            rows={3}
            value={researchData}
            onChange={(e) => setResearchData(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-[#6366F1] focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20"
            placeholder="Enter research data, market analysis, or findings..."
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Documents
          </label>
          <p className="mb-2 text-xs text-gray-500">
            Upload PDF documents (new files will be added, not replace existing ones)
          </p>
          
          {/* Existing Documents */}
          {existingDocuments.length > 0 && (
            <div className="mb-3 space-y-2">
              <p className="text-xs font-medium text-gray-600">Existing Documents:</p>
              {existingDocuments.map((doc, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2"
                >
                  <span className="text-lg">📄</span>
                  <span className="flex-1 text-sm text-gray-700">{doc}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setExistingDocuments(existingDocuments.filter((_, i) => i !== index));
                    }}
                    className="text-xs text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* File Input */}
          <div className="relative">
            <input
              type="file"
              accept=".pdf,application/pdf"
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                setDocuments((prev) => [...prev, ...files]);
              }}
              className="hidden"
              id="document-upload"
            />
            <label
              htmlFor="document-upload"
              className="flex cursor-pointer items-center gap-3 rounded-lg border-2 border-dashed border-gray-300 bg-white px-4 py-3 transition hover:border-[#6366F1] hover:bg-indigo-50"
            >
              <span className="text-2xl">📄</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700">
                  {documents.length > 0
                    ? `${documents.length} file(s) selected`
                    : "Click to upload PDF documents"}
                </p>
                <p className="text-xs text-gray-500">PDF files only</p>
              </div>
              <span className="text-sm text-[#6366F1]">Browse</span>
            </label>
          </div>

          {/* Selected Files Preview */}
          {documents.length > 0 && (
            <div className="mt-3 space-y-2">
              <p className="text-xs font-medium text-gray-600">New Files to Upload:</p>
              {documents.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 rounded-lg border border-gray-200 bg-indigo-50 px-3 py-2"
                >
                  <span className="text-lg">📄</span>
                  <span className="flex-1 text-sm text-gray-700">{file.name}</span>
                  <span className="text-xs text-gray-500">
                    {(file.size / 1024).toFixed(1)} KB
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setDocuments(documents.filter((_, i) => i !== index));
                    }}
                    className="text-xs text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Notes
          </label>
          <p className="mb-2 text-xs text-gray-500">
            Additional information or special instructions
          </p>
          <textarea
            name="notes"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-[#6366F1] focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20"
            placeholder="Any additional notes or special capabilities..."
          />
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-100 px-4 py-3 text-sm font-semibold text-red-800">
          {error}
        </div>
      )}

      <SwiggyButton type="submit" disabled={isPending}>
        {isPending ? "Updating..." : "Update Capabilities"}
      </SwiggyButton>
    </form>
  );
}
