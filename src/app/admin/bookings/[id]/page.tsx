import { Suspense } from "react";
import { BookingDetail } from "@/components/admin/BookingDetail";

async function Inner({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <BookingDetail id={id} />;
}

export default function Page({ params }: PageProps<"/admin/bookings/[id]">) {
  return (
    <Suspense fallback={<div className="min-h-svh" aria-busy="true" />}>
      <Inner params={params} />
    </Suspense>
  );
}
