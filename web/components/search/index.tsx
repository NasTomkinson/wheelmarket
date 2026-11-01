"use client";

import { useEffect, useMemo, useState } from "react";

type VehicleModel = {
  id: string;
  name: string;
  years: number[];
};

type VehicleMake = {
  id: string;
  name: string;
  models: VehicleModel[];
};

type VehiclesResponse = {
  data?: VehicleMake[];
  message?: string;
};

export default function Search() {
  const [makes, setMakes] = useState<VehicleMake[]>([]);
  const [makeId, setMakeId] = useState("");
  const [modelId, setModelId] = useState("");
  const [year, setYear] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadVehicles() {
      try {
        const response = await fetch("/api/vehicles", {
          signal: controller.signal,
        });
        const payload = (await response.json()) as VehiclesResponse;

        if (!response.ok) {
          throw new Error(payload.message ?? "Unable to load vehicles.");
        }

        setMakes(Array.isArray(payload.data) ? payload.data : []);
      } catch (requestError) {
        if (requestError instanceof Error && requestError.name === "AbortError") {
          return;
        }

        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to load vehicles.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadVehicles();

    return () => controller.abort();
  }, []);

  const selectedMake = useMemo(
    () => makes.find((make) => make.id === makeId),
    [makeId, makes],
  );
  const models = selectedMake?.models ?? [];
  const years = models.find((model) => model.id === modelId)?.years ?? [];

  return (
    <div className="search">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 ">
        <label className="sr-only" htmlFor="vehicle-make">
          Brand
        </label>
        <select
          id="vehicle-make"
          aria-label="Brand"
          value={makeId}
          disabled={isLoading || Boolean(error)}
          onChange={(event) => {
            setMakeId(event.target.value);
            setModelId("");
            setYear("");
          }}
        >
          <option value="">
            {isLoading ? "Loading brands…" : "Select brand"}
          </option>
          {makes.map((make) => (
            <option key={make.id} value={make.id}>
              {make.name}
            </option>
          ))}
        </select>

        <label className="sr-only" htmlFor="vehicle-model">
          Model
        </label>
        <select
          id="vehicle-model"
          aria-label="Model"
          value={modelId}
          disabled={!makeId}
          onChange={(event) => {
            setModelId(event.target.value);
            setYear("");
          }}
        >
          <option value="">Select model</option>
          {models.map((model) => (
            <option key={model.id} value={model.id}>
              {model.name}
            </option>
          ))}
        </select>

        <label className="sr-only" htmlFor="vehicle-year">
          Model year
        </label>
        <select
          id="vehicle-year"
          aria-label="Model year"
          value={year}
          disabled={!modelId || years.length === 0}
          onChange={(event) => setYear(event.target.value)}
        >
          <option value="">
            {modelId && years.length === 0 ? "No years available" : "Select year"}
          </option>
          {years.map((modelYear) => (
            <option key={modelYear} value={modelYear}>
              {modelYear}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <p className="mt-2 text-sm text-primary" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
