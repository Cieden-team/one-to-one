"use client"

import { SignedIn, SignedOut, SignIn } from "@clerk/nextjs"
import { useUser } from "@clerk/nextjs"
import { ActionItemsDashboard } from "@/components/action-items-dashboard"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function ActionItemsPage() {
  const { user } = useUser()
  const userEmail = user?.primaryEmailAddress?.emailAddress || user?.emailAddresses?.[0]?.emailAddress || ""

  return (
    <>
      <SignedOut>
        <div className="flex items-center justify-center min-h-screen">
          <SignIn routing="hash" appearance={{ variables: { colorPrimary: '#2563eb' } }} />
        </div>
      </SignedOut>
      <SignedIn>
        <div className="min-h-screen bg-gray-50">
          <div className="border-b bg-white">
            <div className="flex h-16 items-center px-6">
              <Link href="/">
                <Button variant="ghost" size="sm" className="mr-4">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold">Action Items Dashboard</h1>
              </div>
            </div>
          </div>

          <div className="p-6">
            <ActionItemsDashboard userEmail={userEmail} />
          </div>
        </div>
      </SignedIn>
    </>
  )
} 