import { z } from "zod";

export const vehicleSchema = z.object({
  regNumber: z.string().min(1, "Registration number is required").max(20),
  name: z.string().min(1, "Vehicle name is required"),
  type: z.enum(["TRUCK", "VAN", "CAR", "MOTORCYCLE", "BUS", "TRAILER", "OTHER"]),
  maxLoad: z.number().positive("Max load must be positive"),
  odometer: z.number().min(0).default(0),
  acquisitionCost: z.number().min(0).default(0),
  region: z.string().optional(),
  make: z.string().optional(),
  year: z.number().int().min(1900).max(2030).optional().nullable(),
  notes: z.string().optional(),
});

export const driverSchema = z.object({
  name: z.string().min(1, "Name is required"),
  licenseNumber: z.string().min(1, "License number is required"),
  licenseCategory: z.string().min(1, "License category is required"),
  licenseExpiry: z.string().min(1, "License expiry is required"),
  contactNumber: z.string().min(1, "Contact number is required"),
  email: z.string().email().optional().nullable(),
  safetyScore: z.number().min(0).max(100).default(100),
  notes: z.string().optional(),
});

export const tripSchema = z.object({
  source: z.string().min(1, "Source is required"),
  destination: z.string().min(1, "Destination is required"),
  vehicleId: z.string().min(1, "Vehicle is required"),
  driverId: z.string().min(1, "Driver is required"),
  cargoWeight: z.number().positive("Cargo weight must be positive"),
  plannedDistance: z.number().positive("Planned distance must be positive"),
  revenue: z.number().min(0).optional().default(0),
  notes: z.string().optional(),
});

export const completeTripSchema = z.object({
  actualDistance: z.number().positive("Actual distance must be positive"),
  fuelConsumed: z.number().positive("Fuel consumed must be positive"),
  revenue: z.number().min(0).optional(),
  notes: z.string().optional(),
});

export const maintenanceSchema = z.object({
  vehicleId: z.string().min(1, "Vehicle is required"),
  type: z.string().min(1, "Maintenance type is required"),
  description: z.string().min(1, "Description is required"),
  cost: z.number().min(0).default(0),
  technicianName: z.string().optional(),
  startDate: z.string().optional(),
  notes: z.string().optional(),
});

export const closeMaintenanceSchema = z.object({
  cost: z.number().min(0),
  endDate: z.string().optional(),
  notes: z.string().optional(),
});

export const fuelLogSchema = z.object({
  vehicleId: z.string().min(1, "Vehicle is required"),
  tripId: z.string().optional().nullable(),
  liters: z.number().positive("Liters must be positive"),
  costPerLiter: z.number().positive("Cost per liter must be positive"),
  odometer: z.number().min(0),
  date: z.string().optional(),
  station: z.string().optional(),
});

export const expenseSchema = z.object({
  vehicleId: z.string().min(1, "Vehicle is required"),
  tripId: z.string().optional().nullable(),
  category: z.enum(["TOLL", "MAINTENANCE", "INSURANCE", "PARKING", "FINE", "OTHER"]),
  amount: z.number().positive("Amount must be positive"),
  description: z.string().min(1, "Description is required"),
  date: z.string().optional(),
  receipt: z.string().optional(),
});

export type VehicleInput = z.infer<typeof vehicleSchema>;
export type DriverInput = z.infer<typeof driverSchema>;
export type TripInput = z.infer<typeof tripSchema>;
export type CompleteTripInput = z.infer<typeof completeTripSchema>;
export type MaintenanceInput = z.infer<typeof maintenanceSchema>;
export type CloseMaintenanceInput = z.infer<typeof closeMaintenanceSchema>;
export type FuelLogInput = z.infer<typeof fuelLogSchema>;
export type ExpenseInput = z.infer<typeof expenseSchema>;
