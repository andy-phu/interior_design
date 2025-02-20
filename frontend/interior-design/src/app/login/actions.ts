'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
    const supabase = await createClient()

    // type-casting here for convenience
    // in practice, you should validate your inputs
    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    }

    const { error } = await supabase.auth.signInWithPassword(data)

    if (error) {
        console.log("LOGIN ERROR:", error.message);
        return { error: error.message };
    }

    revalidatePath('/', 'layout')
    console.log("SUCCESS: user logged in successfully!");
    return { success: "Login successful!" };
}

export async function signup(formData: FormData) {
    const supabase = await createClient()

    // type-casting here for convenience
    // in practice, you should validate your inputs
    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    }
    console.log("email", data.email)
    console.log("password", data.password)


    const { error } = await supabase.auth.signUp(data)

    if (error){
        return {error: error.message};

    }

    revalidatePath('/', 'layout')
//   redirect('/')
    return { success: "Signup successful!" };
}