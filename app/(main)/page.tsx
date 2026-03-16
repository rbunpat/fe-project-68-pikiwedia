"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MassageShop, MassagesResponse } from "@/interface";
import { apiBaseUrl } from "@/lib/config";

export default function Home() {
  const router = useRouter();
  const [shops, setShops] = useState<MassageShop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    const fetchMassages = async () => {
      setIsLoading(true);
      setLoadError(null);

      try {
        const response = await fetch(`${apiBaseUrl}/api/massages?sort=-averageRating&limit=60`);

        if (!response.ok) {
          throw new Error("Unable to fetch massage shops.");
        }

        const payload = (await response.json()) as MassagesResponse;
        setShops(payload.data ?? []);
      } catch {
        setLoadError("We could not load massage shops right now. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMassages();
  }, []);

  const featuredShops = useMemo(() => shops.slice(0, 3), [shops]);

  const dropdownResults = useMemo(() => {
    const query = searchInput.trim().toLowerCase();

    if (!query) {
      return [];
    }

    return shops
      .filter((shop) => {
      const searchTarget = `${shop.name} ${shop.address} ${shop.district} ${shop.province}`.toLowerCase();
      return searchTarget.includes(query);
      })
      .slice(0, 5);
  }, [shops, searchInput]);

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const query = searchInput.trim();
    if (!query) {
      return;
    }

    router.push(`/massage-shops/searchresult?q=${encodeURIComponent(query)}`);
  };

  return (
    <>
      <section className="relative h-[95vh] min-h-[85vh] items-center overflow-hidden px-6 py-20 lg:px-20">
        <div className="absolute inset-0 z-0">
          <img
            alt="Minimal spa environment with calming colors and soft textures"
            // fill
            className="h-full w-full object-cover"
            src="https://img.rachatat.com/insecure/rs:fill:1200/plain/https://fe-storage.rachatat.com/home-banner-2.jpg"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-linear-to-r from-background via-background/40 to-transparent" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <h1 className="mb-6 font-headline text-5xl font-bold leading-tight text-on-surface lg:text-7xl">
            Your Journey to <span className="italic text-primary">Stillness</span> Begins Here.
          </h1>
          <p className="mb-10 max-w-lg text-lg leading-relaxed text-on-surface-variant">
            Discover curated sanctuary spaces designed to restore your rhythm and revitalize your spirit.
            Hand-picked therapists, ethereal environments.
          </p>

          <div className="relative max-w-xl">
            <form
              onSubmit={handleSearchSubmit}
              className="flex flex-col gap-2 rounded-xl bg-surface-container-lowest p-2 shadow-[0_8px_32px_rgb(26_28_24/0.05)] md:flex-row"
            >
              <div className="flex flex-1 items-center rounded-lg bg-surface-container-low px-4 py-3 transition-all focus-within:bg-surface-container-lowest focus-within:ring-1 focus-within:ring-outline-variant/40">
                <span className="mr-3 text-outline">
                  <Image width={20} height={20} src="/search.svg" alt="Search" />
                </span>
                <input
                  className="w-full border-none bg-transparent text-sm placeholder:text-outline focus:ring-0"
                  placeholder="Location or treatment..."
                  type="text"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                />
              </div>
              <button
                type="submit"
                className="rounded-lg bg-primary px-8 py-4 text-sm font-bold tracking-wide text-on-primary transition-colors hover:bg-primary-container"
              >
                Explore Treatments
              </button>
            </form>

            {searchInput.trim() ? (
              <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-20 overflow-hidden rounded-xl bg-surface-container-lowest shadow-[0_8px_32px_rgb(26_28_24/0.1)]">
                {isLoading ? (
                  <p className="px-4 py-3 text-sm text-on-surface-variant">Searching...</p>
                ) : loadError ? (
                  <p className="px-4 py-3 text-sm text-on-error-container">Unable to load search results.</p>
                ) : dropdownResults.length === 0 ? (
                  <p className="px-4 py-3 text-sm text-on-surface-variant">No matching shops found.</p>
                ) : (
                  <ul className="divide-y divide-surface-container-high">
                    {dropdownResults.map((shop) => (
                      <li key={shop._id}>
                        <Link
                          href={`/massage-shops/${shop._id}`}
                          className="flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-surface-container-low"
                        >
                          <div>
                            <p className="text-sm font-semibold text-on-surface">{shop.name}</p>
                            <p className="text-xs text-on-surface-variant">{shop.district}, {shop.province}</p>
                          </div>
                          <span className="text-xs font-bold text-primary">{shop.averageRating.toFixed(1)}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="border-t border-surface-container-high px-4 py-3">
                  <Link
                    href={`/massage-shops/searchresult?q=${encodeURIComponent(searchInput.trim())}`}
                    className="inline-flex items-center text-sm font-bold text-primary transition-colors hover:text-primary-container"
                  >
                    See more
                  </Link>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="bg-surface px-6 py-24 lg:px-20">
        <div className="mb-16 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="space-y-4">
            <h2 className="font-headline text-4xl font-bold text-on-surface">Featured Shops</h2>
            <p className="max-w-md text-on-surface-variant">
              The top rated massage shops, rated by our users. Handpicked for quality, ambiance, and unforgettable experiences.
            </p>
          </div>
        </div>

        {isLoading ? (
          <p className="text-on-surface-variant">Loading massage shops...</p>
        ) : loadError ? (
          <p className="rounded-xl bg-error-container px-4 py-3 text-sm text-on-error-container">{loadError}</p>
        ) : featuredShops.length === 0 ? (
          <div className="rounded-xl bg-surface-container-low p-6 text-on-surface-variant">
            No massage shops available right now.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {featuredShops.map((shop) => (
              <Link href={`/massage-shops/${shop._id}`} key={shop._id}>
                <div className="group translate-y-0 overflow-hidden rounded-xl bg-surface-container-lowest shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-xl">
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
                        <Image width={14} height={14} src="/star.svg" alt="Star" />
                      </span>
                      <span className="text-sm font-bold">{shop.averageRating}</span>
                    </div>
                  </div>

                  <div className="p-8">
                    <h3 className="mb-1 text-xl font-bold transition-colors group-hover:text-primary">{shop.name}</h3>
                    <p className="flex items-center gap-1 text-sm text-on-surface-variant">
                      <span>
                        <Image width={14} height={14} src="/map-pin.svg" alt="Map pin" />
                      </span>
                      {shop.address}
                    </p>

                    <div className="mt-6 flex items-center justify-between pt-6">
                      <div>
                        <span className="mb-1 block text-xs uppercase tracking-wider text-outline">Starting from</span>
                        <span className="font-headline text-2xl font-bold text-primary">
                          {shop.price.toLocaleString()} Baht
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
