import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Plus,
  Pencil,
  Trash2,
  Clock,
  Users,
  Link2,
  Loader2,
  Home,
  CheckCircle2,
  XCircle,
  CalendarCheck,
} from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { AdminLayout } from "./AdminDashboard";

const STATUS_COLORS: Record<string, string> = {
  confirmed: "bg-green-100 text-green-700 border-green-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
  completed: "bg-blue-100 text-blue-700 border-blue-200",
};

export default function AdminMeetings() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [showSlotForm, setShowSlotForm] = useState(false);
  const [editingSlotId, setEditingSlotId] = useState<number | null>(null);
  const [deleteSlotTarget, setDeleteSlotTarget] = useState<number | null>(null);
  const [slotForm, setSlotForm] = useState({
    title: "",
    description: "",
    date: "",
    startTime: "",
    endTime: "",
    maxBookings: 1,
    meetingLink: "",
    isActive: true,
  });

  const utils = trpc.useUtils();
  const { data: slots, isLoading: slotsLoading } = trpc.chatbot.meeting.adminList.useQuery();
  const { data: bookings, isLoading: bookingsLoading } = trpc.chatbot.meeting.adminListBookings.useQuery();

  const createSlot = trpc.chatbot.meeting.adminCreate.useMutation({
    onSuccess: () => { toast.success("Meeting slot created"); utils.chatbot.meeting.adminList.invalidate(); resetSlotForm(); },
    onError: (e) => toast.error(e.message),
  });

  const updateSlot = trpc.chatbot.meeting.adminUpdate.useMutation({
    onSuccess: () => { toast.success("Slot updated"); utils.chatbot.meeting.adminList.invalidate(); resetSlotForm(); },
    onError: (e) => toast.error(e.message),
  });

  const deleteSlot = trpc.chatbot.meeting.adminDelete.useMutation({
    onSuccess: () => { toast.success("Slot deleted"); utils.chatbot.meeting.adminList.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  const updateBooking = trpc.chatbot.meeting.adminUpdateBooking.useMutation({
    onSuccess: () => { toast.success("Booking updated"); utils.chatbot.meeting.adminListBookings.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  const resetSlotForm = () => {
    setSlotForm({ title: "", description: "", date: "", startTime: "", endTime: "", maxBookings: 1, meetingLink: "", isActive: true });
    setEditingSlotId(null);
    setShowSlotForm(false);
  };

  const openEditSlot = (slot: NonNullable<typeof slots>[0]) => {
    setSlotForm({
      title: slot.title,
      description: slot.description ?? "",
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      maxBookings: slot.maxBookings,
      meetingLink: slot.meetingLink ?? "",
      isActive: slot.isActive,
    });
    setEditingSlotId(slot.id);
    setShowSlotForm(true);
  };

  const handleSlotSubmit = () => {
    if (!slotForm.title || !slotForm.date || !slotForm.startTime || !slotForm.endTime) {
      toast.error("Please fill in all required fields");
      return;
    }
    const payload = { ...slotForm, description: slotForm.description || undefined, meetingLink: slotForm.meetingLink || undefined };
    if (editingSlotId) {
      updateSlot.mutate({ id: editingSlotId, ...payload });
    } else {
      createSlot.mutate(payload);
    }
  };

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Access restricted.</p>
          <button onClick={() => navigate("/")} className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-input bg-background text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"><Home className="h-4 w-4" />Back to Home</button>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div>
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="h-5 w-5 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">Meeting Management</h1>
            </div>
            <p className="text-sm text-muted-foreground">Manage consultation slots and customer bookings</p>
          </div>
          <Button onClick={() => { resetSlotForm(); setShowSlotForm(true); }}>
            <Plus className="h-4 w-4 mr-2" /> Add Slot
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total Slots", value: slots?.length ?? 0 },
            { label: "Active Slots", value: slots?.filter((s) => s.isActive).length ?? 0 },
            { label: "Total Bookings", value: bookings?.length ?? 0 },
            { label: "Confirmed", value: bookings?.filter((b) => b.status === "confirmed").length ?? 0 },
          ].map(({ label, value }) => (
            <div key={label} className="bg-card border border-border/60 rounded-xl p-4">
              <p className="text-2xl font-bold text-foreground">{value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        <Tabs defaultValue="slots">
          <TabsList className="mb-5">
            <TabsTrigger value="slots">Meeting Slots</TabsTrigger>
            <TabsTrigger value="bookings">Bookings ({bookings?.length ?? 0})</TabsTrigger>
          </TabsList>

          {/* Slots Tab */}
          <TabsContent value="slots">
            {slotsLoading ? (
              <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
            ) : !slots?.length ? (
              <div className="text-center py-16 bg-card border border-border/60 rounded-xl">
                <Calendar className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-muted-foreground font-medium">No meeting slots yet</p>
                <Button className="mt-4" onClick={() => { resetSlotForm(); setShowSlotForm(true); }}>
                  <Plus className="h-4 w-4 mr-2" /> Create First Slot
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {slots.map((slot) => (
                  <div key={slot.id} className="bg-card border border-border/60 rounded-xl p-4 hover:border-primary/30 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground">{slot.title}</h3>
                          <Badge variant={slot.isActive ? "default" : "secondary"} className="text-xs">
                            {slot.isActive ? "Active" : "Inactive"}
                          </Badge>
                          {slot.currentBookings >= slot.maxBookings && (
                            <Badge variant="destructive" className="text-xs">Full</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{slot.date}</span>
                          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{slot.startTime} – {slot.endTime}</span>
                          <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{slot.currentBookings}/{slot.maxBookings} booked</span>
                          {slot.meetingLink && <span className="flex items-center gap-1 text-primary"><Link2 className="h-3.5 w-3.5" />Link set</span>}
                        </div>
                        {slot.description && <p className="text-xs text-muted-foreground mt-1">{slot.description}</p>}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEditSlot(slot)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => setDeleteSlotTarget(slot.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings">
            {bookingsLoading ? (
              <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
            ) : !bookings?.length ? (
              <div className="text-center py-16 bg-card border border-border/60 rounded-xl">
                <CalendarCheck className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-muted-foreground font-medium">No bookings yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {bookings.map((booking) => {
                  const slot = slots?.find((s) => s.id === booking.slotId);
                  return (
                    <div key={booking.id} className="bg-card border border-border/60 rounded-xl p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-foreground">{booking.customerName}</h3>
                            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${STATUS_COLORS[booking.status]}`}>
                              {booking.status}
                            </span>
                          </div>
                          <div className="text-sm text-muted-foreground space-y-0.5">
                            <p>{booking.customerEmail}{booking.customerPhone ? ` · ${booking.customerPhone}` : ""}</p>
                            {slot && <p className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{slot.title} · {slot.date} {slot.startTime}–{slot.endTime}</p>}
                            {booking.notes && <p className="italic">"{booking.notes}"</p>}
                            <p className="text-xs text-muted-foreground/60">Booked {new Date(booking.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <Select
                          value={booking.status}
                          onValueChange={(v) => updateBooking.mutate({ id: booking.id, status: v as "confirmed" | "cancelled" | "completed" })}
                        >
                          <SelectTrigger className="w-32 h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Slot Form Dialog */}
      <Dialog open={showSlotForm} onOpenChange={(o) => { if (!o) resetSlotForm(); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingSlotId ? "Edit Meeting Slot" : "Create Meeting Slot"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-sm font-medium mb-1.5 block">Title *</Label>
              <Input placeholder="e.g. Health Consultation" value={slotForm.title} onChange={(e) => setSlotForm((f) => ({ ...f, title: e.target.value }))} />
            </div>
            <div>
              <Label className="text-sm font-medium mb-1.5 block">Description</Label>
              <Input placeholder="Optional description" value={slotForm.description} onChange={(e) => setSlotForm((f) => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-sm font-medium mb-1.5 block">Date *</Label>
                <Input type="date" value={slotForm.date} onChange={(e) => setSlotForm((f) => ({ ...f, date: e.target.value }))} />
              </div>
              <div>
                <Label className="text-sm font-medium mb-1.5 block">Start *</Label>
                <Input type="time" value={slotForm.startTime} onChange={(e) => setSlotForm((f) => ({ ...f, startTime: e.target.value }))} />
              </div>
              <div>
                <Label className="text-sm font-medium mb-1.5 block">End *</Label>
                <Input type="time" value={slotForm.endTime} onChange={(e) => setSlotForm((f) => ({ ...f, endTime: e.target.value }))} />
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium mb-1.5 block">Max Bookings</Label>
              <Input type="number" min={1} value={slotForm.maxBookings} onChange={(e) => setSlotForm((f) => ({ ...f, maxBookings: parseInt(e.target.value) || 1 }))} />
            </div>
            <div>
              <Label className="text-sm font-medium mb-1.5 block">Meeting Link (optional)</Label>
              <Input placeholder="https://meet.google.com/..." value={slotForm.meetingLink} onChange={(e) => setSlotForm((f) => ({ ...f, meetingLink: e.target.value }))} />
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={slotForm.isActive} onCheckedChange={(v) => setSlotForm((f) => ({ ...f, isActive: v }))} />
              <Label className="text-sm">Active (visible to customers)</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetSlotForm}>Cancel</Button>
            <Button onClick={handleSlotSubmit} disabled={createSlot.isPending || updateSlot.isPending}>
              {(createSlot.isPending || updateSlot.isPending) && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {editingSlotId ? "Save Changes" : "Create Slot"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Delete Slot Confirmation */}
      <AlertDialog open={deleteSlotTarget !== null} onOpenChange={(open) => { if (!open) setDeleteSlotTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Slot</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this meeting slot? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteSlotTarget(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => { if (deleteSlotTarget !== null) { deleteSlot.mutate({ id: deleteSlotTarget }); setDeleteSlotTarget(null); } }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
