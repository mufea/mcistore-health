import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Package, Search } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import MainLayout from "@/components/MainLayout";
import BackToHome from "@/components/BackToHome";

export default function TrackOrder() {
  const [orderNumber, setOrderNumber] = useState("");
  const [, navigate] = useLocation();

  const handleTrack = () => {
    if (orderNumber.trim()) {
      navigate(`/order/${orderNumber.trim()}`);
    }
  };

  return (
    <MainLayout>
      <div className="min-h-[70vh] flex flex-col items-center justify-center py-12 px-6">
        <div className="w-full max-w-md">
          <BackToHome className="mb-8" />

          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Package className="h-7 w-7 text-primary" />
            </div>
            <div className="gold-line mx-auto mb-4" />
            <h1 className="font-serif text-3xl font-light text-foreground mb-2">Track Your Order</h1>
            <p className="text-muted-foreground text-sm">
              Enter your order number to check the current status of your delivery.
            </p>
          </div>

          <div className="bg-card rounded-xl border border-border/60 p-6 space-y-4">
            <div>
              <Label htmlFor="order-number" className="text-sm font-medium mb-1.5 block">
                Order Number
              </Label>
              <Input
                id="order-number"
                placeholder="e.g. VW-1234567890-ABC123"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleTrack()}
              />
            </div>
            <Button
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
              onClick={handleTrack}
              disabled={!orderNumber.trim()}
            >
              <Search className="h-4 w-4" />
              Track Order
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
