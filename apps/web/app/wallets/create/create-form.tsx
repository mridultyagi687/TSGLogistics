"use client";

import { useFormStatus } from "react-dom";
import { SwiggyButton, SwiggyInput } from "../../components/swiggy-ui";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <SwiggyButton type="submit" disabled={pending} className="w-full">
      {pending ? "Creating..." : "Create Wallet"}
    </SwiggyButton>
  );
}

export function CreateWalletForm({
  action
}: {
  action: (formData: FormData) => Promise<void>;
}) {
  return (
    <form action={action} className="space-y-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Wallet Information</h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Configure the wallet type and organization
        </p>
      </div>

      <SwiggyInput
        label="Organization ID"
        name="orgId"
        required
        defaultValue="org_demo"
      />

      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
          Wallet Type *
        </label>
        <div className="grid grid-cols-3 gap-4">
          {(["ESCROW", "FLEET", "VENDOR"] as const).map((type) => (
            <label
              key={type}
              className="flex flex-col items-center gap-2 rounded-lg border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 cursor-pointer hover:border-[#6366F1] dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition"
            >
              <input
                type="radio"
                name="type"
                value={type}
                required
                className="text-[#6366F1] focus:ring-[#6366F1]"
              />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{type}</span>
            </label>
          ))}
        </div>
      </div>

      <SwiggyInput
        label="Currency"
        name="currency"
        defaultValue="INR"
        placeholder="INR"
      />

      <div className="flex justify-end gap-4">
        <SwiggyButton
          type="button"
          variant="outline"
          onClick={() => window.history.back()}
        >
          Cancel
        </SwiggyButton>
        <SubmitButton />
      </div>
    </form>
  );
}

