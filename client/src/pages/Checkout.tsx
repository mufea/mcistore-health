import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import {
  ArrowRight,
  Building2,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Loader2,
  MapPin,
  Minus,
  Package,
  Plus,
  ShoppingBag,
  User,
} from "lucide-react";
import { useSearch, useLocation } from "wouter";
import { useState, useEffect } from "react";
import MainLayout from "@/components/MainLayout";
import BackToHome from "@/components/BackToHome";
import { toast } from "sonner";

interface Address {
  street: string;
  apt: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
}

const emptyAddress: Address = { street: "", apt: "", city: "", province: "", postalCode: "", country: "" };

// ─── Reusable address form ────────────────────────────────────────────────────
function AddressFields({
  addr,
  onChange,
  prefix,
}: {
  addr: Address;
  onChange: (field: keyof Address, value: string) => void;
  prefix: string;
}) {
  return (
    <div className="space-y-4">
      {/* Street — full width */}
      <div>
        <Label htmlFor={`${prefix}-street`} className="text-sm font-medium mb-1.5 block">
          Street Address <span className="text-destructive">*</span>
        </Label>
        <Input
          id={`${prefix}-street`}
          value={addr.street}
          onChange={(e) => onChange("street", e.target.value)}
          placeholder="e.g. Jl. Sudirman No. 123"
          className="h-11 text-base"
        />
      </div>

      {/* Apt — full width on mobile, half on sm+ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor={`${prefix}-apt`} className="text-sm font-medium mb-1.5 block">
            House / Apt Number
          </Label>
          <Input
            id={`${prefix}-apt`}
            value={addr.apt}
            onChange={(e) => onChange("apt", e.target.value)}
            placeholder="e.g. Unit 4B"
            className="h-11 text-base"
          />
        </div>
        <div>
          <Label htmlFor={`${prefix}-city`} className="text-sm font-medium mb-1.5 block">
            City <span className="text-destructive">*</span>
          </Label>
          <Input
            id={`${prefix}-city`}
            value={addr.city}
            onChange={(e) => onChange("city", e.target.value)}
            placeholder="e.g. Jakarta"
            className="h-11 text-base"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-1">
          <Label htmlFor={`${prefix}-province`} className="text-sm font-medium mb-1.5 block">
            Province / State <span className="text-destructive">*</span>
          </Label>
          <Input
            id={`${prefix}-province`}
            value={addr.province}
            onChange={(e) => onChange("province", e.target.value)}
            placeholder="e.g. DKI Jakarta"
            className="h-11 text-base"
          />
        </div>
        <div>
          <Label htmlFor={`${prefix}-postal`} className="text-sm font-medium mb-1.5 block">
            Postal Code <span className="text-destructive">*</span>
          </Label>
          <Input
            id={`${prefix}-postal`}
            value={addr.postalCode}
            onChange={(e) => onChange("postalCode", e.target.value)}
            placeholder="e.g. 10220"
            className="h-11 text-base"
          />
        </div>
        <div>
          <Label htmlFor={`${prefix}-country`} className="text-sm font-medium mb-1.5 block">
            Country <span className="text-destructive">*</span>
          </Label>
          <Input
            id={`${prefix}-country`}
            value={addr.country}
            onChange={(e) => onChange("country", e.target.value)}
            placeholder="e.g. Indonesia"
            className="h-11 text-base"
          />
        </div>
      </div>
    </div>
  );
}

// ─── Section card wrapper ─────────────────────────────────────────────────────
function SectionCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-card rounded-xl border border-border/60 p-5 sm:p-6 ${className}`}>
      {children}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function Checkout() {
  const search = useSearch();
  const [, navigate] = useLocation();
  const params = new URLSearchParams(search);
  const productIds = params.get("products")?.split(",").map(Number).filter(Boolean) ?? [];
  const segment = (params.get("segment") as "standard" | "premium" | "vip") ?? "standard";

  const { user, isAuthenticated } = useAuth();
  const { data: settings } = trpc.settings.getPublic.useQuery();
  const { data: profile } = trpc.userProfile.get.useQuery(undefined, { enabled: isAuthenticated });
  const [profileAddressApplied, setProfileAddressApplied] = useState(false);

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState((user as any)?.phone ?? "");
  const [userAddress, setUserAddress] = useState<Address>(emptyAddress);
  const [shippingAddress, setShippingAddress] = useState<Address>(emptyAddress);
  const [sameAsUser, setSameAsUser] = useState(true);
  const [shippingType, setShippingType] = useState<"national" | "international">("national");
  const [paymentMethod, setPaymentMethod] = useState<"bank_transfer" | "midtrans">("bank_transfer");
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [summaryOpen, setSummaryOpen] = useState(false); // mobile order summary toggle

  const { data: allProducts } = trpc.products.list.useQuery({ segment });
  const createOrderMutation = trpc.orders.create.useMutation();

  const selectedProducts = (allProducts ?? []).filter((p) => productIds.includes(p.id));

  // Pre-fill personal info from session
  useEffect(() => {
    if (user) {
      setName(user.name ?? "");
      setEmail(user.email ?? "");
      setPhone((user as any).phone ?? "");
    }
  }, [user]);

  // Pre-fill billing address from saved profile
  useEffect(() => {
    if (profile && !profileAddressApplied) {
      if (profile.phone && !(user as any)?.phone) setPhone(profile.phone ?? "");
      if (profile.streetAddress) {
        setUserAddress({
          street: profile.streetAddress ?? "",
          apt: profile.aptNumber ?? "",
          city: profile.city ?? "",
          province: profile.province ?? "",
          postalCode: profile.postalCode ?? "",
          country: profile.country ?? "",
        });
        setProfileAddressApplied(true);
      }
    }
  }, [profile, profileAddressApplied]);

  useEffect(() => {
    const qty: Record<number, number> = {};
    productIds.forEach((id) => { qty[id] = 1; });
    setQuantities(qty);
  }, []);

  // ── Unauthenticated gate ────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <MainLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 text-center p-6">
          <ShoppingBag className="h-12 w-12 text-primary" />
          <div>
            <h2 className="font-serif text-2xl font-semibold mb-2">Sign In Required</h2>
            <p className="text-muted-foreground">Please sign in to complete your purchase.</p>
          </div>
          <Button
            size="lg"
            className="bg-primary text-primary-foreground h-12 px-8"
            onClick={() => (window.location.href = getLoginUrl())}
          >
            Sign In to Continue
          </Button>
          <BackToHome />
        </div>
      </MainLayout>
    );
  }

  // ── Derived values ──────────────────────────────────────────────────────────
  const shippingCost =
    shippingType === "national"
      ? (settings?.shippingNationalCost ?? 50000)
      : (settings?.shippingInternationalCost ?? 250000);

  const subtotal = selectedProducts.reduce(
    (sum, p) => sum + Number(p.price) * (quantities[p.id] ?? 1),
    0
  );
  const total = subtotal + shippingCost;
  const effectiveShipping = sameAsUser ? userAddress : shippingAddress;

  const updateUserAddr = (field: keyof Address, value: string) =>
    setUserAddress((prev) => ({ ...prev, [field]: value }));
  const updateShippingAddr = (field: keyof Address, value: string) =>
    setShippingAddress((prev) => ({ ...prev, [field]: value }));

  const isValid = () => {
    if (!name || !email || !phone) return false;
    const a = userAddress;
    if (!a.street || !a.city || !a.province || !a.postalCode || !a.country) return false;
    if (!sameAsUser) {
      const s = shippingAddress;
      if (!s.street || !s.city || !s.province || !s.postalCode || !s.country) return false;
    }
    return selectedProducts.length > 0;
  };

  const handleSubmit = async () => {
    if (!isValid()) {
      toast.error("Please fill in all required fields.");
      return;
    }
    try {
      const result = await createOrderMutation.mutateAsync({
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
        userAddress: {
          street: userAddress.street,
          apt: userAddress.apt || undefined,
          city: userAddress.city,
          province: userAddress.province,
          postalCode: userAddress.postalCode,
          country: userAddress.country,
        },
        shippingAddress: {
          street: effectiveShipping.street,
          apt: effectiveShipping.apt || undefined,
          city: effectiveShipping.city,
          province: effectiveShipping.province,
          postalCode: effectiveShipping.postalCode,
          country: effectiveShipping.country,
        },
        shippingType,
        paymentMethod,
        items: selectedProducts.map((p) => ({
          productId: p.id,
          productName: p.name,
          productPrice: Number(p.price),
          quantity: quantities[p.id] ?? 1,
          subtotal: Number(p.price) * (quantities[p.id] ?? 1),
        })),
      });
      navigate(`/payment/${result.orderNumber}?method=${paymentMethod}`);
    } catch (err: any) {
      toast.error(err.message ?? "Failed to create order. Please try again.");
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <MainLayout>
      {/* ── Mobile sticky order summary bar ─────────────────────────────── */}
      <div className="lg:hidden sticky top-16 z-40 bg-background border-b border-border/60 shadow-sm">
        <button
          type="button"
          className="w-full flex items-center justify-between px-4 py-3 text-sm"
          onClick={() => setSummaryOpen((o) => !o)}
        >
          <div className="flex items-center gap-2 text-primary font-medium">
            <ShoppingBag className="h-4 w-4" />
            Order Summary ({selectedProducts.length} item{selectedProducts.length !== 1 ? "s" : ""})
          </div>
          <div className="flex items-center gap-3">
            <span className="font-semibold text-foreground">IDR {total.toLocaleString("id-ID")}</span>
            {summaryOpen ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </button>

        {/* Expanded mobile summary */}
        {summaryOpen && (
          <div className="px-4 pb-4 border-t border-border/40 bg-muted/20">
            <div className="space-y-3 pt-3">
              {selectedProducts.map((product) => (
                <div key={product.id} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-muted/50 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <Package className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground line-clamp-1">{product.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <button
                        className="w-6 h-6 rounded border border-border flex items-center justify-center hover:bg-muted active:scale-95 transition-transform"
                        onClick={() => setQuantities((q) => ({ ...q, [product.id]: Math.max(1, (q[product.id] ?? 1) - 1) }))}
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="text-sm w-5 text-center font-medium">{quantities[product.id] ?? 1}</span>
                      <button
                        className="w-6 h-6 rounded border border-border flex items-center justify-center hover:bg-muted active:scale-95 transition-transform"
                        onClick={() => setQuantities((q) => ({ ...q, [product.id]: (q[product.id] ?? 1) + 1 }))}
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-foreground flex-shrink-0">
                    IDR {(Number(product.price) * (quantities[product.id] ?? 1)).toLocaleString("id-ID")}
                  </span>
                </div>
              ))}
            </div>
            <Separator className="my-3" />
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>IDR {subtotal.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span>IDR {shippingCost.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between font-semibold text-foreground pt-1">
                <span>Total</span>
                <span>IDR {total.toLocaleString("id-ID")}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Page body ────────────────────────────────────────────────────── */}
      <div className="py-8 sm:py-12">
        <div className="container max-w-5xl">
          <BackToHome className="mb-6 sm:mb-8" />

          <div className="mb-6 sm:mb-8">
            <div className="gold-line mb-4" />
            <h1 className="font-serif text-2xl sm:text-3xl font-light text-foreground">Checkout</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* ── Left: Forms ─────────────────────────────────────────── */}
            <div className="lg:col-span-2 space-y-5">

              {/* Personal Information */}
              <SectionCard>
                <div className="flex items-center gap-2 mb-5">
                  <User className="h-4 w-4 text-primary" />
                  <h2 className="font-semibold text-foreground">Personal Information</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium mb-1.5 block">
                      Full Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your full name"
                      className="h-11 text-base"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium mb-1.5 block">
                        Email Address <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="h-11 text-base"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium mb-1.5 block">
                        Phone Number <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+62 812 3456 7890"
                        className="h-11 text-base"
                      />
                    </div>
                  </div>
                </div>
              </SectionCard>

              {/* Billing Address */}
              <SectionCard>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <h2 className="font-semibold text-foreground">Billing Address</h2>
                  </div>
                  {profile?.streetAddress && (
                    <button
                      type="button"
                      onClick={() =>
                        setUserAddress({
                          street: profile.streetAddress ?? "",
                          apt: profile.aptNumber ?? "",
                          city: profile.city ?? "",
                          province: profile.province ?? "",
                          postalCode: profile.postalCode ?? "",
                          country: profile.country ?? "",
                        })
                      }
                      className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 font-medium transition-colors py-1.5 px-2 rounded-md hover:bg-primary/5"
                    >
                      <CheckCircle className="h-3.5 w-3.5" />
                      Use saved
                    </button>
                  )}
                </div>

                {profile?.streetAddress && profileAddressApplied && (
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20 mb-4">
                    <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">Pre-filled from your saved profile address.</span>{" "}
                      Edit the fields below if needed.
                    </p>
                  </div>
                )}

                <AddressFields addr={userAddress} onChange={updateUserAddr} prefix="user" />
              </SectionCard>

              {/* Shipping Address */}
              <SectionCard>
                <div className="flex items-start justify-between mb-5 gap-3">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-primary" />
                    <h2 className="font-semibold text-foreground">Shipping Address</h2>
                  </div>
                  {/* Larger tap target for checkbox row */}
                  <label
                    htmlFor="same-address"
                    className="flex items-center gap-2.5 cursor-pointer py-1 px-2 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <Checkbox
                      id="same-address"
                      checked={sameAsUser}
                      onCheckedChange={(c) => setSameAsUser(!!c)}
                      className="h-5 w-5"
                    />
                    <span className="text-sm text-muted-foreground select-none">Same as billing</span>
                  </label>
                </div>

                {sameAsUser ? (
                  <div className="bg-muted/40 rounded-lg p-4 text-sm text-muted-foreground">
                    <p>Shipping to the same address as billing.</p>
                    {userAddress.street && (
                      <p className="mt-1 text-foreground font-medium">
                        {userAddress.street}{userAddress.apt ? `, ${userAddress.apt}` : ""},{" "}
                        {userAddress.city}, {userAddress.province} {userAddress.postalCode},{" "}
                        {userAddress.country}
                      </p>
                    )}
                  </div>
                ) : (
                  <AddressFields addr={shippingAddress} onChange={updateShippingAddr} prefix="shipping" />
                )}
              </SectionCard>

              {/* Shipping Method */}
              <SectionCard>
                <h2 className="font-semibold text-foreground mb-4">Shipping Method</h2>
                <RadioGroup
                  value={shippingType}
                  onValueChange={(v) => setShippingType(v as "national" | "international")}
                  className="space-y-3"
                >
                  {[
                    {
                      value: "national",
                      label: "National Delivery",
                      desc: "Delivery within Indonesia",
                      cost: settings?.shippingNationalCost ?? 50000,
                    },
                    {
                      value: "international",
                      label: "International Delivery",
                      desc: "Worldwide shipping",
                      cost: settings?.shippingInternationalCost ?? 250000,
                    },
                  ].map((opt) => (
                    <div
                      key={opt.value}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all active:scale-[0.99] ${
                        shippingType === opt.value
                          ? "border-primary bg-primary/5"
                          : "border-border/60 hover:border-primary/40"
                      }`}
                      onClick={() => setShippingType(opt.value as any)}
                      role="radio"
                      aria-checked={shippingType === opt.value}
                    >
                      <RadioGroupItem value={opt.value} id={`shipping-${opt.value}`} className="h-5 w-5" />
                      <div className="flex-1 min-w-0">
                        <Label htmlFor={`shipping-${opt.value}`} className="cursor-pointer font-medium text-sm">
                          {opt.label}
                        </Label>
                        <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
                      </div>
                      <span className="font-semibold text-sm text-foreground flex-shrink-0">
                        IDR {opt.cost.toLocaleString("id-ID")}
                      </span>
                    </div>
                  ))}
                </RadioGroup>
              </SectionCard>

              {/* Payment Method */}
              <SectionCard>
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard className="h-4 w-4 text-primary" />
                  <h2 className="font-semibold text-foreground">Payment Method</h2>
                </div>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(v) => setPaymentMethod(v as "bank_transfer" | "midtrans")}
                  className="space-y-3"
                >
                  {[
                    {
                      value: "bank_transfer",
                      icon: <Building2 className="h-5 w-5 text-muted-foreground flex-shrink-0" />,
                      label: "Bank Transfer",
                      desc: "Manual bank transfer — we'll send you the account details",
                      badge: null,
                    },
                    {
                      value: "midtrans",
                      icon: <CreditCard className="h-5 w-5 text-muted-foreground flex-shrink-0" />,
                      label: "Online Payment",
                      desc: "Credit card, Virtual Account, QRIS, GoPay",
                      badge: "Midtrans",
                    },
                  ].map((opt) => (
                    <div
                      key={opt.value}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all active:scale-[0.99] ${
                        paymentMethod === opt.value
                          ? "border-primary bg-primary/5"
                          : "border-border/60 hover:border-primary/40"
                      }`}
                      onClick={() => setPaymentMethod(opt.value as any)}
                      role="radio"
                      aria-checked={paymentMethod === opt.value}
                    >
                      <RadioGroupItem value={opt.value} id={`pm-${opt.value}`} className="h-5 w-5" />
                      {opt.icon}
                      <div className="flex-1 min-w-0">
                        <Label htmlFor={`pm-${opt.value}`} className="cursor-pointer font-medium text-sm flex items-center gap-2 flex-wrap">
                          {opt.label}
                          {opt.badge && (
                            <Badge variant="secondary" className="text-xs">{opt.badge}</Badge>
                          )}
                        </Label>
                        <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </SectionCard>

              {/* Mobile Place Order button (below forms) */}
              <div className="lg:hidden">
                <Button
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2 h-13 text-base font-semibold"
                  size="lg"
                  onClick={handleSubmit}
                  disabled={!isValid() || createOrderMutation.isPending}
                >
                  {createOrderMutation.isPending ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      Place Order — IDR {total.toLocaleString("id-ID")}
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-3">
                  By placing your order, you agree to our terms and conditions.
                </p>
              </div>
            </div>

            {/* ── Right: Desktop Order Summary ─────────────────────────── */}
            <div className="hidden lg:block lg:col-span-1">
              <div className="bg-card rounded-xl border border-border/60 p-6 sticky top-24">
                <h2 className="font-semibold text-foreground mb-4">Order Summary</h2>

                <div className="space-y-3 mb-4">
                  {selectedProducts.map((product) => (
                    <div key={product.id} className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <Package className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground line-clamp-1">{product.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <button
                            className="w-6 h-6 rounded border border-border flex items-center justify-center hover:bg-muted active:scale-95 transition-transform"
                            onClick={() =>
                              setQuantities((q) => ({
                                ...q,
                                [product.id]: Math.max(1, (q[product.id] ?? 1) - 1),
                              }))
                            }
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="text-xs w-4 text-center font-medium">{quantities[product.id] ?? 1}</span>
                          <button
                            className="w-6 h-6 rounded border border-border flex items-center justify-center hover:bg-muted active:scale-95 transition-transform"
                            onClick={() =>
                              setQuantities((q) => ({
                                ...q,
                                [product.id]: (q[product.id] ?? 1) + 1,
                              }))
                            }
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-foreground flex-shrink-0">
                        IDR {(Number(product.price) * (quantities[product.id] ?? 1)).toLocaleString("id-ID")}
                      </span>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>IDR {subtotal.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping ({shippingType})</span>
                    <span>IDR {shippingCost.toLocaleString("id-ID")}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-semibold text-foreground text-base">
                    <span>Total</span>
                    <span>IDR {total.toLocaleString("id-ID")}</span>
                  </div>
                </div>

                <Button
                  className="w-full mt-6 bg-primary text-primary-foreground hover:bg-primary/90 gap-2 h-12"
                  size="lg"
                  onClick={handleSubmit}
                  disabled={!isValid() || createOrderMutation.isPending}
                >
                  {createOrderMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Place Order
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center mt-3">
                  By placing your order, you agree to our terms and conditions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
