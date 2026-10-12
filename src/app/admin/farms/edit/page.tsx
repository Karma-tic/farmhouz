import { Suspense } from "react";
import { FarmEditorPage } from "@/components/admin/FarmEditor";

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-svh" aria-busy="true" />}>
      <FarmEditorPage />
    </Suspense>
  );
}
