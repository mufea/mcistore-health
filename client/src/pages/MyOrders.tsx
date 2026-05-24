import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { Loader2, Package, ShoppingBag } from "lucide-react";
import { Link } from "wouter";
import MainLayout from "@/components/MainLayout";
import BackToHome from "@/components/BackToHome";
import { useLanguage } from "@/contexts/LanguageContext";
import { t, translations } from "@/lib/i18n";

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700",
    processing: "bg-blue-100 text-blue-700",
    shipped: "bg-purple-100 text-purple-700",
    delivered: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
    paid: "bg-green-100 text-green-700",
    failed: "bg-red-100 text-red-700",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${variants[status] ?? "bg-muted text-muted-foreground"}`}>
      {status}
    </span>
  );
}

export default function MyOrders() {
  const { lang } = useLanguage();
  const m = translations.myOrdersPage;
  const { isAuthenticated } = useAuth();
  const { data: orders, isLoading } = trpc.orders.myOrders.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <MainLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 text-center p-6">
          <ShoppingBag className="h-12 w-12 text-primary" />
          <div>
            <h2 className="font-serif text-2xl font-semibold mb-2">{t(m.signInRequired, lang)}</h2>
            <p className="text-muted-foreground">{t(m.signInDesc, lang)}</p>
          </div>
          <Button
            className="bg-primary text-primary-foreground"
            onClick={() => (window.location.href = getLoginUrl())}
          >
            {t(m.signIn, lang)}
          </Button>
          <BackToHome />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="py-12">
        <div className="container max-w-3xl">
          <BackToHome className="mb-8" />

          <div className="mb-8">
            <div className="gold-line mb-4" />
            <h1 className="font-serif text-3xl font-light text-foreground">{t(m.title, lang)}</h1>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !orders || orders.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Package className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-serif text-xl font-light mb-2">{t(m.noOrders, lang)}</h3>
              <p className="text-muted-foreground text-sm mb-6">{t(m.noOrdersSub, lang)}</p>
              <Button asChild className="bg-primary text-primary-foreground">
                <Link href="/survey">{t(m.takeHealthSurvey, lang)}</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <Link href={`/order/${order.orderNumber}`} key={order.id}>
                  <div className="bg-card rounded-xl border border-border/60 p-5 card-hover cursor-pointer">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-foreground text-sm">{order.orderNumber}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {new Date(order.createdAt).toLocaleDateString("en-ID", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <StatusBadge status={order.status} />
                        <StatusBadge status={order.paymentStatus} />
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <p className="text-sm text-muted-foreground capitalize">
                        {order.paymentMethod.replace("_", " ")} · {order.shippingType}
                      </p>
                      <p className="font-semibold text-foreground text-sm">
                        IDR {Number(order.total).toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
