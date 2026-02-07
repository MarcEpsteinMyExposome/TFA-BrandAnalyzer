import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

const howItWorksSteps = [
  {
    number: 'Step 1',
    title: 'Share Your Links',
    description:
      "Add URLs to your website, social media, and online profiles. We'll fetch the public content automatically.",
  },
  {
    number: 'Step 2',
    title: 'Add Screenshots',
    description:
      "For platforms we can't access (like private social profiles), simply upload screenshots.",
  },
  {
    number: 'Step 3',
    title: 'Get Your Report',
    description:
      'Our AI analyzes everything and delivers a detailed brand health report with scores and action items.',
  },
]

const whatYoullLearnItems = [
  {
    title: 'Brand Consistency Score',
    description:
      'See how well your platforms align on name, bio, visuals, contact info, and tone of voice.',
  },
  {
    title: 'Brand Completeness Score',
    description:
      "Discover what's missing: platforms you should be on, purchase paths, social proof, and more.",
  },
  {
    title: 'Specific Findings',
    description:
      'Get detailed findings for each category, with platform-by-platform comparisons.',
  },
  {
    title: 'Prioritized Action Items',
    description:
      'Walk away with a clear, prioritized list of exactly what to fix first.',
  },
]

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-white py-16 sm:py-24">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Is Your Brand Telling a Consistent Story?
            </h1>
            <p className="text-lg text-gray-600 mt-4">
              Find out in minutes. Our AI analyzes your online presence across
              platforms to identify inconsistencies and gaps — then gives you a
              clear action plan.
            </p>
            <a
              href="/analyze"
              className="bg-gray-900 text-white rounded-md px-6 py-3 font-medium hover:bg-gray-800 inline-block mt-8"
            >
              Analyze My Brand
            </a>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="bg-gray-50 py-16">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-center text-gray-900">
              How It Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              {howItWorksSteps.map((step) => (
                <div
                  key={step.number}
                  className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm"
                >
                  <p className="text-sm font-medium text-gray-400 mb-2">
                    {step.number}
                  </p>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-600">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* What You'll Learn Section */}
        <section className="bg-white py-16">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
              What You&#39;ll Learn
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {whatYoullLearnItems.map((item) => (
                <div
                  key={item.title}
                  className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="bg-gray-50 py-16">
          <div className="max-w-5xl mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold text-gray-900">
              Ready to strengthen your brand?
            </h2>
            <p className="text-gray-600 mt-2">
              It&#39;s free, takes about 5 minutes, and you&#39;ll get
              actionable insights immediately.
            </p>
            <a
              href="/analyze"
              className="bg-gray-900 text-white rounded-md px-6 py-3 font-medium hover:bg-gray-800 inline-block mt-6"
            >
              Get Started
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
