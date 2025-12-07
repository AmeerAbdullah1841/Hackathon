import { Suspense } from "react";
import { SpotThePhishClient } from "./SpotThePhishClient";

export default function SpotThePhishPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading challenge...</div>}>
      <SpotThePhishClient />
    </Suspense>
  );
}
