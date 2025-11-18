import { createClient } from '@supabase/supabase-js'
import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function uploadAvatars() {
  const avatarsDir = join(process.cwd(), 'public', 'avatars')
  const files = readdirSync(avatarsDir).filter(file => file.endsWith('.jpg'))

  console.log('[v0] Starting avatar upload...')
  console.log('[v0] Found files:', files)

  // Upload each avatar to the existing 'avator' bucket
  for (const file of files) {
    const filePath = join(avatarsDir, file)
    const fileBuffer = readFileSync(filePath)
    
    console.log(`[v0] Uploading ${file}...`)
    
    const { data, error } = await supabase.storage
      .from('avator')
      .upload(file, fileBuffer, {
        contentType: 'image/jpeg',
        upsert: true
      })

    if (error) {
      console.error(`[v0] Error uploading ${file}:`, error)
    } else {
      console.log(`[v0] Successfully uploaded ${file}`)
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avator')
        .getPublicUrl(file)
      
      console.log(`[v0] Public URL: ${urlData.publicUrl}`)
    }
  }

  console.log('[v0] Avatar upload complete!')
}

uploadAvatars().catch(console.error)
