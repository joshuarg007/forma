// Inference Engine with Personalization
// Handles predictions, user learning, and caching

import {
  ComponentType,
  COMPONENT_TYPES,
  COMPONENT_TO_INDEX,
  PredictionContext,
  ComponentPrediction,
  UserInteraction,
} from './types'
import { COMPONENT_REGISTRY, UI_PATTERNS, SIBLING_PATTERNS } from './registry'
import { ComponentRecommendationModel } from './model'
import { pretrainModel } from './training'

// Singleton instance
let modelInstance: ComponentRecommendationModel | null = null
let isInitializing = false
let initPromise: Promise<void> | null = null

// User interaction history for personalization
const USER_HISTORY_KEY = 'component-ai-user-history'
const MAX_HISTORY_SIZE = 500

// Get or create model instance
export async function getModel(): Promise<ComponentRecommendationModel> {
  if (modelInstance?.initialized) {
    return modelInstance
  }

  if (isInitializing && initPromise) {
    await initPromise
    return modelInstance!
  }

  isInitializing = true
  initPromise = initializeModel()
  await initPromise
  isInitializing = false

  return modelInstance!
}

// Initialize model - load saved or pretrain
async function initializeModel(): Promise<void> {
  modelInstance = new ComponentRecommendationModel()

  // Try to load saved model
  const loaded = await modelInstance.load()

  if (!loaded) {
    // No saved model, initialize and pretrain
    await modelInstance.initialize()
    await pretrainModel(modelInstance, {
      numSamples: 3000,
      epochs: 5,
    })
    await modelInstance.save()
  }
}

// Get predictions with personalization blending
export async function getSmartSuggestions(
  context: PredictionContext,
  topK: number = 6
): Promise<ComponentPrediction[]> {
  try {
    const model = await getModel()

    // Get base model predictions
    const modelScores = await model.predict(context)

    // Get rule-based scores as fallback/boost
    const ruleScores = getRuleBasedScores(context)

    // Get personalization boost from user history
    const personalizationScores = getPersonalizationScores(context)

    // Blend scores: 60% model, 25% rules, 15% personalization
    const blendedScores = new Map<ComponentType, number>()

    for (const type of COMPONENT_TYPES) {
      const modelScore = modelScores.get(type) || 0
      const ruleScore = ruleScores.get(type) || 0
      const personalScore = personalizationScores.get(type) || 0

      const blended = (modelScore * 0.6) + (ruleScore * 0.25) + (personalScore * 0.15)
      blendedScores.set(type, blended)
    }

    // Sort and get top K
    const sorted = Array.from(blendedScores.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, topK)

    // Convert to predictions with metadata
    return sorted.map(([componentType, score]) => {
      const meta = COMPONENT_REGISTRY[componentType]
      return {
        componentType,
        score,
        reason: generateReason(componentType, context, score),
      }
    })
  } catch (error) {
    console.warn('[ComponentAI] Prediction failed, using fallback:', error)
    return getFallbackSuggestions(context, topK)
  }
}

// Rule-based scoring (fast, deterministic fallback)
function getRuleBasedScores(context: PredictionContext): Map<ComponentType, number> {
  const scores = new Map<ComponentType, number>()

  // Initialize all to small value
  COMPONENT_TYPES.forEach(type => scores.set(type, 0.01))

  // Boost from UI patterns
  for (const pattern of UI_PATTERNS) {
    if (pattern.parentTypes.includes(context.parentType)) {
      for (const child of pattern.likelyChildren) {
        const current = scores.get(child) || 0
        scores.set(child, current + (pattern.weight / 10))
      }
    }
  }

  // Boost from sibling patterns (matching items)
  for (const pattern of SIBLING_PATTERNS) {
    const hasSibling = pattern.withSiblings.some(s =>
      context.siblingComponents.includes(s) || context.existingChildren.includes(s)
    )
    if (hasSibling) {
      for (const suggestion of pattern.suggests) {
        const current = scores.get(suggestion) || 0
        scores.set(suggestion, current + (pattern.weight / 10))
      }
    }
  }

  // Normalize
  const max = Math.max(...Array.from(scores.values()))
  if (max > 0) {
    scores.forEach((value, key) => scores.set(key, value / max))
  }

  return scores
}

// Personalization from user history
function getPersonalizationScores(context: PredictionContext): Map<ComponentType, number> {
  const scores = new Map<ComponentType, number>()
  COMPONENT_TYPES.forEach(type => scores.set(type, 0))

  const history = getUserHistory()
  if (history.length === 0) return scores

  // Find similar past contexts and boost what user chose
  for (const interaction of history) {
    const similarity = contextSimilarity(context, interaction.context)
    if (similarity > 0.3) {
      const current = scores.get(interaction.chosenComponent) || 0
      scores.set(interaction.chosenComponent, current + similarity)
    }
  }

  // Normalize
  const max = Math.max(...Array.from(scores.values()))
  if (max > 0) {
    scores.forEach((value, key) => scores.set(key, value / max))
  }

  return scores
}

// Calculate similarity between two contexts
function contextSimilarity(a: PredictionContext, b: PredictionContext): number {
  let score = 0

  // Same parent type is important
  if (a.parentType === b.parentType) score += 0.5

  // Overlapping siblings
  const siblingOverlap = a.siblingComponents.filter(s => b.siblingComponents.includes(s)).length
  score += siblingOverlap * 0.2

  // Overlapping page components
  const pageOverlap = a.pageComponents.filter(p => b.pageComponents.includes(p)).length
  score += Math.min(pageOverlap * 0.1, 0.3)

  return Math.min(score, 1)
}

// Generate human-readable reason for suggestion
function generateReason(
  componentType: ComponentType,
  context: PredictionContext,
  score: number
): string {
  const meta = COMPONENT_REGISTRY[componentType]

  // Check if it matches siblings
  if (context.siblingComponents.includes(componentType)) {
    return 'Matches existing items'
  }

  // Check UI patterns
  for (const pattern of UI_PATTERNS) {
    if (
      pattern.parentTypes.includes(context.parentType) &&
      pattern.likelyChildren.includes(componentType)
    ) {
      return pattern.name
    }
  }

  // Check sibling patterns
  for (const pattern of SIBLING_PATTERNS) {
    const hasSibling = pattern.withSiblings.some(s =>
      context.siblingComponents.includes(s)
    )
    if (hasSibling && pattern.suggests.includes(componentType)) {
      return 'Complements existing'
    }
  }

  // Generic reasons by category
  switch (meta.category) {
    case 'content': return 'Common content choice'
    case 'form': return 'Form element'
    case 'data': return 'Data display'
    default: return 'Suggested'
  }
}

// Fallback suggestions when model fails
function getFallbackSuggestions(context: PredictionContext, topK: number): ComponentPrediction[] {
  const ruleScores = getRuleBasedScores(context)

  return Array.from(ruleScores.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, topK)
    .map(([componentType, score]) => ({
      componentType,
      score,
      reason: 'Suggested',
    }))
}

// Record user interaction for learning
export function recordInteraction(
  context: PredictionContext,
  chosenComponent: ComponentType
): void {
  const history = getUserHistory()

  const interaction: UserInteraction = {
    context,
    chosenComponent,
    timestamp: Date.now(),
  }

  // Add to history
  history.push(interaction)

  // Trim if too large
  if (history.length > MAX_HISTORY_SIZE) {
    history.splice(0, history.length - MAX_HISTORY_SIZE)
  }

  // Save
  saveUserHistory(history)

  // Async: fine-tune model on this interaction
  fineTuneOnInteraction(interaction).catch(console.warn)
}

// Get user history from localStorage
function getUserHistory(): UserInteraction[] {
  if (typeof window === 'undefined') return []

  try {
    const data = localStorage.getItem(USER_HISTORY_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

// Save user history to localStorage
function saveUserHistory(history: UserInteraction[]): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(USER_HISTORY_KEY, JSON.stringify(history))
  } catch (error) {
    console.warn('[ComponentAI] Failed to save history:', error)
  }
}

// Fine-tune model on single interaction
async function fineTuneOnInteraction(interaction: UserInteraction): Promise<void> {
  try {
    const model = await getModel()

    // Train on this single interaction with low learning rate
    await model.trainOnBatch([interaction.context], [interaction.chosenComponent], 1)

    // Periodically save model
    const history = getUserHistory()
    if (history.length % 50 === 0) {
      await model.save()
    }
  } catch (error) {
    // Non-critical, just log
    console.warn('[ComponentAI] Fine-tune failed:', error)
  }
}

// Clear user history and reset personalization
export function clearPersonalization(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(USER_HISTORY_KEY)
  console.log('[ComponentAI] Personalization cleared')
}

// Export user data for backup/transfer
export function exportUserData(): string {
  const history = getUserHistory()
  return JSON.stringify({
    version: 1,
    exportedAt: new Date().toISOString(),
    interactions: history,
  }, null, 2)
}

// Import user data
export function importUserData(jsonData: string): void {
  try {
    const data = JSON.parse(jsonData)
    if (data.interactions && Array.isArray(data.interactions)) {
      saveUserHistory(data.interactions)
      console.log(`[ComponentAI] Imported ${data.interactions.length} interactions`)
    }
  } catch (error) {
    console.error('[ComponentAI] Failed to import data:', error)
  }
}

// Get model status
export async function getModelStatus(): Promise<{
  initialized: boolean
  historySize: number
  modelSaved: boolean
}> {
  const history = getUserHistory()

  let initialized = false
  let modelSaved = false

  try {
    const model = await getModel()
    initialized = model.initialized
    modelSaved = typeof window !== 'undefined' &&
      localStorage.getItem('tensorflowjs_models/component-ai-model/info') !== null
  } catch {
    // Model not ready
  }

  return {
    initialized,
    historySize: history.length,
    modelSaved,
  }
}
