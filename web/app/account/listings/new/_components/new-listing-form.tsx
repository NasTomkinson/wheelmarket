"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";

const maxImageSize = 10 * 1024 * 1024;
const acceptedImageTypes = ["image/jpeg", "image/png", "image/webp"];

type PcdOption = {
  id: number;
  documentId: string;
  bolts: number;
  spacing: number;
};

type WheelModel = {
  id: number;
  name: string;
};

type BrandOption = {
  id: number;
  documentId: string;
  name: string;
  models?: WheelModel[];
};

type ListingOptions = {
  pcds: PcdOption[];
  brands: BrandOption[];
};

type ListingFormValues = {
  images: File[];
  title: string;
  description: string;
  condition: string;
  price: number;
  brand: string;
  wheelModel: string;
  pcd: string;
  diameter: number;
  width: number;
  offset: number;
  centreBore: number;
  construction: string;
  partNumber: string;
  quantity: number;
  finish: string;
  tyresIncluded: boolean;
  tyreType?: string;
  otherInformation: string;
};

const defaultValues: ListingFormValues = {
  images: [],
  title: "",
  description: "",
  condition: "",
  price: 0,
  brand: "",
  wheelModel: "",
  pcd: "",
  diameter: 18,
  width: 8,
  offset: 35,
  centreBore: 66.6,
  construction: "",
  partNumber: "",
  quantity: 4,
  finish: "",
  tyresIncluded: false,
  tyreType: undefined,
  otherInformation: "",
};

const inputClass =
  "w-full rounded-lg border border-neutral bg-white px-3 py-2.5 text-neutral-dark outline-none transition focus:border-primary focus:ring-2 focus:ring-primary-light";
const labelClass = "mb-1.5 block text-sm font-semibold text-neutral-dark";

function ErrorMessage({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <p className="mt-1 text-sm text-red-700" role="alert">
      {message}
    </p>
  );
}

function SectionHeading({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="mb-6 flex items-start gap-3">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
        {number}
      </span>
      <div>
        <h2 className="text-xl! lg:text-2xl!">{title}</h2>
        <p className="mt-1 text-sm text-neutral-dark/70">{description}</p>
      </div>
    </div>
  );
}

function ImagePreview({ file, onRemove }: { file: File; onRemove: () => void }) {
  const [source] = useState(() => URL.createObjectURL(file));

  useEffect(() => () => URL.revokeObjectURL(source), [source]);

  return (
    <div className="group relative aspect-square overflow-hidden rounded-lg border border-neutral bg-neutral-light">
      <Image src={source} alt={file.name} fill unoptimized className="object-cover" />
      <button
        type="button"
        onClick={onRemove}
        className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-black/70 text-xl leading-none text-white transition hover:bg-black focus:outline-none focus:ring-2 focus:ring-white"
        aria-label={`Remove ${file.name}`}
      >
        ×
      </button>
    </div>
  );
}

export default function NewListingForm() {
  const router = useRouter();
  const [options, setOptions] = useState<ListingOptions>({ pcds: [], brands: [] });
  const [optionsError, setOptionsError] = useState("");
  const [optionsLoading, setOptionsLoading] = useState(true);

  const {
    control,
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ListingFormValues>({ defaultValues, shouldUnregister: true, mode: "onBlur" });

  const images = useWatch({ control, name: "images" }) ?? [];
  const selectedBrand = useWatch({ control, name: "brand" });
  const tyresIncluded = useWatch({ control, name: "tyresIncluded" });
  const description = useWatch({ control, name: "description" }) ?? "";
  const otherInformation = useWatch({ control, name: "otherInformation" }) ?? "";

  const selectedBrandModels = useMemo(
    () => options.brands.find((brand) => brand.documentId === selectedBrand)?.models ?? [],
    [options.brands, selectedBrand],
  );

  useEffect(() => {
    const controller = new AbortController();

    async function loadOptions() {
      try {
        const response = await fetch("/api/listing-options", { signal: controller.signal });
        const body = (await response.json()) as ListingOptions & { message?: string };

        if (!response.ok) throw new Error(body.message || "Unable to load listing options.");
        setOptions({ pcds: body.pcds ?? [], brands: body.brands ?? [] });
        setOptionsError("");
      } catch (error) {
        if (controller.signal.aborted) return;
        setOptionsError(error instanceof Error ? error.message : "Unable to load listing options.");
      } finally {
        if (!controller.signal.aborted) setOptionsLoading(false);
      }
    }

    loadOptions();
    return () => controller.abort();
  }, []);

  function addImages(files: File[]) {
    const nextImages = [...images, ...files].slice(0, 8);
    setValue("images", nextImages, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
  }

  function removeImage(index: number) {
    setValue(
      "images",
      images.filter((_, imageIndex) => imageIndex !== index),
      { shouldDirty: true, shouldTouch: true, shouldValidate: true },
    );
  }

  async function onSubmit(values: ListingFormValues) {
    const formData = new FormData();

    formData.append(
      "data",
      JSON.stringify({
        ...values,
        images: undefined,
        tyreType: values.tyresIncluded ? values.tyreType : undefined,
      }),
    );
    values.images.forEach((image) => formData.append("images", image));

    try {
      const response = await fetch("/api/listings", { method: "POST", body: formData });
      const body = (await response.json()) as { message?: string };

      if (!response.ok) throw new Error(body.message || "Unable to create your listing.");
      router.push("/account/listings?created=true");
      router.refresh();
    } catch (error) {
      setError("root.server", {
        message: error instanceof Error ? error.message : "Unable to create your listing.",
      });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      <section className="rounded-xl border border-neutral bg-white p-5 shadow-sm sm:p-7">
        <SectionHeading
          number="1"
          title="Images"
          description="Add clear photos from multiple angles. The first image will be your cover photo."
        />

        <Controller
          name="images"
          control={control}
          rules={{
            validate: (files) => {
              if (files.length < 1) return "Add at least one image.";
              if (files.length > 8) return "You can upload up to 8 images.";
              if (files.some((file) => !acceptedImageTypes.includes(file.type))) {
                return "Images must be JPG, PNG, or WebP files.";
              }
              if (files.some((file) => file.size > maxImageSize)) {
                return "Each image must be 10 MB or smaller.";
              }
              return true;
            },
          }}
          render={() => (
            <div>
              <label
                htmlFor="listing-images"
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  addImages(Array.from(event.dataTransfer.files));
                }}
                className="flex cursor-pointer flex-col items-center rounded-xl border-2 border-dashed border-neutral p-8 text-center transition hover:border-primary hover:bg-primary-light/30"
              >
                <svg className="mb-3 size-9 text-primary" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5M5 13v5a2 2 0 002 2h10a2 2 0 002-2v-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="font-semibold text-neutral-dark">Drop images here or click to browse</span>
                <span className="mt-1 text-sm text-neutral-dark/60">JPG, PNG or WebP · up to 8 images · 10 MB each</span>
              </label>
              <input
                id="listing-images"
                type="file"
                accept={acceptedImageTypes.join(",")}
                multiple
                className="sr-only"
                onChange={(event) => {
                  addImages(Array.from(event.target.files ?? []));
                  event.target.value = "";
                }}
              />
            </div>
          )}
        />
        <ErrorMessage message={errors.images?.message} />

        {images.length > 0 && (
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {images.map((file, index) => (
              <div key={`${file.name}-${file.size}-${file.lastModified}-${index}`} className="relative">
                <ImagePreview file={file} onRemove={() => removeImage(index)} />
                {index === 0 && (
                  <span className="absolute bottom-2 left-2 rounded bg-white/90 px-2 py-1 text-xs font-bold text-neutral-dark">
                    Cover
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-xl border border-neutral bg-white p-5 shadow-sm sm:p-7">
        <SectionHeading number="2" title="Meta information" description="Tell buyers what you are selling and set the asking price." />
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="title" className={labelClass}>Listing title <span className="text-primary">*</span></label>
            <input
              id="title"
              className={inputClass}
              placeholder="e.g. BBS CH-R 19-inch alloy wheel set"
              {...register("title", {
                required: "Enter a listing title.",
                minLength: { value: 10, message: "Use at least 10 characters." },
                maxLength: { value: 100, message: "Use no more than 100 characters." },
              })}
            />
            <ErrorMessage message={errors.title?.message} />
          </div>

          <div className="sm:col-span-2">
            <div className="flex items-end justify-between gap-4">
              <label htmlFor="description" className={labelClass}>Description <span className="text-primary">*</span></label>
              <span className="mb-1.5 text-xs text-neutral-dark/60">{description.length}/3000</span>
            </div>
            <textarea
              id="description"
              rows={6}
              className={inputClass}
              placeholder="Describe the condition, history, marks or damage, and anything a buyer should know."
              {...register("description", {
                required: "Enter a description.",
                minLength: { value: 30, message: "Use at least 30 characters." },
                maxLength: { value: 3000, message: "Use no more than 3,000 characters." },
              })}
            />
            <ErrorMessage message={errors.description?.message} />
          </div>

          <div>
            <label htmlFor="condition" className={labelClass}>Condition <span className="text-primary">*</span></label>
            <select id="condition" className={inputClass} {...register("condition", { required: "Choose a condition." })}>
              <option value="">Select condition</option>
              <option value="new">New</option>
              <option value="like_new">Like new</option>
              <option value="excellent">Excellent</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="refurbished">Refurbished</option>
            </select>
            <ErrorMessage message={errors.condition?.message} />
          </div>

          <div>
            <label htmlFor="price" className={labelClass}>Price <span className="text-primary">*</span></label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center font-semibold text-neutral-dark/70">£</span>
              <input
                id="price"
                type="number"
                min="0.01"
                max="1000000"
                step="0.01"
                className={`${inputClass} pl-8`}
                {...register("price", {
                  valueAsNumber: true,
                  required: "Enter a price.",
                  min: { value: 0.01, message: "Price must be greater than £0." },
                  max: { value: 1_000_000, message: "Price must be £1,000,000 or less." },
                })}
              />
            </div>
            <ErrorMessage message={errors.price?.message} />
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-neutral bg-white p-5 shadow-sm sm:p-7">
        <SectionHeading number="3" title="Wheel information" description="Accurate specifications help buyers confirm fitment." />

        {optionsError && (
          <div className="mb-5 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800" role="alert">
            {optionsError} Refresh the page to try again.
          </div>
        )}

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label htmlFor="brand" className={labelClass}>Brand <span className="text-primary">*</span></label>
            <select
              id="brand"
              disabled={optionsLoading || Boolean(optionsError)}
              className={inputClass}
              {...register("brand", { required: "Choose a brand." })}
            >
              <option value="">{optionsLoading ? "Loading brands…" : "Select brand"}</option>
              {options.brands.map((brand) => <option key={brand.documentId} value={brand.documentId}>{brand.name}</option>)}
            </select>
            <ErrorMessage message={errors.brand?.message} />
          </div>

          <div>
            <label htmlFor="wheelModel" className={labelClass}>Model <span className="text-primary">*</span></label>
            <input
              id="wheelModel"
              list="wheel-model-options"
              className={inputClass}
              placeholder="e.g. CH-R"
              {...register("wheelModel", {
                required: "Enter the wheel model.",
                maxLength: { value: 100, message: "Use no more than 100 characters." },
              })}
            />
            <datalist id="wheel-model-options">
              {selectedBrandModels.map((model) => <option key={model.id} value={model.name} />)}
            </datalist>
            <ErrorMessage message={errors.wheelModel?.message} />
          </div>

          <div>
            <label htmlFor="partNumber" className={labelClass}>Part number</label>
            <input id="partNumber" className={inputClass} placeholder="If known" {...register("partNumber", { maxLength: 100 })} />
          </div>

          <div>
            <label htmlFor="pcd" className={labelClass}>PCD / bolt pattern <span className="text-primary">*</span></label>
            <select
              id="pcd"
              disabled={optionsLoading || Boolean(optionsError)}
              className={inputClass}
              {...register("pcd", { required: "Choose a PCD / bolt pattern." })}
            >
              <option value="">{optionsLoading ? "Loading patterns…" : "Select PCD"}</option>
              {options.pcds.map((pcd) => <option key={pcd.documentId} value={pcd.documentId}>{pcd.bolts} × {pcd.spacing}</option>)}
            </select>
            <ErrorMessage message={errors.pcd?.message} />
          </div>

          <div>
            <label htmlFor="diameter" className={labelClass}>Diameter (inches) <span className="text-primary">*</span></label>
            <input id="diameter" type="number" min="10" max="30" step="1" className={inputClass} {...register("diameter", { valueAsNumber: true, required: true, min: 10, max: 30 })} />
            <ErrorMessage message={errors.diameter && "Enter a diameter from 10 to 30 inches."} />
          </div>

          <div>
            <label htmlFor="width" className={labelClass}>Width (J) <span className="text-primary">*</span></label>
            <input id="width" type="number" min="3" max="20" step="0.5" className={inputClass} {...register("width", { valueAsNumber: true, required: true, min: 3, max: 20 })} />
            <ErrorMessage message={errors.width && "Enter a width from 3J to 20J."} />
          </div>

          <div>
            <label htmlFor="offset" className={labelClass}>Offset (ET, mm) <span className="text-primary">*</span></label>
            <input id="offset" type="number" min="-100" max="100" step="1" className={inputClass} {...register("offset", { valueAsNumber: true, required: true, min: -100, max: 100 })} />
            <ErrorMessage message={errors.offset && "Enter an offset from -100 to 100 mm."} />
          </div>

          <div>
            <label htmlFor="centreBore" className={labelClass}>Centre bore (mm) <span className="text-primary">*</span></label>
            <input id="centreBore" type="number" min="30" max="150" step="0.1" className={inputClass} {...register("centreBore", { valueAsNumber: true, required: true, min: 30, max: 150 })} />
            <ErrorMessage message={errors.centreBore && "Enter a centre bore from 30 to 150 mm."} />
          </div>

          <div>
            <label htmlFor="construction" className={labelClass}>Construction <span className="text-primary">*</span></label>
            <select id="construction" className={inputClass} {...register("construction", { required: "Choose a construction type." })}>
              <option value="">Select construction</option>
              <option value="cast">Cast</option>
              <option value="flow_formed">Flow formed</option>
              <option value="forged">Forged</option>
            </select>
            <ErrorMessage message={errors.construction?.message} />
          </div>

          <div>
            <label htmlFor="quantity" className={labelClass}>Number of wheels <span className="text-primary">*</span></label>
            <select id="quantity" className={inputClass} {...register("quantity", { valueAsNumber: true, required: true })}>
              <option value="1">1 wheel</option>
              <option value="2">2 wheels</option>
              <option value="3">3 wheels</option>
              <option value="4">4 wheels</option>
            </select>
          </div>

          <div>
            <label htmlFor="finish" className={labelClass}>Colour / finish</label>
            <input id="finish" className={inputClass} placeholder="e.g. Satin black" {...register("finish", { maxLength: 100 })} />
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-neutral bg-white p-5 shadow-sm sm:p-7">
        <SectionHeading number="4" title="Tyres" description="Let buyers know whether tyres are included with the wheels." />
        <label className="flex cursor-pointer items-center justify-between gap-5 rounded-lg border border-neutral p-4">
          <span>
            <span className="block font-semibold text-neutral-dark">Tyres included</span>
            <span className="mt-0.5 block text-sm text-neutral-dark/60">The listing price includes the fitted tyres.</span>
          </span>
          <input type="checkbox" className="size-5 accent-primary" {...register("tyresIncluded")} />
        </label>

        {tyresIncluded && (
          <fieldset className="mt-5">
            <legend className={labelClass}>Tyre type <span className="text-primary">*</span></legend>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ["budget", "Budget"],
                ["mid_range", "Mid-range"],
                ["premium", "Premium"],
              ].map(([value, label]) => (
                <label key={value} className="flex cursor-pointer items-center gap-3 rounded-lg border border-neutral p-4 has-checked:border-primary has-checked:bg-primary-light/30">
                  <input type="radio" value={value} className="size-4 accent-primary" {...register("tyreType", { required: "Choose a tyre type." })} />
                  <span className="font-semibold">{label}</span>
                </label>
              ))}
            </div>
            <ErrorMessage message={errors.tyreType?.message} />
          </fieldset>
        )}
      </section>

      <section className="rounded-xl border border-neutral bg-white p-5 shadow-sm sm:p-7">
        <SectionHeading number="5" title="Other information" description="Add any remaining details that may help a buyer." />
        <div className="flex items-end justify-between gap-4">
          <label htmlFor="otherInformation" className={labelClass}>Additional notes</label>
          <span className="mb-1.5 text-xs text-neutral-dark/60">{otherInformation.length}/1500</span>
        </div>
        <textarea
          id="otherInformation"
          rows={5}
          className={inputClass}
          placeholder="Collection details, included accessories, vehicle fitment, or anything else worth mentioning."
          {...register("otherInformation", { maxLength: { value: 1500, message: "Use no more than 1,500 characters." } })}
        />
        <ErrorMessage message={errors.otherInformation?.message} />
      </section>

      {errors.root?.server?.message && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm font-medium text-red-800" role="alert">
          {errors.root.server.message}
        </div>
      )}

      <div className="flex flex-col-reverse items-stretch justify-end gap-3 border-t border-neutral pt-6 sm:flex-row sm:items-center">
        <Link href="/account/listings" className="btn text-center text-neutral-dark hover:bg-neutral-light">Cancel</Link>
        <button type="submit" disabled={isSubmitting || optionsLoading || Boolean(optionsError)} className="btn btn-primary disabled:cursor-not-allowed disabled:opacity-60">
          {isSubmitting ? "Creating listing…" : "Create listing"}
        </button>
      </div>
    </form>
  );
}
