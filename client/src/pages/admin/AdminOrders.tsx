import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/lib/trpc";
import { Eye, Loader2, Package, Search } from "lucide-react";
import { toast } from "sonner";
import { AdminLayout } from "./AdminDashboard";

const ORDER_STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];
const PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"];

function StatusBadge({ status, type = "order" }: { status: string; type?: "order" | "payment" }) {
  const orderColors: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700",
    processing: "bg-blue-100 text-blue-700",
    shipped: "bg-purple-100 text-purple-700",
    delivered: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  };
  const paymentColors: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700",
    paid: "bg-green-100 text-green-700",
    failed: "bg-red-100 text-red-700",
    refunded: "bg-gray-100 text-gray-700",
  };
  const colors = type === "payment" ? paymentColors : orderColors;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${colors[status] ?? "bg-muted text-muted-foreground"}`}>
      {status}
    </span>
  );
}

export default function AdminOrders() {
  const utils = trpc.useUtils();
  const { data: orders, isLoading } = trpc.orders.adminList.useQuery();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [detailDialog, setDetailDialog] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [newPaymentStatus, setNewPaymentStatus] = useState("");

  const updateStatusMutation = trpc.orders.updateStatus.useMutation({
    onSuccess: () => {
      utils.orders.adminList.invalidate();
      if (selectedOrder) {
        setSelectedOrder((prev: any) => ({ ...prev, status: newStatus || prev.status, paymentStatus: newPaymentStatus || prev.paymentStatus }));
      }
      toast.success("Order updated");
    },
    onError: (e) => toast.error(e.message),
  });

  const openDetail = (order: any) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setNewPaymentStatus(order.paymentStatus);
    setDetailDialog(true);
  };

  const saveStatus = () => {
    if (!selectedOrder) return;
    updateStatusMutation.mutate({
      id: selectedOrder.id,
      status: newStatus as any,
      paymentStatus: newPaymentStatus as any,
    });
  };

  const filtered = (orders ?? []).filter((o) => {
    const matchSearch = !search ||
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.customerEmail.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-light text-foreground mb-1">Orders</h1>
        <p className="text-muted-foreground text-sm">View and manage customer orders</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by order #, name, email..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {ORDER_STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-xl border border-border/60">
          <Package className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No orders found.</p>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/60 bg-muted/30">
                  <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Order</th>
                  <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Customer</th>
                  <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Total</th>
                  <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                  <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Payment</th>
                  <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Method</th>
                  <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Date</th>
                  <th className="text-right p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filtered.map((order) => (
                  <tr key={order.id} className="hover:bg-muted/20 transition-colors">
                    <td className="p-4">
                      <p className="text-sm font-mono font-medium text-foreground">{order.orderNumber}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-sm font-medium text-foreground">{order.customerName}</p>
                      <p className="text-xs text-muted-foreground">{order.customerEmail}</p>
                    </td>
                    <td className="p-4">
                      <span className="text-sm font-semibold">IDR {Number(order.total).toLocaleString("id-ID")}</span>
                    </td>
                    <td className="p-4">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="p-4">
                      <StatusBadge status={order.paymentStatus} type="payment" />
                    </td>
                    <td className="p-4">
                      <span className="text-xs text-muted-foreground capitalize">{order.paymentMethod.replace("_", " ")}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-xs text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString("en-ID", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end">
                        <Button size="sm" variant="ghost" onClick={() => openDetail(order)}>
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Detail Dialog */}
      <Dialog open={detailDialog} onOpenChange={setDetailDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order #{selectedOrder?.orderNumber}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-5 py-2">
              {/* Customer */}
              <div>
                <h3 className="text-sm font-semibold mb-2">Customer Information</h3>
                <div className="bg-muted/30 rounded-lg p-3 text-sm space-y-1">
                  <p><span className="text-muted-foreground">Name:</span> <span className="font-medium">{selectedOrder.customerName}</span></p>
                  <p><span className="text-muted-foreground">Email:</span> {selectedOrder.customerEmail}</p>
                  <p><span className="text-muted-foreground">Phone:</span> {selectedOrder.customerPhone}</p>
                </div>
              </div>

              {/* Addresses */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-semibold mb-2">Billing Address</h3>
                  <div className="bg-muted/30 rounded-lg p-3 text-xs text-muted-foreground space-y-0.5">
                    <p>{selectedOrder.streetAddress}{selectedOrder.aptNumber ? `, ${selectedOrder.aptNumber}` : ""}</p>
                    <p>{selectedOrder.city}, {selectedOrder.province} {selectedOrder.postalCode}</p>
                    <p>{selectedOrder.country}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold mb-2">Shipping Address</h3>
                  <div className="bg-muted/30 rounded-lg p-3 text-xs text-muted-foreground space-y-0.5">
                    <p>{selectedOrder.shippingStreet}{selectedOrder.shippingApt ? `, ${selectedOrder.shippingApt}` : ""}</p>
                    <p>{selectedOrder.shippingCity}, {selectedOrder.shippingProvince} {selectedOrder.shippingPostal}</p>
                    <p>{selectedOrder.shippingCountry}</p>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div>
                <h3 className="text-sm font-semibold mb-2">Order Items</h3>
                <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                  {selectedOrder.items?.map((item: any) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.productName} × {item.quantity}</span>
                      <span className="font-medium">IDR {Number(item.subtotal).toLocaleString("id-ID")}</span>
                    </div>
                  ))}
                  <Separator />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Subtotal</span>
                    <span>IDR {Number(selectedOrder.subtotal).toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Shipping ({selectedOrder.shippingType})</span>
                    <span>IDR {Number(selectedOrder.shippingCost).toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold">
                    <span>Total</span>
                    <span>IDR {Number(selectedOrder.total).toLocaleString("id-ID")}</span>
                  </div>
                </div>
              </div>

              {/* Status Update */}
              <div>
                <h3 className="text-sm font-semibold mb-3">Update Status</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block">Order Status</label>
                    <Select value={newStatus} onValueChange={setNewStatus}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {ORDER_STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block">Payment Status</label>
                    <Select value={newPaymentStatus} onValueChange={setNewPaymentStatus}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {PAYMENT_STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {selectedOrder.midtransOrderId && (
                <div className="bg-muted/30 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">Midtrans Order ID: <span className="font-mono text-foreground">{selectedOrder.midtransOrderId}</span></p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailDialog(false)}>Close</Button>
            <Button
              className="bg-primary text-primary-foreground"
              onClick={saveStatus}
              disabled={updateStatusMutation.isPending}
            >
              {updateStatusMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
