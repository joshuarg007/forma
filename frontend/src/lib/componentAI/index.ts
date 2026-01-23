// Component AI - TensorFlow.js Recommendation System
// Main entry point

export * from './types'
export * from './registry'
export { ComponentRecommendationModel } from './model'
export {
  generatePatternSamples,
  pretrainModel,
  exportTrainingData,
  importAndTrain,
} from './training'
export {
  getSmartSuggestions,
  recordInteraction,
  clearPersonalization,
  exportUserData,
  importUserData,
  getModelStatus,
  getModel,
} from './inference'
