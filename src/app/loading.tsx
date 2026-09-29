import Loading from "@/components/Loading";

// Auto-shown while the route segment loads — no manual trigger
export default function RouteLoading() {
  return <Loading label="Loading EasyBuy..." variant="full" />;
}