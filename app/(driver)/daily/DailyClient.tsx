"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { format } from "date-fns";
import { DriverShell } from "@/components/layout/DriverShell";
import { useOpsDaily } from "@/lib/hooks/useOpsDaily";
import { upsertOpsDaily } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const today = format(new Date(), "yyyy-MM-dd");

export default function DailyClient() {
  const [day, setDay] = useState(today);
  const { data, refresh } = useOpsDaily(day);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    idle_minutes: "",
    energy_kwh: "",
    energy_cost_inr: "",
    fuel_litres: "",
    fuel_cost_inr: "",
    tolls_parking_inr: "",
    notes: "",
  });

  useEffect(() => {
    if (!data) {
      setForm({
        idle_minutes: "",
        energy_kwh: "",
        energy_cost_inr: "",
        fuel_litres: "",
        fuel_cost_inr: "",
        tolls_parking_inr: "",
        notes: "",
      });
      return;
    }
    setForm({
      idle_minutes: data.idle_minutes?.toString() ?? "",
      energy_kwh: data.energy_kwh?.toString() ?? "",
      energy_cost_inr: data.energy_cost_inr?.toString() ?? "",
      fuel_litres: data.fuel_litres?.toString() ?? "",
      fuel_cost_inr: data.fuel_cost_inr?.toString() ?? "",
      tolls_parking_inr: data.tolls_parking_inr?.toString() ?? "",
      notes: data.notes ?? "",
    });
  }, [data]);

  const handleChange =
    (key: keyof typeof form) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [key]: event.target.value }));
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    const payload = {
      day,
      idle_minutes: form.idle_minutes ? Number(form.idle_minutes) : undefined,
      energy_kwh: form.energy_kwh ? Number(form.energy_kwh) : undefined,
      energy_cost_inr: form.energy_cost_inr ? Number(form.energy_cost_inr) : undefined,
      fuel_litres: form.fuel_litres ? Number(form.fuel_litres) : undefined,
      fuel_cost_inr: form.fuel_cost_inr ? Number(form.fuel_cost_inr) : undefined,
      tolls_parking_inr: form.tolls_parking_inr ? Number(form.tolls_parking_inr) : undefined,
      notes: form.notes || undefined,
    };
    const { error } = await upsertOpsDaily(payload);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Saved your daily summary");
    refresh();
  };

  return (
    <DriverShell title="Daily summary" subtitle="Stay on top of charging + idle time">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block text-sm">
          Day
          <input
            type="date"
            className="mt-1 w-full rounded-lg border px-3 py-2"
            value={day}
            onChange={(event) => setDay(event.target.value)}
          />
        </label>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <NumberField label="Idle minutes" value={form.idle_minutes} onChange={handleChange("idle_minutes")} />
          <NumberField
            label="Tolls / parking (?)"
            value={form.tolls_parking_inr}
            onChange={handleChange("tolls_parking_inr")}
          />
          <NumberField label="Energy used (kWh)" value={form.energy_kwh} onChange={handleChange("energy_kwh")} />
          <NumberField
            label="Energy cost (?)"
            value={form.energy_cost_inr}
            onChange={handleChange("energy_cost_inr")}
          />
          <NumberField label="Fuel (L)" value={form.fuel_litres} onChange={handleChange("fuel_litres")} />
          <NumberField label="Fuel cost (?)" value={form.fuel_cost_inr} onChange={handleChange("fuel_cost_inr")} />
        </div>

        <label className="text-sm">
          Notes
          <textarea
            className="mt-1 w-full rounded-lg border px-3 py-2"
            rows={3}
            value={form.notes}
            onChange={handleChange("notes")}
            placeholder="Anything special about today?"
          />
        </label>

        <Button type="submit" className="w-full" disabled={saving}>
          {saving ? "Saving." : "Save daily summary"}
        </Button>
      </form>
    </DriverShell>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <label className="text-sm">
      {label}
      <input
        type="number"
        inputMode="decimal"
        className="mt-1 w-full rounded-lg border px-3 py-2"
        value={value}
        onChange={onChange}
        placeholder="0"
      />
    </label>
  );
}
