"use client";

import ProductCard from "@/components/productCard";
import { Suspense, useEffect, useState, type ComponentProps } from "react";
import { useSearchParams } from "next/navigation";
import Filters from "@/components/filters";

type SearchResult = ComponentProps<typeof ProductCard> & { id: number };

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.toString();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function getListings() {
      setIsLoading(true);
      setError("");

      try {
        const response = await fetch(`/api/search${query ? `?${query}` : ""}`, {
          signal: controller.signal,
        });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.message ?? "Unable to load search results.");
        }

        if (!controller.signal.aborted) {
          setResults(Array.isArray(payload.data) ? payload.data : []);
        }
      } catch (requestError) {
        if (requestError instanceof Error && requestError.name === "AbortError") {
          return;
        }

        if (!controller.signal.aborted) {
          setResults([]);
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Unable to load search results.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    getListings();

    return () => controller.abort();
  }, [query]);

  return (
    <div className=" ">
      <main>
        {isLoading && (
          <p className="container mt-12" role="status">
            Loading results…
          </p>
        )}
        {error && (
          <p className="container mt-12 text-primary" role="alert">
            {error}
          </p>
        )}
        {!isLoading && !error && results.length === 0 && (
          <p className="container mt-12">No matching listings found.</p>
        )}
        <section className="sticky top-8 left-0  container mt-4 flex flex-col justify-center items-center z-999">
          <Filters />
        </section>

        <section className="container grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-4">
          {results.map((result) => (
            <ProductCard key={result.id} {...result} />
          ))}
        </section>
      </main>
    </div>
  );
}

export default function Search() {
  return (
    <Suspense fallback={<div className="container mt-12">Loading results…</div>}>
      <SearchResults />
    </Suspense>
  );
}
