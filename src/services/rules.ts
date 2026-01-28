import { Rule, RuleResponse } from '../types/rules';
import { apiCall } from '../utils/api';

export const fetchRules = async (): Promise<RuleResponse> => {
  return await apiCall('/api/suspiciousRxLog/get_rule', {
    method: 'POST',
    body: {},
  });
};

export const updateRuleStatus = async (rule: Rule, newState: boolean): Promise<void> => {
  const updatedRule = {
    ...rule,
    state: newState ? "True" : "False", // Convert boolean to API expected string format
  };

  await apiCall('/api/suspiciousRxLog/update_rule_local', {
    method: 'POST',
    body: {
      Data: [updatedRule],
    },
  });
};