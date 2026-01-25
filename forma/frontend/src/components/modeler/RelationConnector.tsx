'use client'

import { useMemo } from 'react'
import type { SchemaDefinition, CollectionPosition } from '@/types/schema'

interface RelationConnectorProps {
  schema: SchemaDefinition
  positions: Record<string, CollectionPosition>
}

interface Relation {
  from: string
  to: string
  field: string
  type: string
}

export function RelationConnector({ schema, positions }: RelationConnectorProps) {
  // Extract all relations from schema
  const relations = useMemo(() => {
    const result: Relation[] = []

    for (const [collName, collection] of Object.entries(schema.collections)) {
      for (const [fieldName, field] of Object.entries(collection.fields)) {
        if (field.type === 'relation' && field.target) {
          result.push({
            from: collName,
            to: field.target,
            field: fieldName,
            type: field.relation || 'many-to-one',
          })
        }
      }
    }

    return result
  }, [schema])

  if (relations.length === 0) return null

  // Collection node dimensions (approximate)
  const NODE_WIDTH = 280
  const NODE_HEADER_HEIGHT = 40

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      style={{ width: '100%', height: '100%', overflow: 'visible' }}
    >
      <defs>
        {/* Arrow markers */}
        <marker
          id="arrow-one"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#3B82F6" />
        </marker>

        <marker
          id="arrow-many"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 L 4 5 z" fill="#3B82F6" />
        </marker>

        <marker
          id="circle"
          viewBox="0 0 10 10"
          refX="5"
          refY="5"
          markerWidth="6"
          markerHeight="6"
        >
          <circle cx="5" cy="5" r="3" fill="#3B82F6" />
        </marker>
      </defs>

      {relations.map((relation, index) => {
        const fromPos = positions[relation.from]
        const toPos = positions[relation.to]

        if (!fromPos || !toPos) return null

        // Calculate connection points
        // Connect from the right side of the source to the left side of the target
        const fromX = fromPos.x + NODE_WIDTH
        const fromY = fromPos.y + NODE_HEADER_HEIGHT + 20
        const toX = toPos.x
        const toY = toPos.y + NODE_HEADER_HEIGHT + 20

        // Create a curved path
        const midX = (fromX + toX) / 2
        const controlOffset = Math.min(Math.abs(toX - fromX) / 2, 100)

        // Handle self-referencing relations
        if (relation.from === relation.to) {
          const selfX = fromPos.x + NODE_WIDTH
          const selfY = fromPos.y + NODE_HEADER_HEIGHT + 40
          const loopSize = 50

          return (
            <g key={`${relation.from}-${relation.field}-${index}`}>
              <path
                d={`M ${selfX} ${selfY}
                    C ${selfX + loopSize} ${selfY - loopSize}
                      ${selfX + loopSize} ${selfY + loopSize}
                      ${selfX} ${selfY + 30}`}
                fill="none"
                stroke="#3B82F6"
                strokeWidth="2"
                strokeDasharray={relation.type.includes('many') ? 'none' : '4 4'}
                opacity="0.6"
                markerEnd="url(#arrow-one)"
              />
              <text
                x={selfX + loopSize + 5}
                y={selfY}
                className="text-xs fill-blue-400"
                fontSize="10"
              >
                {relation.field}
              </text>
            </g>
          )
        }

        // Determine path direction (left-to-right or right-to-left)
        let path: string
        let labelX: number
        let labelY: number

        if (fromX < toX) {
          // Normal left-to-right
          path = `M ${fromX} ${fromY} C ${fromX + controlOffset} ${fromY} ${toX - controlOffset} ${toY} ${toX} ${toY}`
          labelX = midX
          labelY = (fromY + toY) / 2 - 8
        } else {
          // Right-to-left (curve under)
          const curveY = Math.max(fromY, toY) + 60
          path = `M ${fromX} ${fromY}
                  C ${fromX + 50} ${fromY} ${fromX + 50} ${curveY} ${midX} ${curveY}
                  C ${toX - 50} ${curveY} ${toX - 50} ${toY} ${toX} ${toY}`
          labelX = midX
          labelY = curveY + 12
        }

        // Marker based on relation type
        const markerEnd = relation.type.includes('many')
          ? 'url(#arrow-many)'
          : 'url(#arrow-one)'

        return (
          <g key={`${relation.from}-${relation.field}-${index}`}>
            <path
              d={path}
              fill="none"
              stroke="#3B82F6"
              strokeWidth="2"
              strokeDasharray={relation.type === 'one-to-one' ? '4 4' : 'none'}
              opacity="0.5"
              markerEnd={markerEnd}
              markerStart="url(#circle)"
            />
            <text
              x={labelX}
              y={labelY}
              textAnchor="middle"
              className="text-xs fill-blue-400 pointer-events-none"
              fontSize="10"
              fontFamily="monospace"
            >
              {relation.field}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
