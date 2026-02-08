import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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

    // Steps 1 and 2 should be completed — rendered as buttons when onStepClick is not provided,
    // they are rendered as divs with completed aria-label
    // Without onStepClick, completed steps are still divs
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

  describe('clickable completed steps', () => {
    it('renders completed steps as buttons when onStepClick is provided', () => {
      const onStepClick = jest.fn()
      render(<StepIndicator currentStep="processing" onStepClick={onStepClick} />)

      // Steps 1 and 2 are completed — should be buttons
      const step1Button = screen.getByRole('button', { name: 'Go back to Step 1: Add Links' })
      expect(step1Button).toBeInTheDocument()

      const step2Button = screen.getByRole('button', { name: 'Go back to Step 2: Screenshots' })
      expect(step2Button).toBeInTheDocument()
    })

    it('does not render current or future steps as buttons', () => {
      const onStepClick = jest.fn()
      render(<StepIndicator currentStep="screenshots" onStepClick={onStepClick} />)

      // Step 2 (current) and steps 3, 4 (future) should NOT be buttons
      const buttons = screen.getAllByRole('button')
      expect(buttons).toHaveLength(1) // Only step 1 is a button
      expect(buttons[0]).toHaveAttribute('aria-label', 'Go back to Step 1: Add Links')
    })

    it('calls onStepClick with the step key when a completed step is clicked', async () => {
      const user = userEvent.setup()
      const onStepClick = jest.fn()
      render(<StepIndicator currentStep="report" onStepClick={onStepClick} />)

      await user.click(screen.getByRole('button', { name: 'Go back to Step 1: Add Links' }))
      expect(onStepClick).toHaveBeenCalledWith('urls')

      await user.click(screen.getByRole('button', { name: 'Go back to Step 2: Screenshots' }))
      expect(onStepClick).toHaveBeenCalledWith('screenshots')

      await user.click(screen.getByRole('button', { name: 'Go back to Step 3: Analyzing' }))
      expect(onStepClick).toHaveBeenCalledWith('processing')
    })

    it('does not render buttons when onStepClick is not provided', () => {
      render(<StepIndicator currentStep="report" />)

      // No buttons should exist at all
      const buttons = screen.queryAllByRole('button')
      expect(buttons).toHaveLength(0)
    })

    it('on step 1 (urls), no steps are clickable', () => {
      const onStepClick = jest.fn()
      render(<StepIndicator currentStep="urls" onStepClick={onStepClick} />)

      const buttons = screen.queryAllByRole('button')
      expect(buttons).toHaveLength(0)
    })
  })
})
