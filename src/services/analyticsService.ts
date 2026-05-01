/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { trackEvent } from '../firebase';

export const analytics = {
  pageView: (page: string) => {
    trackEvent('page_view', { page_id: page });
  },
  action: (actionName: string, category: string, label?: string) => {
    trackEvent('user_action', { action_name: actionName, category, label });
  },
  auth: (method: string, action: 'login' | 'logout') => {
    trackEvent('auth_event', { method, action });
  },
  aiEvent: (type: string, success: boolean) => {
    trackEvent('ai_generation', { type, success });
  }
};
