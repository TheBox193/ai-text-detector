export type SeverityLevel = "low" | "medium" | "high"
export type DetectionType = "sentence" | "word"

export type DetectionStats = {
  totalWords: number
  totalCharacters: number
  flaggedWords: number
  flaggedCharacters: number
  rawCoverage: number
  weightedCoverage: number
  scorePercent: number
  highlightCount: number
  uniqueDetections: number
  severityBreakdown: Record<SeverityLevel | "unknown", number>
  typeBreakdown: Record<DetectionType, number>
  coreNodeTag: string
  weightedCoveragePercent: number
  rawCoveragePercent: number
  detectionPoints: number
  pointsPer100Words: number
  highSeverityDensity: number
  uniqueDensity: number
  detectionIntensity: number
  confidence: number
  confidencePercent: number
}
