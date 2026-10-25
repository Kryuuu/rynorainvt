import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Parse .env manually
try {
  const envContent = fs.readFileSync(path.resolve(process.cwd(), '.env'), 'utf-8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx > 0) {
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      process.env[key] = val;
    }
  });
} catch (e) {
  console.log('Notice reading .env:', e.message);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing from environment.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function main() {
  const email = 'ahmadshawity@gmail.com';
  const password = 'admin123';
  const fullName = 'Ahmad Shawity';

  console.log(`Checking if user ${email} already exists in Supabase Auth...`);

  // 1. List users to check if already created
  const { data: usersData, error: listError } = await supabase.auth.admin.listUsers();
  
  if (listError) {
    console.error('Error listing users:', listError);
  }

  const existingUser = usersData?.users?.find(u => u.email === email);

  if (existingUser) {
    console.log(`User found with ID: ${existingUser.id}. Updating password to '${password}' and confirming email...`);
    const { data: updated, error: updateError } = await supabase.auth.admin.updateUserById(
      existingUser.id,
      {
        password: password,
        email_confirm: true,
        user_metadata: {
          full_name: fullName,
          role: 'platform_admin',
          is_platform_admin: true,
        },
      }
    );

    if (updateError) {
      console.error('Failed to update user:', updateError);
      process.exit(1);
    }

    console.log('SUCCESS! Admin user updated successfully:', updated.user.id, updated.user.email);
  } else {
    console.log(`Creating new user ${email}...`);
    const { data: created, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        role: 'platform_admin',
        is_platform_admin: true,
      },
    });

    if (createError) {
      console.error('Failed to create admin user:', createError);
      process.exit(1);
    }

    console.log('SUCCESS! Admin user created successfully:', created.user.id, created.user.email);
  }

  // Also ensure workspace and user record exist in profiles table if profiles table exists
  try {
    const { error: profileError } = await supabase
      .from('user_profiles')
      .upsert({
        id: existingUser ? existingUser.id : (await supabase.auth.admin.listUsers()).data.users.find(u => u.email === email)?.id,
        full_name: fullName,
        is_platform_admin: true,
      });

    if (profileError) {
      console.log('Note on user_profiles upsert:', profileError.message);
    } else {
      console.log('user_profiles table updated with is_platform_admin = true');
    }
  } catch (err) {
    console.log('user_profiles query notice:', err.message);
  }
}

main().catch(err => {
  console.error('Unhandled script error:', err);
  process.exit(1);
});
