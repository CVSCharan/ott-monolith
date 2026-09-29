import { Metadata } from 'next'
import { getPlansList } from '@/modules/billing'
import { PlanSelector } from './PlanSelector'
import { Navbar } from '@/components/navbar/Navbar'
import { Footer } from '@/components/footer/Footer'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Choose Your Plan | StreamForge',
  description:
    'Compare StreamForge streaming plans. Choose between Free, Standard, and Premium 4K Ultra HD.',
}

export default async function PlansPage() {
  const plans = await getPlansList()

  return (
    <div className="min-h-screen bg-bg-base text-text-primary flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 pt-24 pb-16">
        <PlanSelector plans={plans} currentPlanSlug="free" />
      </main>

      <Footer />
    </div>
  )
}
