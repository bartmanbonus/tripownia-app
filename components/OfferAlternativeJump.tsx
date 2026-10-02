"use client";

import { CalendarRange } from "lucide-react";
import styles from "./OfferAlternativeJump.module.css";

export default function OfferAlternativeJump() {
  return (
    <a className={styles.link} href="#alternatywy">
      <CalendarRange size={16} />
      Inny termin lub lotnisko?
    </a>
  );
}
