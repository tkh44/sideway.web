import { emptyInsight } from 'redux/insights'

export const getInsightById = (state, id) => {
  return state.insights[id] || { ...emptyInsight }
}
