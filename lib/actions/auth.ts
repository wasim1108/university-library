'use server'

import { db } from "@/database/drizzle"
import { users } from "@/database/schema"
import { error, log } from "console"
import { eq } from "drizzle-orm"
import { hash } from "bcryptjs"
import { signIn } from "@/auth"

const signInWithCredentials = async (params: Pick<AuthCredentials, "email" | "password">) => {

    const {email, password} = params

    try {
        const result = await signIn("credentials", {
            email,
            password,
            redirect: false
        })

        if(result?.error) {
            return {success:false, error: result.error}
        }

        return {success: true}

    } catch(error) {
        console.error(error, "Automatic Signin error")
        return {success: false, error: "Automatic Signin error"}
    }
}

const signUp = async (params: AuthCredentials) => {

    const { fullName, email, universityId, password, universityCard} = params

    const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email))

    if(existingUser.length > 0) {
        return {success:false, error: "User already exists"}
    }

    const hashedPassword = await hash(password, 10)

    try {
        await db.insert(users).values({
            fullName,
            email,
            universityId,
            password: hashedPassword,
            universityCard
        })

        // await signInWithCredentials({email, password})

        return {success:true}

    } catch(error) {
        console.log(error, 'Signup')
        return {
            success: false,
            error: "Signup error!!"
        }
    }
}

export {signInWithCredentials, signUp}