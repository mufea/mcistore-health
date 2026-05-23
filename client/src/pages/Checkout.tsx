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
import { ArrowLeft, Building2, CreditCard, Loader2, MapPin, Package, ShoppingBag, User } from "lucide-react";
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

export default function Checkout() {
  const search = useSearch();
  const [, navigate] = useLocation();
  const params = new URLSearchParams(search);
  const productIds = params.get("products")?.split(",").map(Number).filter(Boolean) ?? [];
  const segment = (params.get("segment") as "standard" | "premium" | "vip") ?? "standard";

  const { user, isAuthenticated } = useAuth();
  const { data: settings } = trpc.settings.getPublic.useQuery();

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [userAddress, setUserAddress] = useState<Address>(emptyAddress);
  const [shippingAddress, setShippingAddress] = useState<Address>(emptyAddress);
  const [sameAsUser, setSameAsUser] = useState(true);
  const [shippingType, setShippingType] = useState<"national" | "international">("national");
  const [paymentMethod, setPaymentMethod] = useState<"bank_transfer" | "midtrans">("bank_transfer");
  const [quantities, setQuantities] = useState<Record<number, number>>({});

  const { data: allProducts } = trpc.products.list.useQuery({ segment });
  const createOrderMutation = trpc.orders.create.useMutation();

  const selectedProducts = (allProducts ?? []).filter((p) => productIds.includes(p.id));

  useEffect(() => {
    if (user) {
      setName(user.name ?? "");
      setEmail(user.email ?? "");
      setPhone(user.phone ?? "");
      if (user.streetAddress) {
        setUserAddress({
          street: user.streetAddress ?? "",
          apt: user.aptNumber ?? "",
          city: user.city ?? "",
          province: user.province ?? "",
          postalCode: user.postalCode ?? "",
          country: user.country ?? "",
        });
      }
    }
  }, [user]);

  useEffect(() => {
    const qty: Record<number, number> = {};
    productIds.forEach((id) => { qty[id] = 1; });
    setQuantities(qty);
  }, []);

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
            className="bg-primary text-primary-foreground"
            onClick={() => (window.location.href = getLoginUrl())}
          >
            Sign In to Continue
          </Button>
          <BackToHome />
        </div>
      </MainLayout>
    );
  }

  const shippingCost = shippingType === "national"
    ? (settings?.shippingNationalCost ?? 50000)
    : (settings?.shippingInternationalCost ?? 250000);

  const subtotal = selectedProducts.reduce((sum, p) => {
    return sum + Number(p.price) * (quantities[p.id] ?? 1);
  }, 0);

  const total = subtotal + shippingCost;

  const effectiveShipping = sameAsUser ? userAddress : shippingAddress;

  const updateUserAddr = (field: keyof Address, value: string) => {
    setUserAddress((prev) => ({ ...prev, [field]: value }));
  };

  const updateShippingAddr = (field: keyof Address, value: string) => {
    setShippingAddress((prev) => ({ ...prev, [field]: value }));
  };

  const isValid = () => {
    if (!name || !email || !phone) return false;
    const addr = userAddress;
    if (!addr.street || !addr.city || !addr.province || !addr.postalCode || !addr.country) return false;
    if (!sameAsUser) {
      const sa = shippingAddress;
      if (!sa.street || !sa.city || !sa.province || !sa.postalCode || !sa.country) return false;
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

  const AddressFields = ({
    addr,
    onChange,
    prefix,
  }: {
    addr: Address;
    onChange: (field: keyof Address, value: string) => void;
    prefix: string;
  }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="sm:col-span-2">
        <Label htmlFor={`${prefix}-street`} className="text-sm font-medium mb-1.5 block">
          Street Address <span className="text-destructive">*</span>
        </Label>
        <Input
          id={`${prefix}-street`}
          value={addr.street}
          onChange={(e) => onChange("street", e.target.value)}
          placeholder="e.g. Jl. Sudirman No. 123"
        />
      </div>
      <div>
        <Label htmlFor={`${prefix}-apt`} className="text-sm font-medium mb-1.5 block">
          House / Apt Number
        </Label>
        <Input
          id={`${prefix}-apt`}
          value={addr.apt}
          onChange={(e) => onChange("apt", e.target.value)}
          placeholder="e.g. Unit 4B"
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
        />
      </div>
      <div>
        <Label htmlFor={`${prefix}-province`} className="text-sm font-medium mb-1.5 block">
          Province / State <span className="text-destructive">*</span>
        </Label>
        <Input
          id={`${prefix}-province`}
          value={addr.province}
          onChange={(e) => onChange("province", e.target.value)}
          placeholder="e.g. DKI Jakarta"
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
        />
      </div>
    </div>
  );

  return (
    <MainLayout>
      <div className="py-12">
        <div className="container max-w-5xl">
          <BackToHome className="mb-8" />

          <div className="mb-8">
            <div className="gold-line mb-4" />
            <h1 className="font-serif text-3xl font-light text-foreground">Checkout</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Forms */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Info */}
              <div className="bg-card rounded-xl border border-border/60 p-6">
                <div className="flex items-center gap-2 mb-5">
                  <User className="h-4 w-4 text-primary" />
                  <h2 className="font-semibold text-foreground">Personal Information</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <Label className="text-sm font-medium mb-1.5 block">
                      Full Name <span className="text-destructive">*</span>
                    </Label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-1.5 block">
                      Email Address <span className="text-destructive">*</span>
                    </Label>
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-1.5 block">
                      Phone Number <span className="text-destructive">*</span>
                    </Label>
                    <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+62 812 3456 7890" />
                  </div>
                </div>
              </div>

              {/* User Address */}
              <div className="bg-card rounded-xl border border-border/60 p-6">
                <div className="flex items-center gap-2 mb-5">
                  <MapPin className="h-4 w-4 text-primary" />
                  <h2 className="font-semibold text-foreground">Billing Address</h2>
                </div>
                <AddressFields addr={userAddress} onChange={updateUserAddr} prefix="user" />
              </div>

              {/* Shipping Address */}
              <div className="bg-card rounded-xl border border-border/60 p-6">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-primary" />
                    <h2 className="font-semibold text-foreground">Shipping Address</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="same-address"
                      checked={sameAsUser}
                      onCheckedChange={(c) => setSameAsUser(!!c)}
                    />
                    <Label htmlFor="same-address" className="text-sm cursor-pointer text-muted-foreground">
                      Same as billing address
                    </Label>
                  </div>
                </div>
                {sameAsUser ? (
                  <div className="bg-muted/40 rounded-lg p-4 text-sm text-muted-foreground">
                    <p>Shipping to the same address as billing.</p>
                    {userAddress.street && (
                      <p className="mt-1 text-foreground font-medium">
                        {userAddress.street}{userAddress.apt ? `, ${userAddress.apt}` : ""}, {userAddress.city}, {userAddress.province} {userAddress.postalCode}, {userAddress.country}
                      </p>
                    )}
                  </div>
                ) : (
                  <AddressFields addr={shippingAddress} onChange={updateShippingAddr} prefix="shipping" />
                )}
              </div>

              {/* Shipping Type */}
              <div className="bg-card rounded-xl border border-border/60 p-6">
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
                      className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                        shippingType === opt.value
                          ? "border-primary bg-primary/5"
                          : "border-border/60 hover:border-primary/40"
                      }`}
                      onClick={() => setShippingType(opt.value as any)}
                    >
                      <RadioGroupItem value={opt.value} id={`shipping-${opt.value}`} />
                      <div className="flex-1">
                        <Label htmlFor={`shipping-${opt.value}`} className="cursor-pointer font-medium text-sm">
                          {opt.label}
                        </Label>
                        <p className="text-xs text-muted-foreground">{opt.desc}</p>
                      </div>
                      <span className="font-semibold text-sm">
                        IDR {opt.cost.toLocaleString("id-ID")}
                      </span>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Payment Method */}
              <div className="bg-card rounded-xl border border-border/60 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard className="h-4 w-4 text-primary" />
                  <h2 className="font-semibold text-foreground">Payment Method</h2>
                </div>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(v) => setPaymentMethod(v as "bank_transfer" | "midtrans")}
                  className="space-y-3"
                >
                  <div
                    className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                      paymentMethod === "bank_transfer"
                        ? "border-primary bg-primary/5"
                        : "border-border/60 hover:border-primary/40"
                    }`}
                    onClick={() => setPaymentMethod("bank_transfer")}
                  >
                    <RadioGroupItem value="bank_transfer" id="pm-bank" />
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <Label htmlFor="pm-bank" className="cursor-pointer font-medium text-sm">Bank Transfer</Label>
                      <p className="text-xs text-muted-foreground">Manual bank transfer — we'll send you the account details</p>
                    </div>
                  </div>
                  <div
                    className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                      paymentMethod === "midtrans"
                        ? "border-primary bg-primary/5"
                        : "border-border/60 hover:border-primary/40"
                    }`}
                    onClick={() => setPaymentMethod("midtrans")}
                  >
                    <RadioGroupItem value="midtrans" id="pm-midtrans" />
                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <Label htmlFor="pm-midtrans" className="cursor-pointer font-medium text-sm">
                        Online Payment
                        <Badge variant="secondary" className="ml-2 text-xs">Midtrans</Badge>
                      </Label>
                      <p className="text-xs text-muted-foreground">Credit card, Virtual Account, QRIS, GoPay</p>
                    </div>
                  </div>
                </RadioGroup>
              </div>
            </div>

            {/* Right: Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-xl border border-border/60 p-6 sticky top-24">
                <h2 className="font-semibold text-foreground mb-4">Order Summary</h2>

                {/* Items */}
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
                            className="w-5 h-5 rounded border border-border text-xs flex items-center justify-center hover:bg-muted"
                            onClick={() => setQuantities((q) => ({ ...q, [product.id]: Math.max(1, (q[product.id] ?? 1) - 1) }))}
                          >
                            −
                          </button>
                          <span className="text-xs w-4 text-center">{quantities[product.id] ?? 1}</span>
                          <button
                            className="w-5 h-5 rounded border border-border text-xs flex items-center justify-center hover:bg-muted"
                            onClick={() => setQuantities((q) => ({ ...q, [product.id]: (q[product.id] ?? 1) + 1 }))}
                          >
                            +
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
                  className="w-full mt-6 bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
                  size="lg"
                  onClick={handleSubmit}
                  disabled={!isValid() || createOrderMutation.isPending}
                >
                  {createOrderMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Place Order
                      <ArrowLeft className="h-4 w-4 rotate-180" />
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
