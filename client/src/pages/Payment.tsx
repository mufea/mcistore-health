import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/lib/trpc";
import { Building2, CheckCircle, Clock3, Copy, CreditCard, ExternalLink, Loader2, RefreshCw } from "lucide-react";
import { useParams, useSearch, useLocation } from "wouter";
import { useState, useEffect } from "react";
import MainLayout from "@/components/MainLayout";
import BackToHome from "@/components/BackToHome";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { t, translations } from "@/lib/i18n";
import CheckoutStepper from "@/components/CheckoutStepper";
import { formatReservationCountdown, isReservationNearExpiry, remainingReservationMs, reservationProgressPercent } from "@/lib/reservationTimer";

declare global {
  interface Window {
    snap: {
      pay: (token: string, options: {
        onSuccess?: (result: any) => void;
        onPending?: (result: any) => void;
        onError?: (result: any) => void;
        onClose?: () => void;
      }) => void;
    };
  }
}

export default function Payment() {
  const { lang } = useLanguage();
  const params = useParams<{ orderNumber: string }>();
  const search = useSearch();
  const [, navigate] = useLocation();
  const searchParams = new URLSearchParams(search);
  const method = searchParams.get("method") as "bank_transfer" | "midtrans";

  const { data: order, refetch } = trpc.orders.getByNumber.useQuery(
    { orderNumber: params.orderNumber ?? "" },
    { enabled: !!params.orderNumber }
  );

  const { data: settings } = trpc.settings.getPublic.useQuery();
  const createTokenMutation = trpc.payment.createMidtransToken.useMutation();
  const { data: paymentStatus, refetch: refetchStatus } = trpc.payment.checkStatus.useQuery(
    { orderNumber: params.orderNumber ?? "" },
    { enabled: !!params.orderNumber, refetchInterval: 5000 }
  );

  const [midtransLoaded, setMidtransLoaded] = useState(false);
  const [paymentInitiated, setPaymentInitiated] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const reservationExpiresAt = order?.reservationExpiresAt ?? null;
  const reservationActive = order?.reservationStatus === "active" && Boolean(reservationExpiresAt);
  const reservationRemaining = remainingReservationMs(reservationExpiresAt, now);
  const reservationExpired = reservationActive && reservationRemaining === 0;
  const reservationProgress = reservationProgressPercent(reservationRemaining);
  const reservationNearExpiry = isReservationNearExpiry(reservationRemaining);
  const reservationProgressColor = reservationNearExpiry ? "bg-red-500" : "bg-amber-500";

  useEffect(() => {
    if (!reservationActive || reservationExpired) return;
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 1_000);
    return () => window.clearInterval(timer);
  }, [reservationActive, reservationExpired, reservationExpiresAt]);

  useEffect(() => {
    if (reservationExpired) setPaymentInitiated(false);
  }, [reservationExpired]);

  // Load Midtrans Snap script
  useEffect(() => {
    if (method !== "midtrans") return;
    const scriptId = "midtrans-snap";
    if (document.getElementById(scriptId)) {
      setMidtransLoaded(true);
      return;
    }
    const script = document.createElement("script");
    script.id = scriptId;
    script.src = settings?.midtransIsProduction
      ? "https://app.midtrans.com/snap/snap.js"
      : "https://app.sandbox.midtrans.com/snap/snap.js";
    script.setAttribute("data-client-key", settings?.midtransClientKey ?? "");
    script.onload = () => setMidtransLoaded(true);
    document.head.appendChild(script);
  }, [method, settings]);

  const handleMidtransPayment = async () => {
    if (!params.orderNumber) return;
    try {
      const result = await createTokenMutation.mutateAsync({ orderNumber: params.orderNumber });
      setPaymentInitiated(true);
      window.snap.pay(result.token, {
        onSuccess: () => {
          toast.success(t(translations.toast.paymentSuccess, lang));
          navigate(`/order/${params.orderNumber}`);
        },
        onPending: () => {
          toast.info(t(translations.toast.paymentPending, lang));
          refetchStatus();
        },
        onError: () => {
          toast.error(t(translations.toast.paymentFailed, lang));
        },
        onClose: () => {
          setPaymentInitiated(false);
          refetchStatus();
        },
      });
    } catch (err: any) {
      toast.error(err.message ?? t(translations.toast.paymentInitFailed, lang));
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(t(translations.toast.copiedToClipboard, lang));
  };

  if (!order) {
    return (
      <MainLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  const isPaid = paymentStatus?.paymentStatus === "paid";

  if (isPaid) {
    return (
      <MainLayout>
        <div className="min-h-[70vh] flex flex-col items-center justify-center gap-8 text-center p-6">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center animate-slide-up">
            <CheckCircle className="h-10 w-10 text-primary" />
          </div>
          <div className="animate-slide-up" style={{ animationDelay: "100ms" }}>
            <div className="gold-line mx-auto mb-4" />
            <h2 className="font-serif text-3xl font-light mb-3">Payment Confirmed!</h2>
            <p className="text-muted-foreground max-w-sm">
              Your payment has been confirmed. Your order <strong>{params.orderNumber}</strong> is now being processed.
            </p>
          </div>
          <div className="flex gap-3 animate-slide-up" style={{ animationDelay: "200ms" }}>
            <Button
              className="bg-primary text-primary-foreground"
              onClick={() => navigate(`/order/${params.orderNumber}`)}
            >
              Track My Order
            </Button>
            <BackToHome />
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="py-12">
        <div className="container max-w-2xl">
          <BackToHome className="mb-8" />

          <div className="mb-8">
            <div className="gold-line mb-4" />
            <h1 className="font-serif text-3xl font-light text-foreground mb-1">Complete Your Payment</h1>
            <p className="text-muted-foreground text-sm">Order #{params.orderNumber}</p>
          </div>

          {reservationActive && !reservationExpired && (
            <div className={`mb-5 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 ${reservationNearExpiry ? "reservation-near-expiry" : ""}`}>
              <Clock3 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <div>
                <p>{t(translations.checkout.reservationNotice, lang)}</p>
                <p className="mt-1 font-semibold tabular-nums" aria-label={`${t(translations.checkout.reservationTimeLeft, lang)}: ${formatReservationCountdown(reservationRemaining)}`}>
                  {t(translations.checkout.reservationTimeLeft, lang)}: {formatReservationCountdown(reservationRemaining)}
                </p>
                <div
                  className="mt-2 h-2 w-full overflow-hidden rounded-full bg-amber-200/80"
                  role="progressbar"
                  aria-label={t(translations.checkout.reservationTimeLeft, lang)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={reservationProgress}
                >
                  <div
                    className={`reservation-progress-fill h-full rounded-full ${reservationProgressColor} ${reservationNearExpiry ? "reservation-progress-near-expiry" : ""}`}
                    style={{ width: `${reservationProgress}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {reservationExpired && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
              <p>{t(translations.checkout.reservationExpired, lang)}</p>
              <Button className="mt-3" size="sm" variant="outline" onClick={() => navigate("/checkout")}>
                {t(translations.checkout.returnToCheckout, lang)}
              </Button>
            </div>
          )}

          <CheckoutStepper
            currentStep="payment"
            labels={{
              checkout: t(translations.checkout.title, lang),
              payment: t(translations.checkout.payment, lang),
              confirmation: t(translations.checkout.confirmation, lang),
            }}
          />

          {/* Order Summary Card */}
          <div className="bg-card rounded-xl border border-border/60 p-5 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="font-serif text-2xl font-semibold text-foreground">
                  IDR {Number(order.total).toLocaleString("id-ID")}
                </p>
              </div>
              <Badge
                variant={
                  paymentStatus?.paymentStatus === "paid"
                    ? "default"
                    : paymentStatus?.paymentStatus === "failed"
                    ? "destructive"
                    : "secondary"
                }
                className="capitalize"
              >
                {paymentStatus?.paymentStatus ?? "pending"}
              </Badge>
            </div>
          </div>

          {/* Bank Transfer Instructions */}
          {method === "bank_transfer" && (
            <div className="bg-card rounded-xl border border-border/60 p-6 space-y-5">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="h-5 w-5 text-primary" />
                <h2 className="font-semibold text-foreground">Bank Transfer Instructions</h2>
              </div>

              <div className="bg-muted/40 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Bank Name</p>
                    <p className="font-semibold text-foreground">{settings?.bankTransferBankName ?? "BCA"}</p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Account Number</p>
                    <p className="font-semibold text-foreground text-lg tracking-wider">
                      {settings?.bankTransferAccountNumber ?? "—"}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 text-primary"
                    onClick={() => copyToClipboard(settings?.bankTransferAccountNumber ?? "")}
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Copy
                  </Button>
                </div>
                <Separator />
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Beneficiary Name</p>
                  <p className="font-semibold text-foreground">{settings?.bankTransferBeneficiary ?? "—"}</p>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Transfer Amount (exact)</p>
                    <p className="font-semibold text-foreground text-lg">
                      IDR {Number(order.total).toLocaleString("id-ID")}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 text-primary"
                    onClick={() => copyToClipboard(String(Math.round(Number(order.total))))}
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Copy
                  </Button>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-800 font-medium mb-1">Important Instructions</p>
                <ul className="text-xs text-amber-700 space-y-1 list-disc list-inside">
                  <li>Transfer the exact amount shown above</li>
                  <li>Include your order number <strong>{params.orderNumber}</strong> in the transfer notes</li>
                  <li>Payment will be confirmed within 1-2 business hours</li>
                  <li>You will receive an email confirmation once payment is verified</li>
                </ul>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  className="gap-2 flex-1"
                  onClick={() => { refetch(); refetchStatus(); }}
                >
                  <RefreshCw className="h-4 w-4" />
                  Check Payment Status
                </Button>
                <Button
                  className="bg-primary text-primary-foreground gap-2 flex-1"
                  onClick={() => navigate(`/order/${params.orderNumber}`)}
                >
                  Track Order
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Midtrans Payment */}
          {method === "midtrans" && (
            <div className="bg-card rounded-xl border border-border/60 p-6 space-y-5">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="h-5 w-5 text-primary" />
                <h2 className="font-semibold text-foreground">Online Payment</h2>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                {["Credit Card", "Virtual Account", "QRIS / GoPay"].map((pm) => (
                  <div key={pm} className="bg-muted/40 rounded-lg p-3">
                    <p className="text-xs font-medium text-foreground">{pm}</p>
                  </div>
                ))}
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed">
                Click the button below to open the secure payment portal. You can pay using your preferred method.
              </p>

              <Button
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
                size="lg"
                onClick={handleMidtransPayment}
                disabled={createTokenMutation.isPending || !midtransLoaded || paymentInitiated || reservationExpired}
              >
                {createTokenMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <CreditCard className="h-4 w-4" />
                    Pay Now — IDR {Number(order.total).toLocaleString("id-ID")}
                  </>
                )}
              </Button>

              {!midtransLoaded && (
                <p className="text-xs text-center text-muted-foreground">Loading payment gateway...</p>
              )}

              <div className="flex items-center gap-3 pt-2">
                <Button
                  variant="outline"
                  className="gap-2 flex-1"
                  onClick={() => { refetch(); refetchStatus(); }}
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh Status
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
