import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { authGuard } from './core/guards/auth.guard';
import { partnerGuard } from './core/guards/partner.guard';
import { profileCompletionGuard } from './core/guards/profile-completion.guard';
import { agreementAccessGuard } from './core/guards/agreement-access.guard';
import { locationAccessGuard } from './core/guards/location-access.guard';
import { userServerAvailabilityGuard } from './core/guards/user-server-availability.guard';
import { userUiFeatureGuard } from './core/guards/user-ui-feature.guard';

export const routes: Routes = [
    {
        path: '',
        component: HomeComponent,
        title: 'FastEMIs - Instant Finance Online',
        data: { breadcrumb: 'Home' }
    },
    {
        path: 'partner/:slug',
        loadComponent: () => import('./features/partner/partner.component').then(m => m.PartnerComponent),
        canActivate: [partnerGuard],
        data: { breadcrumb: 'Partner' }
    },
    {
        path: 'partner/:slug/apply',
        loadComponent: () => import('./features/apply/apply.component').then(m => m.ApplyComponent),
        canActivate: [partnerGuard],
        title: 'FastEMIs - Registration',
        data: { breadcrumb: 'Apply' }
    },
    {
        path: 'sign-in',
        loadComponent: () => import('./features/auth/sign-in.component').then(m => m.SignInComponent),
        title: 'FastEMIs - Sign In',
        data: { breadcrumb: 'Sign In' }
    },
    {
        path: 'agent-sign-in',
        loadComponent: () => import('./features/auth/agent-sign-in.component').then(m => m.AgentSignInComponent),
        title: 'FastEMIs - Agent Sign In',
        data: { breadcrumb: 'Agent Sign In' }
    },
    {
        path: 'sign-up',
        loadComponent: () => import('./features/auth/sign-up.component').then(m => m.SignUpComponent),
        title: 'FastEMIs - Sign Up',
        data: { breadcrumb: 'Sign Up' }
    },
    {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
        canActivate: [authGuard, userServerAvailabilityGuard, locationAccessGuard, profileCompletionGuard],
        title: 'FastEMIs - Dashboard',
        data: { breadcrumb: 'Dashboard' }
    },
    {
        path: 'dashboard/location-access',
        loadComponent: () => import('./features/dashboard/components/location-access/location-access.component').then(m => m.LocationAccessComponent),
        canActivate: [authGuard, userServerAvailabilityGuard],
        title: 'FastEMIs - Location Permission',
        data: { breadcrumb: 'Location Access' }
    },
    {
        path: 'dashboard/complete-profile',
        loadComponent: () => import('./features/dashboard/components/complete-profile/complete-profile.component').then(m => m.CompleteProfileComponent),
        canActivate: [authGuard, userServerAvailabilityGuard, locationAccessGuard],
        title: 'FastEMIs - Complete Profile',
        data: { breadcrumb: 'Complete Profile' }
    },
    {
        path: 'dashboard/support',
        loadComponent: () => import('./features/dashboard/components/support-chat/support-chat.component').then(m => m.SupportChatComponent),
        canActivate: [authGuard, userServerAvailabilityGuard, locationAccessGuard, profileCompletionGuard, userUiFeatureGuard],
        title: 'FastEMIs - Chat With Support',
        data: { breadcrumb: 'Chat With Support', userUiFeature: 'supportChat' }
    },
    {
        path: 'dashboard/messages',
        loadComponent: () => import('./features/messages/messages.component').then(m => m.MessagesComponent),
        canActivate: [authGuard, userServerAvailabilityGuard, locationAccessGuard, profileCompletionGuard, userUiFeatureGuard],
        title: 'FastEMIs - Private Chats',
        data: { breadcrumb: 'Private Chats', userUiFeature: 'privateChat' }
    },
    {
        path: 'dashboard/profile',
        loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent),
        canActivate: [authGuard, userServerAvailabilityGuard, locationAccessGuard, profileCompletionGuard],
        title: 'FastEMIs - Profile',
        data: { breadcrumb: 'Profile Details' }
    },
    {
        path: 'dashboard/community',
        loadComponent: () => import('./features/dashboard/components/community/community.component').then(m => m.CommunityComponent),
        canActivate: [authGuard, userServerAvailabilityGuard, locationAccessGuard, profileCompletionGuard, userUiFeatureGuard],
        title: 'FastEMIs - Community',
        data: { breadcrumb: 'Community', userUiFeature: 'groupChat' }
    },
    {
        path: 'dashboard/send-payments',
        loadComponent: () => import('./features/dashboard/components/send-payments/send-payments.component').then(m => m.SendPaymentsComponent),
        canActivate: [authGuard, userServerAvailabilityGuard, locationAccessGuard, profileCompletionGuard],
        title: 'FastEMIs - Send Payments',
        data: { breadcrumb: 'Send Payments' }
    },
    {
        path: 'dashboard/agreement',
        loadComponent: () => import('./features/agreement/agreement.component').then(m => m.AgreementComponent),
        canActivate: [authGuard, userServerAvailabilityGuard, locationAccessGuard, profileCompletionGuard, userUiFeatureGuard, agreementAccessGuard],
        title: 'FastEMIs - Secure Digital Signature',
        data: { breadcrumb: 'Agreement', userUiFeature: 'agreements' }
    },
    {
        path: 'tester',
        loadComponent: () => import('./features/tester/tester.component').then(m => m.TesterComponent),
        title: 'FastEMIs - Developer Tester Hub',
        data: { breadcrumb: 'Tester' }
    },
    {
        path: 'tester/api',
        loadComponent: () => import('./features/tester/api-test.component').then(m => m.ApiTestComponent),
        title: 'FastEMIs - API Fetch Test',
        data: { breadcrumb: 'API Test' }
    },
    {
        path: 'feature-details',
        loadComponent: () => import('./features/feature-details/feature-details.component').then(m => m.FeatureDetailsComponent),
        title: 'FastEMIs - All Feature Details',
        data: { breadcrumb: 'Feature Details' }
    },
    {
        path: 'testimonials-all',
        loadComponent: () => import('./features/testimonials-all/testimonials-all.component').then(m => m.TestimonialsAllComponent),
        title: 'FastEMIs - Testimonials',
        data: { breadcrumb: 'Testimonials' }
    },
    {
        path: 'stocks',
        loadComponent: () => import('./features/stocks/stocks.component').then(m => m.StocksComponent),
        title: 'FastEMIs - Stocks',
        data: { breadcrumb: 'Stocks' }
    },
    {
        path: 'terms-and-conditions',
        loadComponent: () => import('./features/legal/terms-conditions.component').then(m => m.TermsConditionsComponent),
        title: 'FastEMIs - Terms & Conditions',
        data: { breadcrumb: 'Terms & Conditions' }
    },
    {
        path: 'agent',
        loadComponent: () => import('./features/agent/agent-layout.component').then(m => m.AgentLayoutComponent),
        canActivate: [authGuard],
        title: 'FastEMIs - Vendor Dashboard',
        data: { breadcrumb: 'Agent' },
        children: [
            {
                path: '',
                loadComponent: () => import('./features/agent/agent-home.component').then(m => m.AgentHomeComponent),
                data: { breadcrumb: 'Agent Home' }
            },
            {
                path: 'applicants',
                loadComponent: () => import('./features/agent/agent-dashboard.component').then(m => m.AgentDashboardComponent),
                data: { breadcrumb: 'Applicants' }
            },
            {
                path: 'chats-home',
                loadComponent: () => import('./features/agent/agent-chats-home.component').then(m => m.AgentChatsHomeComponent),
                data: { breadcrumb: 'Chats Home' }
            },
            {
                path: 'applications/:id',
                loadComponent: () => import('./features/agent/agent-application-details.component').then(m => m.AgentApplicationDetailsComponent),
                data: { breadcrumb: 'Profile Details' }
            },
            {
                path: 'chats',
                loadComponent: () => import('./features/agent/components/agent-all-chats/agent-all-chats.component').then(m => m.AgentAllChatsComponent),
                data: { breadcrumb: 'Ghost Chat' }
            },
            {
                path: 'support-chats',
                loadComponent: () => import('./features/agent/components/agent-support-chats/agent-support-chats.component').then(m => m.AgentSupportChatsComponent),
                data: { breadcrumb: 'Support Chats' }
            },
            {
                path: 'support-chats/:userId',
                loadComponent: () => import('./features/agent/components/agent-support-chat-page/agent-support-chat-page.component').then(m => m.AgentSupportChatPageComponent),
                data: { breadcrumb: 'Support Chat' }
            },
            {
                path: 'announcements',
                loadComponent: () => import('./features/agent/components/agent-announcements/agent-announcements.component').then(m => m.AgentAnnouncementsComponent),
                data: { breadcrumb: 'Announcements' }
            },
            {
                path: 'chats/:userId',
                loadComponent: () => import('./features/agent/components/agent-chat-page/agent-chat-page.component').then(m => m.AgentChatPageComponent),
                data: { breadcrumb: 'Chat' }
            },
            {
                path: 'community',
                loadComponent: () => import('./features/dashboard/components/community/community.component').then(m => m.CommunityComponent),
                data: { breadcrumb: 'Community Chat' }
            },
            {
                path: 'ghost-setup',
                loadComponent: () => import('./features/agent/components/ghost-setup/ghost-setup.component').then(m => m.GhostSetupComponent),
                data: { breadcrumb: 'Ghost Setup' }
            },
            {
                path: 'payments',
                loadComponent: () => import('./features/agent/agent-payments.component').then(m => m.AgentPaymentsComponent),
                data: { breadcrumb: 'Payment Home' }
            },
            {
                path: 'videos',
                redirectTo: '',
                pathMatch: 'full'
            },
            {
                path: 'stocks',
                loadComponent: () => import('./features/agent/components/agent-stock-management/agent-stock-management.component').then(m => m.AgentStockManagementComponent),
                data: { breadcrumb: 'Device Stocks' }
            },
            {
                path: 'ui-config',
                loadComponent: () => import('./features/agent/components/agent-user-ui-config/agent-user-ui-config.component').then(m => m.AgentUserUiConfigComponent),
                data: { breadcrumb: 'User UI Config' }
            },
            {
                path: 'community-visibility',
                loadComponent: () => import('./features/agent/components/agent-community-visibility/agent-community-visibility.component').then(m => m.AgentCommunityVisibilityComponent),
                data: { breadcrumb: 'Community Visibility' }
            },
            {
                path: 'agreements',
                loadComponent: () => import('./features/agent/agent-agreements.component').then(m => m.AgentAgreementsComponent),
                data: { breadcrumb: 'Agreements Home' }
            }
        ]
    },
    {
        path: '**',
        redirectTo: ''
    }
];
