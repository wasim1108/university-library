import { serve } from "@upstash/workflow/nextjs"
import { users } from "@/database/schema"
import { db } from "@/database/drizzle";
import { eq } from "drizzle-orm"
import { sendEmail } from "@/lib/workflow"

type UserState = "non-active" | "active"

type InitialData = {
  email: string;
  fullName: string;
}

const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000; // 1 day in milliseconds
const THREE_DAYS_IN_MS = 3 * ONE_DAY_IN_MS; // 3 days in milliseconds
const THIRTY_DAYS_IN_MS = 30 * ONE_DAY_IN_MS; // 30 days in milliseconds

const getUserState = async (email: string): Promise<UserState> => {
  // Implement user state logic here
  const user = await db
  .select()
  .from(users)
  .where(eq(users.email, email))
  .limit(1)

  if(!user || user.length === 0) return "non-active"

  const lastActivityDate = new Date(user[0].lastActivityDate!)
  const currentDate = new Date()
  
  const timeDifference = currentDate.getTime() - lastActivityDate.getTime()

  if (timeDifference <= THREE_DAYS_IN_MS && timeDifference > THIRTY_DAYS_IN_MS) {
    return "non-active"
  }

  return "active"
}

export const { POST } = serve<InitialData>(async (context) => {
  const { email, fullName } = context.requestPayload

  await context.run("new-signup", async () => {
    await sendEmail({
      email,
      subject: "Welcome to the platform",
      message: `<p>Hi ${fullName},</p><p>Thank you for signing up! We're excited to have you on board.</p>`
    })
  })
  
  await context.sleep("wait-for-3-days", THREE_DAYS_IN_MS)

  while (true) {
    const state = await context.run("check-user-state", async () => {
      return await getUserState(email)
    })

    if (state === "non-active") {
      await context.run("send-email-non-active", async () => {
        await sendEmail({
          email,
          subject: "You're almost there!",
          message: `<p>Hi ${fullName},</p><p>We noticed you haven't logged in for a while. Come back and see what's new!</p>`
        })
      })
    } else if (state === "active") {
      await context.run("send-email-active", async () => {
        await sendEmail({
          email,
          subject: "Welcome back! Stay updated!",
          message: `<p>Hi ${fullName},</p><p>Here's the latest news and updates from our platform.</p>`
        })
      })
    }

    await context.sleep("wait-for-1-month", THIRTY_DAYS_IN_MS)
  }
})

