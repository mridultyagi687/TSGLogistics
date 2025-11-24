"use client";

import { useFormState, useFormStatus } from "react-dom";
import { SwiggyButton, SwiggyInput } from "../../components/swiggy-ui";
import { serviceTags } from "@tsg/shared";

const SERVICE_OPTIONS = Object.values(serviceTags);

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <SwiggyButton type="submit" disabled={pending} className="w-full">
      {pending ? "Creating..." : "Create Vendor"}
    </SwiggyButton>
  );
}

export function CreateVendorForm({
  action
}: {
  action: (formData: FormData) => Promise<void>;
}) {
  return (
    <form action={action} className="space-y-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Vendor Information</h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Basic details about the vendor
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <SwiggyInput
          label="Organization ID"
          name="orgId"
          required
          defaultValue="org_demo"
        />
        <SwiggyInput
          label="Vendor Name"
          name="name"
          required
          placeholder="ABC Mechanics"
        />
        <SwiggyInput
          label="Contact Phone"
          name="contactPhone"
          type="tel"
          placeholder="+91 9876543210"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
          Services *
        </label>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {SERVICE_OPTIONS.map((service) => (
            <label
              key={service}
              className="flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              <input
                type="checkbox"
                name="services"
                value={service}
                className="rounded border-gray-300 dark:border-gray-600 text-[#6366F1] focus:ring-[#6366F1]"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                {service.replace(/_/g, " ")}
              </span>
            </label>
          ))}
        </div>
      </div>

      <fieldset className="grid gap-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-6">
        <legend className="px-3 text-sm font-bold text-gray-900 dark:text-white">
          Address
        </legend>
        <div className="grid gap-4 md:grid-cols-2">
          <SwiggyInput
            label="Line 1"
            name="address_line1"
            required
            placeholder="Street address"
          />
          <SwiggyInput
            label="Line 2"
            name="address_line2"
            placeholder="Apartment, suite, etc."
          />
          <SwiggyInput label="City" name="address_city" required />
          <SwiggyInput label="State" name="address_state" required />
          <SwiggyInput label="Postal Code" name="address_postalCode" required />
          <SwiggyInput
            label="Country"
            name="address_country"
            required
            defaultValue="India"
          />
          <SwiggyInput
            label="Latitude (optional)"
            name="address_latitude"
            type="number"
            step="0.000001"
          />
          <SwiggyInput
            label="Longitude (optional)"
            name="address_longitude"
            type="number"
            step="0.000001"
          />
        </div>
      </fieldset>

      <div className="flex justify-end gap-4">
        <SwiggyButton type="button" variant="outline" onClick={() => window.history.back()}>
          Cancel
        </SwiggyButton>
        <SubmitButton />
      </div>
    </form>
  );
}

