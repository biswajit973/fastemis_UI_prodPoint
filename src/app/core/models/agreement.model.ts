export type AgreementAnswerChoice = 'yes' | 'no';

export interface AgreementQuestionItem {
    questionId: number;
    description: string;
    answerType: 'yes_no';
    answer: AgreementAnswerChoice | null;
    readonly: boolean;
}

export interface AgentAgreementQuestion {
    questionId: number;
    description: string;
    answerType: 'yes_no';
    is_active: boolean;
    updated_at: string;
}

export interface UserAgreementState {
    questions: AgreementQuestionItem[];
    allAnswered: boolean;
    totalQuestions: number;
    agreementEnabled: boolean;
    agreement1Complete: boolean;
    agreement2Available: boolean;
    agreement2Complete: boolean;
    agreementComplete: boolean;
    signatureUrl: string;
    consentVideoUrl: string;
    agreementCompletedAt: string | null;
}

export interface AgreementFlowState {
    agreement1Complete: boolean;
    agreement2Available: boolean;
    agreement2Complete: boolean;
    agreementComplete: boolean;
    activeBookingConfigId: number | null;
}

export interface AgreementLegalSettings {
    seller_legal_name: string;
    seller_brand_name: string;
    office_address: string;
    jurisdiction_city: string;
    jurisdiction_state: string;
    support_email: string;
    payments_email: string;
    version: string;
    updated_at?: string;
}

export interface BookingAgreementUserInfo {
    user_id: string;
    full_name: string;
    email: string;
    mobile_number: string;
    address: {
        full_address: string;
        city: string;
        pincode: string;
    };
}

export interface BookingAgreementAcceptance {
    typed_full_name: string;
    accept_booking_terms: boolean;
    accepted_at: string | null;
    accepted_ip?: string | null;
    accepted_user_agent?: string;
    agreement_version: string;
    document_hash: string;
}

export interface BookingAgreementConfig {
    id: number;
    user_id: string;
    product_name: string;
    product_category: string;
    brand_model_variant: string;
    product_unique_id: string;
    product_condition: string;
    total_product_value_inr: string;
    booking_amount_inr: string;
    balance_amount_inr: string;
    reservation_period_days: number;
    reservation_starts_at: string | null;
    delivery_notes: string;
    status: 'draft' | 'published' | 'signed' | 'expired' | 'cancelled';
    published_at: string | null;
    cancelled_at: string | null;
    created_at: string | null;
    updated_at: string | null;
    acceptance?: BookingAgreementAcceptance | null;
    user?: {
        id: string;
        full_name: string;
        email: string;
        mobile_number: string;
    };
}

export interface BookingAgreementCurrentPayload {
    config: BookingAgreementConfig | null;
    legalSettings: AgreementLegalSettings | null;
    buyer: BookingAgreementUserInfo | null;
    agreement1Complete: boolean;
    agreement2Complete: boolean;
    canSign: boolean;
    acceptance?: BookingAgreementAcceptance | null;
    documentSnapshot?: Record<string, unknown> | null;
}

export interface AgreementDocumentExecutionInfo {
    ipAddress: string;
    userAgent: string;
    browserName: string;
    browserVersion: string;
    operatingSystem: string;
    browserLanguage: string;
    browserTimezone: string;
}

export interface AgreementDocumentCustomerInfo {
    userId: string;
    fullName: string;
    email: string;
    mobileNumber: string;
    deviceCode: string;
    requestedAmount: string;
    maritalStatus: string;
    spouseOccupation: string;
    employmentType: string;
    whatYouDo: string;
    monthlySalary: string;
    address: {
        fullAddress: string;
        city: string;
        pincode: string;
    };
    aadharNumber: string;
    panNumber: string;
}

export interface AgreementDocumentEvidence {
    aadharImageUrl: string;
    pancardImageUrl: string;
    livePhotoUrl: string;
    signatureUrl: string;
    consentVideoUrl: string;
}

export interface AgreementDocumentPayload {
    documentType: string;
    agreementVersion: string;
    agreementId: string;
    sessionId: string;
    executedAt: string | null;
    agreedToAllClauses: boolean;
    documentHash: string;
    customer: AgreementDocumentCustomerInfo;
    execution: AgreementDocumentExecutionInfo;
    evidence: AgreementDocumentEvidence;
}

export interface AgreementCompletionResult {
    state: UserAgreementState;
    document: AgreementDocumentPayload | null;
}

export interface AgentBookingAgreementConfigInput {
    user_id: string;
    product_name: string;
    product_category?: string;
    brand_model_variant?: string;
    product_unique_id?: string;
    product_condition?: string;
    total_product_value_inr: string | number;
    booking_amount_inr: string | number;
    balance_amount_inr?: string | number;
    reservation_period_days: number;
    reservation_starts_at: string;
    delivery_notes?: string;
}
