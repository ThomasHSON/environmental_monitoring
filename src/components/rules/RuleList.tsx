import React, { useState } from 'react';
import { Rule } from '../../types/rules';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { updateRuleStatus } from '../../services/rules';
import LoadingSpinner from '../common/LoadingSpinner';

interface RuleListProps {
  rules: Rule[];
  onRuleUpdate?: (updatedRule: Rule) => void;
}

const RuleList: React.FC<RuleListProps> = ({ rules, onRuleUpdate }) => {
  const [expandedRule, setExpandedRule] = useState<string | null>(null);
  const [updatingRule, setUpdatingRule] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const toggleRule = (guid: string) => {
    setExpandedRule(expandedRule === guid ? null : guid);
  };

  const handleStatusToggle = async (rule: Rule) => {
    setError(null);
    setUpdatingRule(rule.GUID);
    
    try {
      const newState = rule.state !== "True";
      await updateRuleStatus(rule, newState);
      
      const updatedRule = {
        ...rule,
        state: newState ? "True" : "False",
      };
      
      onRuleUpdate?.(updatedRule);
    } catch (err) {
      setError('更新規則狀態失敗');
      console.error('Error updating rule status:', err);
    } finally {
      setUpdatingRule(null);
    }
  };

  const groupedRules = rules.reduce((acc, rule) => {
    if (!acc[rule.group]) {
      acc[rule.group] = [];
    }
    acc[rule.group].push(rule);
    return acc;
  }, {} as Record<string, Rule[]>);

  return (
    <div className="space-y-6 mb-12">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      
      {Object.entries(groupedRules).map(([group, groupRules]) => (
        <div key={group} className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b">
            <h3 className="text-lg font-semibold text-gray-800">{group}</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {groupRules.map((rule) => (
              <div key={rule.GUID} className="hover:bg-gray-50 transition-colors">
                <div className="px-4 py-3">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => toggleRule(rule.GUID)}
                      className="flex-1 text-left focus:outline-none"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium text-gray-500">{rule.index}</span>
                        <span className="text-gray-900">{rule.rule}</span>
                      </div>
                    </button>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={rule.state === "True"}
                            onChange={() => handleStatusToggle(rule)}
                            disabled={!!updatingRule}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                        {updatingRule === rule.GUID && (
                          <LoadingSpinner size="small" className="ml-2" />
                        )}
                      </div>
                      {expandedRule === rule.GUID ? (
                        <ChevronUp size={20} className="text-gray-400" />
                      ) : (
                        <ChevronDown size={20} className="text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>
                {expandedRule === rule.GUID && (
                  <div className="px-4 pb-4 animate-fadeIn">
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      {rule.rule_detail && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700">規則說明</h4>
                          <p className="mt-1 text-gray-600">{rule.rule_detail}</p>
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-700">執行環境</h4>
                          <p className="mt-1 text-gray-600">{rule.software}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-700">重要程度</h4>
                          <p className="mt-1 text-gray-600">{rule.level}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default RuleList;