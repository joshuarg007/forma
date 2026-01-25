// Training Data Generation for Component AI
// Generates synthetic training data from UI patterns

import {
  ComponentType,
  COMPONENT_TYPES,
  PredictionContext,
  TrainingSample,
} from './types'
import {
  UI_PATTERNS,
  PAGE_FLOW_PATTERNS,
  SIBLING_PATTERNS,
} from './registry'
import { ComponentRecommendationModel } from './model'

// Random selection helper
function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomSubset<T>(arr: T[], maxSize: number): T[] {
  const size = Math.floor(Math.random() * Math.min(maxSize + 1, arr.length))
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, size)
}

// Generate training samples from UI patterns
export function generatePatternSamples(numSamples: number = 1000): TrainingSample[] {
  const samples: TrainingSample[] = []

  // Generate samples from UI patterns (what goes in containers)
  for (let i = 0; i < numSamples * 0.4; i++) {
    const pattern = randomChoice(UI_PATTERNS)
    const parentType = randomChoice(pattern.parentTypes)
    const chosenComponent = randomChoice(pattern.likelyChildren)

    // Randomly add some existing children (to simulate partially filled containers)
    const existingChildren = Math.random() > 0.5
      ? randomSubset(pattern.likelyChildren.filter(c => c !== chosenComponent), 2) as ComponentType[]
      : []

    // Random siblings in other slots
    const siblingComponents = Math.random() > 0.6
      ? randomSubset(pattern.likelyChildren, 3) as ComponentType[]
      : []

    // Random page components for context
    const pageComponents = generateRandomPageContext()

    samples.push({
      context: {
        parentType,
        existingChildren,
        siblingComponents,
        pageComponents,
      },
      chosenComponent,
      weight: pattern.weight,
    })
  }

  // Generate samples from page flow patterns
  for (let i = 0; i < numSamples * 0.3; i++) {
    const pattern = randomChoice(PAGE_FLOW_PATTERNS)
    const pageComponents = [...pattern.after]

    // Add some random components before
    if (Math.random() > 0.3) {
      pageComponents.unshift('navbar')
    }

    const chosenComponent = randomChoice(pattern.suggests)

    // For page-level suggestions, parent is usually 'section' or root
    const parentType = randomChoice(['section', 'container'] as ComponentType[])

    samples.push({
      context: {
        parentType,
        existingChildren: [],
        siblingComponents: [],
        pageComponents,
      },
      chosenComponent,
      weight: pattern.weight,
    })
  }

  // Generate samples from sibling patterns (matching/complementary items)
  for (let i = 0; i < numSamples * 0.3; i++) {
    const pattern = randomChoice(SIBLING_PATTERNS)
    const siblingComponents = pattern.withSiblings
    const chosenComponent = randomChoice(pattern.suggests)

    // These are typically in grids
    const parentType = randomChoice(['grid-2col', 'grid-3col', 'grid-4col', 'flex-row'] as ComponentType[])

    samples.push({
      context: {
        parentType,
        existingChildren: [],
        siblingComponents,
        pageComponents: generateRandomPageContext(),
      },
      chosenComponent,
      weight: pattern.weight,
    })
  }

  return samples
}

// Generate random page context for training variety
function generateRandomPageContext(): ComponentType[] {
  const components: ComponentType[] = []

  // Common page structures
  if (Math.random() > 0.3) components.push('navbar')
  if (Math.random() > 0.4) components.push(randomChoice(['hero-centered', 'hero-split'] as ComponentType[]))
  if (Math.random() > 0.5) components.push('section-features')
  if (Math.random() > 0.6) components.push('section-testimonials')
  if (Math.random() > 0.7) components.push('section-pricing')
  if (Math.random() > 0.7) components.push('section-cta')
  if (Math.random() > 0.5) components.push('footer')

  return components
}

// Generate negative samples (things that shouldn't go together)
export function generateNegativeSamples(numSamples: number = 200): TrainingSample[] {
  const samples: TrainingSample[] = []

  // Things that don't make sense
  const badCombos: Array<{ parent: ComponentType; bad: ComponentType[] }> = [
    { parent: 'grid-3col', bad: ['navbar', 'footer', 'hero-centered', 'hero-split'] },
    { parent: 'flex-row', bad: ['section', 'container', 'hero-centered'] },
    { parent: 'flex-col', bad: ['navbar', 'footer', 'grid-3col'] },
  ]

  for (let i = 0; i < numSamples; i++) {
    const combo = randomChoice(badCombos)

    samples.push({
      context: {
        parentType: combo.parent,
        existingChildren: [],
        siblingComponents: [],
        pageComponents: generateRandomPageContext(),
      },
      chosenComponent: randomChoice(combo.bad),
      weight: -5, // Negative weight to discourage
    })
  }

  return samples
}

// Pre-train model with synthetic data
export async function pretrainModel(
  model: ComponentRecommendationModel,
  options: {
    numSamples?: number
    epochs?: number
    onProgress?: (epoch: number, loss: number) => void
  } = {}
): Promise<void> {
  const {
    numSamples = 5000,
    epochs = 10,
    onProgress,
  } = options

  // Generate training data
  console.log('[ComponentAI] Generating synthetic training data...')
  const positiveSamples = generatePatternSamples(numSamples)
  const negativeSamples = generateNegativeSamples(Math.floor(numSamples * 0.1))

  // Combine and filter (remove negative weight samples for now, use them differently)
  const allSamples = [...positiveSamples, ...negativeSamples].filter(s => (s.weight || 1) > 0)

  console.log(`[ComponentAI] Training on ${allSamples.length} samples...`)

  // Train in batches
  const batchSize = 64
  for (let epoch = 0; epoch < epochs; epoch++) {
    // Shuffle samples each epoch
    const shuffled = [...allSamples].sort(() => Math.random() - 0.5)

    let totalLoss = 0
    let batches = 0

    for (let i = 0; i < shuffled.length; i += batchSize) {
      const batch = shuffled.slice(i, i + batchSize)
      const contexts = batch.map(s => s.context)
      const labels = batch.map(s => s.chosenComponent)

      const history = await model.trainOnBatch(contexts, labels, 1)
      const loss = history.history.loss[0] as number
      totalLoss += loss
      batches++
    }

    const avgLoss = totalLoss / batches
    console.log(`[ComponentAI] Epoch ${epoch + 1}/${epochs}, Loss: ${avgLoss.toFixed(4)}`)

    if (onProgress) {
      onProgress(epoch + 1, avgLoss)
    }
  }

  console.log('[ComponentAI] Pre-training complete')
}

// Export training data for external training
export function exportTrainingData(numSamples: number = 10000): string {
  const samples = generatePatternSamples(numSamples)

  return JSON.stringify(samples, null, 2)
}

// Import and train from external data
export async function importAndTrain(
  model: ComponentRecommendationModel,
  jsonData: string,
  epochs = 5
): Promise<void> {
  const samples: TrainingSample[] = JSON.parse(jsonData)

  const contexts = samples.map(s => s.context)
  const labels = samples.map(s => s.chosenComponent)

  await model.trainOnBatch(contexts, labels, epochs)
}
