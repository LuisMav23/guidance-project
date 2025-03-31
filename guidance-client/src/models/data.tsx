import { AnswerSummary } from "./answerSummary";


export interface ClassificationReport {
    precision: number;
    recall: number;
    "f1-score": number;
    support?: number;
}

export interface ClassificationSummary {
    accuracy: number;
    model_name: string;
    report: Record<string, ClassificationReport>;
    confusion_matrix: number[][];
}

export interface Data {
    id: string;
    user: string;
    type: string;
    data_summary: {
        answers_summary: AnswerSummary;
        cluster_summary: {
            optimal_k: number;
            cluster_count: object;
        }
        pca_summary: {
            optimal_pcs: number;
        }
        classification_summary?: ClassificationSummary;
    }
}