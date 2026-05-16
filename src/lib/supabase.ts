import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://peevprlodvjbrtvzlygw.supabase.co'
const supabaseKey = 'sb_publishable_jJJLJdp9dvr7DZ0WIVhhmA_Tn-j4cr1'

export const supabase = createClient(supabaseUrl, supabaseKey)