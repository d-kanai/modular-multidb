'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

interface Screening {
  id: string
  userId: string
  status: string
  createdAt: string
}

export default function AdminPage() {
  const queryClient = useQueryClient()

  const { data: screenings, isLoading } = useQuery<Screening[]>({
    queryKey: ['screenings'],
    queryFn: async () => {
      const response = await fetch('http://localhost:4001/api/screenings/list')
      if (!response.ok) throw new Error('Failed to fetch screenings')
      return response.json()
    },
    refetchInterval: 3000, // Auto-refresh every 3 seconds
  })

  const passMutation = useMutation({
    mutationFn: async (screeningId: string) => {
      const response = await fetch(
        `http://localhost:4001/api/screenings/${screeningId}/pass`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }
      )
      if (!response.ok) throw new Error('Failed to pass screening')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['screenings'] })
    },
  })

  const handlePass = (screeningId: string) => {
    if (confirm('Are you sure you want to pass this screening?')) {
      passMutation.mutate(screeningId)
    }
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Admin Portal - Screening Management</h1>

        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8">
          <h2 className="text-xl font-semibold mb-4">Screening Applications</h2>

          {isLoading ? (
            <p>Loading screenings...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="px-4 py-2 text-left">ID</th>
                    <th className="px-4 py-2 text-left">User ID</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Created At</th>
                    <th className="px-4 py-2 text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {screenings?.map((screening) => (
                    <tr key={screening.id} className="border-b">
                      <td className="px-4 py-2 font-mono text-sm">
                        {screening.id.substring(0, 8)}...
                      </td>
                      <td className="px-4 py-2 font-mono text-sm">
                        {screening.userId.substring(0, 8)}...
                      </td>
                      <td className="px-4 py-2">
                        <span
                          className={`px-2 py-1 rounded text-sm ${
                            screening.status === 'PENDING'
                              ? 'bg-yellow-200 text-yellow-800'
                              : screening.status === 'PASSED'
                              ? 'bg-green-200 text-green-800'
                              : 'bg-red-200 text-red-800'
                          }`}
                        >
                          {screening.status}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        {new Date(screening.createdAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-2">
                        {screening.status === 'PENDING' && (
                          <button
                            onClick={() => handlePass(screening.id)}
                            disabled={passMutation.isPending}
                            className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded text-sm disabled:opacity-50"
                          >
                            Pass
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {screenings?.length === 0 && (
                <p className="text-center py-4 text-gray-500">No screenings found</p>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
