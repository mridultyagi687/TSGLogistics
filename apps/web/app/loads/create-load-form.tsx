'use client';

import { useFormState, useFormStatus } from "react-dom";
import { createLoadAction } from "./actions";
import type { CreateLoadFormState } from "./actions";
import { SwiggyCard, SwiggyButton, SwiggyInput, SwiggyTextarea } from "../components/swiggy-ui";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <SwiggyButton type="submit" disabled={pending} className="w-full">
      {pending ? "Creating..." : "Create Load Draft"}
    </SwiggyButton>
  );
}

const initialCreateLoadState: CreateLoadFormState = { status: "idle" };

export function CreateLoadForm() {
  const [state, formAction] = useFormState(createLoadAction, initialCreateLoadState);

  return (
    <SwiggyCard>
      <form action={formAction} className="space-y-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create Load Draft</h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Submit a draft load through the API gateway
          </p>
        </div>

      <div className="grid gap-4 md:grid-cols-2">
        <SwiggyInput
          label="Organization ID"
          name="orgId"
          required
          defaultValue="org_demo"
        />
        <label className="grid gap-1 text-sm">
          <span className="font-medium text-slate-700 dark:text-slate-300">Reference code</span>
          <input
            name="referenceCode"
            required
            defaultValue={`LD-${Date.now()}`}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-white outline-none transition focus:border-[#6366F1] dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900"
          />
        </label>
        <label className="grid gap-1 text-sm">
          <span className="font-medium text-slate-700 dark:text-slate-300">Cargo type</span>
          <input
            name="cargoType"
            required
            defaultValue="FMCG"
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-white outline-none transition focus:border-[#6366F1] dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900"
          />
        </label>
        <label className="grid gap-1 text-sm">
          <span className="font-medium text-slate-700 dark:text-slate-300">Vehicle type</span>
          <input
            name="vehicleType"
            required
            defaultValue="32FT_CONTAINER"
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-white outline-none transition focus:border-[#6366F1] dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900"
          />
        </label>
        <label className="grid gap-1 text-sm">
          <span className="font-medium text-slate-700 dark:text-slate-300">Cargo value (INR)</span>
          <input
            name="cargoValue"
            type="number"
            min="1"
            step="0.01"
            required
            defaultValue="100000"
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-white outline-none transition focus:border-[#6366F1] dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900"
          />
        </label>
        <label className="grid gap-1 text-sm">
          <span className="font-medium text-slate-700 dark:text-slate-300">SLA hours</span>
          <input
            name="slaHours"
            type="number"
            min="1"
            step="1"
            required
            defaultValue="72"
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-white outline-none transition focus:border-[#6366F1] dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900"
          />
        </label>
      </div>

      <fieldset className="grid gap-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-6">
        <legend className="px-3 text-sm font-bold text-gray-900 dark:text-white">
          Pickup address
        </legend>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-1 text-sm">
            <span className="font-medium text-slate-700 dark:text-slate-300">Line 1</span>
            <input
              name="pickup_line1"
              required
              defaultValue="Plot 18, Sector 35"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-white outline-none transition focus:border-[#6366F1] dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900"
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="font-medium text-slate-700 dark:text-slate-300">Line 2</span>
            <input
              name="pickup_line2"
              defaultValue=""
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-white outline-none transition focus:border-[#6366F1] dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900"
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="font-medium text-slate-700 dark:text-slate-300">City</span>
            <input
              name="pickup_city"
              required
              defaultValue="Gurugram"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-white outline-none transition focus:border-[#6366F1] dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900"
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="font-medium text-slate-700 dark:text-slate-300">State</span>
            <input
              name="pickup_state"
              required
              defaultValue="Haryana"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-white outline-none transition focus:border-[#6366F1] dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900"
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="font-medium text-slate-700 dark:text-slate-300">Postal code</span>
            <input
              name="pickup_postalCode"
              required
              defaultValue="122001"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-white outline-none transition focus:border-[#6366F1] dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900"
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="font-medium text-slate-700 dark:text-slate-300">Country</span>
            <input
              name="pickup_country"
              required
              defaultValue="India"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-white outline-none transition focus:border-[#6366F1] dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900"
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="font-medium text-slate-700 dark:text-slate-300">Latitude (optional)</span>
            <input
              name="pickup_latitude"
              type="number"
              step="0.000001"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-white outline-none transition focus:border-[#6366F1] dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900"
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="font-medium text-slate-700 dark:text-slate-300">Longitude (optional)</span>
            <input
              name="pickup_longitude"
              type="number"
              step="0.000001"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-white outline-none transition focus:border-[#6366F1] dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900"
            />
          </label>
        </div>
      </fieldset>

      <fieldset className="grid gap-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-6">
        <legend className="px-3 text-sm font-bold text-gray-900 dark:text-white">
          Drop address
        </legend>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-1 text-sm">
            <span className="font-medium text-slate-700 dark:text-slate-300">Line 1</span>
            <input
              name="drop_line1"
              required
              defaultValue="Warehouse 4B, Bhiwandi"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-white outline-none transition focus:border-[#6366F1] dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900"
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="font-medium text-slate-700 dark:text-slate-300">Line 2</span>
            <input
              name="drop_line2"
              defaultValue=""
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-white outline-none transition focus:border-[#6366F1] dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900"
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="font-medium text-slate-700 dark:text-slate-300">City</span>
            <input
              name="drop_city"
              required
              defaultValue="Thane"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-white outline-none transition focus:border-[#6366F1] dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900"
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="font-medium text-slate-700 dark:text-slate-300">State</span>
            <input
              name="drop_state"
              required
              defaultValue="Maharashtra"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-white outline-none transition focus:border-[#6366F1] dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900"
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="font-medium text-slate-700 dark:text-slate-300">Postal code</span>
            <input
              name="drop_postalCode"
              required
              defaultValue="421302"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-white outline-none transition focus:border-[#6366F1] dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900"
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="font-medium text-slate-700 dark:text-slate-300">Country</span>
            <input
              name="drop_country"
              required
              defaultValue="India"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-white outline-none transition focus:border-[#6366F1] dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900"
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="font-medium text-slate-700 dark:text-slate-300">Latitude (optional)</span>
            <input
              name="drop_latitude"
              type="number"
              step="0.000001"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-white outline-none transition focus:border-[#6366F1] dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900"
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="font-medium text-slate-700 dark:text-slate-300">Longitude (optional)</span>
            <input
              name="drop_longitude"
              type="number"
              step="0.000001"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-white outline-none transition focus:border-[#6366F1] dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900"
            />
          </label>
        </div>
      </fieldset>

      {state.status !== "idle" ? (
        <div
          className={`rounded-lg px-4 py-3 text-sm font-semibold ${
            state.status === "success"
              ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200"
              : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200"
          }`}
        >
          {state.message}
          {state.status === "error" && state.message.includes("service") && (
            <div className="mt-2 text-xs font-normal opacity-90">
              Make sure the API Gateway (port 4000) and Orders Service (port 4001) are running.
            </div>
          )}
        </div>
      ) : null}

      <div className="flex justify-end">
        <SubmitButton />
      </div>
      </form>
    </SwiggyCard>
  );
}

