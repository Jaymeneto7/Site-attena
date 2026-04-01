import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://zbnjvvqpffnozzxtlzlg.supabase.co';
const SUPABASE_KEY = 'sb_publishable_UM4ifZpNNzc2tTsK0h8ibQ_Zssnp4V8';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  client: SupabaseClient;

  constructor() {
    this.client = createClient(SUPABASE_URL, SUPABASE_KEY);
  }
}