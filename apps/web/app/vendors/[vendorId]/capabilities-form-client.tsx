"use client";

import { useState, useTransition } from "react";
import { SwiggyButton, SwiggyInput } from "../../components/swiggy-ui";

interface CapabilitiesData {
  fleetTypes?: string[];
  maxPayloadKg?: number;
  routeCoverage?: string[];
  operatingHours?: string;
  notes?: string;
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

    // Preserve any other fields from initial data
    Object.keys(initialData).forEach((key) => {
      if (
        !["fleetTypes", "maxPayloadKg", "routeCoverage", "operatingHours", "notes"].includes(
          key
        )
      ) {
        capabilities[key] = initialData[key];
      }
    });

    const formData = new FormData();
    formData.set("capabilities", formatCapabilities(capabilities));

    startTransition(async () => {
      await action(formData);
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
