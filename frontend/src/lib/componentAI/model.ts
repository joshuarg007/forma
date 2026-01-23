// TensorFlow.js Model for Component Recommendations
// Two-Tower Architecture: Context Encoder + Component Embeddings

import * as tf from '@tensorflow/tfjs'
import {
  ComponentType,
  COMPONENT_TYPES,
  COMPONENT_TO_INDEX,
  ModelConfig,
  DEFAULT_MODEL_CONFIG,
  PredictionContext,
} from './types'

export class ComponentRecommendationModel {
  private model: tf.LayersModel | null = null
  private config: ModelConfig
  private isInitialized = false

  constructor(config: ModelConfig = DEFAULT_MODEL_CONFIG) {
    this.config = config
  }

  // Build the neural network architecture
  async initialize(): Promise<void> {
    if (this.isInitialized) return

    const { embeddingDim, hiddenDim, numComponents } = this.config

    // Input layers
    const parentInput = tf.input({ shape: [numComponents], name: 'parent_input' }) // one-hot
    const childrenInput = tf.input({ shape: [numComponents], name: 'children_input' }) // multi-hot
    const siblingsInput = tf.input({ shape: [numComponents], name: 'siblings_input' }) // multi-hot
    const pageInput = tf.input({ shape: [numComponents], name: 'page_input' }) // multi-hot

    // Context tower - encode the context into a dense vector
    const parentEmbedding = tf.layers.dense({
      units: embeddingDim,
      activation: 'relu',
      name: 'parent_embedding',
    }).apply(parentInput) as tf.SymbolicTensor

    const childrenEmbedding = tf.layers.dense({
      units: embeddingDim,
      activation: 'relu',
      name: 'children_embedding',
    }).apply(childrenInput) as tf.SymbolicTensor

    const siblingsEmbedding = tf.layers.dense({
      units: embeddingDim,
      activation: 'relu',
      name: 'siblings_embedding',
    }).apply(siblingsInput) as tf.SymbolicTensor

    const pageEmbedding = tf.layers.dense({
      units: embeddingDim,
      activation: 'relu',
      name: 'page_embedding',
    }).apply(pageInput) as tf.SymbolicTensor

    // Concatenate all context embeddings
    const contextConcat = tf.layers.concatenate({ name: 'context_concat' }).apply([
      parentEmbedding,
      childrenEmbedding,
      siblingsEmbedding,
      pageEmbedding,
    ]) as tf.SymbolicTensor

    // Hidden layer to mix context signals
    const contextHidden = tf.layers.dense({
      units: hiddenDim,
      activation: 'relu',
      name: 'context_hidden',
    }).apply(contextConcat) as tf.SymbolicTensor

    // Dropout for regularization
    const contextDropout = tf.layers.dropout({
      rate: 0.2,
      name: 'context_dropout',
    }).apply(contextHidden) as tf.SymbolicTensor

    // Output layer - scores for each component
    const output = tf.layers.dense({
      units: numComponents,
      activation: 'softmax',
      name: 'output',
    }).apply(contextDropout) as tf.SymbolicTensor

    // Create model
    this.model = tf.model({
      inputs: [parentInput, childrenInput, siblingsInput, pageInput],
      outputs: output,
      name: 'component_recommender',
    })

    // Compile model
    this.model.compile({
      optimizer: tf.train.adam(this.config.learningRate),
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy'],
    })

    this.isInitialized = true
    console.log('[ComponentAI] Model initialized')
  }

  // Convert context to tensor inputs
  private contextToTensors(context: PredictionContext): tf.Tensor[] {
    const numComponents = this.config.numComponents

    // One-hot encode parent type
    const parentOneHot = new Array(numComponents).fill(0)
    const parentIdx = COMPONENT_TO_INDEX[context.parentType]
    if (parentIdx !== undefined) parentOneHot[parentIdx] = 1

    // Multi-hot encode children
    const childrenMultiHot = new Array(numComponents).fill(0)
    context.existingChildren.forEach(child => {
      const idx = COMPONENT_TO_INDEX[child]
      if (idx !== undefined) childrenMultiHot[idx] = 1
    })

    // Multi-hot encode siblings
    const siblingsMultiHot = new Array(numComponents).fill(0)
    context.siblingComponents.forEach(sibling => {
      const idx = COMPONENT_TO_INDEX[sibling]
      if (idx !== undefined) siblingsMultiHot[idx] = 1
    })

    // Multi-hot encode page components
    const pageMultiHot = new Array(numComponents).fill(0)
    context.pageComponents.forEach(comp => {
      const idx = COMPONENT_TO_INDEX[comp]
      if (idx !== undefined) pageMultiHot[idx] = 1
    })

    return [
      tf.tensor2d([parentOneHot]),
      tf.tensor2d([childrenMultiHot]),
      tf.tensor2d([siblingsMultiHot]),
      tf.tensor2d([pageMultiHot]),
    ]
  }

  // Get predictions for a given context
  async predict(context: PredictionContext): Promise<Map<ComponentType, number>> {
    if (!this.model) {
      throw new Error('Model not initialized')
    }

    const tensors = this.contextToTensors(context)

    try {
      const prediction = this.model.predict(tensors) as tf.Tensor
      const scores = await prediction.data()

      // Clean up tensors
      tensors.forEach(t => t.dispose())
      prediction.dispose()

      // Create map of component type -> score
      const results = new Map<ComponentType, number>()
      COMPONENT_TYPES.forEach((type, idx) => {
        results.set(type, scores[idx])
      })

      return results
    } catch (error) {
      // Clean up tensors on error
      tensors.forEach(t => t.dispose())
      throw error
    }
  }

  // Train on a batch of samples
  async trainOnBatch(
    contexts: PredictionContext[],
    labels: ComponentType[],
    epochs = 1
  ): Promise<tf.History> {
    if (!this.model) {
      throw new Error('Model not initialized')
    }

    const numComponents = this.config.numComponents
    const batchSize = contexts.length

    // Prepare input tensors
    const parentData: number[][] = []
    const childrenData: number[][] = []
    const siblingsData: number[][] = []
    const pageData: number[][] = []
    const labelData: number[][] = []

    for (let i = 0; i < batchSize; i++) {
      const context = contexts[i]
      const label = labels[i]

      // One-hot parent
      const parentOneHot = new Array(numComponents).fill(0)
      const parentIdx = COMPONENT_TO_INDEX[context.parentType]
      if (parentIdx !== undefined) parentOneHot[parentIdx] = 1
      parentData.push(parentOneHot)

      // Multi-hot children
      const childrenMultiHot = new Array(numComponents).fill(0)
      context.existingChildren.forEach(child => {
        const idx = COMPONENT_TO_INDEX[child]
        if (idx !== undefined) childrenMultiHot[idx] = 1
      })
      childrenData.push(childrenMultiHot)

      // Multi-hot siblings
      const siblingsMultiHot = new Array(numComponents).fill(0)
      context.siblingComponents.forEach(sibling => {
        const idx = COMPONENT_TO_INDEX[sibling]
        if (idx !== undefined) siblingsMultiHot[idx] = 1
      })
      siblingsData.push(siblingsMultiHot)

      // Multi-hot page
      const pageMultiHot = new Array(numComponents).fill(0)
      context.pageComponents.forEach(comp => {
        const idx = COMPONENT_TO_INDEX[comp]
        if (idx !== undefined) pageMultiHot[idx] = 1
      })
      pageData.push(pageMultiHot)

      // One-hot label
      const labelOneHot = new Array(numComponents).fill(0)
      const labelIdx = COMPONENT_TO_INDEX[label]
      if (labelIdx !== undefined) labelOneHot[labelIdx] = 1
      labelData.push(labelOneHot)
    }

    // Create tensors
    const parentTensor = tf.tensor2d(parentData)
    const childrenTensor = tf.tensor2d(childrenData)
    const siblingsTensor = tf.tensor2d(siblingsData)
    const pageTensor = tf.tensor2d(pageData)
    const labelTensor = tf.tensor2d(labelData)

    try {
      // Train
      const history = await this.model.fit(
        [parentTensor, childrenTensor, siblingsTensor, pageTensor],
        labelTensor,
        {
          epochs,
          batchSize: Math.min(32, batchSize),
          shuffle: true,
          verbose: 0,
        }
      )

      return history
    } finally {
      // Clean up
      parentTensor.dispose()
      childrenTensor.dispose()
      siblingsTensor.dispose()
      pageTensor.dispose()
      labelTensor.dispose()
    }
  }

  // Save model to localStorage or IndexedDB
  async save(path = 'localstorage://component-ai-model'): Promise<void> {
    if (!this.model) {
      throw new Error('Model not initialized')
    }
    await this.model.save(path)
    console.log('[ComponentAI] Model saved to', path)
  }

  // Load model from localStorage or IndexedDB
  async load(path = 'localstorage://component-ai-model'): Promise<boolean> {
    try {
      this.model = await tf.loadLayersModel(path)
      this.model.compile({
        optimizer: tf.train.adam(this.config.learningRate),
        loss: 'categoricalCrossentropy',
        metrics: ['accuracy'],
      })
      this.isInitialized = true
      console.log('[ComponentAI] Model loaded from', path)
      return true
    } catch (error) {
      console.log('[ComponentAI] No saved model found, will initialize fresh')
      return false
    }
  }

  // Get model summary
  summary(): void {
    if (this.model) {
      this.model.summary()
    }
  }

  // Dispose of model to free memory
  dispose(): void {
    if (this.model) {
      this.model.dispose()
      this.model = null
      this.isInitialized = false
    }
  }

  get initialized(): boolean {
    return this.isInitialized
  }
}
