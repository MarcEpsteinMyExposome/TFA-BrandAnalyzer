import { render, screen } from '@testing-library/react'
import StepIndicator from '@/components/analyze/StepIndicator'

describe('StepIndicator', () => {
  it('renders all 4 step labels', () => {
    render(<StepIndicator currentStep="urls" />)

    // Labels are hidden on mobile but present in the DOM
    expect(screen.getByText('Add Links')).toBeInTheDocument()
    expect(screen.getByText('Screenshots')).toBeInTheDocument()
    expect(screen.getByText('Analyzing')).toBeInTheDocument()
    expect(screen.getByText('Report')).toBeInTheDocument()
  })

  it('highlights the current step (urls = step 1)', () => {
    render(<StepIndicator currentStep="urls" />)

    const currentStep = screen.getByLabelText('Step 1: Add Links (current)')
    expect(currentStep).toBeInTheDocument()
    expect(currentStep).toHaveAttribute('aria-current', 'step')
  })

  it('highlights the current step (screenshots = step 2)', () => {
    render(<StepIndicator currentStep="screenshots" />)

    const currentStep = screen.getByLabelText('Step 2: Screenshots (current)')
    expect(currentStep).toBeInTheDocument()
    expect(currentStep).toHaveAttribute('aria-current', 'step')
  })

  it('shows completed steps with checkmark and marks them as completed', () => {
    render(<StepIndicator currentStep="processing" />)

    // Steps 1 and 2 should be completed
    const step1 = screen.getByLabelText('Step 1: Add Links (completed)')
    expect(step1).toBeInTheDocument()
    // Completed steps should contain an SVG checkmark, not the number
    const svg = step1.querySelector('svg')
    expect(svg).toBeInTheDocument()

    const step2 = screen.getByLabelText('Step 2: Screenshots (completed)')
    expect(step2).toBeInTheDocument()
    expect(step2.querySelector('svg')).toBeInTheDocument()

    // Step 3 should be current
    const step3 = screen.getByLabelText('Step 3: Analyzing (current)')
    expect(step3).toHaveAttribute('aria-current', 'step')
  })

  it('shows future steps without special marking', () => {
    render(<StepIndicator currentStep="urls" />)

    // Steps 2, 3, 4 are future — they should exist but not have aria-current
    const step2 = screen.getByLabelText('Step 2: Screenshots')
    expect(step2).toBeInTheDocument()
    expect(step2).not.toHaveAttribute('aria-current')

    const step3 = screen.getByLabelText('Step 3: Analyzing')
    expect(step3).toBeInTheDocument()
    expect(step3).not.toHaveAttribute('aria-current')

    const step4 = screen.getByLabelText('Step 4: Report')
    expect(step4).toBeInTheDocument()
    expect(step4).not.toHaveAttribute('aria-current')
  })

  it('has an accessible navigation landmark', () => {
    render(<StepIndicator currentStep="urls" />)
    expect(screen.getByRole('navigation', { name: 'Analysis progress' })).toBeInTheDocument()
  })

  it('when on the last step, all previous steps are completed', () => {
    render(<StepIndicator currentStep="report" />)

    expect(screen.getByLabelText('Step 1: Add Links (completed)')).toBeInTheDocument()
    expect(screen.getByLabelText('Step 2: Screenshots (completed)')).toBeInTheDocument()
    expect(screen.getByLabelText('Step 3: Analyzing (completed)')).toBeInTheDocument()
    expect(screen.getByLabelText('Step 4: Report (current)')).toHaveAttribute('aria-current', 'step')
  })
})
