"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  images: any[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="aspect-[4/5] bg-muted w-full flex items-center justify-center">
        No image available
      </div>
    );
  }

  const activeImage = images[activeIndex];

  return (
    <div className="flex flex-col-reverse md:flex-row gap-4">
      {/* Thumbnails */}
      <div className="flex md:flex-col gap-3 overflow-x-auto md:w-24 shrink-0 pb-2 md:pb-0 hide-scrollbar">
        {images.map((image, idx) => (
          <button
            key={image.id || idx}
            onClick={() => setActiveIndex(idx)}
            className={cn(
              "relative aspect-[4/5] w-20 md:w-full overflow-hidden bg-muted flex-shrink-0 transition-all",
              activeIndex === idx ? "ring-2 ring-primary ring-offset-2" : "opacity-70 hover:opacity-100"
            )}
          >
            <Image
              src={image.url}
              alt={`${productName} thumbnail ${idx + 1}`}
              fill
              className="object-cover"
              sizes="100px"
            />
          </button>
        ))}
      </div>

      {/* Main Image */}
      <div className="relative aspect-[4/5] w-full bg-muted overflow-hidden">
        <Image
          src={activeImage.url}
          alt={activeImage.alt_text || productName}
          fill
          className="object-cover"
          sizes="(min-width: 768px) 50vw, 100vw"
          priority
        />
      </div>
    </div>
  );
}
