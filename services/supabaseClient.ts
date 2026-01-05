
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ettxfynejyfvlzjcrioy.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_LvI_mAxyeO5ai97R7YxH9w_NPrnBTYn';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
