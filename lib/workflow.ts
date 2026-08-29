import { Client as WorkflowClient } from "@upstash/workflow"
import { Client as QStashClient, resend } from "@upstash/qstash";
import config from "@/lib/config"

export const workflowClient = new WorkflowClient({
  baseUrl: config.env.upstash.qstashUrl,
  token: config.env.upstash.qstashToken,
})


const qStashClient = new QStashClient({ token: config.env.upstash.qstashToken });

export const sendEmail = async ({email, subject, message}: {
  message: string, 
  email: string, 
  subject: string}) => {

  await qStashClient.publishJSON({
    api: {
      name: "email",
      provider: resend({ token: config.env.upstash.resendToken }),
    },
    body: {
      from: "Simaye <onboarding@hello.simayesolutions.com>",
      to: [email],
      subject,
      html: message,
    },
  });
}
