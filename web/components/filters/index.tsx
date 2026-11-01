"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Search from "@/components/search";

export default function Filters() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const includesTyres = searchParams.get("tyresIncluded") === "true";
    const diameter = searchParams.get("diameter") ?? "";

    function updateFilter(name: string, value?: string) {
        const nextParams = new URLSearchParams(searchParams.toString());

        if (value) {
            nextParams.set(name, value);
        } else {
            nextParams.delete(name);
        }

        const query = nextParams.toString();
        router.replace(`${pathname}${query ? `?${query}` : ""}`, { scroll: false });
    }

    return (
        <div className="flex flex-row justify-center items-center *:px-4 bg-white/80 backdrop-blur-3xl divide-x divide-neutral-light px-6 py-2 rounded-full">
            <div className="flex flex-row justify-start items-center gap-2">
                <label className="font-semibold text-sm" htmlFor="filter-tyres">Includes tyres</label>
                <input
                    id="filter-tyres"
                    type="checkbox"
                    checked={includesTyres}
                    onChange={(event) =>
                        updateFilter("tyresIncluded", event.target.checked ? "true" : undefined)
                    }
                />
            </div>
            <div className="flex flex-row justify-start items-center gap-2">
                <label className="font-semibold text-sm" htmlFor="filter-diameter">Size</label>
                <select
                    id="filter-diameter"
                    value={diameter}
                    onChange={(event) => updateFilter("diameter", event.target.value || undefined)}
                >
                    <option value="">Any size</option>
                    <option value="17">17″</option>
                    <option value="18">18″</option>
                    <option value="19">19″</option>
                    <option value="20">20″</option>
                    <option value="21">21″</option>
                    <option value="22">22″</option>
                </select>
            </div>
            <div className="flex flex-row justify-start items-center gap-2">
                <Search />
            </div>
        </div>
    );
}
