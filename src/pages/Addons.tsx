import { useState, useCallback } from "react";
import { format } from "date-fns";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { StatCard } from "@/components/ui/stat-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Package, Shield, FileText, Truck, Smartphone, Search,
  ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown,
  Clock, CheckCircle2, Loader2, Plus, Send, Plug, ScrollText,
  FileCheck, Eye,
} from "lucide-react";
import { useAddons, useApplications } from "@/hooks/useFirestore";
import { AddonServiceCard } from "@/components/addons/AddonServiceCard";
import { AddonFormSection } from "@/components/addons/AddonFormSection";
import { AddonRequestDetailDrawer } from "@/components/addons/AddonRequestDetailDrawer";
import {
  ADDON_SERVICES,
  type AddonServiceType,
  type AddonFormData,
  type AddonRequest,
} from "@/types/addon-forms";
import { toast } from "sonner";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import type { AddonType } from "@/types";

const ITEMS_PER_PAGE = 10;

const typeIconMap: Record<string, React.ElementType> = {
  adapter: Plug,
  authorization_letter: ScrollText,
  personal_insurance: Shield,
  tm2_tm3: FileCheck,
  tdac: FileText,
  towing: Truck,
  sim_card: Smartphone,
  insurance: Shield,
};

const typeLabelMap: Record<string, string> = {
  adapter: "Adapter",
  authorization_letter: "Auth Letter",
  personal_insurance: "Personal Insurance",
  tm2_tm3: "TM2 / TM3",
  tdac: "TDAC",
  towing: "Towing",
  sim_card: "SIM Card",
  insurance: "Insurance",
};

const Addons = () => {
  const { addons, loading } = useAddons();
  const { applications } = useApplications();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("requests");

  // --- New Request State ---
  const [selectedServices, setSelectedServices] = useState<AddonServiceType[]>([]);
  const [formDataMap, setFormDataMap] = useState<Partial<Record<AddonServiceType, AddonFormData>>>({});
  const [documentsMap, setDocumentsMap] = useState<Partial<Record<AddonServiceType, Record<string, File | null>>>>({});
  const [errorsMap, setErrorsMap] = useState<Partial<Record<AddonServiceType, Record<string, string>>>>({});
  const [submitting, setSubmitting] = useState(false);

  // --- Table State ---
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>("desc");

  // --- Detail Drawer ---
  const [selectedRequest, setSelectedRequest] = useState<AddonRequest | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // --- Service selection ---
  const toggleService = useCallback((type: AddonServiceType) => {
    setSelectedServices((prev) => {
      if (prev.includes(type)) {
        return prev.filter((t) => t !== type);
      }
      // Init form data for new selection
      if (!formDataMap[type]) {
        setFormDataMap((m) => ({ ...m, [type]: { fullName: "", phone: "" } }));
        setDocumentsMap((m) => ({ ...m, [type]: {} }));
      }
      return [...prev, type];
    });
    setErrorsMap((m) => ({ ...m, [type]: {} }));
  }, [formDataMap]);

  const handleFormChange = useCallback((type: AddonServiceType, key: string, value: string) => {
    setFormDataMap((m) => ({
      ...m,
      [type]: { ...m[type], [key]: value },
    }));
    setErrorsMap((m) => {
      const errs = { ...m[type] };
      delete errs[key];
      return { ...m, [type]: errs };
    });
  }, []);

  const handleDocumentChange = useCallback((type: AddonServiceType, key: string, file: File | null) => {
    setDocumentsMap((m) => ({
      ...m,
      [type]: { ...m[type], [key]: file },
    }));
    setErrorsMap((m) => {
      const errs = { ...m[type] };
      delete errs[`doc_${key}`];
      return { ...m, [type]: errs };
    });
  }, []);

  const removeService = useCallback((type: AddonServiceType) => {
    setSelectedServices((prev) => prev.filter((t) => t !== type));
  }, []);

  // --- Validation ---
  const validate = (): boolean => {
    let valid = true;
    const newErrorsMap: Record<AddonServiceType, Record<string, string>> = {} as any;

    selectedServices.forEach((type) => {
      const config = ADDON_SERVICES.find((s) => s.type === type)!;
      const data = formDataMap[type] || {};
      const docs = documentsMap[type] || {};
      const errs: Record<string, string> = {};

      config.fields.forEach((field) => {
        if (field.required && !data[field.key]?.trim()) {
          errs[field.key] = `${field.label} is required`;
          valid = false;
        }
      });

      config.documents.forEach((doc) => {
        if (doc.required && !docs[doc.key]) {
          errs[`doc_${doc.key}`] = `${doc.label} is required`;
          valid = false;
        }
      });

      newErrorsMap[type] = errs;
    });

    setErrorsMap(newErrorsMap);
    return valid;
  };

  // --- Submit ---
  const handleSubmit = async () => {
    if (selectedServices.length === 0) {
      toast.error("Please select at least one add-on service");
      return;
    }
    if (!validate()) {
      toast.error("Please fill in all required fields and upload documents");
      return;
    }

    setSubmitting(true);
    try {
      for (const type of selectedServices) {
        const config = ADDON_SERVICES.find((s) => s.type === type)!;
        const data = formDataMap[type] || {};

        // Build additional details (non-standard fields)
        const additionalDetails: Record<string, string> = {};
        config.fields.forEach((f) => {
          if (f.key !== "fullName" && f.key !== "phone" && data[f.key]) {
            additionalDetails[f.key] = data[f.key]!;
          }
        });

        // For now, we store document names (in production, upload to Firebase Storage first)
        const documentNames: Record<string, string> = {};
        const docs = documentsMap[type] || {};
        Object.entries(docs).forEach(([key, file]) => {
          if (file) documentNames[key] = file.name;
        });

        await addDoc(collection(db, "addon_requests"), {
          addonType: type,
          fullName: (data as AddonFormData).fullName || "",
          phone: (data as AddonFormData).phone || "",
          additionalDetails,
          documentNames,
          status: "pending",
          createdAt: Timestamp.now(),
          submittedBy: user?.id || "",
        });
      }

      toast.success(`${selectedServices.length} add-on request(s) submitted successfully`);
      setSelectedServices([]);
      setFormDataMap({} as any);
      setDocumentsMap({} as any);
      setErrorsMap({} as any);
      setActiveTab("requests");
    } catch (err) {
      console.error("Error submitting addon requests:", err);
      toast.error("Failed to submit add-on requests");
    } finally {
      setSubmitting(false);
    }
  };

  // --- Table Filtering (existing derived addons) ---
  const filteredAddons = addons
    .filter((addon) => typeFilter === "all" || addon.type === typeFilter)
    .filter((addon) => {
      if (!searchQuery) return true;
      const app = getApplication(addon.applicationId);
      const q = searchQuery.toLowerCase();
      return (
        app?.name?.toLowerCase().includes(q) ||
        app?.phone?.toLowerCase().includes(q) ||
        addon.id.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (!sortOrder) return 0;
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "desc" ? "asc" : prev === "asc" ? null : "desc"));
    setCurrentPage(1);
  };

  const getSortIcon = () => {
    if (sortOrder === "desc") return <ArrowDown className="h-3.5 w-3.5" />;
    if (sortOrder === "asc") return <ArrowUp className="h-3.5 w-3.5" />;
    return <ArrowUpDown className="h-3.5 w-3.5" />;
  };

  const totalPages = Math.ceil(filteredAddons.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedAddons = filteredAddons.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  function getApplication(appId: string) {
    const orderId = appId.includes("_addon_") ? appId.split("_addon_")[0] : appId;
    return applications.find((a) => a.id === orderId);
  }

  const getAddonIcon = (type: string) => {
    const Icon = typeIconMap[type] || Package;
    return <Icon className="h-4 w-4" />;
  };

  const addonStats = {
    total: addons.length,
    pending: addons.filter((a) => a.status === "pending").length,
    confirmed: addons.filter((a) => a.status === "confirmed").length,
    completed: addons.filter((a) => a.status === "completed").length,
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Header title="Add-ons" subtitle="Manage add-on services and requests" />
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Header title="Add-ons" subtitle="Manage add-on services and requests" />
      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard title="Total Add-ons" value={addonStats.total} icon={Package} iconBg="bg-primary/10" iconColor="text-primary" />
          <StatCard title="Pending" value={addonStats.pending} icon={Clock} iconBg="bg-warning/10" iconColor="text-warning" />
          <StatCard title="Confirmed" value={addonStats.confirmed} icon={Loader2} iconBg="bg-accent/10" iconColor="text-accent" />
          <StatCard title="Completed" value={addonStats.completed} icon={CheckCircle2} iconBg="bg-success/10" iconColor="text-success" />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="requests" className="text-sm">
              <Package className="h-4 w-4 mr-1.5" />
              All Requests
            </TabsTrigger>
            <TabsTrigger value="new" className="text-sm">
              <Plus className="h-4 w-4 mr-1.5" />
              New Request
            </TabsTrigger>
          </TabsList>

          {/* ====== NEW REQUEST TAB ====== */}
          <TabsContent value="new" className="space-y-6 mt-4">
            {/* Service Selection */}
            <Card>
              <CardHeader className="py-4 px-5">
                <CardTitle className="text-sm font-semibold">Select Add-on Services</CardTitle>
                <p className="text-xs text-muted-foreground">Choose one or more services to apply for</p>
              </CardHeader>
              <CardContent className="px-5 pb-5 pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {ADDON_SERVICES.map((config) => (
                    <AddonServiceCard
                      key={config.type}
                      config={config}
                      selected={selectedServices.includes(config.type)}
                      onToggle={() => toggleService(config.type)}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Forms for selected services */}
            {selectedServices.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground">
                  Complete Details for {selectedServices.length} Service{selectedServices.length > 1 ? "s" : ""}
                </h3>

                {selectedServices.map((type) => {
                  const config = ADDON_SERVICES.find((s) => s.type === type)!;
                  return (
                    <AddonFormSection
                      key={type}
                      config={config}
                      formData={formDataMap[type] || { fullName: "", phone: "" }}
                      documents={documentsMap[type] || {}}
                      errors={errorsMap[type] || {}}
                      onFormChange={(key, value) => handleFormChange(type, key, value)}
                      onDocumentChange={(key, file) => handleDocumentChange(type, key, file)}
                      onRemove={() => removeService(type)}
                    />
                  );
                })}

                <div className="flex justify-end pt-2">
                  <Button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="min-w-[160px]"
                  >
                    {submitting ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    {submitting ? "Submitting..." : "Submit Request"}
                  </Button>
                </div>
              </div>
            )}

            {selectedServices.length === 0 && (
              <div className="text-center py-10 text-muted-foreground">
                <Package className="h-10 w-10 mx-auto mb-3 opacity-40" />
                <p className="text-sm">Select add-on services above to get started</p>
              </div>
            )}
          </TabsContent>

          {/* ====== ALL REQUESTS TAB ====== */}
          <TabsContent value="requests" className="space-y-4 mt-4">
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, phone, or ID..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className="pl-9 h-9 bg-background"
                />
              </div>
              <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setCurrentPage(1); }}>
                <SelectTrigger className="w-40 h-9 bg-background">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="tdac">TDAC</SelectItem>
                  <SelectItem value="towing">Towing</SelectItem>
                  <SelectItem value="sim_card">SIM Card</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Table */}
            <Card className="border border-border shadow-sm">
              <CardContent className="p-0">
                {filteredAddons.length === 0 ? (
                  <EmptyState
                    icon={Package}
                    title="No add-ons found"
                    description="Add-on records linked to applications will appear here."
                  />
                ) : (
                  <>
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/30 border-b border-border">
                          <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Applicant</TableHead>
                          <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Type</TableHead>
                          <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Vehicle</TableHead>
                          <TableHead
                            className="text-xs font-semibold uppercase tracking-wide text-muted-foreground cursor-pointer hover:text-foreground transition-colors select-none"
                            onClick={toggleSortOrder}
                          >
                            <div className="flex items-center gap-1">
                              Created At
                              {getSortIcon()}
                            </div>
                          </TableHead>
                          <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedAddons.map((addon) => {
                          const app = getApplication(addon.applicationId);
                          return (
                            <TableRow key={addon.id} className="hover:bg-muted/30 transition-colors border-b border-border/50">
                              <TableCell>
                                <p className="text-sm font-medium text-foreground">{app?.name || "-"}</p>
                                <p className="text-xs text-muted-foreground">{app?.phone || ""}</p>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2 text-sm">
                                  {getAddonIcon(addon.type)}
                                  <span className="capitalize">{typeLabelMap[addon.type] || addon.type.replace("_", " ")}</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">{app?.vehicleType ? app.vehicleType.replace("_", " ") : "-"}</TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {addon.createdAt ? format(addon.createdAt, "dd MMM yyyy, HH:mm") : "-"}
                              </TableCell>
                              <TableCell><StatusBadge variant={addon.status}>{addon.status}</StatusBadge></TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between px-6 py-4 border-t border-border">
                        <p className="text-xs text-muted-foreground">
                          Showing {startIndex + 1}–{Math.min(startIndex + ITEMS_PER_PAGE, filteredAddons.length)} of {filteredAddons.length}
                        </p>
                        <div className="flex items-center gap-1.5">
                          <Button variant="outline" size="sm" className="h-8" onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1}>
                            <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Previous
                          </Button>
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <Button key={page} variant={currentPage === page ? "default" : "outline"} size="sm" className="w-8 h-8 p-0" onClick={() => setCurrentPage(page)}>
                              {page}
                            </Button>
                          ))}
                          <Button variant="outline" size="sm" className="h-8" onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>
                            Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Detail Drawer */}
      <AddonRequestDetailDrawer
        request={selectedRequest}
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); setSelectedRequest(null); }}
      />
    </DashboardLayout>
  );
};

export default Addons;
