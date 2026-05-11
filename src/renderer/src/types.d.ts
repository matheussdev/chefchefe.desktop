export interface Account {
  id: string
  name: string
  email: string
}

export interface LoginParams {
  email: string
  password: string
  restaurant_token: string
}

export interface LoginResponse {
  access: string
  refres: string
  restaurant_id: string
}

export interface Restaurant {
  id: string
  name: string
  default_tip_value: string
  tip_aplyed_by_default: boolean
  tip_type: 'percentage' | 'value'
  payment_methods: {
    id: string
    display_name: string
    position: number
    method: string
  }[]
}

export interface User {
  id: string
  name: string
  email: string
  first_name?: string
  last_name?: string
  permission: string
}

interface Complement {
  id: string
  complement_group_name: string
  complements: {
    name: string
    quantity: string
    price: number
  }[]
}

export interface Order {
  id: string
  number: number
  product: string
  quantity: string
  unit_price: string
  complements_price: string
  total_price: string
  status: string
  notes: string
  launched_by: string
  complements: Complement[]
  created: string
  bill_number: number
}

export interface BillGroup {
  id: string
  number: number
  orders: Order[]
}

export interface Bill {
  id: string
  created: string
  modified: string
  is_active: boolean
  is_deleted: boolean
  number: number
  identification: string
  is_open: boolean
  opened_at: string | null
  closed_at: string | null
  opened_by_name: string | null
  table: string | null
  table_number: string | null
  restaurant: string
  opened_by: string | null
  sale: string | null
  orders?: Order[]
  bill_group?: BillGroup[] | null
  bill_groups?: string[] | null
}

export interface BillItems {
  id: string
  bill_id: string
  product_name: string
  quantity: number
  unit_price: string
  total_price: string
  responsible_name?: string
}

export interface Table {
  id: string
  created: string
  modified: string
  is_active: boolean
  is_deleted: boolean
  number: number
  title: string
  capacity: number
  restaurant: string
  count: number
}

export interface Complement {
  id: string
  name: string
  description: string
  price: string
  max: number
  min: number
}

export interface ComplementGroup {
  id: string
  name: string
  rule: string
  min: number
  max: number
  complements: Complement[]
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: string
  category: string
  code: string
  sell_type: string
  complement_groups: ComplementGroup[]
}


export interface Cashier{
  id: string
  identification: string
  is_open: boolean
  created: string
  closed_at: string | null
  opened_by_name: string
  closed_by_name: string | null
  restaurant: string
  opened_by: string
  closed_by: string | null
  current_value: string | null
}


export interface PmStats {
  total_amount: number
  average_amount: number
  transaction_count: number
  payment_method_name: string
  method_type: string,
  avarage_count: number
}


export interface Sale {
  id: string
  balance: string
  payment_method_name: string
  payment_method_method: string
  created: string
}
