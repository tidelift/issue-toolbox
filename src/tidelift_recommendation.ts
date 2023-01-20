type RecommendationData = {
  created_at: Date
  updated_at: Date
  impact_score: number
  impact_description: string
  other_conditions: boolean
  other_conditions_description?: string
  workaround_available: boolean
  workaround_description?: string
  specific_methods_affected: boolean
  specific_methods_description?: string
  real_issue: boolean
  false_positive_reason?: string
}

export class TideliftRecommendation implements RecommendationData {
  created_at: Date
  updated_at: Date
  impact_score: number
  impact_description: string
  other_conditions: boolean
  other_conditions_description?: string
  workaround_available: boolean
  workaround_description?: string
  specific_methods_affected: boolean
  specific_methods_description?: string
  real_issue: boolean
  false_positive_reason?: string

  constructor(data: RecommendationData) {
    this.created_at = data['created_at']
    this.updated_at = data['updated_at']
    this.impact_score = data['impact_score']
    this.impact_description = data['impact_description']
    this.other_conditions = data['other_conditions']
    this.other_conditions_description = data['other_conditions_description']
    this.workaround_available = data['workaround_available']
    this.workaround_description = data['workaround_description']
    this.specific_methods_affected = data['specific_methods_affected']
    this.specific_methods_description = data['specific_methods_description']
    this.real_issue = data['real_issue']
    this.false_positive_reason = data['false_positive_reason']
  }
}
