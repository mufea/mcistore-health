import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/lib/trpc";
import { Building2, Globe, Loader2, Package, Save, Settings } from "lucide-react";
import { toast } from "sonner";
import { AdminLayout } from "./AdminDashboard";

export default function AdminSettings() {
  const utils = trpc.useUtils();
  const { data: rawSettings, isLoading } = trpc.settings.adminGetAll.useQuery();

  // Site
  const [siteName, setSiteName] = useState("");
  const [siteTagline, setSiteTagline] = useState("");

  // Bank Transfer
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [beneficiary, setBeneficiary] = useState("");

  // Shipping
  const [nationalCost, setNationalCost] = useState("");
  const [internationalCost, setInternationalCost] = useState("");

  // Midtrans
  const [midtransServerKey, setMidtransServerKey] = useState("");
  const [midtransClientKey, setMidtransClientKey] = useState("");
  const [midtransIsProduction, setMidtransIsProduction] = useState(false);

  useEffect(() => {
    if (rawSettings) {
      setSiteName(rawSettings["site_name"] ?? "VitaWell Health");
      setSiteTagline(rawSettings["site_tagline"] ?? "");
      setBankName(rawSettings["bank_transfer_bank_name"] ?? "");
      setAccountNumber(rawSettings["bank_transfer_account_number"] ?? "");
      setBeneficiary(rawSettings["bank_transfer_beneficiary"] ?? "");
      setNationalCost(rawSettings["shipping_national_cost"] ?? "50000");
      setInternationalCost(rawSettings["shipping_international_cost"] ?? "250000");
      setMidtransServerKey(rawSettings["midtrans_server_key"] ?? "");
      setMidtransClientKey(rawSettings["midtrans_client_key"] ?? "");
      setMidtransIsProduction(rawSettings["midtrans_is_production"] === "true");
    }
  }, [rawSettings]);

  const updateMutation = trpc.settings.bulkUpdate.useMutation({
    onSuccess: () => { utils.settings.adminGetAll.invalidate(); utils.settings.getPublic.invalidate(); toast.success("Settings saved successfully"); },
    onError: (e) => toast.error(e.message),
  });

  const save = () => {
    updateMutation.mutate({
      settings: {
        site_name: siteName,
        site_tagline: siteTagline,
        bank_transfer_bank_name: bankName,
        bank_transfer_account_number: accountNumber,
        bank_transfer_beneficiary: beneficiary,
        shipping_national_cost: nationalCost,
        shipping_international_cost: internationalCost,
        midtrans_server_key: midtransServerKey,
        midtrans_client_key: midtransClientKey,
        midtrans_is_production: String(midtransIsProduction),
      },
    });
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl font-light text-foreground mb-1">Settings</h1>
          <p className="text-muted-foreground text-sm">Configure payment, shipping, and site settings</p>
        </div>
        <Button
          className="bg-primary text-primary-foreground gap-2"
          onClick={save}
          disabled={updateMutation.isPending}
        >
          {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save All Settings
        </Button>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Site Settings */}
        <div className="bg-card rounded-xl border border-border/60 p-6">
          <div className="flex items-center gap-2 mb-5">
            <Globe className="h-4 w-4 text-primary" />
            <h2 className="font-semibold text-foreground">Site Information</h2>
          </div>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-1.5 block">Site Name</Label>
              <Input value={siteName} onChange={(e) => setSiteName(e.target.value)} placeholder="VitaWell Health" />
            </div>
            <div>
              <Label className="text-sm font-medium mb-1.5 block">Site Tagline</Label>
              <Input value={siteTagline} onChange={(e) => setSiteTagline(e.target.value)} placeholder="Your journey to optimal health starts here." />
            </div>
          </div>
        </div>

        {/* Bank Transfer */}
        <div className="bg-card rounded-xl border border-border/60 p-6">
          <div className="flex items-center gap-2 mb-5">
            <Building2 className="h-4 w-4 text-primary" />
            <h2 className="font-semibold text-foreground">Bank Transfer Settings</h2>
          </div>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-1.5 block">Bank Name</Label>
              <Input value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="e.g. BCA, Mandiri, BNI" />
            </div>
            <div>
              <Label className="text-sm font-medium mb-1.5 block">Account Number</Label>
              <Input value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} placeholder="e.g. 1234567890" />
            </div>
            <div>
              <Label className="text-sm font-medium mb-1.5 block">Beneficiary Name</Label>
              <Input value={beneficiary} onChange={(e) => setBeneficiary(e.target.value)} placeholder="e.g. PT VitaWell Indonesia" />
            </div>
          </div>
        </div>

        {/* Shipping */}
        <div className="bg-card rounded-xl border border-border/60 p-6">
          <div className="flex items-center gap-2 mb-5">
            <Package className="h-4 w-4 text-primary" />
            <h2 className="font-semibold text-foreground">Shipping Rates</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">Set flat-rate shipping costs for national and international deliveries.</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium mb-1.5 block">National Shipping (IDR)</Label>
              <Input type="number" value={nationalCost} onChange={(e) => setNationalCost(e.target.value)} placeholder="50000" min={0} />
              <p className="text-xs text-muted-foreground mt-1">Delivery within Indonesia</p>
            </div>
            <div>
              <Label className="text-sm font-medium mb-1.5 block">International Shipping (IDR)</Label>
              <Input type="number" value={internationalCost} onChange={(e) => setInternationalCost(e.target.value)} placeholder="250000" min={0} />
              <p className="text-xs text-muted-foreground mt-1">Worldwide delivery</p>
            </div>
          </div>
        </div>

        {/* Midtrans */}
        <div className="bg-card rounded-xl border border-border/60 p-6">
          <div className="flex items-center gap-2 mb-5">
            <Settings className="h-4 w-4 text-primary" />
            <h2 className="font-semibold text-foreground">Midtrans Payment Gateway</h2>
          </div>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-1.5 block">Server Key</Label>
              <Input
                type="password"
                value={midtransServerKey}
                onChange={(e) => setMidtransServerKey(e.target.value)}
                placeholder="SB-Mid-server-..."
              />
              <p className="text-xs text-muted-foreground mt-1">Used server-side for creating transactions. Keep this secret.</p>
            </div>
            <div>
              <Label className="text-sm font-medium mb-1.5 block">Client Key</Label>
              <Input
                value={midtransClientKey}
                onChange={(e) => setMidtransClientKey(e.target.value)}
                placeholder="SB-Mid-client-..."
              />
              <p className="text-xs text-muted-foreground mt-1">Used client-side for Snap.js integration.</p>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Production Mode</Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {midtransIsProduction ? "Using production Midtrans endpoints" : "Using sandbox/testing endpoints"}
                </p>
              </div>
              <Switch checked={midtransIsProduction} onCheckedChange={setMidtransIsProduction} />
            </div>
            {!midtransIsProduction && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-xs text-amber-700">
                  <strong>Sandbox Mode:</strong> Payments are simulated. Switch to Production Mode when ready to accept real payments.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            className="bg-primary text-primary-foreground gap-2 px-8"
            onClick={save}
            disabled={updateMutation.isPending}
            size="lg"
          >
            {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save All Settings
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}
