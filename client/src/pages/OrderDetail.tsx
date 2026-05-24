import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/lib/trpc";
import { CheckCircle, Clock, Loader2, MapPin, Package, Truck } from "lucide-react";
import { useParams } from "wouter";
import MainLayout from "@/components/MainLayout";
import BackToHome from "@/components/BackToHome";
import { useLanguage } from "@/contexts/LanguageContext";
import { t, translations } from "@/lib/i18n";
import CheckoutStepper from "@/components/CheckoutStepper";

const statusOrder = ["pending", "processing", "shipped", "delivered", "cancelled"];

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700 border-amber-200",
    processing: "bg-blue-100 text-blue-700 border-blue-200",
    shipped: "bg-purple-100 text-purple-700 border-purple-200",
    delivered: "bg-green-100 text-green-700 border-green-200",
    cancelled: "bg-red-100 text-red-700 border-red-200",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${variants[status] ?? ""}`}>
      {status}
    </span>
  );
}

export default function OrderDetail() {
  const { lang } = useLanguage();
  const o = translations.orderDetailPage;

  // Build translated status steps inside the component so they react to lang changes
  const statusSteps = [
    { key: "pending",    label: t(o.stepOrderPlaced, lang), icon: Clock },
    { key: "processing", label: t(o.stepProcessing,  lang), icon: Package },
    { key: "shipped",    label: t(o.stepShipped,     lang), icon: Truck },
    { key: "delivered",  label: t(o.stepDelivered,   lang), icon: CheckCircle },
  ];

  const params = useParams<{ orderNumber: string }>();
  const { data: order, isLoading } = trpc.orders.getByNumber.useQuery(
    { orderNumber: params.orderNumber ?? "" },
    { enabled: !!params.orderNumber, refetchInterval: 10000 }
  );

  if (isLoading) {
    return (
      <MainLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  if (!order) {
    return (
      <MainLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 text-center p-6">
          <Package className="h-12 w-12 text-muted-foreground" />
          <div>
            <h2 className="font-serif text-2xl font-semibold mb-2">{t(o.notFoundTitle, lang)}</h2>
            <p className="text-muted-foreground">{t(o.notFoundDesc, lang)}</p>
          </div>
          <BackToHome />
        </div>
      </MainLayout>
    );
  }

  const currentStepIndex = statusOrder.indexOf(order.status);

  return (
    <MainLayout>
      <div className="py-12">
        <div className="container max-w-3xl">
          <BackToHome className="mb-8" />

          <CheckoutStepper
            currentStep="confirmation"
            labels={{
              checkout: t(translations.checkout.title, lang),
              payment: t(translations.checkout.payment, lang),
              confirmation: t(translations.checkout.confirmation, lang),
            }}
          />

          <div className="mb-8">
            <div className="gold-line mb-4" />
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="font-serif text-3xl font-light text-foreground mb-1">{t(o.title, lang)}</h1>
                <p className="text-muted-foreground text-sm">#{order.orderNumber}</p>
              </div>
              <div className="text-right">
                <StatusBadge status={order.status} />
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(order.createdAt).toLocaleDateString("en-ID", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Progress Tracker */}
          {order.status !== "cancelled" && (
            <div className="bg-card rounded-xl border border-border/60 p-6 mb-6">
              <h2 className="font-semibold text-foreground mb-6">{t(o.orderProgress, lang)}</h2>
              <div className="relative">
                <div className="absolute top-5 left-5 right-5 h-0.5 bg-border" />
                <div
                  className="absolute top-5 left-5 h-0.5 bg-primary transition-all duration-500"
                  style={{
                    width: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%`,
                    right: "auto",
                  }}
                />
                <div className="relative flex justify-between">
                  {statusSteps.map((step, i) => {
                    const isCompleted = i < currentStepIndex;
                    const isCurrent = i === currentStepIndex;
                    const Icon = step.icon;
                    return (
                      <div key={step.key} className="flex flex-col items-center gap-2">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all z-10 ${
                            isCompleted
                              ? "bg-primary border-primary"
                              : isCurrent
                              ? "bg-primary/10 border-primary"
                              : "bg-background border-border"
                          }`}
                        >
                          <Icon
                            className={`h-4 w-4 ${
                              isCompleted
                                ? "text-primary-foreground"
                                : isCurrent
                                ? "text-primary"
                                : "text-muted-foreground"
                            }`}
                          />
                        </div>
                        <span
                          className={`text-xs font-medium text-center ${
                            isCurrent ? "text-primary" : isCompleted ? "text-foreground" : "text-muted-foreground"
                          }`}
                        >
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Payment Status */}
          <div className="bg-card rounded-xl border border-border/60 p-5 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-0.5">{t(o.paymentStatus, lang)}</p>
                <StatusBadge status={order.paymentStatus} />
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground mb-0.5">{t(o.paymentMethod, lang)}</p>
                <p className="text-sm font-medium capitalize">{order.paymentMethod.replace("_", " ")}</p>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="bg-card rounded-xl border border-border/60 p-6 mb-6">
            <h2 className="font-semibold text-foreground mb-4">{t(o.itemsOrdered, lang)}</h2>
            <div className="space-y-3">
              {(order as any).items?.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md bg-muted/50 flex items-center justify-center">
                      <Package className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.productName}</p>
                      <p className="text-xs text-muted-foreground">{t(o.qty, lang)}: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="text-sm font-medium">IDR {Number(item.subtotal).toLocaleString("id-ID")}</span>
                </div>
              ))}
            </div>
            <Separator className="my-4" />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>{t(o.subtotal, lang)}</span>
                <span>IDR {Number(order.subtotal).toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>{t(o.shipping, lang)} ({order.shippingType})</span>
                <span>IDR {Number(order.shippingCost).toLocaleString("id-ID")}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-semibold text-foreground text-base">
                <span>{t(o.total, lang)}</span>
                <span>IDR {Number(order.total).toLocaleString("id-ID")}</span>
              </div>
            </div>
          </div>

          {/* Addresses */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="bg-card rounded-xl border border-border/60 p-5">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-sm">{t(o.billingAddress, lang)}</h3>
              </div>
              <div className="text-sm text-muted-foreground space-y-0.5">
                <p className="font-medium text-foreground">{order.customerName}</p>
                <p>{order.streetAddress}{order.aptNumber ? `, ${order.aptNumber}` : ""}</p>
                <p>{order.city}, {order.province} {order.postalCode}</p>
                <p>{order.country}</p>
                <p className="mt-1">{order.customerPhone}</p>
              </div>
            </div>
            <div className="bg-card rounded-xl border border-border/60 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Truck className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-sm">{t(o.shippingAddress, lang)}</h3>
              </div>
              <div className="text-sm text-muted-foreground space-y-0.5">
                <p>{order.shippingStreet}{order.shippingApt ? `, ${order.shippingApt}` : ""}</p>
                <p>{order.shippingCity}, {order.shippingProvince} {order.shippingPostal}</p>
                <p>{order.shippingCountry}</p>
              </div>
            </div>
          </div>

          <BackToHome />
        </div>
      </div>
    </MainLayout>
  );
}
