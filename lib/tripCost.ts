import type { Offer } from "@/lib/offers";

export type TripCostEstimate = {
  offer: number;
  baggage: number;
  transfer: number;
  localTransport: number;
  foodAndSpending: number;
  total: number;
  note: string;
};

export function estimateTripCost(offer: Offer, displayPrice = offer.price): TripCostEstimate {
  const nights = Math.max(1, offer.nights || 1);
  const baggage = offer.baggageIncluded ? 0 : nights <= 4 ? 120 : 220;
  const transfer = offer.transferIncluded ? 0 : 100;
  const localTransport = Math.max(60, nights * 35);
  const board = (offer.board || "").toLowerCase();
  const foodPerDay = board.includes("all inclusive") ? 45 : board.includes("śniad") ? 110 : 160;
  const foodAndSpending = nights * foodPerDay;
  const total = displayPrice + baggage + transfer + localTransport + foodAndSpending;

  return {
    offer: displayPrice,
    baggage,
    transfer,
    localTransport,
    foodAndSpending,
    total,
    note: "Szacunek Tripowni na 1 osobę. Finalny koszt zależy od terminu, bagażu i stylu wydawania.",
  };
}
