"use client";

import React from 'react'
import { signUpSchema } from '@/lib/validation'
import AuthForm from '@/components/AuthForm'
import { signUp } from '@/lib/actions/auth';

const page = () => (
  <AuthForm
    type="SIGN_UP"
    schema={signUpSchema}
    defaultValues={{
      email: "",
      password: "",
      universityId: 0,
      fullName: "",
      universityCard: ""
    }}
    onSubmit={signUp}
  />
)

export default page