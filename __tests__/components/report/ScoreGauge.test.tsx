import { render, screen } from '@testing-library/react'
import ScoreGauge from '@/components/report/ScoreGauge'

describe('ScoreGauge', () => {
  it('renders score number', () => {
    render(<ScoreGauge score={85} label="Test" />)
    expect(screen.getByText('85')).toBeInTheDocument()
  })

  it('renders label', () => {
    render(<ScoreGauge score={50} label="Consistency" />)
    expect(screen.getByText('Consistency')).toBeInTheDocument()
  })

  it('shows green color for score >= 80', () => {
    render(<ScoreGauge score={90} label="High" />)
    const meter = screen.getByRole('meter')
    expect(meter.className).toContain('bg-green-50')
    expect(meter.className).toContain('border-green-200')
  })

  it('shows yellow color for score 60-79', () => {
    render(<ScoreGauge score={70} label="Medium-High" />)
    const meter = screen.getByRole('meter')
    expect(meter.className).toContain('bg-yellow-50')
    expect(meter.className).toContain('border-yellow-200')
  })

  it('shows orange color for score 40-59', () => {
    render(<ScoreGauge score={45} label="Medium-Low" />)
    const meter = screen.getByRole('meter')
    expect(meter.className).toContain('bg-orange-50')
    expect(meter.className).toContain('border-orange-200')
  })

  it('shows red color for score < 40', () => {
    render(<ScoreGauge score={20} label="Low" />)
    const meter = screen.getByRole('meter')
    expect(meter.className).toContain('bg-red-50')
    expect(meter.className).toContain('border-red-200')
  })

  it('has correct aria attributes', () => {
    render(<ScoreGauge score={75} label="Completeness" />)
    const meter = screen.getByRole('meter')
    expect(meter).toHaveAttribute('aria-valuenow', '75')
    expect(meter).toHaveAttribute('aria-valuemin', '0')
    expect(meter).toHaveAttribute('aria-valuemax', '100')
  })

  it('renders with lg size', () => {
    render(<ScoreGauge score={80} label="Big" size="lg" />)
    const scoreText = screen.getByText('80')
    expect(scoreText.className).toContain('text-3xl')
  })

  it('renders with sm size by default', () => {
    render(<ScoreGauge score={60} label="Small" />)
    const scoreText = screen.getByText('60')
    expect(scoreText.className).toContain('text-xl')
  })
})
