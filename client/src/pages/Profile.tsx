import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { getChangePasswordUrl, getLoginUrl } from "@/const";
import {
  CheckCircle,
  ChevronRight,
  Edit2,
  ExternalLink,
  KeyRound,
  Loader2,
  MapPin,
  Package,
  Save,
  ShoppingBag,
  User,
  X,
} from "lucide-react";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import MainLayout from "@/components/MainLayout";
import BackToHome from "@/components/BackToHome";
import { toast } from "sonner";

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700",
    processing: "bg-blue-100 text-blue-700",
    shipped: "bg-purple-100 text-purple-700",
    delivered: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
    paid: "bg-green-100 text-green-700",
    failed: "bg-red-100 text-red-700",
    refunded: "bg-gray-100 text-gray-700",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${variants[status] ?? "bg-muted text-muted-foreground"}`}
    >
      {status}
    </span>
  );
}

// ─── Segment badge ────────────────────────────────────────────────────────────

function SegmentBadge({ segment }: { segment: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    standard: { label: "Standard", cls: "bg-muted text-muted-foreground" },
    premium: { label: "Premium", cls: "bg-amber-100 text-amber-700" },
    vip: { label: "VIP", cls: "bg-primary/10 text-primary" },
  };
  const s = map[segment] ?? map.standard;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${s.cls}`}>
      {s.label}
    </span>
  );
}

// ─── Section card ─────────────────────────────────────────────────────────────

function SectionCard({
  title,
  icon: Icon,
  children,
  action,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="bg-card rounded-2xl border border-border/60 overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="h-4 w-4 text-primary" />
          </div>
          <h2 className="font-semibold text-foreground text-sm">{title}</h2>
        </div>
        {action}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

// ─── Personal info form ───────────────────────────────────────────────────────

function PersonalInfoSection() {
  const utils = trpc.useUtils();
  const { data: profile, isLoading } = trpc.userProfile.get.useQuery();
  const updateMutation = trpc.userProfile.update.useMutation({
    onSuccess: () => {
      utils.userProfile.get.invalidate();
      utils.auth.me.invalidate();
      setEditing(false);
      toast.success("Profile updated successfully.");
    },
    onError: () => toast.error("Failed to update profile. Please try again."),
  });

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "" });

  useEffect(() => {
    if (profile) {
      setForm({ name: profile.name ?? "", phone: profile.phone ?? "" });
    }
  }, [profile]);

  const handleSave = () => {
    updateMutation.mutate({ name: form.name || undefined, phone: form.phone || undefined });
  };

  const handleCancel = () => {
    if (profile) setForm({ name: profile.name ?? "", phone: profile.phone ?? "" });
    setEditing(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <SectionCard
      title="Personal Information"
      icon={User}
      action={
        !editing ? (
          <Button variant="ghost" size="sm" onClick={() => setEditing(true)} className="gap-1.5 text-xs">
            <Edit2 className="h-3.5 w-3.5" /> Edit
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={handleCancel} className="gap-1.5 text-xs text-muted-foreground">
              <X className="h-3.5 w-3.5" /> Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={updateMutation.isPending}
              className="gap-1.5 text-xs bg-primary text-primary-foreground"
            >
              {updateMutation.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              Save
            </Button>
          </div>
        )
      }
    >
      <div className="space-y-5">
        {/* Avatar row */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
            <span className="text-primary-foreground text-xl font-bold">
              {(profile?.name ?? "U").charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-semibold text-foreground">{profile?.name ?? "—"}</p>
            <p className="text-sm text-muted-foreground">{profile?.email ?? "—"}</p>
            <div className="mt-1">
              <SegmentBadge segment={profile?.segment ?? "standard"} />
            </div>
          </div>
        </div>

        <div className="section-divider" />

        {/* Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Full Name</Label>
            {editing ? (
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Your full name"
              />
            ) : (
              <p className="text-sm text-foreground font-medium">{profile?.name ?? "—"}</p>
            )}
          </div>
          <div>
            <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Email Address</Label>
            <p className="text-sm text-foreground font-medium">{profile?.email ?? "—"}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Managed by your sign-in provider</p>
          </div>
          <div>
            <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Phone Number</Label>
            {editing ? (
              <Input
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="+62 812 3456 7890"
              />
            ) : (
              <p className="text-sm text-foreground font-medium">{profile?.phone ?? "—"}</p>
            )}
          </div>
          <div>
            <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Member Since</Label>
            <p className="text-sm text-foreground font-medium">
              {profile?.createdAt
                ? new Date(profile.createdAt).toLocaleDateString("en-ID", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "—"}
            </p>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

// ─── Address section ──────────────────────────────────────────────────────────

type AddressForm = {
  streetAddress: string;
  aptNumber: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
};

function AddressSection() {
  const utils = trpc.useUtils();
  const { data: profile, isLoading } = trpc.userProfile.get.useQuery();
  const updateMutation = trpc.userProfile.update.useMutation({
    onSuccess: () => {
      utils.userProfile.get.invalidate();
      utils.auth.me.invalidate();
      setEditing(false);
      toast.success("Address saved successfully.");
    },
    onError: () => toast.error("Failed to save address. Please try again."),
  });

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<AddressForm>({
    streetAddress: "",
    aptNumber: "",
    city: "",
    province: "",
    postalCode: "",
    country: "",
  });

  useEffect(() => {
    if (profile) {
      setForm({
        streetAddress: profile.streetAddress ?? "",
        aptNumber: profile.aptNumber ?? "",
        city: profile.city ?? "",
        province: profile.province ?? "",
        postalCode: profile.postalCode ?? "",
        country: profile.country ?? "",
      });
    }
  }, [profile]);

  const handleSave = () => {
    updateMutation.mutate({
      streetAddress: form.streetAddress || undefined,
      aptNumber: form.aptNumber || undefined,
      city: form.city || undefined,
      province: form.province || undefined,
      postalCode: form.postalCode || undefined,
      country: form.country || undefined,
    });
  };

  const handleCancel = () => {
    if (profile) {
      setForm({
        streetAddress: profile.streetAddress ?? "",
        aptNumber: profile.aptNumber ?? "",
        city: profile.city ?? "",
        province: profile.province ?? "",
        postalCode: profile.postalCode ?? "",
        country: profile.country ?? "",
      });
    }
    setEditing(false);
  };

  const hasAddress = profile?.streetAddress || profile?.city;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <SectionCard
      title="Default Address"
      icon={MapPin}
      action={
        !editing ? (
          <Button variant="ghost" size="sm" onClick={() => setEditing(true)} className="gap-1.5 text-xs">
            <Edit2 className="h-3.5 w-3.5" /> {hasAddress ? "Edit" : "Add Address"}
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={handleCancel} className="gap-1.5 text-xs text-muted-foreground">
              <X className="h-3.5 w-3.5" /> Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={updateMutation.isPending}
              className="gap-1.5 text-xs bg-primary text-primary-foreground"
            >
              {updateMutation.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              Save
            </Button>
          </div>
        )
      }
    >
      {!editing ? (
        hasAddress ? (
          <div className="space-y-1">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <div className="text-sm text-foreground leading-relaxed">
                <p className="font-medium">
                  {profile?.streetAddress}
                  {profile?.aptNumber ? `, ${profile.aptNumber}` : ""}
                </p>
                <p className="text-muted-foreground">
                  {[profile?.city, profile?.province, profile?.postalCode].filter(Boolean).join(", ")}
                </p>
                <p className="text-muted-foreground">{profile?.country}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3 pl-7">
              This address will be pre-filled at checkout for faster ordering.
            </p>
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
              <MapPin className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground mb-1">No address saved yet</p>
            <p className="text-xs text-muted-foreground">Add your address to speed up checkout.</p>
          </div>
        )
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Label className="text-xs font-medium mb-1.5 block">
              Street Address <span className="text-destructive">*</span>
            </Label>
            <Input
              value={form.streetAddress}
              onChange={(e) => setForm((f) => ({ ...f, streetAddress: e.target.value }))}
              placeholder="e.g. Jl. Sudirman No. 123"
            />
          </div>
          <div>
            <Label className="text-xs font-medium mb-1.5 block">House / Apt Number</Label>
            <Input
              value={form.aptNumber}
              onChange={(e) => setForm((f) => ({ ...f, aptNumber: e.target.value }))}
              placeholder="e.g. Unit 4B"
            />
          </div>
          <div>
            <Label className="text-xs font-medium mb-1.5 block">
              City <span className="text-destructive">*</span>
            </Label>
            <Input
              value={form.city}
              onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
              placeholder="e.g. Jakarta"
            />
          </div>
          <div>
            <Label className="text-xs font-medium mb-1.5 block">
              Province / State <span className="text-destructive">*</span>
            </Label>
            <Input
              value={form.province}
              onChange={(e) => setForm((f) => ({ ...f, province: e.target.value }))}
              placeholder="e.g. DKI Jakarta"
            />
          </div>
          <div>
            <Label className="text-xs font-medium mb-1.5 block">
              Postal Code <span className="text-destructive">*</span>
            </Label>
            <Input
              value={form.postalCode}
              onChange={(e) => setForm((f) => ({ ...f, postalCode: e.target.value }))}
              placeholder="e.g. 10220"
            />
          </div>
          <div className="sm:col-span-2">
            <Label className="text-xs font-medium mb-1.5 block">
              Country <span className="text-destructive">*</span>
            </Label>
            <Input
              value={form.country}
              onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
              placeholder="e.g. Indonesia"
            />
          </div>
        </div>
      )}
    </SectionCard>
  );
}

// ─── Change Password section ─────────────────────────────────────────────────

function ChangePasswordSection() {
  return (
    <SectionCard title="Password & Security" icon={KeyRound}>
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground leading-relaxed">
          Your password is managed securely through the MCI Store authentication portal. Click the button below
          to update your password. You will be redirected back to your profile once the change is complete.
        </p>
        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/40 border border-border/40">
          <KeyRound className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <p className="text-xs text-muted-foreground">
            For your security, you may be asked to verify your current password before setting a new one.
          </p>
        </div>
        <Button
          onClick={() => (window.location.href = getChangePasswordUrl())}
          variant="outline"
          className="gap-2 border-primary/30 text-primary hover:bg-primary/5 hover:border-primary"
        >
          <KeyRound className="h-4 w-4" />
          Change Password
          <ExternalLink className="h-3.5 w-3.5 ml-1 opacity-60" />
        </Button>
      </div>
    </SectionCard>
  );
}

// ─── Orders section ───────────────────────────────────────────────────────────

function OrdersSection() {
  const { data: orders, isLoading } = trpc.orders.myOrders.useQuery();

  return (
    <SectionCard title="Order History" icon={ShoppingBag}>
      {isLoading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : !orders || orders.length === 0 ? (
        <div className="text-center py-10">
          <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Package className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground mb-1">No orders yet</p>
          <p className="text-xs text-muted-foreground mb-5">Start your wellness journey today.</p>
          <Button asChild size="sm" className="bg-primary text-primary-foreground">
            <Link href="/survey">Take Health Survey</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.slice(0, 5).map((order) => (
            <Link href={`/order/${order.orderNumber}`} key={order.id}>
              <div className="group flex items-center justify-between p-4 rounded-xl border border-border/60 hover:border-primary/30 hover:bg-muted/30 transition-all cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Package className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{order.orderNumber}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString("en-ID", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex flex-col items-end gap-1">
                    <StatusBadge status={order.status} />
                    <StatusBadge status={order.paymentStatus} />
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">
                      IDR {Number(order.total).toLocaleString("id-ID")}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {order.paymentMethod.replace("_", " ")}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </div>
            </Link>
          ))}
          {orders.length > 5 && (
            <div className="pt-2 text-center">
              <Button asChild variant="ghost" size="sm" className="text-primary gap-1.5">
                <Link href="/my-orders">
                  View all {orders.length} orders <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      )}
    </SectionCard>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function Profile() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  if (!isAuthenticated) {
    return (
      <MainLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 text-center p-6">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h2 className="font-serif text-2xl font-semibold mb-2">Sign In Required</h2>
            <p className="text-muted-foreground text-sm">Please sign in to view and manage your profile.</p>
          </div>
          <Button
            className="bg-primary text-primary-foreground"
            onClick={() => (window.location.href = getLoginUrl())}
          >
            Sign In
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

          {/* Page header */}
          <div className="mb-10">
            <div className="gold-line mb-4" />
            <h1 className="font-serif text-3xl font-light text-foreground">My Profile</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Manage your personal information, default address, and view your order history.
            </p>
          </div>

          {/* Quick nav tabs */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
            {[
              { label: "Profile", href: "#profile" },
              { label: "Address", href: "#address" },
              { label: "Security", href: "#security" },
              { label: "Orders", href: "#orders" },
            ].map((tab) => (
              <a
                key={tab.href}
                href={tab.href}
                className="flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border border-border/60 text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
              >
                {tab.label}
              </a>
            ))}
          </div>

          {/* Sections */}
          <div className="space-y-6">
            <div id="profile">
              <PersonalInfoSection />
            </div>
            <div id="address">
              <AddressSection />
            </div>
            <div id="security">
              <ChangePasswordSection />
            </div>
            <div id="orders">
              <OrdersSection />
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
