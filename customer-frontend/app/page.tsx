'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'

const signupSchema = z.object({
  name: z.string().min(1, 'Name is required'),
})

type SignupForm = z.infer<typeof signupSchema>

export default function Home() {
  const [userId, setUserId] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
  })

  const signupMutation = useMutation({
    mutationFn: async (data: SignupForm) => {
      const response = await fetch('http://localhost:4000/api/users/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Signup failed')
      return response.json()
    },
    onSuccess: (data) => {
      setUserId(data.id)
    },
  })

  const screeningMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch('http://localhost:4001/api/screenings/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })
      if (!response.ok) throw new Error('Screening application failed')
      return response.json()
    },
  })

  const onSignup = (data: SignupForm) => {
    signupMutation.mutate(data)
  }

  const onApplyScreening = () => {
    if (userId) {
      screeningMutation.mutate(userId)
    }
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-8">Customer Portal</h1>

        {!userId ? (
          <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
            <h2 className="text-xl font-semibold mb-4">Sign Up</h2>
            <form onSubmit={handleSubmit(onSignup)}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Name
                </label>
                <input
                  {...register('name')}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  type="text"
                  placeholder="Your name"
                />
                {errors.name && (
                  <p className="text-red-500 text-xs italic">{errors.name.message}</p>
                )}
              </div>
              <button
                type="submit"
                disabled={signupMutation.isPending}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
              >
                {signupMutation.isPending ? 'Signing up...' : 'Sign Up'}
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
            <h2 className="text-xl font-semibold mb-4">Welcome!</h2>
            <p className="mb-4">Your User ID: {userId}</p>

            {!screeningMutation.isSuccess ? (
              <button
                onClick={onApplyScreening}
                disabled={screeningMutation.isPending}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
              >
                {screeningMutation.isPending ? 'Applying...' : 'Apply for Screening'}
              </button>
            ) : (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                Screening application submitted successfully!
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
