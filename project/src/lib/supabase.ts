import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
  },
});

export type Course = {
  id: string;
  title: string;
  description: string;
  price: number;
  duration: string;
  lessons_count: number;
  image_url: string | null;
  featured: boolean;
  sort_order: number;
  created_at: string;
};

export type Instructor = {
  id: string;
  name: string;
  bio: string;
  experience_years: number;
  phone: string;
  specialty: string;
  image_url: string | null;
  rating: number;
  available: boolean;
  sort_order: number;
  created_at: string;
};

export type Booking = {
  id: string;
  name: string;
  phone: string;
  email: string;
  course_id: string | null;
  status: string;
  preferred_date: string;
  notes: string;
  created_at: string;
};

export type Message = {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  read: boolean;
  created_at: string;
};

export type JobApplication = {
  id: string;
  name: string;
  phone: string;
  email: string;
  position: string;
  experience: string;
  message: string;
  status: string;
  created_at: string;
};

export type Testimonial = {
  id: string;
  name: string;
  course: string;
  rating: number;
  text: string;
  approved: boolean;
  avatar_url: string | null;
  sort_order: number;
  created_at: string;
};

export type SiteSetting = {
  id: string;
  key: string;
  value: string;
  updated_at: string;
};
