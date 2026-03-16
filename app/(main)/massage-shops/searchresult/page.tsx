"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense, useMemo, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { MassageShop, MassagesResponse } from "@/interface";
import { apiBaseUrl } from "@/lib/config";

function SearchResultContent() {
  const searchParams = useSearchParams();
  const query = (searchParams.get("q") ?? "").trim();

  const [shops, setShops] = useState<MassageShop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMassages = async () => {
      setIsLoading(true);
      setLoadError(null);

      try {
        const response = await fetch(
          `${apiBaseUrl}/api/massages?sort=-averageRating&limit=100`,
        );

        if (!response.ok) {
          throw new Error("Unable to fetch massage shops.");
        }

        const payload = (await response.json()) as MassagesResponse;
        setShops(payload.data ?? []);
      } catch {
        setLoadError(
          "We could not load massage shops right now. Please try again later.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchMassages();
  }, []);

  const results = useMemo(() => {
    const normalized = query.toLowerCase();
    if (!normalized) {
      return [];
    }

    return shops.filter((shop) => {
      const target =
        `${shop.name} ${shop.address} ${shop.district} ${shop.province}`.toLowerCase();
      return target.includes(normalized);
    });
  }, [query, shops]);

  return (
    <section className="bg-surface px-6 py-20 lg:px-20">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/"
          className="mb-6 inline-flex text-sm font-medium text-on-surface-variant hover:text-primary"
        >
          ← Back to Home
        </Link>

        <h1 className="font-headline text-4xl font-bold text-on-surface">
          Search Results
        </h1>
        <p className="mt-2 text-on-surface-variant">
          {query
            ? `Showing results for "${query}"`
            : "Enter a query from the homepage search bar."}
        </p>

        <div className="mt-10">
          {isLoading ? (
            <p className="text-on-surface-variant">Loading massage shops...</p>
          ) : loadError ? (
            <p className="rounded-xl bg-error-container px-4 py-3 text-sm text-on-error-container">
              {loadError}
            </p>
          ) : results.length === 0 ? (
            <div className="rounded-xl bg-surface-container-low p-6 text-on-surface-variant">
              No shops matched your search.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {results.map((shop) => (
                <Link href={`/massage-shops/${shop._id}`} key={shop._id}>
                  <div
                    key={shop.name}
                    className={`group translate-y-0 overflow-hidden rounded-xl bg-surface-container-lowest shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-xl`}
                  >
                    <div className="relative h-64 overflow-hidden">
                      <Image
                        alt={shop.name}
                        fill
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                        src={shop.pictures[0]}
                        sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                      />
                      <div className="absolute right-2 top-4 flex items-center gap-1 rounded-full bg-surface-container-lowest/90 px-3 py-1 backdrop-blur">
                        <span>
                          <img width={14} src="/star.svg" alt="Star" />
                        </span>
                        <span className="text-sm font-bold">
                          {shop.averageRating}
                        </span>
                      </div>
                    </div>

                    <div className="p-8">
                      <h3 className="mb-1 text-xl font-bold transition-colors group-hover:text-primary">
                        {shop.name}
                      </h3>
                      <p className="flex items-center gap-1 text-sm text-on-surface-variant">
                        <span className="material-symbols-outlined text-xs">
                          <img width={14} src="/map-pin.svg" alt="Map Pin" />
                        </span>
                        {shop.address}
                      </p>

                      <div className="mt-6 flex items-center justify-between pt-6">
                        <div>
                          <span className="mb-1 block text-xs uppercase tracking-wider text-outline">
                            Starting from
                          </span>
                          <span className="font-headline text-2xl font-bold text-primary">
                            {shop.price.toLocaleString()} Baht
                          </span>
                        </div>
                        {/* <button className="custom-underline text-sm font-bold text-primary">
                            <Link href={`/shops/${shop._id}/book`}>
                            Book Session
                            </Link>
                        </button> */}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default function SearchResultPage() {
  return (
    <Suspense
      fallback={
        <section className="bg-surface px-6 py-20 lg:px-20">
          <div className="mx-auto max-w-7xl text-on-surface-variant">
            Loading search results...
          </div>
        </section>
      }
    >
      <SearchResultContent />
    </Suspense>
  );
}
