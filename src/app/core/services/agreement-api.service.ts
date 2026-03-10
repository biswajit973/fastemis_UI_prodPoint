import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import {
    AgentAgreementQuestion,
    AgreementAnswerChoice,
    AgreementCompletionResult,
    AgreementDocumentPayload,
    AgreementFlowState,
    AgreementLegalSettings,
    AgreementQuestionItem,
    AgentBookingAgreementConfigInput,
    BookingAgreementConfig,
    BookingAgreementCurrentPayload,
    UserAgreementState
} from '../models/agreement.model';

@Injectable({
    providedIn: 'root'
})
export class AgreementApiService {
    constructor(private http: HttpClient) { }

    getAgentQuestions(): Observable<AgentAgreementQuestion[]> {
        return this.http.get<{ questions?: Array<{
            questionId: number;
            description: string;
            answerType: 'yes_no';
            is_active: boolean;
            updated_at: string;
        }> }>('/api/agent/agreements/questions').pipe(
            map((response) => response?.questions || []),
            catchError(() => of([]))
        );
    }

    saveAgentQuestions(questions: Array<{ questionId: number; description: string }>): Observable<AgentAgreementQuestion[]> {
        return this.http.post<{ questions?: Array<{
            questionId: number;
            description: string;
            answerType: 'yes_no';
            is_active: boolean;
            updated_at: string;
        }> }>('/api/agent/agreements/questions', { questions }).pipe(
            map((response) => response?.questions || []),
            catchError(() => of([]))
        );
    }

    resetUserAgreements(userId: string): Observable<boolean> {
        return this.http.post('/api/agent/agreements/reset-user', { user_id: userId }).pipe(
            map(() => true),
            catchError(() => of(false))
        );
    }

    setUserAgreementVisibility(userId: string, enabled: boolean): Observable<boolean> {
        return this.http.patch<{ agreement_tab_enabled?: boolean }>('/api/agent/agreements/user-visibility', {
            user_id: userId,
            agreement_tab_enabled: enabled
        }).pipe(
            map((response) => !!response && !!response.agreement_tab_enabled === enabled),
            catchError(() => of(false))
        );
    }

    getUserAgreementState(): Observable<UserAgreementState> {
        return this.http.get<{
            questions?: AgreementQuestionItem[];
            all_answered?: boolean;
            total_questions?: number;
            agreement_enabled?: boolean;
            agreement1_complete?: boolean;
            agreement2_available?: boolean;
            agreement2_complete?: boolean;
            agreement_complete?: boolean;
            signature_url?: string;
            consent_video_url?: string;
            agreement_completed_at?: string | null;
        }>('/api/agreements/questions').pipe(
            map((response) => this.mapUserAgreementState(response)),
            catchError(() => of(this.emptyUserAgreementState()))
        );
    }

    submitUserAnswers(answers: Array<{ questionId: number; answer: AgreementAnswerChoice }>): Observable<UserAgreementState> {
        return this.http.post<{
            questions?: AgreementQuestionItem[];
            all_answered?: boolean;
            total_questions?: number;
            agreement_enabled?: boolean;
            agreement1_complete?: boolean;
            agreement2_available?: boolean;
            agreement2_complete?: boolean;
            agreement_complete?: boolean;
            signature_url?: string;
            consent_video_url?: string;
            agreement_completed_at?: string | null;
        }>('/api/agreements/answers', { answers }).pipe(
            map((response) => this.mapUserAgreementState(response)),
            catchError(() => of(this.emptyUserAgreementState()))
        );
    }

    completeAgreement(payload: FormData): Observable<AgreementCompletionResult | null> {
        return this.http.post<{
            questions?: AgreementQuestionItem[];
            all_answered?: boolean;
            total_questions?: number;
            agreement_enabled?: boolean;
            agreement1_complete?: boolean;
            agreement2_available?: boolean;
            agreement2_complete?: boolean;
            agreement_complete?: boolean;
            signature_url?: string;
            consent_video_url?: string;
            agreement_completed_at?: string | null;
            document?: unknown;
        }>('/api/agreements/complete', payload).pipe(
            map((response) => ({
                state: this.mapUserAgreementState(response),
                document: response?.document ? this.mapAgreementDocument(response.document) : null
            })),
            catchError(() => of(null))
        );
    }

    getAgreementDocument(): Observable<AgreementDocumentPayload | null> {
        return this.http.get<{ document?: unknown }>('/api/agreements/document').pipe(
            map((response) => response?.document ? this.mapAgreementDocument(response.document) : null),
            catchError(() => of(null))
        );
    }

    syncAgreementDocumentExecution(payload: {
        userAgent: string;
        browserName: string;
        browserVersion: string;
        operatingSystem: string;
        browserLanguage: string;
        browserTimezone: string;
    }): Observable<AgreementDocumentPayload | null> {
        return this.http.post<{ document?: unknown }>('/api/agreements/document/sync-execution', {
            user_agent: payload.userAgent,
            browser_name: payload.browserName,
            browser_version: payload.browserVersion,
            operating_system: payload.operatingSystem,
            browser_language: payload.browserLanguage,
            browser_timezone: payload.browserTimezone
        }).pipe(
            map((response) => response?.document ? this.mapAgreementDocument(response.document) : null),
            catchError(() => of(null))
        );
    }

    getAgentAgreementDocument(userId: string): Observable<AgreementDocumentPayload | null> {
        const normalizedUserId = String(userId || '').trim();
        if (!normalizedUserId) {
            return of(null);
        }
        return this.http.get<{ document?: unknown }>(`/api/agent/users/${encodeURIComponent(normalizedUserId)}/agreement-document`).pipe(
            map((response) => response?.document ? this.mapAgreementDocument(response.document) : null),
            catchError(() => of(null))
        );
    }

    getAgreementFlowState(): Observable<AgreementFlowState> {
        return this.http.get<{
            agreement1_complete?: boolean;
            agreement2_available?: boolean;
            agreement2_complete?: boolean;
            agreement_complete?: boolean;
            active_booking_config_id?: number | null;
        }>('/api/agreements/state').pipe(
            map((response) => ({
                agreement1Complete: !!response?.agreement1_complete,
                agreement2Available: !!response?.agreement2_available,
                agreement2Complete: !!response?.agreement2_complete,
                agreementComplete: !!response?.agreement_complete,
                activeBookingConfigId: Number.isFinite(Number(response?.active_booking_config_id))
                    ? Number(response?.active_booking_config_id)
                    : null
            })),
            catchError(() => of({
                agreement1Complete: false,
                agreement2Available: false,
                agreement2Complete: false,
                agreementComplete: false,
                activeBookingConfigId: null
            }))
        );
    }

    getBookingCurrent(): Observable<BookingAgreementCurrentPayload | null> {
        return this.http.get<any>('/api/agreements/booking/current').pipe(
            map((response) => ({
                config: response?.config ? this.mapBookingConfig(response.config) : null,
                legalSettings: response?.legal_settings ? this.mapLegalSettings(response.legal_settings) : null,
                buyer: response?.buyer || null,
                agreement1Complete: !!response?.agreement1_complete,
                agreement2Complete: !!response?.agreement2_complete,
                canSign: !!response?.can_sign,
                acceptance: response?.acceptance || null,
                documentSnapshot: response?.document_snapshot || null
            })),
            catchError(() => of(null))
        );
    }

    acceptBookingAgreement(
        typedFullName: string,
        acceptBookingTerms: boolean
    ): Observable<{ ok: boolean; error?: string }> {
        return this.http.post('/api/agreements/booking/accept', {
            typed_full_name: typedFullName,
            accept_booking_terms: acceptBookingTerms
        }).pipe(
            map(() => ({ ok: true })),
            catchError((error: HttpErrorResponse) => of({
                ok: false,
                error: this.extractErrorMessage(error, 'Could not sign Agreement 2. Please retry.')
            }))
        );
    }

    getSignedBookingAgreement(): Observable<BookingAgreementCurrentPayload | null> {
        return this.http.get<any>('/api/agreements/booking/signed').pipe(
            map((response) => ({
                config: response?.config ? this.mapBookingConfig(response.config) : null,
                legalSettings: response?.legal_settings ? this.mapLegalSettings(response.legal_settings) : null,
                buyer: response?.buyer || null,
                agreement1Complete: true,
                agreement2Complete: true,
                canSign: false,
                acceptance: response?.acceptance || null,
                documentSnapshot: response?.document_snapshot || null
            })),
            catchError(() => of(null))
        );
    }

    getAgreementLegalSettings(): Observable<AgreementLegalSettings | null> {
        return this.http.get<{ settings?: AgreementLegalSettings }>('/api/agent/agreements/legal-settings').pipe(
            map((response) => response?.settings ? this.mapLegalSettings(response.settings) : null),
            catchError(() => of(null))
        );
    }

    updateAgreementLegalSettings(payload: Partial<AgreementLegalSettings>): Observable<AgreementLegalSettings | null> {
        return this.http.patch<{ settings?: AgreementLegalSettings }>('/api/agent/agreements/legal-settings', payload).pipe(
            map((response) => response?.settings ? this.mapLegalSettings(response.settings) : null),
            catchError(() => of(null))
        );
    }

    getBookingConfigs(userId?: string): Observable<BookingAgreementConfig[]> {
        const normalizedUserId = String(userId || '').trim();
        if (!normalizedUserId) {
            return of([]);
        }
        const query = `?userId=${encodeURIComponent(normalizedUserId)}`;
        return this.http.get<{ configs?: unknown[] }>(`/api/agent/agreements/booking-config${query}`).pipe(
            map((response) => Array.isArray(response?.configs)
                ? response.configs.map((item) => this.mapBookingConfig(item))
                : []),
            catchError(() => of([]))
        );
    }

    createBookingConfig(payload: AgentBookingAgreementConfigInput): Observable<BookingAgreementConfig | null> {
        return this.http.post<{ config?: unknown }>('/api/agent/agreements/booking-config', payload).pipe(
            map((response) => response?.config ? this.mapBookingConfig(response.config) : null),
            catchError(() => of(null))
        );
    }

    updateBookingConfig(configId: number, patch: Partial<AgentBookingAgreementConfigInput>): Observable<BookingAgreementConfig | null> {
        return this.http.patch<{ config?: unknown }>(`/api/agent/agreements/booking-config/${configId}`, patch).pipe(
            map((response) => response?.config ? this.mapBookingConfig(response.config) : null),
            catchError(() => of(null))
        );
    }

    publishBookingConfig(configId: number): Observable<BookingAgreementConfig | null> {
        return this.http.post<{ config?: unknown }>(`/api/agent/agreements/booking-config/${configId}/publish`, {}).pipe(
            map((response) => response?.config ? this.mapBookingConfig(response.config) : null),
            catchError(() => of(null))
        );
    }

    cancelBookingConfig(configId: number): Observable<BookingAgreementConfig | null> {
        return this.http.post<{ config?: unknown }>(`/api/agent/agreements/booking-config/${configId}/cancel`, {}).pipe(
            map((response) => response?.config ? this.mapBookingConfig(response.config) : null),
            catchError(() => of(null))
        );
    }

    resetUserBookingAgreement(userId: string): Observable<boolean> {
        return this.http.post('/api/agent/agreements/booking/reset-user', { user_id: userId }).pipe(
            map(() => true),
            catchError(() => of(false))
        );
    }

    private emptyUserAgreementState(): UserAgreementState {
        return {
            questions: [],
            allAnswered: false,
            totalQuestions: 0,
            agreementEnabled: false,
            agreement1Complete: false,
            agreement2Available: false,
            agreement2Complete: false,
            agreementComplete: false,
            signatureUrl: '',
            consentVideoUrl: '',
            agreementCompletedAt: null
        };
    }

    private mapUserAgreementState(response: any): UserAgreementState {
        return {
            questions: (response?.questions || []).map((item: any) => ({
                questionId: Number(item.questionId),
                description: String(item.description || ''),
                answerType: 'yes_no' as const,
                answer: item.answer === 'yes' || item.answer === 'no' ? item.answer : null,
                readonly: !!item.readonly
            })),
            allAnswered: !!response?.all_answered,
            totalQuestions: Number(response?.total_questions || 0),
            agreementEnabled: !!response?.agreement_enabled,
            agreement1Complete: !!response?.agreement1_complete,
            agreement2Available: !!response?.agreement2_available,
            agreement2Complete: !!response?.agreement2_complete,
            agreementComplete: !!response?.agreement_complete,
            signatureUrl: String(response?.signature_url || ''),
            consentVideoUrl: String(response?.consent_video_url || ''),
            agreementCompletedAt: response?.agreement_completed_at || null
        };
    }

    private mapLegalSettings(raw: any): AgreementLegalSettings {
        return {
            seller_legal_name: String(raw?.seller_legal_name || ''),
            seller_brand_name: String(raw?.seller_brand_name || ''),
            office_address: String(raw?.office_address || ''),
            jurisdiction_city: String(raw?.jurisdiction_city || ''),
            jurisdiction_state: String(raw?.jurisdiction_state || ''),
            support_email: String(raw?.support_email || ''),
            payments_email: String(raw?.payments_email || ''),
            version: String(raw?.version || ''),
            updated_at: raw?.updated_at || ''
        };
    }

    private mapBookingConfig(raw: any): BookingAgreementConfig {
        return {
            id: Number(raw?.id || 0),
            user_id: String(raw?.user_id || ''),
            product_name: String(raw?.product_name || ''),
            product_category: String(raw?.product_category || ''),
            brand_model_variant: String(raw?.brand_model_variant || ''),
            product_unique_id: String(raw?.product_unique_id || ''),
            product_condition: String(raw?.product_condition || ''),
            total_product_value_inr: String(raw?.total_product_value_inr || '0'),
            booking_amount_inr: String(raw?.booking_amount_inr || '0'),
            balance_amount_inr: String(raw?.balance_amount_inr || '0'),
            reservation_period_days: Number(raw?.reservation_period_days || 0),
            reservation_starts_at: raw?.reservation_starts_at || null,
            delivery_notes: String(raw?.delivery_notes || ''),
            status: String(raw?.status || 'draft') as BookingAgreementConfig['status'],
            published_at: raw?.published_at || null,
            cancelled_at: raw?.cancelled_at || null,
            created_at: raw?.created_at || null,
            updated_at: raw?.updated_at || null,
            acceptance: raw?.acceptance || null,
            user: raw?.user || undefined
        };
    }

    private mapAgreementDocument(raw: any): AgreementDocumentPayload {
        return {
            documentType: String(raw?.document_type || ''),
            agreementVersion: String(raw?.agreement_version || ''),
            agreementId: String(raw?.agreement_id || ''),
            sessionId: String(raw?.session_id || ''),
            executedAt: raw?.executed_at || null,
            agreedToAllClauses: !!raw?.agreed_to_all_clauses,
            documentHash: String(raw?.document_hash || ''),
            customer: {
                userId: String(raw?.customer?.user_id || ''),
                fullName: String(raw?.customer?.full_name || ''),
                email: String(raw?.customer?.email || ''),
                mobileNumber: String(raw?.customer?.mobile_number || ''),
                deviceCode: String(raw?.customer?.device_code || ''),
                requestedAmount: String(raw?.customer?.requested_amount || ''),
                maritalStatus: String(raw?.customer?.marital_status || ''),
                spouseOccupation: String(raw?.customer?.spouse_occupation || ''),
                employmentType: String(raw?.customer?.employment_type || ''),
                whatYouDo: String(raw?.customer?.what_you_do || ''),
                monthlySalary: String(raw?.customer?.monthly_salary || ''),
                address: {
                    fullAddress: String(raw?.customer?.address?.full_address || ''),
                    city: String(raw?.customer?.address?.city || ''),
                    pincode: String(raw?.customer?.address?.pincode || '')
                },
                aadharNumber: String(raw?.customer?.aadhar_number || ''),
                panNumber: String(raw?.customer?.pan_number || '')
            },
            execution: {
                ipAddress: String(raw?.execution?.ip_address || ''),
                userAgent: String(raw?.execution?.user_agent || ''),
                browserName: String(raw?.execution?.browser_name || ''),
                browserVersion: String(raw?.execution?.browser_version || ''),
                operatingSystem: String(raw?.execution?.operating_system || ''),
                browserLanguage: String(raw?.execution?.browser_language || ''),
                browserTimezone: String(raw?.execution?.browser_timezone || '')
            },
            evidence: {
                aadharImageUrl: String(raw?.evidence?.aadhar_image_url || ''),
                pancardImageUrl: String(raw?.evidence?.pancard_image_url || ''),
                livePhotoUrl: String(raw?.evidence?.live_photo_url || ''),
                signatureUrl: String(raw?.evidence?.signature_url || ''),
                consentVideoUrl: String(raw?.evidence?.consent_video_url || '')
            }
        };
    }

    private extractErrorMessage(error: HttpErrorResponse, fallback: string): string {
        const payload = error?.error;
        if (!payload) {
            return fallback;
        }

        if (typeof payload === 'string') {
            const text = payload.trim();
            return text || fallback;
        }

        const direct = payload.error || payload.detail || payload.message;
        if (typeof direct === 'string' && direct.trim()) {
            return direct.trim();
        }

        for (const value of Object.values(payload)) {
            if (Array.isArray(value) && value.length > 0) {
                const first = value[0];
                if (typeof first === 'string' && first.trim()) {
                    return first.trim();
                }
            }
            if (typeof value === 'string' && value.trim()) {
                return value.trim();
            }
        }

        return fallback;
    }
}
