"use client";

import { Star } from "lucide-react";
import type { PlayerReview } from "@/types/profile";

interface ReviewCardProps {
  review: PlayerReview;
}

export function ReviewCard({ review }: ReviewCardProps) {
  return (
    <div className="rounded-xl border border-brand-border bg-brand-surface p-4">
      <div className="flex items-start gap-3">
        {/* Author avatar */}
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-accent/20 text-sm font-bold text-brand-accent">
          {review.authorName.charAt(0)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-brand-text">
              {review.authorName}
            </span>
            <span className="text-[10px] text-brand-muted">
              {new Date(review.date).toLocaleDateString("pt-BR")}
            </span>
          </div>

          {/* Stars */}
          <div className="mt-1 flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 ${
                  i < review.rating
                    ? "fill-brand-warning text-brand-warning"
                    : "text-white/10"
                }`}
              />
            ))}
          </div>

          {/* Comment */}
          <p className="mt-2 text-[11px] leading-relaxed text-brand-muted">
            {review.comment}
          </p>

          {/* Campaign */}
          <p className="mt-1.5 text-[10px] text-brand-muted/60">
            {review.campaignName}
          </p>
        </div>
      </div>
    </div>
  );
}
