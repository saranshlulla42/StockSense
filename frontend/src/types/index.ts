export type OperationStatus = "draft" | "waiting" | "ready" | "done" | "cancelled";

export type Product = {
  id: number;
  name: string;
  sku: string;
  category: string;
  unit_of_measure: string;
  per_unit_cost: number;
  on_hand: number;
  free_to_use: number;
};

export type Operation = {
  id: number;
  reference: string;
  operation_type: string;
  status: OperationStatus;
  contact_name: string;
  schedule_date: string | null;
};
