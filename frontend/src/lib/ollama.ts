// Ollama Integration for Smart Component Predictions

const OLLAMA_URL = 'http://localhost:11434'

interface ComponentPrediction {
  id: string
  name: string
  confidence: number
  reason: string
}

interface PredictionContext {
  existingComponents: string[]
  projectType?: string
  pageType?: string
}

// Check if Ollama is available
export async function checkOllamaStatus(): Promise<boolean> {
  try {
    const response = await fetch(`${OLLAMA_URL}/api/tags`, {
      method: 'GET',
      signal: AbortSignal.timeout(2000),
    })
    return response.ok
  } catch {
    return false
  }
}

// Get smart component predictions using Ollama
export async function getSmartPredictions(
  context: PredictionContext
): Promise<ComponentPrediction[]> {
  const { existingComponents } = context

  // Build the prompt
  const prompt = buildPredictionPrompt(existingComponents)

  try {
    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'qwen2.5-coder:7b',
        prompt,
        stream: false,
        options: {
          temperature: 0.3,
          num_predict: 500,
        },
      }),
      signal: AbortSignal.timeout(10000),
    })

    if (!response.ok) {
      throw new Error('Ollama request failed')
    }

    const data = await response.json()
    return parseOllamaResponse(data.response)
  } catch (error) {
    console.warn('Ollama prediction failed, using fallback:', error)
    return []
  }
}

function buildPredictionPrompt(existingComponents: string[]): string {
  const componentList = existingComponents.length > 0
    ? existingComponents.join(', ')
    : 'none (empty page)'

  return `You are a web design assistant. A user is building a landing page.

Current components on the page: ${componentList}

Available components to add:
- navbar: Navigation bar
- hero-centered: Centered hero section
- hero-split: Split hero with image
- features-grid: Feature cards in grid
- features-list: Vertical feature list
- testimonials: Customer testimonials
- logos: Logo cloud / partner logos
- stats: Statistics/metrics section
- pricing-table: Pricing comparison
- cta-simple: Call-to-action banner
- cta-newsletter: Newsletter signup
- team-grid: Team members
- faq: FAQ accordion
- footer: Site footer

Based on typical landing page structure and what's already on the page, suggest the top 5 components to add next. Consider:
1. Logical page flow (navbar → hero → features → social proof → pricing → cta → footer)
2. What's missing from a complete landing page
3. What would make sense given existing content

Respond ONLY with a JSON array, no explanation:
[{"id": "component-id", "confidence": 0.95, "reason": "brief reason"}]`
}

function parseOllamaResponse(response: string): ComponentPrediction[] {
  try {
    // Extract JSON from response
    const jsonMatch = response.match(/\[[\s\S]*\]/)
    if (!jsonMatch) return []

    const predictions = JSON.parse(jsonMatch[0])

    // Map to our format with names
    const nameMap: Record<string, string> = {
      'navbar': 'Navbar',
      'hero-centered': 'Centered Hero',
      'hero-split': 'Split Hero',
      'features-grid': 'Features Grid',
      'features-list': 'Features List',
      'testimonials': 'Testimonials',
      'logos': 'Logo Cloud',
      'stats': 'Stats Section',
      'pricing-table': 'Pricing Table',
      'cta-simple': 'Simple CTA',
      'cta-newsletter': 'Newsletter',
      'team-grid': 'Team Grid',
      'faq': 'FAQ Section',
      'footer': 'Footer',
    }

    return predictions
      .filter((p: any) => p.id && nameMap[p.id])
      .map((p: any) => ({
        id: p.id,
        name: nameMap[p.id] || p.id,
        confidence: p.confidence || 0.5,
        reason: p.reason || '',
      }))
      .slice(0, 5)
  } catch (error) {
    console.warn('Failed to parse Ollama response:', error)
    return []
  }
}

// Embedding-based similarity search (future enhancement)
export async function getSemanticSuggestions(query: string): Promise<string[]> {
  try {
    const response = await fetch(`${OLLAMA_URL}/api/embeddings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'nomic-embed-text',
        prompt: query,
      }),
      signal: AbortSignal.timeout(5000),
    })

    if (!response.ok) return []

    // In a full implementation, you'd compare this embedding
    // against pre-computed component embeddings
    return []
  } catch {
    return []
  }
}

// Context for slot-based predictions
interface SlotPredictionContext {
  parentType: string
  parentName?: string
  existingChildren: string[]
  siblingComponents?: string[]
  pageComponents?: string[]
}

// Get contextual predictions for what to add inside a container slot
export async function getSlotPredictions(
  context: SlotPredictionContext
): Promise<ComponentPrediction[]> {
  const { parentType, existingChildren, siblingComponents = [], pageComponents = [] } = context

  const prompt = buildSlotPredictionPrompt(parentType, existingChildren, siblingComponents, pageComponents)

  try {
    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'qwen2.5-coder:7b',
        prompt,
        stream: false,
        options: {
          temperature: 0.3,
          num_predict: 400,
        },
      }),
      signal: AbortSignal.timeout(8000),
    })

    if (!response.ok) {
      throw new Error('Ollama request failed')
    }

    const data = await response.json()
    return parseSlotResponse(data.response)
  } catch (error) {
    console.warn('Ollama slot prediction failed:', error)
    return []
  }
}

function buildSlotPredictionPrompt(
  parentType: string,
  existingChildren: string[],
  siblingComponents: string[],
  pageComponents: string[]
): string {
  const childList = existingChildren.length > 0 ? existingChildren.join(', ') : 'empty'
  const siblingList = siblingComponents.length > 0 ? siblingComponents.join(', ') : 'none'
  const pageList = pageComponents.length > 0 ? pageComponents.join(', ') : 'empty page'

  return `You are a web design assistant. A user is adding content inside a container component.

Container type: ${parentType}
Current children in this slot: ${childList}
Sibling components (in other slots): ${siblingList}
Other components on page: ${pageList}

Available child components:
- card-basic: Simple content card
- card-image: Card with image header
- text: Text/paragraph block
- heading: Heading/title
- image: Image element
- button: Button element
- avatar: User avatar
- stats: Statistics display
- team-member: Team member card
- pricing-card: Pricing tier card
- testimonial-card: Customer quote card
- form-contact: Contact form
- form-newsletter: Email signup
- icon: Icon element
- divider: Horizontal divider
- list: Bullet/numbered list

Based on the container type and context, suggest 4-6 components that would work well. Consider:
1. What typically goes inside ${parentType} containers
2. Visual balance with siblings
3. Common UI patterns

Respond ONLY with a JSON array:
[{"id": "component-id", "confidence": 0.9, "reason": "brief reason"}]`
}

function parseSlotResponse(response: string): ComponentPrediction[] {
  try {
    const jsonMatch = response.match(/\[[\s\S]*\]/)
    if (!jsonMatch) return []

    const predictions = JSON.parse(jsonMatch[0])

    const nameMap: Record<string, string> = {
      'card-basic': 'Card',
      'card-image': 'Image Card',
      'text': 'Text Block',
      'heading': 'Heading',
      'image': 'Image',
      'button': 'Button',
      'avatar': 'Avatar',
      'stats': 'Stats',
      'team-member': 'Team Member',
      'pricing-card': 'Pricing Card',
      'testimonial-card': 'Testimonial',
      'form-contact': 'Contact Form',
      'form-newsletter': 'Newsletter',
      'icon': 'Icon',
      'divider': 'Divider',
      'list': 'List',
    }

    return predictions
      .filter((p: any) => p.id && nameMap[p.id])
      .map((p: any) => ({
        id: p.id,
        name: nameMap[p.id] || p.id,
        confidence: p.confidence || 0.5,
        reason: p.reason || '',
      }))
      .slice(0, 6)
  } catch (error) {
    console.warn('Failed to parse slot response:', error)
    return []
  }
}
