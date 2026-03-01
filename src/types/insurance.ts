export interface InsuranceApplication {
  id: string;
  userId: string;
  fullName: string;
  icNumber: string;
  vehiclePlate: string;
  chassisNumber: string;
  insuranceType: string;
  status: "Pending" | "Approved" | "Rejected";
  createdAt: Date;
}
