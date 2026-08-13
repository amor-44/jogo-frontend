import axios from 'axios';
import type { AnalysisReportDto, PerformanceMetricsDto } from '../types';

const AI_BASE_URL = import.meta.env.VITE_AI_API_URL || 'https://jogo-ai.fastapicloud.dev';

const aiClient = axios.create({
  baseURL: AI_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Response types from AI API ───────────────────────────────────────────────

/** The AI API returns a free-form JSON object. We define the shape we expect. */
interface AIAnalysisResponse {
  analysis_id?: string;
  id?: string;
  status?: string;
  result?: AIAnalysisResult;
  // When the result is returned inline (not nested)
  overall_score?: number;
  overallScore?: number;
  summary?: string;
  strengths?: string[];
  weaknesses?: string[];
  recommendations?: string[];
  ai_model_version?: string;
  aiModelVersion?: string;
  completed_at?: string;
  completedAt?: string;
  metrics?: Record<string, number>;
  performance_metrics?: Record<string, number>;
  performanceMetrics?: Record<string, number>;
}

interface AIAnalysisResult {
  overall_score?: number;
  overallScore?: number;
  summary?: string;
  strengths?: string[];
  weaknesses?: string[];
  recommendations?: string[];
  ai_model_version?: string;
  aiModelVersion?: string;
  completed_at?: string;
  completedAt?: string;
  metrics?: Record<string, number>;
  performance_metrics?: Record<string, number>;
  performanceMetrics?: Record<string, number>;
}

// ─── Helper: map AI response to our AnalysisReportDto ─────────────────────────

function mapMetrics(raw?: Record<string, number>): PerformanceMetricsDto {
  if (!raw) return {};
  return {
    positionScore: raw.position_score ?? raw.positionScore ?? raw['position score'],
    passingAccuracy: raw.passing_accuracy ?? raw.passingAccuracy ?? raw['passing accuracy'] ?? raw.passing,
    ballControl: raw.ball_control ?? raw.ballControl ?? raw['ball control'] ?? raw.dribbling,
    positioningScore: raw.positioning_score ?? raw.positioningScore ?? raw.positioning,
    movementEfficiency: raw.movement_efficiency ?? raw.movementEfficiency ?? raw.speed,
    defensiveActions: raw.defensive_actions ?? raw.defensiveActions ?? raw.defending,
    attackingImpact: raw.attacking_impact ?? raw.attackingImpact ?? raw.shooting,
    decisionMaking: raw.decision_making ?? raw.decisionMaking ?? raw['decision making'],
  };
}

function mapToReport(data: AIAnalysisResponse, videoId: string): AnalysisReportDto {
  // The result could be nested under `result` or flat at the top level
  const r = data.result || data;

  return {
    id: data.analysis_id || data.id || `ai-${Date.now()}`,
    videoId,
    overallScore: r.overall_score ?? r.overallScore ?? 0,
    summary: r.summary || '',
    strengths: r.strengths || [],
    weaknesses: r.weaknesses || [],
    recommendations: r.recommendations || [],
    aiModelVersion: r.ai_model_version ?? r.aiModelVersion ?? 'JogoAI-v1',
    completedAt: r.completed_at ?? r.completedAt ?? new Date().toISOString(),
    metrics: mapMetrics(r.metrics || r.performance_metrics || r.performanceMetrics),
  };
}

// ─── Public AI Service ────────────────────────────────────────────────────────

export const aiService = {
  /**
   * Submit a video URL for AI analysis.
   * Returns the analysis_id to poll with, or the full result if returned inline.
   */
  analyzeByUrl: async (videoUrl: string): Promise<{ analysisId: string; report?: AnalysisReportDto; videoId?: string }> => {
    const { data } = await aiClient.post<AIAnalysisResponse>('/analyze-by-url', { video_url: videoUrl });

    const analysisId = data.analysis_id || data.id || '';

    // If the AI already returned a full result inline
    if (data.status === 'completed' || data.result || data.overall_score || data.overallScore) {
      return {
        analysisId,
        report: mapToReport(data, ''),
      };
    }

    return { analysisId };
  },

  /**
   * Upload a video file directly for AI analysis.
   */
  analyzeFile: async (file: File): Promise<{ analysisId: string; report?: AnalysisReportDto }> => {
    const formData = new FormData();
    formData.append('video', file);

    const { data } = await aiClient.post<AIAnalysisResponse>('/analyze/football-performance', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    const analysisId = data.analysis_id || data.id || '';

    if (data.status === 'completed' || data.result || data.overall_score || data.overallScore) {
      return {
        analysisId,
        report: mapToReport(data, ''),
      };
    }

    return { analysisId };
  },

  /**
   * Poll for analysis result by analysis ID.
   */
  getAnalysis: async (analysisId: string, videoId: string): Promise<{ status: string; report?: AnalysisReportDto }> => {
    const { data } = await aiClient.get<AIAnalysisResponse>(`/analysis/${analysisId}`);

    const status = data.status || 'unknown';

    if (status === 'completed' || data.result || data.overall_score || data.overallScore) {
      return {
        status: 'completed',
        report: mapToReport(data, videoId),
      };
    }

    return { status };
  },

  /**
   * Health check for the AI service.
   */
  checkHealth: async (): Promise<boolean> => {
    try {
      await aiClient.get('/health');
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Map raw AI response to our report DTO. Exposed for reuse.
   */
  mapToReport,
};
